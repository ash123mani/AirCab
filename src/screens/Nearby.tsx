import React from 'react';
import {Pressable, ScrollView, Text, View} from 'react-native';
import {Badge, Button, Card, EmptyState, Heading, ListRow, OfflineBanner, Screen, SectionTitle, Sub} from '../design/components';
import type {Peer} from '../core/matching';
import {colors, font, spacing} from '../design/tokens';

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
      <Text style={{...font.board, color: colors.amber, marginBottom: spacing.sm}}>
        STEP 02 · TERMINAL RADAR
      </Text>
      <Heading>Signals nearby</Heading>
      <Sub>
        {props.peers.length === 0
          ? 'No Aircab transmitters in range yet.'
          : `${props.peers.length} transmitter${props.peers.length === 1 ? '' : 's'} in range.`}
      </Sub>
      <ScrollView showsVerticalScrollIndicator={false}>
        {props.peers.length === 0 && (
          <EmptyState
            title="Holding for signals"
            body="Keep Aircab open. Passengers appear as their phones advertise over Bluetooth."
          />
        )}
        {props.peers.length > 0 && (
          <SectionTitle>IN RANGE · {props.peers.length}</SectionTitle>
        )}
        {props.peers.map(p => (
          <Card key={p.id}>
            <ListRow
              name={p.name}
              detail={`→ ${p.destination.city} · ${p.destination.area}`}
              right={
                <Badge dot={p.connected ? 'green' : 'amber'} label={p.connected ? 'Linked' : 'Nearby'} />
              }
            />
            <View style={{flexDirection: 'row', marginTop: spacing.md, alignItems: 'center'}}>
              <View style={{flex: 1, marginRight: spacing.sm}}>
                <Button
                  title={p.connected ? 'Linked ✓' : `Link with ${p.name.split(' ')[0]}`}
                  variant={p.connected ? 'secondary' : 'primary'}
                  onPress={() => props.onConnect(p)}
                />
              </View>
              <Pressable onPress={() => props.onBlock(p)} hitSlop={12}>
                <Text style={{...font.bodyStrong, color: colors.red}}>Block</Text>
              </Pressable>
            </View>
          </Card>
        ))}
        <View style={{height: spacing.xl}} />
      </ScrollView>
      <Button title="View boarding passes" variant="secondary" onPress={props.gotoGroups} />
    </Screen>
  );
}
