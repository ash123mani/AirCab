// Local-only persistence behind a tiny async key/value interface.
// Runtime implementation is in-memory; the React Native app wires it to
// MMKV/SQLite via the same interface. No network, no cloud.
export interface KVStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}

export function memoryStore(): KVStore & {dump(): Record<string, string>} {
  const m = new Map<string, string>();
  return {
    async get(k) {
      return m.has(k) ? m.get(k)! : null;
    },
    async set(k, v) {
      m.set(k, v);
    },
    async remove(k) {
      m.delete(k);
    },
    async clear() {
      m.clear();
    },
    dump() {
      return Object.fromEntries(m);
    },
  };
}

const K = {identity: 'aircab.identity', dest: 'aircab.destination', groups: 'aircab.groups', msgs: 'aircab.messages', blocked: 'aircab.blocked'};

export async function wipeLocalData(store: KVStore): Promise<void> {
  for (const key of Object.values(K)) await store.remove(key);
}

export const storeKeys = K;
