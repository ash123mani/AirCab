// AircabMesh — iOS native transport (CoreBluetooth GATT, BitChat-style).
// Every device is simultaneously central + peripheral on one shared service.
// This layer is a dumb pipe: discovery, chunking, reconnect live here;
// flood/TTL/dedup/relay policy lives in the shared JS Mesh class.
//
// Why CoreBluetooth, not MultipeerConnectivity:
// - MPC is iOS-only (no Android interop), deprecated in Xcode 27, unstable
//   beyond ~7 peers, and stops advertising in background.
// Limits (surfaced in UX as Offline/Searching, never as jargon):
// - Foreground-to-foreground discovery is reliable; background-to-background
//   often fails — at least one phone should have Aircab open.
// - Background relay is best-effort (restoration IDs + short tasks).
// - BLE-grade throughput: text only, ~500 B messages.
import Foundation
import CoreBluetooth
import React

@objc(AircabMesh)
class AircabMesh: RCTEventEmitter, CBCentralManagerDelegate, CBPeripheralManagerDelegate, CBPeripheralDelegate {

  static let serviceUUID = CBUUID(string: "6E400001-A1RC-AB00-CAB1-AIRCAB000001")
  static let chatCharUUID = CBUUID(string: "6E400002-A1RC-AB00-CAB1-AIRCAB000002")

  private var central: CBCentralManager?
  private var peripheralMgr: CBPeripheralManager?
  private var profile: [String: String] = ["name": "Passenger"]
  private var links: [UUID: CBPeripheral] = [:]       // connected centrals-side peers
  private var charByPeer: [UUID: CBCharacteristic] = [:]
  private var started = false

  // MARK: - RCTBridgeModule

  override static func moduleName() -> String! { return "AircabMesh" }
  override static func requiresMainQueueSetup() -> Bool { return false }
  override func supportedEvents() -> [String]! {
    return ["onPeerFound", "onPacket", "onPeersChanged"]
  }

  // Listener bookkeeping for the JS NativeEventEmitter (silences the
  // "called without addListener/removeListeners" warning on New Arch).
  override func addListener(_ eventName: String) { super.addListener(eventName) }
  override func removeListeners(_ count: Double) { super.removeListeners(count) }

  // MARK: - Exported methods

  @objc func start(_ profile: NSDictionary,
                   resolver resolve: @escaping RCTPromiseResolveBlock,
                   rejecter reject: @escaping RCTPromiseRejectBlock) {
    if let p = profile as? [String: String] { self.profile = p }
    #if targetEnvironment(simulator)
    // The simulator has no bluetoothd: CBPeripheralManager init hard-crashes
    // (assertion in initWithDelegate). Resolve immediately; JS shows the
    // honest Offline/Searching state. Real radios only exist on device.
    resolve(nil)
    return
    #endif
    if !started {
      started = true
      central = CBCentralManager(delegate: self, queue: nil,
        options: [CBCentralManagerOptionRestoreIdentifierKey: "aircab.central"])
      peripheralMgr = CBPeripheralManager(delegate: self, queue: nil,
        options: [CBPeripheralManagerOptionRestoreIdentifierKey: "aircab.peripheral"])
    }
    resolve(nil)
  }

  @objc func stop(_ resolve: @escaping RCTPromiseResolveBlock,
                  rejecter reject: @escaping RCTPromiseRejectBlock) {
    started = false
    central?.stopScan()
    peripheralMgr?.stopAdvertising()
    for (_, p) in links { central?.cancelPeripheralConnection(p) }
    links.removeAll()
    charByPeer.removeAll()
    resolve(nil)
  }

  @objc func send(_ peerId: String, json: String) {
    guard let uuid = UUID(uuidString: peerId),
          let peer = links[uuid],
          let ch = charByPeer[uuid],
          let data = json.data(using: .utf8) else { return }
    // BLE writes are MTU-limited; fragment into 512 B chunks with a tiny header.
    for chunk in chunked(data, size: 512) {
      peer.writeValue(chunk, for: ch, type: .withoutResponse)
    }
  }

  @objc func broadcast(_ json: String) {
    guard let data = json.data(using: .utf8) else { return }
    for chunk in chunked(data, size: 512) {
      for (_, peer) in links {
        if let ch = charByPeer[peer.identifier] {
          peer.writeValue(chunk, for: ch, type: .withoutResponse)
        }
      }
      if let ch = chatChar {
        peripheralMgr?.updateValue(chunk, for: ch, onSubscribedCentrals: nil)
      }
    }
  }

  @objc func directPeers(_ resolve: @escaping RCTPromiseResolveBlock,
                         rejecter reject: @escaping RCTPromiseRejectBlock) {
    resolve(links.keys.map { $0.uuidString })
  }

  // MARK: - Central (discovery)

  private var chatChar: CBMutableCharacteristic?

  func centralManagerDidUpdateState(_ central: CBCentralManager) {
    guard central.state == .poweredOn, started else { return }
    central.scanForPeripherals(withServices: [Self.serviceUUID],
      options: [CBCentralManagerScanOptionAllowDuplicatesKey: true])
  }

