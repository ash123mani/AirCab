// Aircab design tokens — Uber rider language:
// monochrome, high contrast, flat surfaces, hairlines over shadows.
export const colors = {
  ink: '#000000',
  inkSoft: '#1A1A1A',
  muted: '#545454',
  faint: '#A6A6A6',
  line: '#E2E2E2',
  lineSoft: '#EFEFEF',
  bg: '#FFFFFF',
  surface: '#F6F6F6',
  card: '#FFFFFF',
  brand: '#000000', // Uber black — primary actions
  brandDeep: '#000000',
  brandBright: '#1A1A1A',
  brandTint: '#EFEFEF',
  brandMist: '#F6F6F6',
  accent: '#000000',
  accentTint: '#F6F6F6',
  sky: '#F6F6F6',
  skyInk: '#000000',
  success: '#06C167', // Uber green
  successTint: '#E6F7EE',
  danger: '#C81E1E',
  dangerTint: '#FDECEC',
  offline: '#A6A6A6',
  white: '#FFFFFF',
} as const;

// Inter is bundled (assets/fonts + iOS UIAppFonts + Android assets).
// Weight map: 400 Regular · 500 Medium · 600 SemiBold · 700 Bold · 800 ExtraBold.
const inter = 'Inter';

export const font = {
  hero: {fontFamily: inter, fontSize: 32, lineHeight: 38, fontWeight: '800' as const, letterSpacing: -0.6},
  display: {fontFamily: inter, fontSize: 26, lineHeight: 32, fontWeight: '800' as const, letterSpacing: -0.4},
  title: {fontFamily: inter, fontSize: 20, lineHeight: 26, fontWeight: '700' as const, letterSpacing: -0.2},
  subtitle: {fontFamily: inter, fontSize: 16, lineHeight: 22, fontWeight: '600' as const},
  body: {fontFamily: inter, fontSize: 15, lineHeight: 22, fontWeight: '400' as const},
  bodyStrong: {fontFamily: inter, fontSize: 15, lineHeight: 22, fontWeight: '600' as const},
  caption: {fontFamily: inter, fontSize: 13, lineHeight: 18, fontWeight: '400' as const},
  micro: {fontFamily: inter, fontSize: 12, lineHeight: 16, fontWeight: '600' as const, letterSpacing: 0.8},
  button: {fontFamily: inter, fontSize: 16, lineHeight: 20, fontWeight: '600' as const},
};

export const spacing = {xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48} as const;

export const radius = {sm: 8, md: 12, lg: 16, xl: 24, pill: 999} as const;

// Uber is flat: hairlines, not shadows. Kept for API compatibility.
export const shadows = {
  card: {elevation: 0},
  button: {elevation: 0},
  pop: {elevation: 0},
} as const;

// Monochrome avatar grays derived from a name.
const avatarBg = ['#EFEFEF', '#E4E4E4', '#D8D8D8', '#CFCFCF', '#E9E9E9', '#DBDBDB'] as const;

export function avatarColors(name: string): {bg: string; ink: string} {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return {bg: avatarBg[h % avatarBg.length], ink: '#000000'};
}

export type Theme = {
  colors: typeof colors;
  font: typeof font;
  spacing: typeof spacing;
  radius: typeof radius;
};
export const theme: Theme = {colors, font, spacing, radius};
