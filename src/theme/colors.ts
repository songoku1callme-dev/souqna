import { palette } from './palette';

/**
 * Semantic color tokens. Every UI surface references these names (e.g.
 * `colors.text`, `colors.primary`) so that swapping light/dark only changes
 * this mapping, never the components.
 */
export type ThemeColors = {
  background: string;
  surface: string;
  surfaceAlt: string;
  surfaceElevated: string;
  text: string;
  textMuted: string;
  textInverse: string;
  border: string;
  borderStrong: string;
  primary: string;
  primaryMuted: string;
  onPrimary: string;
  accent: string;
  accentMuted: string;
  onAccent: string;
  success: string;
  warning: string;
  danger: string;
  dangerMuted: string;
  verified: string;
  skeleton: string;
  overlay: string;
  tabBar: string;
  tabActive: string;
  tabInactive: string;
};

export const lightColors: ThemeColors = {
  background: palette.cream50,
  surface: palette.white,
  surfaceAlt: palette.cream100,
  surfaceElevated: palette.white,
  text: palette.clay900,
  textMuted: palette.stone600,
  textInverse: palette.white,
  border: palette.cream200,
  borderStrong: palette.sand300,
  primary: palette.teal600,
  primaryMuted: '#D6EEEB',
  onPrimary: palette.white,
  accent: palette.clayAccent500,
  accentMuted: '#F8E4D8',
  onAccent: palette.white,
  success: palette.green600,
  warning: palette.amber600,
  danger: palette.red600,
  dangerMuted: '#FBE3E3',
  verified: palette.teal600,
  skeleton: palette.cream200,
  overlay: 'rgba(31,27,22,0.45)',
  tabBar: palette.white,
  tabActive: palette.teal600,
  tabInactive: palette.stone500,
};

export const darkColors: ThemeColors = {
  background: palette.ink950,
  surface: palette.ink900,
  surfaceAlt: palette.ink800,
  surfaceElevated: palette.ink800,
  text: palette.cream50,
  textMuted: palette.stone400,
  textInverse: palette.clay900,
  border: palette.ink700,
  borderStrong: '#41382D',
  primary: palette.teal400,
  primaryMuted: '#0C2E2B',
  onPrimary: palette.ink950,
  accent: palette.clayAccent400,
  accentMuted: '#3A241A',
  onAccent: palette.ink950,
  success: palette.green400,
  warning: palette.amber400,
  danger: palette.red400,
  dangerMuted: '#3A1D1D',
  verified: palette.teal400,
  skeleton: palette.ink800,
  overlay: 'rgba(0,0,0,0.6)',
  tabBar: palette.ink900,
  tabActive: palette.teal400,
  tabInactive: palette.stone500,
};
