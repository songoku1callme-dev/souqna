/**
 * Raw color palette for Souqna.
 *
 * Design direction: culturally warm, premium, trustworthy. Warm cream
 * neutrals, a confident teal primary (calm / trust) and a terracotta accent
 * (warmth / craft). Avoid neon and generic marketplace spam colors.
 */

export const palette = {
  // Warm neutrals
  cream50: '#FBF7F0',
  cream100: '#F5EEE2',
  cream200: '#ECE1CE',
  sand300: '#E2D4BC',
  clay900: '#1F1B16',
  clay800: '#2A241D',
  clay700: '#3A3228',
  stone600: '#6B6256',
  stone500: '#8A8073',
  stone400: '#A8A092',

  // Brand teal
  teal300: '#5EEAD4',
  teal400: '#2DD4BF',
  teal500: '#14B8A6',
  teal600: '#0F766E',
  teal700: '#115E59',

  // Terracotta accent
  clayAccent300: '#F0A883',
  clayAccent400: '#E8794B',
  clayAccent500: '#C2562B',
  clayAccent600: '#9A431F',

  // Semantic
  green600: '#15803D',
  green400: '#4ADE80',
  amber600: '#D97706',
  amber400: '#FBBF24',
  red600: '#DC2626',
  red400: '#F87171',
  blue600: '#0E7490',
  blue400: '#38BDF8',

  // Pure
  white: '#FFFFFF',
  black: '#000000',

  // Dark surfaces
  ink950: '#14110D',
  ink900: '#1E1A15',
  ink800: '#2A241D',
  ink700: '#332C23',
} as const;
