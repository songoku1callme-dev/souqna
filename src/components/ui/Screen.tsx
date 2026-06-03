import type { ReactNode } from 'react';
import { ScrollView, View, type ScrollViewProps, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useResponsive } from '@/hooks/useResponsive';
import { useTheme } from '@/theme/ThemeProvider';

export type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  edges?: Edge[];
  contentContainerStyle?: ViewStyle;
  scrollProps?: ScrollViewProps;
  background?: 'background' | 'surface';
};

export function Screen({
  children,
  scroll = false,
  padded = true,
  edges = ['top'],
  contentContainerStyle,
  scrollProps,
  background = 'background',
}: ScreenProps) {
  const theme = useTheme();
  const { maxContentWidth } = useResponsive();
  const padding = padded ? theme.layout.screenPadding : 0;

  // Center content within a device-canvas so the app never stretches like a
  // desktop site on wide viewports (tablets / dev web build).
  const canvas: ViewStyle = { width: '100%', maxWidth: maxContentWidth, alignSelf: 'center' };

  const body = scroll ? (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        { padding, paddingBottom: theme.spacing['4xl'] },
        canvas,
        contentContainerStyle,
      ]}
      {...scrollProps}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1, padding }, canvas, contentContainerStyle]}>{children}</View>
  );

  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: theme.colors[background] }}>
      {body}
    </SafeAreaView>
  );
}
