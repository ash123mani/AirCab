import React, {useState} from 'react';
import {Pressable, ScrollView, Text, TextInput, View} from 'react-native';
import {Badge, Heading, Screen, SendButton} from '../design/components';
import type {ChatMessage} from '../core/chat';
import {Group, groupLabel} from '../core/groups';
import {colors, font, radius, spacing} from '../design/tokens';

function statusMark(s: ChatMessage['status']): string {
  return s === 'delivered' ? '✓✓' : s === 'sent' ? '✓' : s === 'failed' ? '!' : '…';
}

export function ChatScreen(props: {
  group: Group;
  messages: ChatMessage[];
  meId: string;
  online: boolean;
  onSend: (text: string) => void;
  onBack: () => void;
}) {
  const [draft, setDraft] = useState('');
  return (
    <Screen>
      <Pressable onPress={props.onBack} hitSlop={12}>
        <Text style={{...font.board, color: colors.amber, fontSize: 12}}>← ALL PASSES</Text>
      </Pressable>
      <View style={{height: spacing.sm}} />
      <Heading>{groupLabel(props.group)}</Heading>
      <View style={{marginBottom: spacing.md, alignSelf: 'flex-start'}}>
        <Badge
          dot={props.online ? 'green' : 'grey'}
          label={props.online ? `Live · ${props.group.memberIds.length}/4 aboard` : 'Holding · sends on reconnect'}
        />
      </View>
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radius.sm,
          borderWidth: 1, borderColor: colors.line,
          paddingHorizontal: spacing.md, paddingVertical: spacing.sm, marginBottom: spacing.md,
        }}>
        <Text style={{...font.board, color: colors.muted, fontSize: 11}} numberOfLines={1}>
          {Object.values(props.group.memberNames).join(' · ').toUpperCase()}
        </Text>
      </View>
      <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false}>
        {props.messages.length === 0 && (
          <Text style={{...font.body, color: colors.faint, textAlign: 'center', marginTop: spacing.xl}}>
            Frequency open. Say where to meet.
          </Text>
        )}
        {props.messages.map(m => {
          const mine = m.senderId === props.meId;
          return (
            <View
              key={m.id}
              style={{
                alignSelf: mine ? 'flex-end' : 'flex-start',
                backgroundColor: mine ? colors.amber : colors.surface,
                borderWidth: mine ? 0 : 1,
                borderColor: colors.line,
                borderRadius: radius.md,
                borderBottomRightRadius: mine ? 4 : radius.md,
                borderBottomLeftRadius: mine ? radius.md : 4,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                marginBottom: spacing.sm,
                maxWidth: '84%',
              }}>
              {!mine && (
                <Text style={{...font.board, color: colors.amber, fontSize: 11}}>{m.senderName.toUpperCase()}</Text>
              )}
              <Text style={{...font.body, color: mine ? colors.amberInk : colors.ink}}>{m.text}</Text>
              <Text style={{...font.board, fontSize: 10, color: mine ? '#6B4E12' : colors.faint, marginTop: 3}}>
                {new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', hour12: false})} · {statusMark(m.status)}
              </Text>
            </View>
          );
        })}
        <View style={{height: spacing.md}} />
      </ScrollView>
      <View style={{flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm}}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Transmit to group…"
          placeholderTextColor={colors.faint}
          style={{
            flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line,
            borderRadius: radius.pill, paddingHorizontal: 18, paddingVertical: 13,
            ...font.body, color: colors.ink, marginRight: spacing.sm,
          }}
          onSubmitEditing={() => {
            props.onSend(draft);
            setDraft('');
          }}
        />
        <SendButton onPress={() => {props.onSend(draft); setDraft('');}} />
      </View>
      <View style={{height: spacing.md}} />
    </Screen>
  );
}
