// Bridge to the real native mesh modules (iOS CoreBluetooth / Android Nearby).
// JS never touches radios directly; it talks to the AircabMesh native module.
// Falls back to MockTransport when the native module is absent (simulators).
import {LogBox, NativeEventEmitter, NativeModules} from 'react-native';
import type {Packet} from './protocol';
import type {Transport} from './transport';
import {MockTransport} from './mockTransport';

// AircabMesh manages its own listener lifetime (observes only while transport
// is started) and never needs JS-side ref-counting, so the emitter
// addListener bookkeeping warning is noise. Events themselves flow normally.
LogBox.ignoreLogs(['`new NativeEventEmitter()` was called with a non-null argument']);

type NativeMesh = {
  start(profile: {name: string; city: string; area: string}): Promise<void>;
  stop(): Promise<void>;
  send(peerId: string, json: string): void;
  broadcast(json: string): void;
  directPeers(): Promise<string[]>;
};

type PeerEvent = {id: string; name: string; city: string; area: string};
type PacketEvent = {packet: string; via: string};
type PeersChangedEvent = {peers: string[]};

class NativeTransport implements Transport {
  readonly name = 'native';
  private native: NativeMesh;
  private emitter: NativeEventEmitter;
  private profile = {name: 'Passenger', city: '', area: ''};
  private peerIds: string[] = [];
  private peerCb: ((id: string, name: string, city: string, area: string) => void) | null = null;
  private pktCb: ((p: Packet, via: string) => void) | null = null;
  private changedCb: ((ids: string[]) => void) | null = null;

  constructor(native: NativeMesh) {
    this.native = native;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.emitter = new NativeEventEmitter(native as any);
    this.emitter.addListener('onPeerFound', (e: PeerEvent) => this.peerCb?.(e.id, e.name, e.city, e.area));
    this.emitter.addListener('onPacket', (e: PacketEvent) => {
      try {
        this.pktCb?.(JSON.parse(e.packet) as Packet, e.via);
      } catch {
        // Malformed frame from the radio — drop it, never crash the mesh.
      }
    });
    this.emitter.addListener('onPeersChanged', (e: PeersChangedEvent) => {
      this.peerIds = e.peers ?? [];
      this.changedCb?.(this.peerIds);
    });
  }

  async start() {
    await this.native.start(this.profile);
  }
  async stop() {
    await this.native.stop();
  }
  setProfile(name: string, city: string, area: string) {
    this.profile = {name, city, area};
    this.native.start(this.profile);
  }
  directPeers() {
    return [...this.peerIds];
  }
  send(peerId: string, packet: Packet) {
    this.native.send(peerId, JSON.stringify(packet));
  }
  broadcast(packet: Packet) {
    this.native.broadcast(JSON.stringify(packet));
  }
  onPeer(cb: (id: string, name: string, city: string, area: string) => void) {
    this.peerCb = cb;
  }
  onPacket(cb: (p: Packet, via: string) => void) {
    this.pktCb = cb;
  }
  onPeersChanged(cb: (ids: string[]) => void) {
    this.changedCb = cb;
  }
}

export function createTransport(): Transport {
  const native = (NativeModules as {AircabMesh?: NativeMesh}).AircabMesh;
  if (!native) return new MockTransport();
  return new NativeTransport(native);
}
