import React from 'react';
import {ScrollView, Text, View} from 'react-native';
import {Avatar, Button, Card, Chip, Heading, Screen, SectionTitle, Sub} from '../design/components';
import {groupByDirection, Peer} from '../core/matching';
import type {Destination} from '../data/cities';
import {colors, font, spacing} from '../design/tokens';

export function GoingYourWayScreen(props: {
  peers: Peer[];
  me: Destination;
  onJoinArea: (city: string, area: string, peerIds: string[]) => void;
}) {
  const buckets = groupByDirection(props.peers, props.me);
  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={{...font.board, color: colors.amber, marginBottom: spacing.sm}}>
          STEP 03 · OUTBOUND ROUTES
        </Text>
        <Heading>Going your way</Heading>
        <Sub>Every route leaves the airport. Find yours.</Sub>
        <Card>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <View style={{width: 12, height: 12, borderRadius: 6, backgroundColor: colors.amber}} />
            <Text style={{...font.boardBig, color: colors.ink, marginLeft: spacing.sm}}>AIRPORT</Text>
          </View>
          <View style={{marginLeft: 5, marginTop: 4, marginBottom: 4, width: 2, height: 14, backgroundColor: colors.line}} />
          {buckets.length === 0 && (
            <Text style={{...font.body, color: colors.muted}}>No routes on the board yet.</Text>
          )}
          {buckets.map((b, bi) => (
            <View key={`${b.city}${b.area}`}>
              <View style={{flexDirection: 'row'}}>
                <View style={{alignItems: 'center', marginRight: spacing.md}}>
                  <View
                    style={{
                      width: 12, height: 12, borderRadius: 6, marginTop: 4,
                      backgroundColor: b.sameWay ? colors.amber : colors.faint,
                    }}
                  />
                  {bi < buckets.length - 1 && (
                    <View style={{width: 2, flex: 1, minHeight: 30, backgroundColor: colors.line, marginVertical: 4}} />
                  )}
                </View>
                <View style={{flex: 1, paddingBottom: spacing.lg}}>
                  <View style={{flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap'}}>
                    <Text style={{...font.title, color: colors.ink}}>{b.area}</Text>
                    <View style={{width: spacing.sm}} />
                    {b.sameWay ? <Chip label="YOUR ROUTE" tone="brand" /> : <Chip label={`${b.peers.length} ABOARD`} tone="neutral" />}
                  </View>
                  <Text style={{...font.board, color: colors.faint, fontSize: 11, marginTop: 4}}>
                    {b.city.toUpperCase()} SECTOR
                  </Text>
                  <View style={{flexDirection: 'row', marginTop: spacing.sm}}>
                    {b.peers.slice(0, 4).map(p => (
                      <View key={p.id} style={{marginRight: -8}}>
                        <Avatar name={p.name} size={32} />
                      </View>
                    ))}
                    <Text style={{...font.caption, color: colors.muted, marginLeft: spacing.lg, alignSelf: 'center'}}>
                      {b.peers.map(p => p.name.split(' ')[0]).join(' · ')}
                    </Text>
                  </View>
                  <Button
                    title={b.sameWay ? `Board ${b.area} group` : `Board anyway`}
                    variant={b.sameWay ? 'primary' : 'secondary'}
                    onPress={() => props.onJoinArea(b.city, b.area, b.peers.map(p => p.id))}
                  />
                </View>
              </View>
            </View>
          ))}
        </Card>
        <SectionTitle>BOARDING RULES</SectionTitle>
        <Text style={{...font.caption, color: colors.muted}}>
          Max 4 per group. You may hold several passes on the same heading.
        </Text>
        <View style={{height: spacing.xxxl}} />
      </ScrollView>
    </Screen>
  );
}
