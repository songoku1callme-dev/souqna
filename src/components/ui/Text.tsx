import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import type { FontWeight } from '@/theme';

type Variant = 'display' | 'title' | 'heading' | 'subtitle' | 'body' | 'label' | 'caption';
type ColorToken = 'text' | 'textMuted' | 'primary' | 'accent' | 'danger' | 'success' | 'onPrimary';

export type TextProps = RNTextProps & {
  variant?: Variant;
  color?: ColorToken;
  weight?: FontWeight;
  center?: boolean;
};

export function Text({
  variant = 'body',
  color = 'text',
  weight,
  center,
  style,
  ...rest
}: TextProps) {
  const theme = useTheme();

  const variantStyles: Record<Variant, TextStyle> = {
    display: { fontSize: theme.fontSize['4xl'], fontWeight: theme.fontWeight.bold, lineHeight: 42 },
    title: { fontSize: theme.fontSize['3xl'], fontWeight: theme.fontWeight.bold, lineHeight: 38 },
    heading: { fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.semibold, lineHeight: 26 },
    subtitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: theme.fontWeight.semibold,
      lineHeight: 24,
    },
    body: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.regular, lineHeight: 22 },
    label: { fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.semibold, lineHeight: 18 },
    caption: { fontSize: theme.fontSize.xs, fontWeight: theme.fontWeight.regular, lineHeight: 16 },
  };

  return (
    <RNText
      style={[
        variantStyles[variant],
        { color: theme.colors[color] },
        weight ? { fontWeight: theme.fontWeight[weight] } : null,
        center ? { textAlign: 'center' } : null,
        { writingDirection: 'auto' },
        style,
      ]}
      {...rest}
    />
  );
}
