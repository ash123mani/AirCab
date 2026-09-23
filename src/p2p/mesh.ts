// Controlled-flood mesh: TTL + LRU seen-set + jitter + split-horizon.
// Mirrors BitChat's relay policy at v1 scale (no Nostr/internet fallback).
import {decrementTtl, Packet} from './protocol';

export interface MeshEvents {
  onPacket(p: Packet, via: string): void;
}

export class Mesh {
  private seen = new Map<string, number>(); // id -> expiry
  private seq = 0;
  constructor(private selfId: string, private events: MeshEvents, private sendTo: (peerId: string, p: Packet) => void) {}

  nextId(): string {
    this.seq += 1;
    return `${this.selfId}:${this.seq}`;
  }

  /** Outgoing: mark seen, deliver locally is the caller's job. */
  markOwn(id: string) {
    this.remember(id);
  }

  /** Incoming from link `via`. Returns true if new (should process + relay). */
  receive(p: Packet, via: string, directPeers: string[]): boolean {
    this.evict();
    if (this.seen.has(p.id)) return false;
    this.remember(p.id);
    this.events.onPacket(p, via);
    const relayed = decrementTtl(p);
    if (relayed) {
      const delay = 10 + Math.random() * 120; // jitter lets dup-suppression win
      const targets = directPeers.filter(id => id !== via);
      setTimeout(() => {
        for (const t of targets) this.sendTo(t, relayed);
      }, delay);
    }
    return true;
  }

  private remember(id: string) {
    this.seen.set(id, Date.now() + 5 * 60_000);
    if (this.seen.size > 1000) {
      const first = this.seen.keys().next().value as string;
      this.seen.delete(first);
    }
  }

  private evict() {
    const now = Date.now();
    for (const [k, exp] of this.seen) if (exp < now) this.seen.delete(k);
  }
}
