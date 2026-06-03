import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { EmptyState } from './ui/EmptyState';

export function LoginRequired() {
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <EmptyState
      icon="lock-closed-outline"
      title={t('auth.loginRequiredTitle')}
      body={t('auth.loginRequiredBody')}
      actionLabel={t('auth.signIn')}
      onAction={() => router.push('/(auth)/sign-in')}
    />
  );
}
