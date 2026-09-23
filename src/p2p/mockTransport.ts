// In-memory mock transport: lets the full flow run on simulators / Expo Go
// with zero radios, plus seeds demo passengers for screenshots.
import type {Packet} from './protocol';
import type {Transport} from './transport';

export class MockTransport implements Transport {
  readonly name = 'mock';
  private peerCb: ((id: string, name: string, city: string, area: string) => void) | null = null;
  private pktCb: ((p: Packet, via: string) => void) | null = null;
  private changedCb: ((ids: string[]) => void) | null = null;
  private peers = new Map<string, {name: string; city: string; area: string}>();
  private me = {name: 'You', city: '', area: ''};
  private timer: ReturnType<typeof setInterval> | null = null;

  setProfile(name: string, city: string, area: string) {
    this.me = {name, city, area};
  }
  async start() {
    this.seedDemo();
    this.timer = setInterval(() => this.changedCb?.([...this.peers.keys()]), 3000);
  }
  async stop() {
    if (this.timer) clearInterval(this.timer);
  }
  directPeers() {
    return [...this.peers.keys()];
  }
  send(peerId: string, packet: Packet) {
    // loopback in mock; real fan-out happens in native layer
    this.pktCb?.(packet, peerId);
  }
  broadcast(packet: Packet) {
    for (const id of this.peers.keys()) this.pktCb?.(packet, id);
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

  private seedDemo() {
    const city = this.me.city || 'Chennai';
    const area = this.me.area || 'Velachery';
    const demo: Array<[string, string, string]> = [
      ['peer_rahul', 'Rahul', area],
      ['peer_priya', 'Priya', area],
      ['peer_amit', 'Amit', 'Adyar'],
      ['peer_neha', 'Neha', 'Adyar'],
      ['peer_arjun', 'Arjun', 'OMR'],
    ];
    for (const [id, name, a] of demo) {
      this.peers.set(id, {name, city, area: a});
      this.peerCb?.(id, name, city, a);
    }
    this.changedCb?.([...this.peers.keys()]);
  }
}
