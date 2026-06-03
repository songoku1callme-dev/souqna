import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './ui/Text';

export type SelectableOptionProps = {
  label: string;
  description?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  selected: boolean;
  onPress: () => void;
};

export function SelectableOption({
  label,
  description,
  icon,
  selected,
  onPress,
}: SelectableOptionProps) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        padding: theme.spacing.lg,
        borderRadius: theme.radii.md,
        borderWidth: 1.5,
        borderColor: selected ? theme.colors.primary : theme.colors.border,
        backgroundColor: selected ? theme.colors.primaryMuted : theme.colors.surface,
        opacity: pressed ? 0.9 : 1,
      })}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={22}
          color={selected ? theme.colors.primary : theme.colors.textMuted}
        />
      ) : null}
      <View style={{ flex: 1 }}>
        <Text variant="subtitle">{label}</Text>
        {description ? (
          <Text variant="caption" color="textMuted">
            {description}
          </Text>
        ) : null}
      </View>
      <Ionicons
        name={selected ? 'checkmark-circle' : 'ellipse-outline'}
        size={22}
        color={selected ? theme.colors.primary : theme.colors.borderStrong}
      />
    </Pressable>
  );
}
