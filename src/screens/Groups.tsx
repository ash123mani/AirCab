import React from 'react';
import {ScrollView, Text, View} from 'react-native';
import {Avatar, Button, Card, Chip, EmptyState, Heading, Screen, Sub} from '../design/components';
import {Group, groupLabel} from '../core/groups';
import {colors, font, spacing} from '../design/tokens';

export function GroupsScreen(props: {groups: Group[]; onOpen: (g: Group) => void; onLeave: (g: Group) => void}) {
  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Heading>My Groups</Heading>
        <Sub>You can belong to multiple groups travelling in similar directions.</Sub>
        {props.groups.length === 0 && (
          <EmptyState title="No groups yet" body="Join a group from People Going Your Way. Groups hold max 4 people." />
        )}
        {props.groups.map((g, i) => (
          <Card key={g.id}>
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
              <Text style={{...font.micro, color: colors.faint}}>GROUP {i + 1}</Text>
              <Chip label={`${g.memberIds.length} / 4`} tone={g.memberIds.length >= 4 ? 'warn' : 'brand'} />
            </View>
            <Text style={{...font.title, color: colors.ink, marginTop: spacing.xs}}>{groupLabel(g)}</Text>
            <View style={{flexDirection: 'row', marginTop: spacing.md}}>
              {g.memberIds.map(id => (
                <View key={id} style={{marginRight: -10}}>
                  <Avatar name={g.memberNames[id] ?? '?'} size={36} />
                </View>
              ))}
              <Text style={{...font.caption, color: colors.muted, marginLeft: spacing.lg, alignSelf: 'center'}}>
                {Object.values(g.memberNames).join(' · ')}
              </Text>
            </View>
            <Button title="Open chat" onPress={() => props.onOpen(g)} />
            <Button title="Leave group" variant="secondary" onPress={() => props.onLeave(g)} />
          </Card>
        ))}
        <View style={{height: spacing.xl}} />
      </ScrollView>
    </Screen>
  );
}
