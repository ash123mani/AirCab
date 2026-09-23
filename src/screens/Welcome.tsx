import React from 'react';
import {ScrollView, Text, View} from 'react-native';
import {Body, Button, Card, Chip, Heading, HeroMark, OfflineBanner, Screen} from '../design/components';
import {colors, font, spacing} from '../design/tokens';

const STEPS = [
  {n: '1', title: 'Set your destination area', body: 'Only the area is shared — never your address.'},
  {n: '2', title: 'Discover nearby passengers', body: 'Phones find each other over Bluetooth. No internet.'},
  {n: '3', title: 'Join a group and chat offline', body: 'Max 4 people heading your way.'},
];

export function WelcomeScreen(props: {onStart: () => void}) {
  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{marginTop: spacing.xl}}>
          <HeroMark />
          <Text style={{...font.hero, color: colors.ink}}>Aircab</Text>
          <Heading>Find people around you who are going your way.</Heading>
          <Body>Offline-first. No login, no backend — just nearby passengers heading home in a similar direction.</Body>
        </View>
        <Card>
          {STEPS.map((s, i) => (
            <View key={s.n}>
              <View style={{flexDirection: 'row'}}>
                <View
                  style={{
                    width: 30, height: 30, borderRadius: 15, backgroundColor: colors.brandMist,
                    alignItems: 'center', justifyContent: 'center', marginRight: spacing.md,
                  }}>
                  <Text style={{color: colors.brandDeep, fontWeight: '800'}}>{s.n}</Text>
                </View>
                <View style={{flex: 1}}>
                  <Text style={{...font.bodyStrong, color: colors.ink}}>{s.title}</Text>
                  <Text style={{...font.caption, color: colors.muted, marginTop: 2}}>{s.body}</Text>
                </View>
              </View>
              {i < STEPS.length - 1 && <View style={{height: spacing.md}} />}
            </View>
          ))}
        </Card>
        <View style={{flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.md}}>
          <Chip label="No login" tone="brand" />
          <View style={{width: spacing.sm, height: spacing.sm}} />
          <Chip label="No internet needed" tone="sky" />
          <View style={{width: spacing.sm, height: spacing.sm}} />
          <Chip label="Private" tone="warn" />
        </View>
        <OfflineBanner online={false} peerCount={0} />
        <Button title="Get started" onPress={props.onStart} />
        <View style={{height: spacing.xxxl}} />
      </ScrollView>
    </Screen>
  );
}