  func centralManager(_ central: CBCentralManager, didDiscover peripheral: CBPeripheral,
                      advertisementData: [String: Any], rssi RSSI: NSNumber) {
    guard RSSI.intValue > -85, links[peripheral.identifier] == nil else { return }
    peripheral.delegate = self
    central.connect(peripheral, options: nil)
  }

  func centralManager(_ central: CBCentralManager, didConnect peripheral: CBPeripheral) {
    links[peripheral.identifier] = peripheral
    peripheral.discoverServices([Self.serviceUUID])
    emitPeersChanged()
  }

  func centralManager(_ central: CBCentralManager, didDisconnectPeripheral peripheral: CBPeripheral, error: Error?) {
    links.removeValue(forKey: peripheral.identifier)
    charByPeer.removeValue(forKey: peripheral.identifier)
    emitPeersChanged()
    if started { central.connect(peripheral, options: nil) } // auto-reconnect
  }

  func centralManager(_ central: CBCentralManager, willRestoreState dict: [String: Any]) {
    // Best-effort background resume: re-attach to known peripherals.
    if let perips = dict[CBCentralManagerRestoredStatePeripheralsKey] as? [CBPeripheral] {
      for p in perips {
        p.delegate = self
        central.connect(p, options: nil)
      }
    } else if started {
      central.scanForPeripherals(withServices: [Self.serviceUUID], options: nil)
    }
  }

  func peripheral(_ peripheral: CBPeripheral, didDiscoverServices error: Error?) {
    for svc in peripheral.services ?? [] where svc.uuid == Self.serviceUUID {
      peripheral.discoverCharacteristics([Self.chatCharUUID], for: svc)
    }
  }

  func peripheral(_ peripheral: CBPeripheral, didDiscoverCharacteristicsFor service: CBService, error: Error?) {
    for ch in service.characteristics ?? [] where ch.uuid == Self.chatCharUUID {
      charByPeer[peripheral.identifier] = ch
      peripheral.setNotifyValue(true, for: ch)
    }
  }

  func peripheral(_ peripheral: CBPeripheral, didUpdateValueFor characteristic: CBCharacteristic, error: Error?) {
    guard let data = characteristic.value else { return }
    handleIncoming(data, via: peripheral.identifier.uuidString)
  }

  // MARK: - Peripheral (advertising)

  func peripheralManagerDidUpdateState(_ peripheral: CBPeripheralManager) {
    guard peripheral.state == .poweredOn, started else { return }
    chatChar = CBMutableCharacteristic(type: Self.chatCharUUID,
      properties: [.writeWithoutResponse, .notify], value: nil, permissions: [.writeable])
    let svc = CBMutableService(type: Self.serviceUUID, primary: true)
    svc.characteristics = chatChar.map { [$0] }
    peripheral.removeAllServices()
    peripheral.add(svc)
    peripheral.startAdvertising([CBAdvertisementDataServiceUUIDsKey: [Self.serviceUUID]])
  }

  func peripheralManager(_ peripheral: CBPeripheralManager, didReceiveWrite requests: [CBATTRequest]) {
    for req in requests where req.characteristic.uuid == Self.chatCharUUID {
      peripheral.respond(to: req, withResult: .success)
      handleIncoming(req.value ?? Data(), via: "peripheral-link")
    }
  }

  // MARK: - Framing / events

  private var rxBuffers: [String: Data] = [:]

  private func handleIncoming(_ data: Data, via: String) {
    // Chunks are raw UTF-8 slices; reassemble per-link until a full JSON object parses.
    var buf = (rxBuffers[via] ?? Data()) + data
    if let text = String(data: buf, encoding: .utf8),
       let json = try? JSONSerialization.jsonObject(with: buf) as? [String: Any] {
      rxBuffers[via] = Data()
      handlePacket(json, via: via, raw: text)
      return
    }
    rxBuffers[via] = buf.count > 4096 ? Data() : buf // drop runaway buffers
  }

  private func handlePacket(_ json: [String: Any], via: String, raw: String) {
    let type_ = json["type"] as? String ?? ""
    if type_ == "announce" {
      let body = json["body"] as? [String: String] ?? [:]
      sendEvent(withName: "onPeerFound", body: [
        "id": json["from"] as? String ?? via,
        "name": body["name"] ?? "Passenger",
        "city": body["city"] ?? "",
        "area": body["area"] ?? "",
      ])
    } else {
      sendEvent(withName: "onPacket", body: ["packet": raw, "via": json["from"] as? String ?? via])
    }
  }

  private func emitPeersChanged() {
    sendEvent(withName: "onPeersChanged", body: ["peers": links.keys.map { $0.uuidString }])
  }

  private func chunked(_ data: Data, size: Int) -> [Data] {
    var out: [Data] = []
    var i = data.startIndex
    while i < data.endIndex {
      let j = data.index(i, offsetBy: size, limitedBy: data.endIndex) ?? data.endIndex
      out.append(data[i..<j])
      i = j
    }
    return out.isEmpty ? [Data()] : out
  }
}
