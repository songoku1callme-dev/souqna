import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AuthScaffold } from '@/components/auth/AuthScaffold';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/theme/ThemeProvider';
import { validateEmail, validateRequired } from '@/utils/validation';

export default function SignIn() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const toast = useToast();
  const signIn = useAuthStore((s) => s.signIn);
  const continueAsGuest = useAuthStore((s) => s.continueAsGuest);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const emailError = validateEmail(email);
    const passwordError = validateRequired(password);
    setErrors({ email: emailError ?? undefined, password: passwordError ?? undefined });
    if (emailError || passwordError) return;

    setLoading(true);
    const result = await signIn(email.trim(), password);
    setLoading(false);
    if (result.ok) {
      router.back();
    } else {
      toast.error(t(result.error));
    }
  };

  const guest = () => {
    continueAsGuest();
    router.back();
  };

  return (
    <AuthScaffold
      title={t('auth.signInTitle')}
      subtitle={t('auth.signInSubtitle')}
      footer={
        <View style={{ gap: theme.spacing.lg }}>
          <Button title={t('auth.signIn')} loading={loading} onPress={submit} />
          <Button title={t('auth.continueAsGuest')} variant="ghost" onPress={guest} />
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
            <Text variant="body" color="textMuted">
              {t('auth.noAccount')}
            </Text>
            <Pressable onPress={() => router.replace('/(auth)/sign-up')}>
              <Text variant="label" color="primary">
                {t('auth.createOne')}
              </Text>
            </Pressable>
          </View>
        </View>
      }
    >
      <Input
        label={t('auth.email')}
        placeholder={t('auth.emailPlaceholder')}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        icon="mail-outline"
        error={errors.email ? t(errors.email) : undefined}
      />
      <Input
        label={t('auth.password')}
        placeholder={t('auth.passwordPlaceholder')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        icon="lock-closed-outline"
        error={errors.password ? t(errors.password) : undefined}
      />
      <Pressable
        onPress={() => router.push('/(auth)/forgot-password')}
        style={{ alignSelf: 'flex-end' }}
      >
        <Text variant="label" color="primary">
          {t('auth.forgotPassword')}
        </Text>
      </Pressable>
    </AuthScaffold>
  );
}
