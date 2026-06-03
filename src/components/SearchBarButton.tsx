import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './ui/Text';

export function SearchBarButton({
  placeholder,
  onPress,
}: {
  placeholder: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radii.md,
        paddingHorizontal: theme.spacing.md,
        height: 48,
      }}
    >
      <Ionicons name="search" size={18} color={theme.colors.textMuted} />
      <Text variant="body" color="textMuted" style={{ flex: 1 }} numberOfLines={1}>
        {placeholder}
      </Text>
    </Pressable>
  );
}
