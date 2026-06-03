import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { isRTL } from '@/i18n/rtl';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';

export type ListRowProps = {
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  danger?: boolean;
  right?: React.ReactNode;
};

export function ListRow({
  icon,
  label,
  value,
  onPress,
  showChevron = true,
  danger,
  right,
}: ListRowProps) {
  const theme = useTheme();
  const tint = danger ? theme.colors.danger : theme.colors.text;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      {icon ? (
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: theme.radii.sm,
            backgroundColor: danger ? theme.colors.dangerMuted : theme.colors.surfaceAlt,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name={icon} size={18} color={tint} />
        </View>
      ) : null}
      <Text variant="body" style={{ flex: 1, color: tint }}>
        {label}
      </Text>
      {value ? (
        <Text variant="label" color="textMuted">
          {value}
        </Text>
      ) : null}
      {right}
      {showChevron && onPress ? (
        <Ionicons
          name={isRTL() ? 'chevron-back' : 'chevron-forward'}
          size={18}
          color={theme.colors.textMuted}
        />
      ) : null}
    </Pressable>
  );
}
