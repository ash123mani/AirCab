// Reusable presentational primitives — Uber rider language.
// Flat white surfaces, hairlines, black primary actions. No business logic.
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {avatarColors, colors, font, radius, spacing} from './tokens';

export function Screen(props: {children: React.ReactNode}) {
  return <View style={s.screen}>{props.children}</View>;
}

export function Heading(props: {children: React.ReactNode}) {
  return <Text style={s.heading}>{props.children}</Text>;
}
export function Sub(props: {children: React.ReactNode}) {
  return <Text style={s.sub}>{props.children}</Text>;
}
export function Body(props: {children: React.ReactNode}) {
  return <Text style={s.body}>{props.children}</Text>;
}
export function Caption(props: {children: React.ReactNode}) {
  return <Text style={s.caption}>{props.children}</Text>;
}

/** Small uppercase section label, e.g. "NEARBY · 3". */
export function SectionTitle(props: {children: React.ReactNode}) {
  return <Text style={s.section}>{props.children}</Text>;
}

/** Black rounded brand mark. */
export function HeroMark() {
  return (
    <View style={s.heroMark}>
      <Text style={s.heroMarkText}>A</Text>
      <View style={s.heroBar} />
    </View>
  );
}

export function Button(props: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}) {
  const v = props.variant ?? 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      disabled={props.disabled}
      onPress={props.onPress}
      style={({pressed}) => [
        s.btn,
        v === 'primary' && s.btnPrimary,
        v === 'secondary' && s.btnSecondary,
        v === 'danger' && s.btnDanger,
        pressed && !props.disabled && s.btnPressed,
        props.disabled && s.btnDisabled,
      ]}>
      <Text
        style={[
          s.btnText,
          v === 'primary' && s.btnTextLight,
          v === 'danger' && s.btnTextLight,
          v === 'secondary' && s.btnTextDark,
        ]}>
        {props.title}
      </Text>
    </Pressable>
  );
}

/** Compact round send button for the chat composer. */
export function SendButton(props: {onPress: () => void}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Send"
      onPress={props.onPress}
      style={({pressed}) => [s.send, pressed && s.btnPressed]}>
      <Text style={s.sendGlyph}>↑</Text>
    </Pressable>
  );
}

export function Field(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <View style={{marginBottom: spacing.md}}>
      <Text style={s.label}>{props.label}</Text>
      <TextInput
        value={props.value}
        onChangeText={props.onChange}
        placeholder={props.placeholder}
        placeholderTextColor={colors.faint}
        style={s.input}
      />
    </View>
  );
}

export function Card(props: {children: React.ReactNode}) {
  return <View style={s.card}>{props.children}</View>;
}

export function Row(props: {children: React.ReactNode}) {
  return <View style={s.row}>{props.children}</View>;
}

/** Avatar + two-line text block used for passengers and members. */
export function ListRow(props: {name: string; detail: string; right?: React.ReactNode}) {
  return (
    <View style={s.listRow}>
      <Avatar name={props.name} />
      <View style={s.listRowText}>
        <Text style={s.listRowName}>{props.name}</Text>
        <Text style={s.listRowDetail}>{props.detail}</Text>
      </View>
      {props.right}
    </View>
  );
}

export function Divider() {
  return <View style={s.divider} />;
}

export function Chip(props: {label: string; tone?: 'brand' | 'neutral' | 'warn' | 'sky'}) {
  const tone = props.tone ?? 'neutral';
  const dark = tone === 'brand';
  return (
    <View style={[s.chip, dark ? {backgroundColor: colors.ink} : {backgroundColor: colors.brandMist}]}>
      <Text style={[s.chipText, dark ? {color: colors.white} : {color: colors.ink}]}>
        {props.label}
      </Text>
    </View>
  );
}

export function Badge(props: {dot: 'green' | 'grey' | 'amber'; label: string}) {
  const dotColor = props.dot === 'green' ? colors.success : colors.offline;
  return (
    <View style={s.badge}>
      <View style={[s.dot, {backgroundColor: dotColor}]} />
      <Text style={s.badgeText}>{props.label}</Text>
    </View>
  );
}

export function Avatar(props: {name: string; size?: number}) {
  const size = props.size ?? 44;
  const c = avatarColors(props.name);
  const initials = props.name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <View style={[s.avatar, {width: size, height: size, borderRadius: size / 2, backgroundColor: c.bg}]}>
      <Text style={[s.avatarText, {color: c.ink, fontSize: size * 0.36}]}>{initials}</Text>
    </View>
  );
}

export function EmptyState(props: {title: string; body: string}) {
  return (
    <View style={s.state}>
      <View style={s.emptyGlyph}>
        <Text style={s.emptyGlyphText}>···</Text>
      </View>
      <Text style={s.stateTitle}>{props.title}</Text>
      <Text style={s.stateBody}>{props.body}</Text>
    </View>
  );
}

