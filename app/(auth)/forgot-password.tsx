import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AuthScaffold } from '@/components/auth/AuthScaffold';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/authStore';
import { validateEmail } from '@/utils/validation';

export default function ForgotPassword() {
  const router = useRouter();
  const { t } = useTranslation();
  const toast = useToast();
  const resetPassword = useAuthStore((s) => s.resetPassword);

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const emailError = validateEmail(email);
    setError(emailError ?? undefined);
    if (emailError) return;

    setLoading(true);
    const result = await resetPassword(email.trim());
    setLoading(false);
    if (result.ok) {
      toast.success(t('auth.resetSent'));
      router.back();
    } else {
      toast.error(t(result.error));
    }
  };

  return (
    <AuthScaffold
      title={t('auth.forgotTitle')}
      subtitle={t('auth.forgotSubtitle')}
      footer={<Button title={t('auth.sendResetLink')} loading={loading} onPress={submit} />}
    >
      <Input
        label={t('auth.email')}
        placeholder={t('auth.emailPlaceholder')}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        icon="mail-outline"
        error={error ? t(error) : undefined}
      />
    </AuthScaffold>
  );
}
