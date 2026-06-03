import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme/ThemeProvider';

export type AuthScaffoldProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthScaffold({ title, subtitle, children, footer }: AuthScaffoldProps) {
  const theme = useTheme();
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <Screen scroll edges={['bottom']}>
        <View style={{ gap: theme.spacing.xs, marginBottom: theme.spacing['2xl'] }}>
          <Text variant="title">{title}</Text>
          <Text variant="body" color="textMuted">
            {subtitle}
          </Text>
        </View>
        <View style={{ gap: theme.spacing.lg }}>{children}</View>
        {footer ? <View style={{ marginTop: theme.spacing.xl }}>{footer}</View> : null}
      </Screen>
    </KeyboardAvoidingView>
  );
}
