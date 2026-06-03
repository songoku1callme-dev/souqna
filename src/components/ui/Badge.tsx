import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';

type Tone = 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'verified';

export type BadgeProps = {
  label: string;
  tone?: Tone;
  icon?: keyof typeof Ionicons.glyphMap;
  small?: boolean;
};

export function Badge({ label, tone = 'neutral', icon, small }: BadgeProps) {
  const theme = useTheme();

  const toneBg: Record<Tone, string> = {
    primary: theme.colors.primaryMuted,
    success: theme.colors.primaryMuted,
    warning: theme.colors.accentMuted,
    danger: theme.colors.dangerMuted,
    neutral: theme.colors.surfaceAlt,
    verified: theme.colors.primaryMuted,
  };
  const toneFg: Record<Tone, keyof typeof theme.colors> = {
    primary: 'primary',
    success: 'success',
    warning: 'warning',
    danger: 'danger',
    neutral: 'textMuted',
    verified: 'verified',
  };

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: toneBg[tone],
          borderRadius: theme.radii.pill,
          paddingVertical: small ? 3 : 5,
          paddingHorizontal: small ? theme.spacing.sm : theme.spacing.md,
        },
      ]}
    >
      {icon ? (
        <Ionicons name={icon} size={small ? 11 : 13} color={theme.colors[toneFg[tone]]} />
      ) : null}
      <Text variant="caption" weight="semibold" style={{ color: theme.colors[toneFg[tone]] }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' },
});
