import React from 'react';
import {Pressable, ScrollView, Text, View} from 'react-native';
import {Avatar, Button, Card, Chip, EmptyState, Heading, Perforation, Screen, Sub} from '../design/components';
import {Group, groupLabel} from '../core/groups';
import {colors, font, spacing} from '../design/tokens';

export function GroupsScreen(props: {groups: Group[]; onOpen: (g: Group) => void; onLeave: (g: Group) => void}) {
  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={{...font.board, color: colors.amber, marginBottom: spacing.sm}}>
          YOUR WALLET
        </Text>
        <Heading>Boarding passes</Heading>
        <Sub>One pass per group. Several groups may share a heading.</Sub>
        {props.groups.length === 0 && (
          <EmptyState
            title="Wallet empty"
            body="Board a group from Routes. Passes hold max 4 passengers."
          />
        )}
        {props.groups.map((g, i) => (
          <Card key={g.id}>
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
              <Text style={{...font.board, color: colors.faint, fontSize: 12}}>
                PASS {String(i + 1).padStart(2, '0')} · {g.city.toUpperCase()}
              </Text>
              <Chip label={`${g.memberIds.length}/4 SEATS`} tone={g.memberIds.length >= 4 ? 'neutral' : 'brand'} />
            </View>
            <Text style={{...font.display, color: colors.ink, marginTop: spacing.xs}}>
              {groupLabel(g)}
            </Text>
            <Perforation />
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              {g.memberIds.map(id => (
                <View key={id} style={{marginRight: -10}}>
                  <Avatar name={g.memberNames[id] ?? '?'} size={36} />
                </View>
              ))}
              <Text style={{...font.board, color: colors.muted, fontSize: 11, marginLeft: spacing.lg, flex: 1}}>
                {Object.values(g.memberNames).join(' · ').toUpperCase()}
              </Text>
            </View>
            <Button title="Open channel →" onPress={() => props.onOpen(g)} />
            <Pressable onPress={() => props.onLeave(g)} hitSlop={12} style={{alignSelf: 'center', marginTop: spacing.md}}>
              <Text style={{...font.bodyStrong, color: colors.red}}>Tear up this pass</Text>
            </Pressable>
          </Card>
        ))}
        <View style={{height: spacing.xl}} />
      </ScrollView>
    </Screen>
  );
}
