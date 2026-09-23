import React, {useState} from 'react';
import {ScrollView, Text, View} from 'react-native';
import {Button, Caption, Card, Heading, Screen, SectionTitle, Sub} from '../design/components';
import {CITIES} from '../data/cities';
import {colors, font, radius, spacing} from '../design/tokens';
import {avatarColors} from '../design/tokens';

export function SetupScreen(props: {name: string; onDone: (city: string, area: string) => void}) {
  const cities = Object.keys(CITIES);
  const [city, setCity] = useState(cities[0]);
  const [area, setArea] = useState(CITIES[cities[0]][0]);
  const c = avatarColors(props.name);
  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Heading>Where are you headed?</Heading>
        <Sub>Only your destination area is shared. Never your address or live location.</Sub>
        <Card>
          <Caption>YOUR TEMPORARY NAME</Caption>
          <View style={{flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm}}>
            <View
              style={{
                width: 52, height: 52, borderRadius: 26, backgroundColor: c.bg,
                alignItems: 'center', justifyContent: 'center', marginRight: spacing.md,
              }}>
              <Text style={{fontSize: 20, fontWeight: '800', color: c.ink}}>
                {props.name.split(' ').map(w => w[0]).join('')}
              </Text>
            </View>
            <View>
              <Text style={{...font.title, color: colors.ink}}>{props.name}</Text>
              <Caption>No phone number. No email. Just this trip.</Caption>
            </View>
          </View>
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
                  color: active ? colors.white : colors.inkSoft,
                  backgroundColor: active ? colors.brand : colors.card,
                  borderWidth: 1,
                  borderColor: active ? colors.brand : colors.line,
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
        <SectionTitle>DESTINATION AREA · {city.toUpperCase()}</SectionTitle>
        <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
          {(CITIES[city] ?? []).map(a => {
            const active = a === area;
            return (
              <Text
                key={a}
                onPress={() => setArea(a)}
                style={{
                  ...font.bodyStrong,
                  color: active ? colors.brandDeep : colors.inkSoft,
                  backgroundColor: active ? colors.brandTint : colors.card,
                  borderWidth: 1,
                  borderColor: active ? colors.brand : colors.line,
                  borderRadius: radius.pill,
                  paddingHorizontal: 18,
                  paddingVertical: 11,
                  marginRight: spacing.sm,
                  marginBottom: spacing.sm,
                  overflow: 'hidden',
                }}>
                {a}
              </Text>
            );
          })}
        </View>
        <Button title={`Find people going to ${area}`} onPress={() => props.onDone(city, area)} />
        <View style={{height: spacing.xxxl}} />
      </ScrollView>
    </Screen>
  );
}
