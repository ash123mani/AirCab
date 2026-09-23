import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {colors, font, spacing} from '../design/tokens';

export type Route = 'welcome' | 'setup' | 'nearby' | 'way' | 'groups' | 'chat' | 'profile';

const TABS: {id: Route; label: string}[] = [
  {id: 'nearby', label: 'Radar'},
  {id: 'way', label: 'Routes'},
  {id: 'groups', label: 'Passes'},
  {id: 'profile', label: 'You'},
];

export function TabBar(props: {route: Route; onGo: (r: Route) => void}) {
  if (props.route === 'welcome' || props.route === 'setup' || props.route === 'chat') return null;
  return (
    <View style={s.bar}>
      {TABS.map(t => {
        const active = props.route === t.id;
        return (
          <Pressable key={t.id} onPress={() => props.onGo(t.id)} style={s.tab}>
            <View style={[s.dot, active && s.dotActive]} />
            <Text style={[s.label, active && s.labelActive]}>{t.label.toUpperCase()}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.sm,
  },
  tab: {flex: 1, alignItems: 'center', paddingVertical: 4},
  dot: {width: 5, height: 5, borderRadius: 3, backgroundColor: 'transparent', marginBottom: 5},
  dotActive: {backgroundColor: colors.amber},
  label: {...font.board, color: colors.faint, fontSize: 11},
  labelActive: {color: colors.ink},
});
