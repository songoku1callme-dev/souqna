import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme/ThemeProvider';

export type OnboardingScaffoldProps = {
  step: number;
  totalSteps: number;
  title: string;
  body?: string;
  children: ReactNode;
  footer: ReactNode;
};

export function OnboardingScaffold({
  step,
  totalSteps,
  title,
  body,
  children,
  footer,
}: OnboardingScaffoldProps) {
  const theme = useTheme();
  return (
    <Screen edges={['top', 'bottom']}>
      <View style={{ flexDirection: 'row', gap: 6, marginBottom: theme.spacing['2xl'] }}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View
            key={index}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              backgroundColor: index < step ? theme.colors.primary : theme.colors.surfaceAlt,
            }}
          />
        ))}
      </View>
      <Text variant="title">{title}</Text>
      {body ? (
        <Text variant="body" color="textMuted" style={{ marginTop: theme.spacing.sm }}>
          {body}
        </Text>
      ) : null}
      <View style={{ flex: 1, marginTop: theme.spacing.xl }}>{children}</View>
      <View style={{ gap: theme.spacing.sm }}>{footer}</View>
    </Screen>
  );
}
