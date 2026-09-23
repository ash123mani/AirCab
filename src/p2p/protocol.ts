// BitChat-inspired wire protocol, trimmed for Aircab v1.
// Binary framing is handled in native modules; JS uses this JSON-compatible
// shape so the mesh logic is testable without radios.
// Transports must be cross-platform: one shared service UUID + packet layout.
export const AIRCAB_SERVICE_UUID = '6E400001-AIRC-AB00-CAB1-AIRCAB000001';
export const PROTOCOL_VERSION = 1;
export const MAX_TTL = 4; // small airport crowd; prevents broadcast storms
export const MAX_TEXT_LEN = 500;

export type PacketType = 'announce' | 'chat' | 'ack' | 'bye';

export type Packet = {
  v: number;
  type: PacketType;
  id: string; // senderId:seq — used for dedup
  from: string; // ephemeral peer id
  groupId?: string;
  ttl: number;
  at: number;
  body: {name?: string; city?: string; area?: string; text?: string; ref?: string};
};

export function makeAnnounce(from: string, name: string, city: string, area: string, id: string): Packet {
  return {v: PROTOCOL_VERSION, type: 'announce', id, from, ttl: MAX_TTL, at: Date.now(), body: {name, city, area}};
}

export function makeChat(from: string, groupId: string, text: string, id: string): Packet {
  return {v: PROTOCOL_VERSION, type: 'chat', id, from, groupId, ttl: MAX_TTL, at: Date.now(), body: {text: text.slice(0, MAX_TEXT_LEN)}};
}

export function decrementTtl(p: Packet): Packet | null {
  if (p.ttl <= 0) return null;
  return {...p, ttl: p.ttl - 1};
}
