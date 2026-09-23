import {generateIdentity} from '../src/core/identity';
import {groupByDirection, sameDirection} from '../src/core/matching';

test('identity has adjective animal shape', () => {
  const id = generateIdentity(() => 0.1, 1000);
  expect(id.name.split(' ').length).toBe(2);
  expect(id.id.startsWith('u_')).toBe(true);
});

test('sameDirection matches city+area only', () => {
  expect(sameDirection({city: 'Chennai', area: 'Velachery'}, {city: 'Chennai', area: 'Velachery'})).toBe(true);
  expect(sameDirection({city: 'Chennai', area: 'Velachery'}, {city: 'Chennai', area: 'Adyar'})).toBe(false);
});

test('groupByDirection puts same-way bucket first', () => {
  const now = Date.now();
  const peers = [
    {id: '1', name: 'Amit', destination: {city: 'Chennai', area: 'Adyar'}, lastSeenAt: now, connected: false},
    {id: '2', name: 'Rahul', destination: {city: 'Chennai', area: 'Velachery'}, lastSeenAt: now, connected: false},
  ];
  const buckets = groupByDirection(peers, {city: 'Chennai', area: 'Velachery'});
  expect(buckets[0].area).toBe('Velachery');
  expect(buckets[0].sameWay).toBe(true);
});
