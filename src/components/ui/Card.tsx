import { View, type ViewProps, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

export type CardProps = ViewProps & {
  padded?: boolean;
  elevated?: boolean;
  style?: ViewStyle;
};

export function Card({ padded = true, elevated = false, style, children, ...rest }: CardProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radii.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          padding: padded ? theme.spacing.lg : 0,
          overflow: 'hidden',
        },
        elevated && theme.mode === 'light'
          ? {
              shadowColor: '#000',
              shadowOpacity: 0.06,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
              elevation: 2,
            }
          : null,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
