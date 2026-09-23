// Aircab root: smallest end-to-end flow —
// set destination → discover → group by direction → join/create → chat → offline exchange.
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {SafeAreaView, StatusBar, StyleSheet} from 'react-native';
import {generateIdentity, Identity} from './core/identity';
import {Peer} from './core/matching';
import {createGroup, Group, joinGroup, leaveGroup, MAX_GROUP_SIZE} from './core/groups';
import {ChatMessage, createMessage, sortMessages} from './core/chat';
import {memoryStore, KVStore, storeKeys, wipeLocalData} from './core/storage';
import {Mesh} from './p2p/mesh';
import {makeAnnounce, makeChat, Packet} from './p2p/protocol';
import {createTransport} from './p2p/nativeBridge';
import type {Transport} from './p2p/transport';
import type {Destination} from './data/cities';
import {TabBar, Route} from './navigation/RootNavigator';
import {WelcomeScreen} from './screens/Welcome';
import {SetupScreen} from './screens/Setup';
import {NearbyScreen} from './screens/Nearby';
import {GoingYourWayScreen} from './screens/GoingYourWay';
import {GroupsScreen} from './screens/Groups';
import {ChatScreen} from './screens/Chat';
import {ProfileScreen} from './screens/Profile';

const store: KVStore = memoryStore();

