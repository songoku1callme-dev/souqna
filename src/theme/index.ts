import { darkColors, lightColors, type ThemeColors } from './colors';
import { fontSize, fontWeight, layout, radii, spacing } from './tokens';

export type Theme = {
  mode: 'light' | 'dark';
  colors: ThemeColors;
  spacing: typeof spacing;
  radii: typeof radii;
  fontSize: typeof fontSize;
  fontWeight: typeof fontWeight;
  layout: typeof layout;
};

export const lightTheme: Theme = {
  mode: 'light',
  colors: lightColors,
  spacing,
  radii,
  fontSize,
  fontWeight,
  layout,
};

export const darkTheme: Theme = {
  mode: 'dark',
  colors: darkColors,
  spacing,
  radii,
  fontSize,
  fontWeight,
  layout,
};

export * from './tokens';
export type { ThemeColors } from './colors';
export { palette } from './palette';
