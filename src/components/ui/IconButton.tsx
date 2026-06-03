import { Pressable, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/theme/ThemeProvider';

export type IconButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  size?: number;
  color?: keyof ReturnType<typeof useTheme>['colors'];
  variant?: 'plain' | 'surface';
  accessibilityLabel?: string;
  style?: ViewStyle;
};

export function IconButton({
  icon,
  onPress,
  size = 22,
  color = 'text',
  variant = 'plain',
  accessibilityLabel,
  style,
}: IconButtonProps) {
  const theme = useTheme();
  const dimension = size + 18;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={theme.layout.hitSlop}
      style={({ pressed }) => [
        {
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: variant === 'surface' ? theme.colors.surface : 'transparent',
          borderWidth: variant === 'surface' ? 1 : 0,
          borderColor: theme.colors.border,
          opacity: pressed ? 0.6 : 1,
        },
        style,
      ]}
    >
      <Ionicons name={icon} size={size} color={theme.colors[color]} />
    </Pressable>
  );
}
