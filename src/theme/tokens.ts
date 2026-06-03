/**
 * Non-color design tokens shared across both themes: spacing scale, radii,
 * typography sizes and font weights. Components should consume these instead
 * of hardcoding magic numbers.
 */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 56,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999,
} as const;

export const fontSize = {
  xs: 12,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export type FontWeight = keyof typeof fontWeight;
export type SpacingKey = keyof typeof spacing;

export const layout = {
  screenPadding: spacing.xl,
  cardGap: spacing.md,
  hitSlop: { top: 8, bottom: 8, left: 8, right: 8 },
} as const;
