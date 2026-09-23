import React, {useState} from 'react';
import {Pressable, ScrollView, Text, TextInput, View} from 'react-native';
import {Badge, Heading, Screen, SendButton} from '../design/components';
import type {ChatMessage} from '../core/chat';
import {Group, groupLabel} from '../core/groups';
import {colors, font, radius, shadows, spacing} from '../design/tokens';

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
        <Text style={{...font.bodyStrong, color: colors.brandDeep}}>‹ Groups</Text>
      </Pressable>
      <View style={{height: spacing.sm}} />
      <Heading>{groupLabel(props.group)}</Heading>
      <View style={{marginBottom: spacing.md, alignSelf: 'flex-start'}}>
        <Badge
          dot={props.online ? 'green' : 'grey'}
          label={props.online ? `Connected · ${props.group.memberIds.length}/4` : 'Offline · messages send on reconnect'}
        />
      </View>
      <View
        style={{
          flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card,
          borderRadius: radius.lg, borderWidth: 1, borderColor: colors.lineSoft,
          paddingHorizontal: spacing.md, paddingVertical: spacing.sm, marginBottom: spacing.md,
        }}>
        <Text style={{...font.caption, color: colors.muted}} numberOfLines={1}>
          {Object.values(props.group.memberNames).join('  ·  ')}
        </Text>
      </View>
      <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false}>
        {props.messages.length === 0 && (
          <Text style={{...font.body, color: colors.faint, textAlign: 'center', marginTop: spacing.xl}}>
            Say hello — coordinate where to meet.
          </Text>
        )}
        {props.messages.map(m => {
          const mine = m.senderId === props.meId;
          return (
            <View
              key={m.id}
              style={{
                alignSelf: mine ? 'flex-end' : 'flex-start',
                backgroundColor: mine ? colors.brand : colors.card,
                borderWidth: mine ? 0 : 1,
                borderColor: colors.lineSoft,
                borderRadius: radius.lg,
                borderBottomRightRadius: mine ? 6 : radius.lg,
                borderBottomLeftRadius: mine ? radius.lg : 6,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                marginBottom: spacing.sm,
                maxWidth: '84%',
                ...(mine ? shadows.button : shadows.card),
              }}>
              {!mine && <Text style={{...font.caption, color: colors.brandDeep, fontWeight: '800'}}>{m.senderName}</Text>}
              <Text style={{...font.body, color: mine ? colors.white : colors.ink}}>{m.text}</Text>
              <Text style={{...font.caption, fontSize: 11, color: mine ? '#A6A6A6' : colors.faint, marginTop: 2}}>
                {new Date(m.createdAt).toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'})} · {statusMark(m.status)}
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
          placeholder="Message the group…"
          placeholderTextColor={colors.faint}
          style={{
            flex: 1, backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.line,
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