export function LoadingState(props: {label: string}) {
  return (
    <View style={s.state}>
      <ActivityIndicator color={colors.ink} size="large" />
      <Text style={s.stateBody}>{props.label}</Text>
    </View>
  );
}

export function ErrorState(props: {message: string; onRetry: () => void}) {
  return (
    <View style={s.state}>
      <Text style={s.stateTitle}>Something went wrong</Text>
      <Text style={s.stateBody}>{props.message}</Text>
      <View style={{height: spacing.sm}} />
      <Button title="Try again" variant="secondary" onPress={props.onRetry} />
    </View>
  );
}

export function OfflineBanner(props: {online: boolean; peerCount: number}) {
  return (
    <View style={[s.banner, props.online ? {backgroundColor: colors.ink} : {backgroundColor: colors.surface}]}>
      <View style={[s.bannerDot, {backgroundColor: props.online ? colors.success : colors.faint}]} />
      <Text style={[s.bannerText, props.online ? {color: colors.white} : {color: colors.muted}]}>
        {props.online
          ? `Nearby · ${props.peerCount} passenger${props.peerCount === 1 ? '' : 's'} connected`
          : 'Offline · searching for nearby passengers'}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.lg, paddingTop: spacing.xl},
  heading: {...font.display, color: colors.ink, marginBottom: spacing.xs},
  sub: {...font.body, color: colors.muted, marginBottom: spacing.lg},
  body: {...font.body, color: colors.inkSoft},
  caption: {...font.caption, color: colors.muted},
  section: {...font.micro, color: colors.faint, marginBottom: spacing.sm, marginTop: spacing.lg},
  heroMark: {
    width: 64, height: 64, borderRadius: 14, backgroundColor: colors.ink,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg,
  },
  heroMarkText: {fontFamily: 'Inter', color: colors.white, fontSize: 32, fontWeight: '800'},
  heroBar: {width: 30, height: 5, borderRadius: 3, backgroundColor: colors.success, marginTop: 2},
  label: {...font.micro, color: colors.muted, marginBottom: 6},
  input: {
    backgroundColor: colors.surface,
    borderWidth: 0,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    ...font.body,
    color: colors.ink,
  },
  btn: {
    borderRadius: radius.sm, paddingVertical: 15, alignItems: 'center', justifyContent: 'center',
    marginTop: spacing.sm, minHeight: 54,
  },
  btnPrimary: {backgroundColor: colors.brand},
  btnSecondary: {backgroundColor: colors.card, borderWidth: 1, borderColor: colors.ink},
  btnDanger: {backgroundColor: colors.danger},
  btnPressed: {opacity: 0.75},
  btnDisabled: {opacity: 0.4},
  btnText: {...font.button},
  btnTextLight: {color: colors.white},
  btnTextDark: {color: colors.ink},
  send: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: colors.ink,
    alignItems: 'center', justifyContent: 'center',
  },
  sendGlyph: {fontFamily: 'Inter', color: colors.white, fontSize: 22, fontWeight: '700', marginTop: -2},
  card: {
    backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.lg,
    borderWidth: 1, borderColor: colors.line, marginBottom: spacing.md,
  },
  row: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  listRow: {flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm},
  listRowText: {marginLeft: spacing.md, flex: 1},
  listRowName: {...font.bodyStrong, color: colors.ink},
  listRowDetail: {...font.caption, color: colors.muted, marginTop: 1},
  divider: {height: 1, backgroundColor: colors.lineSoft, marginVertical: spacing.sm},
  chip: {
    backgroundColor: colors.brandMist, borderRadius: radius.pill,
    paddingHorizontal: 12, paddingVertical: 7, alignSelf: 'flex-start',
  },
  chipText: {...font.caption, color: colors.ink, fontWeight: '600'},
  badge: {flexDirection: 'row', alignItems: 'center'},
  dot: {width: 8, height: 8, borderRadius: 4, marginRight: 6},
  badgeText: {...font.caption, color: colors.muted, fontWeight: '600'},
  avatar: {alignItems: 'center', justifyContent: 'center'},
  avatarText: {fontFamily: 'Inter', fontWeight: '700'},
  state: {alignItems: 'center', padding: spacing.xl},
  emptyGlyph: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: colors.brandMist,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md,
  },
  emptyGlyphText: {fontFamily: 'Inter', color: colors.ink, fontSize: 22, fontWeight: '700', letterSpacing: 2},
  stateTitle: {...font.subtitle, color: colors.ink, marginBottom: 4, textAlign: 'center'},
  stateBody: {...font.body, color: colors.muted, textAlign: 'center'},
  banner: {
    flexDirection: 'row', alignItems: 'center', borderRadius: radius.pill,
    paddingHorizontal: spacing.md, paddingVertical: 11, marginBottom: spacing.lg,
  },
  bannerDot: {width: 9, height: 9, borderRadius: 5, marginRight: spacing.sm},
  bannerText: {...font.caption, fontWeight: '600'},
});
