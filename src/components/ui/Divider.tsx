import { View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

export function Divider({ spacing = 0 }: { spacing?: number }) {
  const theme = useTheme();
  return (
    <View
      style={{
        height: 1,
        backgroundColor: theme.colors.border,
        marginVertical: spacing,
      }}
    />
  );
}
