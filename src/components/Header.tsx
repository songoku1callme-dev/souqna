import type { ReactNode } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './ui/Text';

export type HeaderProps = {
  title: string;
  subtitle?: string;
  right?: ReactNode;
};

/** Lightweight in-screen header used by the tab screens (native header hidden). */
export function Header({ title, subtitle, right }: HeaderProps) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.spacing.md,
        marginBottom: theme.spacing.lg,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text variant="title">{title}</Text>
        {subtitle ? (
          <Text variant="body" color="textMuted">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}
