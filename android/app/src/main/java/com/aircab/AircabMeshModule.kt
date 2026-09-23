package com.aircab

import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.android.gms.nearby.Nearby
import com.google.android.gms.nearby.connection.*

// AircabMesh — Android native transport.
// Primary: Google Nearby Connections API, P2P_CLUSTER (Bluetooth + BLE + Wi-Fi,
// encrypted, fully offline). Dumb pipe: JS Mesh owns flood/TTL/dedup/relay.
// Manifest must grant BLUETOOTH_SCAN/CONNECT + ACCESS_FINE_LOCATION, and the app
// must prompt the user to enable Bluetooth/Wi-Fi (Nearby no longer auto-enables).
class AircabMeshModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  companion object {
    const val NAME = "AircabMesh"
    const val SERVICE_ID = "com.aircab.MESH"
    val STRATEGY: Strategy = Strategy.P2P_CLUSTER
  }

  private val client by lazy { Nearby.getConnectionsClient(reactContext) }
  private var profileName = "Passenger"
  private val connected = mutableSetOf<String>()

  override fun getName() = NAME

  private fun emit(event: String, params: WritableMap) {
    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(event, params)
  }

  @ReactMethod
  fun start(profile: ReadableMap, promise: Promise) {
    profileName = profile.getString("name") ?: "Passenger"
    val opts = AdvertisingOptions.Builder().setStrategy(STRATEGY).build()
    client.startAdvertising(profileName, SERVICE_ID, lifecycleCallback, opts)
    val discOpts = DiscoveryOptions.Builder().setStrategy(STRATEGY).build()
    client.startDiscovery(SERVICE_ID, discoveryCallback, discOpts)
    promise.resolve(null)
  }

  @ReactMethod
  fun stop(promise: Promise) {
    client.stopAdvertising()
    client.stopDiscovery()
    client.stopAllEndpoints()
    connected.clear()
    promise.resolve(null)
  }

  @ReactMethod
  fun send(peerId: String, json: String) {
    if (connected.contains(peerId)) {
      client.sendPayload(peerId, Payload.fromBytes(json.toByteArray(Charsets.UTF_8)))
    }
  }

  @ReactMethod
  fun broadcast(json: String) {
    val payload = Payload.fromBytes(json.toByteArray(Charsets.UTF_8))
    for (id in connected) client.sendPayload(id, payload)
  }

  @ReactMethod
  fun directPeers(promise: Promise) {
    val arr = Arguments.createArray()
    for (id in connected) arr.pushString(id)
    promise.resolve(arr)
  }

  // Listener bookkeeping for the JS NativeEventEmitter. No-ops required so
  // the bridge keeps the emitter alive for onPeerFound/onPacket/onPeersChanged.
  @ReactMethod
  fun addListener(@Suppress("UNUSED_PARAMETER") eventName: String?) = Unit

  @ReactMethod
  fun removeListeners(@Suppress("UNUSED_PARAMETER") count: Int) = Unit

  private val discoveryCallback = object : EndpointDiscoveryCallback() {
    override fun onEndpointFound(endpointId: String, info: DiscoveredEndpointInfo) {
      client.requestConnection(profileName, endpointId, lifecycleCallback)
    }
    override fun onEndpointLost(endpointId: String) {
      connected.remove(endpointId)
      emitPeersChanged()
    }
  }

  private val lifecycleCallback = object : ConnectionLifecycleCallback() {
    override fun onConnectionInitiated(endpointId: String, info: ConnectionInfo) {
      // TODO: surface info.authenticationDigits for user-confirmed pairing.
      client.acceptConnection(endpointId, payloadCallback)
    }
    override fun onConnectionResult(endpointId: String, result: ConnectionResolution) {
      if (result.status.isSuccess) {
        connected.add(endpointId)
        emitPeersChanged()
      }
    }
    override fun onDisconnected(endpointId: String) {
      connected.remove(endpointId)
      emitPeersChanged()
    }
  }

  private val payloadCallback = object : PayloadCallback() {
    override fun onPayloadReceived(endpointId: String, payload: Payload) {
      val bytes = payload.asBytes() ?: return
      val raw = bytes.toString(Charsets.UTF_8)
      // Announce packets register the peer (name/city/area); the rest flows to JS Mesh.
      try {
        val parsed = org.json.JSONObject(raw)
        if (parsed.optString("type") == "announce") {
          val body = parsed.optJSONObject("body")
          val params = Arguments.createMap().apply {
            putString("id", parsed.optString("from", endpointId))
            putString("name", body?.optString("name") ?: "Passenger")
            putString("city", body?.optString("city") ?: "")
            putString("area", body?.optString("area") ?: "")
          }
          emit("onPeerFound", params)
          return
        }
      } catch (_: Exception) { /* fall through: forward raw */ }
      val params = Arguments.createMap().apply {
        putString("packet", raw)
        putString("via", endpointId)
      }
      emit("onPacket", params)
    }
    override fun onPayloadTransferUpdate(endpointId: String, update: PayloadTransferUpdate) {}
  }

  private fun emitPeersChanged() {
    val arr = Arguments.createArray()
    for (id in connected) arr.pushString(id)
    val params = Arguments.createMap().apply { putArray("peers", arr) }
    emit("onPeersChanged", params)
  }
}
