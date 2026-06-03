import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './ui/Text';

export type SectionHeaderProps = {
  title: string;
  onSeeAll?: () => void;
};

export function SectionHeader({ title, onSeeAll }: SectionHeaderProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.md,
      }}
    >
      <Text variant="heading">{title}</Text>
      {onSeeAll ? (
        <Pressable onPress={onSeeAll} hitSlop={theme.layout.hitSlop}>
          <Text variant="label" color="primary">
            {t('common.seeAll')}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
