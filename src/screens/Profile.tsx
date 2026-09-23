import React from 'react';
import {ScrollView, Text, View} from 'react-native';
import {Avatar, Badge, Button, Card, Heading, Screen, SectionTitle, Sub} from '../design/components';
import type {Identity} from '../core/identity';
import type {Destination} from '../data/cities';
import {colors, font, spacing} from '../design/tokens';

export function ProfileScreen(props: {
  me: Identity;
  dest: Destination | null;
  online: boolean;
  peerCount: number;
  onDisconnect: () => void;
  onWipe: () => void;
}) {
  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={{...font.board, color: colors.amber, marginBottom: spacing.sm}}>
          CREW RECORD · LOCAL ONLY
        </Text>
        <Heading>You</Heading>
        <Sub>Nothing here ever leaves this phone.</Sub>
        <Card>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Avatar name={props.me.name} size={56} />
            <View style={{marginLeft: spacing.md, flex: 1}}>
              <Text style={{...font.title, color: colors.ink}}>{props.me.name}</Text>
              <Text style={{...font.board, color: colors.muted, fontSize: 12, marginTop: 4}}>
                {props.dest ? `${props.dest.city.toUpperCase()} → ${props.dest.area.toUpperCase()}` : 'NO ROUTE FILED'}
              </Text>
            </View>
          </View>
          <View style={{marginTop: spacing.md, alignSelf: 'flex-start'}}>
            <Badge
              dot={props.online ? 'green' : 'grey'}
              label={props.online ? `Online · ${props.peerCount} linked` : 'Offline · scanning'}
            />
          </View>
        </Card>
        <SectionTitle>BLACK BOX</SectionTitle>
        <Card>
          <Text style={{...font.body, color: colors.inkSoft}}>
            Only your destination sector is ever broadcast. No address, GPS, phone, or email.
          </Text>
          <Button title="Cut all frequencies" variant="secondary" onPress={props.onDisconnect} />
          <Button title="Wipe black box" variant="danger" onPress={props.onWipe} />
        </Card>
        <View style={{height: spacing.xxxl}} />
      </ScrollView>
    </Screen>
  );
}