export default function App() {
  const [route, setRoute] = useState<Route>('welcome');
  const [me] = useState<Identity>(() => generateIdentity());
  const [dest, setDest] = useState<Destination | null>(null);
  const [peers, setPeers] = useState<Peer[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);
  const [blocked, setBlocked] = useState<string[]>([]);
  const [online, setOnline] = useState(false);
  const transport = useRef<Transport | null>(null);
  const mesh = useRef<Mesh | null>(null);
  const outbox = useRef<ChatMessage[]>([]); // offline queue, flushed on reconnect

  const peerMap = useRef(new Map<string, Peer>());

  useEffect(() => {
    const t = createTransport();
    transport.current = t;
    const m = new Mesh(me.id, {onPacket: handlePacket}, (peerId, p) => t.send(peerId, p));
    mesh.current = m;
    t.onPeer((id, name, city, area) => {
      if (blocked.includes(id)) return;
      peerMap.current.set(id, {id, name, destination: {city, area}, lastSeenAt: Date.now(), connected: peerMap.current.get(id)?.connected ?? false});
      refreshPeers();
    });
    t.onPacket((p, via) => {
      m.receive(p, via, t.directPeers());
    });
    t.onPeersChanged(ids => {
      setOnline(ids.length > 0);
      flushOutbox();
    });
    t.start();
    return () => {
      t.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function refreshPeers() {
    setPeers([...peerMap.current.values()].filter(p => !blocked.includes(p.id)));
  }

  function handlePacket(p: Packet) {
    if (p.type === 'announce' && p.body.name && p.body.city && p.body.area) {
      if (blocked.includes(p.from)) return;
      peerMap.current.set(p.from, {
        id: p.from,
        name: p.body.name,
        destination: {city: p.body.city, area: p.body.area},
        lastSeenAt: Date.now(),
        connected: peerMap.current.get(p.from)?.connected ?? false,
      });
      refreshPeers();
      setOnline(true);
    } else if (p.type === 'chat' && p.groupId && p.body.text) {
      const g = groupsRef.current.find(g => g.id === p.groupId);
      if (!g) return;
      if (!g.memberIds.includes(p.from) && p.from !== me.id) return; // only members
      setMessages(prev => sortMessages([...prev, {
        id: p.id, groupId: p.groupId!, senderId: p.from,
        senderName: g.memberNames[p.from] ?? 'Passenger',
        text: p.body.text!, createdAt: p.at, status: 'delivered',
      }]));
    }
  }
  const groupsRef = useRef<Group[]>([]);
  groupsRef.current = groups;

  function flushOutbox() {
    if (!transport.current || !mesh.current || outbox.current.length === 0) return;
    const pending = outbox.current;
    outbox.current = [];
    for (const msg of pending) {
      const pkt = makeChat(me.id, msg.groupId, msg.text, mesh.current.nextId());
      mesh.current.markOwn(pkt.id);
      transport.current.broadcast(pkt);
      setMessages(prev => prev.map(m => (m.id === msg.id ? {...m, status: 'sent'} : m)));
    }
  }

  const openGroup = useMemo(() => groups.find(g => g.id === openGroupId) ?? null, [groups, openGroupId]);

  async function persist() {
    await store.set(storeKeys.identity, JSON.stringify(me));
    if (dest) await store.set(storeKeys.dest, JSON.stringify(dest));
    await store.set(storeKeys.groups, JSON.stringify(groups));
    await store.set(storeKeys.msgs, JSON.stringify(messages));
  }
  useEffect(() => {
    persist();
  }, [groups, messages, dest]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- actions: only creatable/joinable via nearby experience ----
  function completeSetup(city: string, area: string) {
    const d = {city, area};
    setDest(d);
    transport.current?.setProfile(me.name, city, area);
    const pkt = makeAnnounce(me.id, me.name, city, area, mesh.current?.nextId() ?? `${me.id}:0`);
    mesh.current?.markOwn(pkt.id);
    transport.current?.broadcast(pkt);
    setRoute('nearby');
  }

  function connectPeer(peer: Peer) {
    peerMap.current.set(peer.id, {...peer, connected: true, lastSeenAt: Date.now()});
    refreshPeers();
    setOnline(true);
  }

  function joinArea(city: string, area: string, peerIds: string[]) {
    // Reuse an existing open group for the area, else create one through nearby.
    let g = groups.find(g => g.city === city && g.areas.includes(area) && g.memberIds.length < MAX_GROUP_SIZE);
    if (!g) {
      g = createGroup(city, [area], {id: me.id, name: me.name});
      setGroups(prev => [...prev, g!]);
    }
    let next = g;
    for (const pid of peerIds.slice(0, MAX_GROUP_SIZE - next.memberIds.length)) {
      const p = peerMap.current.get(pid);
      if (!p || next.memberIds.includes(pid)) continue;
      try {
        next = joinGroup(next, pid, p.name);
      } catch {
        break; // full — stop adding
      }
    }
    const final = next;
    setGroups(prev => prev.map(x => (x.id === final.id ? final : x)));
    setOpenGroupId(final.id);
    setRoute('chat');
  }

  function sendChat(text: string) {
    if (!openGroup || !text.trim()) return;
    const msg = createMessage(openGroup.id, {id: me.id, name: me.name}, text);
    if (!online) {
      outbox.current.push(msg); // offline: queue, persist locally
      setMessages(prev => sortMessages([...prev, msg]));
      return;
    }
    const pkt = makeChat(me.id, openGroup.id, msg.text, mesh.current?.nextId() ?? msg.id);
    mesh.current?.markOwn(pkt.id);
    transport.current?.broadcast(pkt);
    setMessages(prev => sortMessages([...prev, {...msg, status: 'sent'}]));
    // Simulate delivery ack when peers are around (native layer reports real acks)
    setTimeout(() => {
      setMessages(prev => prev.map(m => (m.id === msg.id ? {...m, status: 'delivered'} : m)));
    }, 1500);
  }

  const visiblePeers = peers.filter(p => !blocked.includes(p.id));

  return (
    <SafeAreaView style={[s.root, {backgroundColor: '#0B0E11'}]}>
      <StatusBar barStyle="light-content" />
      {route === 'welcome' && <WelcomeScreen onStart={() => setRoute('setup')} />}
      {route === 'setup' && <SetupScreen name={me.name} onDone={completeSetup} />}
      {route === 'nearby' && dest && (
        <NearbyScreen peers={visiblePeers} online={online} onConnect={connectPeer} onBlock={p => {setBlocked(b => [...b, p.id]); refreshPeers();}} gotoGroups={() => setRoute('groups')} />
      )}
      {route === 'way' && dest && (
        <GoingYourWayScreen peers={visiblePeers} me={dest} onJoinArea={joinArea} />
      )}
      {route === 'groups' && (
        <GroupsScreen groups={groups} onOpen={g => {setOpenGroupId(g.id); setRoute('chat');}} onLeave={g => setGroups(prev => prev.map(x => (x.id === g.id ? leaveGroup(x, me.id) : x)).filter(x => x.memberIds.length > 0))} />
      )}
      {route === 'chat' && openGroup && (
        <ChatScreen group={openGroup} messages={messages.filter(m => m.groupId === openGroup.id)} meId={me.id} online={online} onSend={sendChat} onBack={() => setRoute('groups')} />
      )}
      {route === 'profile' && (
        <ProfileScreen me={me} dest={dest} online={online} peerCount={visiblePeers.length} onDisconnect={() => {transport.current?.stop(); setOnline(false);}} onWipe={() => {wipeLocalData(store); setGroups([]); setMessages([]); setBlocked([]); setRoute('welcome');}} />
      )}
      <TabBar route={route} onGo={setRoute} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({root: {flex: 1}});
