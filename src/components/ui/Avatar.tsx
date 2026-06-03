import { View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';

export type AvatarProps = {
  name: string;
  size?: number;
};

function initials(name: string): string {
  const clean = name.replace(/[·•].*$/, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function Avatar({ name, size = 44 }: AvatarProps) {
  const theme = useTheme();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: theme.colors.primaryMuted,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text variant="label" style={{ color: theme.colors.primary, fontSize: size * 0.36 }}>
        {initials(name)}
      </Text>
    </View>
  );
}
