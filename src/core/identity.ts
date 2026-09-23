// Temporary identity: adjective + animal. No account, no PII.
const ADJECTIVES = [
  'Lucky', 'Blue', 'Silent', 'Swift', 'Calm', 'Bright', 'Kind', 'Bold',
  'Gentle', 'Happy', 'Clever', 'Misty',
];
const ANIMALS = [
  'Tiger', 'Fox', 'Eagle', 'Otter', 'Heron', 'Deer', 'Crane', 'Bear',
  'Kite', 'Turtle', 'Sparrow', 'Wolf',
];

export type Identity = {id: string; name: string; createdAt: number};

export function generateIdentity(rand: () => number = Math.random, now: number = Date.now()): Identity {
  const adj = ADJECTIVES[Math.floor(rand() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(rand() * ANIMALS.length)];
  const suffix = Math.floor(rand() * 90 + 10);
  const id = `u_${now.toString(36)}_${Math.floor(rand() * 1e6).toString(36)}`;
  return {id, name: `${adj} ${animal}`, createdAt: now, ...(suffix ? {} : {})};
}
