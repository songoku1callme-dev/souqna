import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ListingsGrid } from '@/components/ListingsGrid';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { LISTINGS } from '@/data/listings';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useTheme } from '@/theme/ThemeProvider';

export default function SavedScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const ids = useFavoritesStore((s) => s.ids);
  const saved = LISTINGS.filter((l) => ids.includes(l.id));

  return (
    <Screen scroll contentContainerStyle={{ gap: theme.spacing.lg }}>
      <Stack.Screen options={{ title: t('profile.savedItems') }} />
      {saved.length === 0 ? (
        <EmptyState icon="heart-outline" title={t('empty.noSaved')} body={t('empty.noSavedBody')} />
      ) : (
        <ListingsGrid listings={saved} />
      )}
    </Screen>
  );
}
