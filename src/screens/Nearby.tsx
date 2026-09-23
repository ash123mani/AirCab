import React from 'react';
import {Pressable, ScrollView, Text, View} from 'react-native';
import {Badge, Button, Card, Chip, EmptyState, Heading, ListRow, OfflineBanner, Screen, SectionTitle, Sub} from '../design/components';
import type {Peer} from '../core/matching';
import {colors, spacing} from '../design/tokens';

export function NearbyScreen(props: {
  peers: Peer[];
  online: boolean;
  onConnect: (peer: Peer) => void;
  onBlock: (peer: Peer) => void;
  gotoGroups: () => void;
}) {
  return (
    <Screen>
      <OfflineBanner online={props.online} peerCount={props.peers.length} />
      <Heading>Nearby passengers</Heading>
      <Sub>{props.peers.length} Aircab {props.peers.length === 1 ? 'user' : 'users'} around you</Sub>
      <ScrollView showsVerticalScrollIndicator={false}>
        {props.peers.length === 0 && (
          <EmptyState title="No one nearby yet" body="Keep Aircab open. Passengers appear as their phones advertise over Bluetooth." />
        )}
        {props.peers.length > 0 && <SectionTitle>AROUND YOU · {props.peers.length}</SectionTitle>}
        {props.peers.map(p => (
          <Card key={p.id}>
            <ListRow
              name={p.name}
              detail={`→ ${p.destination.area}`}
              right={<Badge dot={p.connected ? 'green' : 'amber'} label={p.connected ? 'Connected' : 'Nearby'} />}
            />
            <View style={{marginTop: spacing.sm}}>
              <Chip label={`${p.destination.city} · ${p.destination.area}`} tone="brand" />
            </View>
            <View style={{flexDirection: 'row', marginTop: spacing.md, alignItems: 'center'}}>
              <View style={{flex: 1, marginRight: spacing.sm}}>
                <Button
                  title={p.connected ? 'Connected ✓' : `Connect with ${p.name.split(' ')[0]}`}
                  variant="secondary"
                  onPress={() => props.onConnect(p)}
                />
              </View>
              <Pressable onPress={() => props.onBlock(p)} hitSlop={12}>
                <Text style={{color: colors.danger, fontWeight: '600'}}>Block</Text>
              </Pressable>
            </View>
          </Card>
        ))}
        <View style={{height: spacing.xl}} />
      </ScrollView>
      <Button title="My Groups" variant="secondary" onPress={props.gotoGroups} />
    </Screen>
  );
}
