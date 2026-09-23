// Aircab "Departure" tokens — dark editorial system inspired by
// airport split-flap boards. Near-black surfaces, one runway amber,
// Inter voice + IBM Plex Mono data.
import {Platform} from 'react-native';

export const colors = {
  bg: '#0B0E11',
  surface: '#12171C',
  card: '#141A20',
  line: '#232C34',
  lineSoft: '#1B2229',
  ink: '#FFFFFF',
  inkSoft: '#D7DDE2',
  muted: '#98A2AB',
  faint: '#5D6871',
  amber: '#FFB224', // runway amber — the one signature color
  amberInk: '#191104',
  amberDim: '#3A2C10',
  green: '#2FD180',
  greenDeep: '#0E2A1D',
  red: '#FF6363',
  redDeep: '#2E1416',
  white: '#FFFFFF',
  black: '#000000',
  // legacy aliases (kept so older screens compile during migration)
  brand: '#FFB224',
  brandDeep: '#FFB224',
  brandBright: '#FFC95C',
  brandTint: '#3A2C10',
  brandMist: '#1B2229',
  accent: '#FFB224',
  accentTint: '#3A2C10',
  sky: '#1B2229',
  skyInk: '#D7DDE2',
  success: '#2FD180',
  successTint: '#0E2A1D',
  danger: '#FF6363',
  dangerTint: '#2E1416',
  offline: '#5D6871',
} as const;

export const sans = 'Inter';
export const mono = Platform.select({
  ios: 'IBM Plex Mono',
  android: 'IBMPlexMono',
  default: 'monospace',
});

export const font = {
  hero: {fontFamily: sans, fontSize: 36, lineHeight: 42, fontWeight: '800' as const, letterSpacing: -0.8},
  display: {fontFamily: sans, fontSize: 27, lineHeight: 33, fontWeight: '800' as const, letterSpacing: -0.4},
  title: {fontFamily: sans, fontSize: 20, lineHeight: 26, fontWeight: '700' as const, letterSpacing: -0.2},
  subtitle: {fontFamily: sans, fontSize: 16, lineHeight: 23, fontWeight: '600' as const},
  body: {fontFamily: sans, fontSize: 15, lineHeight: 22, fontWeight: '400' as const},
  bodyStrong: {fontFamily: sans, fontSize: 15, lineHeight: 22, fontWeight: '600' as const},
  caption: {fontFamily: sans, fontSize: 13, lineHeight: 18, fontWeight: '400' as const},
  micro: {fontFamily: sans, fontSize: 11, lineHeight: 15, fontWeight: '700' as const, letterSpacing: 1.1},
  button: {fontFamily: sans, fontSize: 16, lineHeight: 20, fontWeight: '700' as const},
  board: {fontFamily: mono, fontSize: 13, lineHeight: 18, fontWeight: '500' as const, letterSpacing: 1.4},
  boardBig: {fontFamily: mono, fontSize: 17, lineHeight: 24, fontWeight: '600' as const, letterSpacing: 1},
};

export const spacing = {xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48} as const;

export const radius = {sm: 8, md: 12, lg: 16, xl: 24, pill: 999} as const;

// Flat system: hairlines, no shadows. Kept for API compatibility.
export const shadows = {
  card: {elevation: 0},
  button: {elevation: 0},
  pop: {elevation: 0},
} as const;

// Dark tiles, light initials — one tile in amber for "you".
const tileInks = ['#FFFFFF', '#FFB224', '#2FD180', '#FFFFFF'] as const;

export function avatarColors(name: string): {bg: string; ink: string} {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  const ink = tileInks[h % tileInks.length];
  return {
    bg: ink === '#FFB224' ? '#3A2C10' : '#20272E',
    ink,
  };
}

export type Theme = {
  colors: typeof colors;
  font: typeof font;
  spacing: typeof spacing;
  radius: typeof radius;
};
export const theme: Theme = {colors, font, spacing, radius};
