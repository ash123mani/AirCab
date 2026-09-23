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
        <Heading>Profile</Heading>
        <Sub>Everything stays on this device.</Sub>
        <Card>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Avatar name={props.me.name} size={56} />
            <View style={{marginLeft: spacing.md, flex: 1}}>
              <Text style={{...font.title, color: colors.ink}}>{props.me.name}</Text>
              <Text style={{...font.caption, color: colors.muted, marginTop: 2}}>
                {props.dest ? `${props.dest.city} → ${props.dest.area}` : 'Destination not set'}
              </Text>
            </View>
          </View>
          <View style={{marginTop: spacing.md, alignSelf: 'flex-start'}}>
            <Badge
              dot={props.online ? 'green' : 'grey'}
              label={props.online ? `Connected to ${props.peerCount} passengers` : 'Offline · searching'}
            />
          </View>
        </Card>
        <SectionTitle>PRIVACY</SectionTitle>
        <Card>
          <Text style={{...font.body, color: colors.inkSoft}}>
            Only your destination area is ever shared. No address, GPS, phone, or email.
          </Text>
          <Button title="Disconnect from nearby" variant="secondary" onPress={props.onDisconnect} />
          <Button title="Delete local data" variant="danger" onPress={props.onWipe} />
        </Card>
        <View style={{height: spacing.xxxl}} />
      </ScrollView>
    </Screen>
  );
}
