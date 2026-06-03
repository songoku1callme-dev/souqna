import { ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { CATEGORIES } from '@/data/categories';
import { useTheme } from '@/theme/ThemeProvider';
import { Chip } from './ui/Chip';

export function CategoryChipsRow() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: theme.spacing.sm, paddingVertical: 2 }}
    >
      {CATEGORIES.map((category) => (
        <Chip
          key={category.id}
          label={t(`categories.${category.slug}`)}
          icon={category.icon as never}
          onPress={() => router.push(`/category/${category.slug}`)}
        />
      ))}
    </ScrollView>
  );
}
