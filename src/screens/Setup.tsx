import React, {useState} from 'react';
import {ScrollView, Text, View} from 'react-native';
import {Avatar, Button, Card, Heading, Screen, SectionTitle, Sub} from '../design/components';
import {CITIES} from '../data/cities';
import {colors, font, radius, spacing} from '../design/tokens';

export function SetupScreen(props: {name: string; onDone: (city: string, area: string) => void}) {
  const cities = Object.keys(CITIES);
  const [city, setCity] = useState(cities[0]);
  const [area, setArea] = useState(CITIES[cities[0]][0]);
  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={{...font.board, color: colors.amber, marginBottom: spacing.sm}}>STEP 01 · FILE FLIGHT PLAN</Text>
        <Heading>Where to, passenger?</Heading>
        <Sub>Only the destination area is broadcast. Never your address or live location.</Sub>
        <Card>
          <Text style={{...font.board, color: colors.faint, fontSize: 11}}>TRAVEL ALIAS · AUTO-ISSUED</Text>
          <View style={{flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm}}>
            <Avatar name={props.name} size={56} />
            <View style={{marginLeft: spacing.md}}>
              <Text style={{...font.title, color: colors.ink}}>{props.name}</Text>
              <Text style={{...font.board, color: colors.muted, fontSize: 11, marginTop: 4}}>
                NO PHONE · NO EMAIL · THIS TRIP ONLY
              </Text>
            </View>
          </View>
        </Card>
        <SectionTitle>ORIGIN · AIRPORT</SectionTitle>
        <Card>
          <Text style={{...font.boardBig, color: colors.ink}}>▲  DEPARTING · AIRPORT TERMINAL</Text>
        </Card>
        <SectionTitle>DESTINATION CITY</SectionTitle>
        <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
          {cities.map(name => {
            const active = name === city;
            return (
              <Text
                key={name}
                onPress={() => {
                  setCity(name);
                  const a = CITIES[name]?.[0];
                  if (a) setArea(a);
                }}
                style={{
                  ...font.bodyStrong,
                  color: active ? colors.amberInk : colors.inkSoft,
                  backgroundColor: active ? colors.amber : colors.surface,
                  borderWidth: 1,
                  borderColor: active ? colors.amber : colors.line,
                  borderRadius: radius.pill,
                  paddingHorizontal: 18,
                  paddingVertical: 11,
                  marginRight: spacing.sm,
                  marginBottom: spacing.sm,
                  overflow: 'hidden',
                }}>
                {name}
              </Text>
            );
          })}
        </View>
        <SectionTitle>{`DESTINATION SECTOR · ${city.toUpperCase()}`}</SectionTitle>
        <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
          {(CITIES[city] ?? []).map(a => {
            const active = a === area;
            return (
              <Text
                key={a}
                onPress={() => setArea(a)}
                style={{
                  ...font.board,
                  color: active ? colors.amberInk : colors.inkSoft,
                  backgroundColor: active ? colors.amber : colors.surface,
                  borderWidth: 1,
                  borderColor: active ? colors.amber : colors.line,
                  borderRadius: radius.pill,
                  paddingHorizontal: 16,
                  paddingVertical: 11,
                  marginRight: spacing.sm,
                  marginBottom: spacing.sm,
                  overflow: 'hidden',
                }}>
                {a.toUpperCase()}
              </Text>
            );
          })}
        </View>
        <Button title={`Scan ${area} frequenc${area.endsWith('y') ? 'ies' : 'y'} →`} onPress={() => props.onDone(city, area)} />
        <View style={{height: spacing.xxxl}} />
      </ScrollView>
    </Screen>
  );
}
