// Similar-direction matching. v1: exact destination-area match only.
// Privacy: matching uses area strings, never GPS or addresses.
import type {Destination} from '../data/cities';

export type Peer = {
  id: string;
  name: string;
  destination: Destination;
  lastSeenAt: number; // epoch ms
  connected: boolean;
};

export function isNearby(peer: Peer, now: number, windowMs = 60_000): boolean {
  return now - peer.lastSeenAt <= windowMs;
}

/** Group peers by destination area. Returns sorted buckets: same-area first. */
export function groupByDirection(
  peers: Peer[],
  me: Destination,
): {area: string; city: string; peers: Peer[]; sameWay: boolean}[] {
  const map = new Map<string, Peer[]>();
  for (const p of peers) {
    const key = `${p.destination.city}::${p.destination.area}`;
    const list = map.get(key) ?? [];
    list.push(p);
    map.set(key, list);
  }
  const buckets = [...map.entries()].map(([key, list]) => {
    const [city, area] = key.split('::');
    return {area, city, peers: list, sameWay: city === me.city && area === me.area};
  });
  buckets.sort((a, b) => Number(b.sameWay) - Number(a.sameWay) || b.peers.length - a.peers.length);
  return buckets;
}

export function sameDirection(a: Destination, b: Destination): boolean {
  return a.city === b.city && a.area === b.area;
}
