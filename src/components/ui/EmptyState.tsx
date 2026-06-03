import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/theme/ThemeProvider';
import { Button } from './Button';
import { Text } from './Text';

export type EmptyStateProps = {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  icon = 'cube-outline',
  title,
  body,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const theme = useTheme();
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing['4xl'],
        paddingHorizontal: theme.spacing.xl,
        gap: theme.spacing.sm,
      }}
    >
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: theme.colors.surfaceAlt,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: theme.spacing.sm,
        }}
      >
        <Ionicons name={icon} size={34} color={theme.colors.textMuted} />
      </View>
      <Text variant="subtitle" center>
        {title}
      </Text>
      {body ? (
        <Text variant="body" color="textMuted" center>
          {body}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button
          title={actionLabel}
          onPress={onAction}
          fullWidth={false}
          variant="secondary"
          style={{ marginTop: theme.spacing.md }}
        />
      ) : null}
    </View>
  );
}
