import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';

export default function NotFound() {
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <Screen>
      <EmptyState
        icon="compass-outline"
        title={t('errors.notFound')}
        body={t('errors.notFoundBody')}
        actionLabel={t('common.back')}
        onAction={() => router.replace('/(tabs)')}
      />
    </Screen>
  );
}
