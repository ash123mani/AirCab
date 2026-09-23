import React from 'react';
import {ScrollView, Text, View} from 'react-native';
import {Button, Card, Chip, Heading, ListRow, Screen, SectionTitle, Sub, Divider} from '../design/components';
import {groupByDirection, Peer} from '../core/matching';
import type {Destination} from '../data/cities';
import {colors, font, radius, spacing} from '../design/tokens';

export function GoingYourWayScreen(props: {
  peers: Peer[];
  me: Destination;
  onJoinArea: (city: string, area: string, peerIds: string[]) => void;
}) {
  const buckets = groupByDirection(props.peers, props.me);
  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Heading>People going your way</Heading>
        <Sub>Airport → grouped by destination area</Sub>
        <Card>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <View style={{width: 12, height: 12, borderRadius: 6, backgroundColor: colors.brand}} />
            <Text style={{...font.bodyStrong, color: colors.ink, marginLeft: spacing.sm}}>Airport</Text>
          </View>
          {buckets.map(b => (
            <View key={`${b.city}${b.area}`}>
              <View
                style={{
                  marginTop: spacing.md,
                  paddingLeft: spacing.md,
                  borderLeftWidth: 3,
                  borderLeftColor: b.sameWay ? colors.brand : colors.line,
                  borderRadius: 2,
                }}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text style={{...font.bodyStrong, color: colors.ink}}>
                    {b.area} · {b.peers.length}
                  </Text>
                  <View style={{width: spacing.sm}} />
                  {b.sameWay ? <Chip label="Your way" tone="brand" /> : <Chip label={b.city} tone="neutral" />}
                </View>
                <View style={{marginTop: spacing.sm, borderRadius: radius.md, backgroundColor: colors.bg, paddingHorizontal: spacing.md, paddingVertical: spacing.xs}}>
                  {b.peers.map((p, i) => (
                    <View key={p.id}>
                      <ListRow name={p.name} detail={`→ ${p.destination.area}`} />
                      {i < b.peers.length - 1 && <Divider />}
                    </View>
                  ))}
                </View>
                <View style={{marginTop: spacing.sm}}>
                  <Button
                    title={b.sameWay ? `Join ${b.area} group` : `Join ${b.area} anyway`}
                    variant={b.sameWay ? 'primary' : 'secondary'}
                    onPress={() => props.onJoinArea(b.city, b.area, b.peers.map(p => p.id))}
                  />
                </View>
              </View>
            </View>
          ))}
        </Card>
        <SectionTitle>TIP</SectionTitle>
        <Text style={{...font.caption, color: colors.muted}}>
          Groups hold max 4 people. You can join several heading the same way.
        </Text>
        <View style={{height: spacing.xxxl}} />
      </ScrollView>
    </Screen>
  );
}
