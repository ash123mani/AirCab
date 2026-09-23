import React from 'react';
import {ScrollView, Text, View} from 'react-native';
import {Body, Button, Card, Chip, HeroMark, OfflineBanner, Screen, SectionTitle} from '../design/components';
import {colors, font, spacing} from '../design/tokens';

const STEPS = [
  {n: '01', title: 'File your destination', body: 'Only the area leaves this phone. Never your address.'},
  {n: '02', title: 'Scan the terminal', body: 'Phones find each other over Bluetooth. No internet.'},
  {n: '03', title: 'Board together', body: 'Groups of max 4, heading your way. Chat offline.'},
];

export function WelcomeScreen(props: {onStart: () => void}) {
  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{marginTop: spacing.xl}}>
          <HeroMark />
          <Text style={{...font.board, color: colors.amber, marginBottom: spacing.sm}}>AIRCAB · NIGHT TERMINAL</Text>
          <Text style={{...font.hero, color: colors.ink}}>
            Find people{'\n'}going <Text style={{color: colors.amber}}>your way.</Text>
          </Text>
          <View style={{height: spacing.sm}} />
          <Body>No login. No backend. Just passengers heading home in a similar direction.</Body>
        </View>
        <View style={{height: spacing.lg}} />
        <Card>
          {STEPS.map((s, i) => (
            <View key={s.n}>
              <View style={{flexDirection: 'row'}}>
                <Text style={{...font.boardBig, color: colors.amber, marginRight: spacing.md}}>{s.n}</Text>
                <View style={{flex: 1}}>
                  <Text style={{...font.bodyStrong, color: colors.ink}}>{s.title}</Text>
                  <Text style={{...font.caption, color: colors.muted, marginTop: 2}}>{s.body}</Text>
                </View>
              </View>
              {i < STEPS.length - 1 && <View style={{height: spacing.lg}} />}
            </View>
          ))}
        </Card>
        <View style={{flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.md}}>
          <Chip label="NO LOGIN" tone="brand" />
          <View style={{width: spacing.sm, height: spacing.sm}} />
          <Chip label="WORKS OFFLINE" tone="neutral" />
          <View style={{width: spacing.sm, height: spacing.sm}} />
          <Chip label="PRIVATE" tone="neutral" />
        </View>
        <OfflineBanner online={false} peerCount={0} />
        <Button title="Start boarding →" onPress={props.onStart} />
        <SectionTitle>AIRCAB v1 · PEER TO PEER</SectionTitle>
        <View style={{height: spacing.xxxl}} />
      </ScrollView>
    </Screen>
  );
}
