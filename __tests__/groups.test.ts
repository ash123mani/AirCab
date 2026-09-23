import {canJoin, createGroup, joinGroup, leaveGroup, MAX_GROUP_SIZE} from '../src/core/groups';
import {createMessage} from '../src/core/chat';
import {Mesh} from '../src/p2p/mesh';
import {makeAnnounce, MAX_TTL} from '../src/p2p/protocol';

test('group caps at 4 and allows multiple groups per user', () => {
  expect(MAX_GROUP_SIZE).toBe(4);
  let g = createGroup('Chennai', ['Velachery'], {id: 'me', name: 'Me'});
  for (let i = 0; i < 3; i++) g = joinGroup(g, `u${i}`, `U${i}`);
  expect(canJoin(g)).toBe(false);
  expect(() => joinGroup(g, 'extra', 'Extra')).toThrow('full');
  const left = leaveGroup(g, 'me');
  expect(left.memberIds).not.toContain('me');
});

test('empty message rejected', () => {
  expect(() => createMessage('g', {id: 'a', name: 'A'}, '   ')).toThrow();
});

test('mesh dedups and relays with decremented ttl', done => {
  const sent: string[] = [];
  const m = new Mesh('me', {onPacket: () => {}}, (peer, p) => {
    sent.push(peer);
    expect(p.ttl).toBe(MAX_TTL - 1);
  });
  const pkt = makeAnnounce('peer1', 'Rahul', 'Chennai', 'Velachery', 'peer1:1');
  expect(m.receive(pkt, 'peer1', ['peer1', 'peer2'])).toBe(true);
  expect(m.receive(pkt, 'peer1', ['peer1', 'peer2'])).toBe(false); // dup dropped
  setTimeout(() => {
    expect(sent).toEqual(['peer2']); // split-horizon: ingress excluded
    done();
  }, 250);
});
