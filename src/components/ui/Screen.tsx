import type { ReactNode } from 'react';
import { ScrollView, View, type ScrollViewProps, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

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
  const padding = padded ? theme.layout.screenPadding : 0;

  const body = scroll ? (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        { padding, paddingBottom: theme.spacing['4xl'] },
        contentContainerStyle,
      ]}
      {...scrollProps}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1, padding }, contentContainerStyle]}>{children}</View>
  );

  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: theme.colors[background] }}>
      {body}
    </SafeAreaView>
  );
}
