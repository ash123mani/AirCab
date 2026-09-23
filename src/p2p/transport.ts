// Transport abstraction. Native modules implement this; JS mesh sits above it.
import type {Packet} from './protocol';

export type ConnState = 'searching' | 'connecting' | 'connected' | 'offline';

export interface Transport {
  readonly name: string;
  start(): Promise<void>;
  stop(): Promise<void>;
  setProfile(name: string, city: string, area: string): void;
  directPeers(): string[];
  send(peerId: string, packet: Packet): void;
  broadcast(packet: Packet): void;
  onPeer(cb: (id: string, name: string, city: string, area: string) => void): void;
  onPacket(cb: (p: Packet, via: string) => void): void;
  onPeersChanged(cb: (ids: string[]) => void): void;
}
