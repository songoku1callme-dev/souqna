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
import { validateEmail, validatePassword, validateRequired } from '@/utils/validation';

export default function SignUp() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const toast = useToast();
  const signUp = useAuthStore((s) => s.signUp);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; password?: string }>(
    {},
  );
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const nameError = validateRequired(fullName);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    setErrors({
      fullName: nameError ?? undefined,
      email: emailError ?? undefined,
      password: passwordError ?? undefined,
    });
    if (nameError || emailError || passwordError) return;

    setLoading(true);
    const result = await signUp(fullName.trim(), email.trim(), password);
    setLoading(false);
    if (result.ok) {
      router.dismissAll();
    } else {
      toast.error(t(result.error));
    }
  };

  return (
    <AuthScaffold
      title={t('auth.signUpTitle')}
      subtitle={t('auth.signUpSubtitle')}
      footer={
        <View style={{ gap: theme.spacing.lg }}>
          <Button title={t('auth.signUp')} loading={loading} onPress={submit} />
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
            <Text variant="body" color="textMuted">
              {t('auth.haveAccount')}
            </Text>
            <Pressable onPress={() => router.replace('/(auth)/sign-in')}>
              <Text variant="label" color="primary">
                {t('auth.signInLink')}
              </Text>
            </Pressable>
          </View>
        </View>
      }
    >
      <Input
        label={t('auth.fullName')}
        placeholder={t('auth.fullNamePlaceholder')}
        value={fullName}
        onChangeText={setFullName}
        icon="person-outline"
        error={errors.fullName ? t(errors.fullName) : undefined}
      />
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
    </AuthScaffold>
  );
}
