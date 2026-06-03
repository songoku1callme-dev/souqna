import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Chip } from '@/components/ui/Chip';
import { Input } from '@/components/ui/Input';
import { PickerField } from '@/components/ui/PickerField';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { CATEGORIES } from '@/data/categories';
import { CITIES } from '@/data/cities';
import { useLocale } from '@/hooks/useLocale';
import { useAuthStore } from '@/store/authStore';
import { useLocationStore } from '@/store/locationStore';
import { useSellerStore } from '@/store/sellerStore';
import { useTheme } from '@/theme/ThemeProvider';
import type { CategorySlug } from '@/types';
import { validateEmail, validateRequired } from '@/utils/validation';

export default function SellerOnboarding() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const toast = useToast();
  const { lang } = useLocale();
  const user = useAuthStore((s) => s.user);
  const defaultCity = useLocationStore((s) => s.cityId);
  const submitApplication = useSellerStore((s) => s.submitApplication);

  const [displayName, setDisplayName] = useState(user?.fullName ?? '');
  const [legalName, setLegalName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(user?.email ?? '');
  const [cityId, setCityId] = useState<string | null>(defaultCity);
  const [postalCode, setPostalCode] = useState('');
  const [categorySlugs, setCategorySlugs] = useState<CategorySlug[]>([]);
  const [idUploaded, setIdUploaded] = useState(false);
  const [docsUploaded, setDocsUploaded] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const cityOptions = CITIES.map((c) => ({ value: c.id, label: c.name[lang] }));

  const toggleCategory = (slug: CategorySlug) =>
    setCategorySlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );

  const submit = () => {
    const nextErrors: Record<string, string> = {};
    const nameError = validateRequired(displayName);
    const phoneError = validateRequired(phone);
    const emailError = validateEmail(email);
    if (nameError) nextErrors.displayName = nameError;
    if (phoneError) nextErrors.phone = phoneError;
    if (emailError) nextErrors.email = emailError;
    if (!cityId) nextErrors.city = 'validation.required';
    if (!acceptedTerms) nextErrors.terms = 'validation.mustAcceptTerms';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error(t('validation.fixErrors'));
      return;
    }

    submitApplication({
      displayName: displayName.trim(),
      legalName: legalName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      cityId,
      postalCode: postalCode.trim(),
      categorySlugs,
      idDocumentName: idUploaded ? 'id-document.jpg' : undefined,
      verificationDocNames: docsUploaded ? ['business-doc.pdf'] : [],
      acceptedTerms,
    });
    toast.success(t('sell.form.submitted'));
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Screen scroll edges={['bottom']} contentContainerStyle={{ gap: theme.spacing.lg }}>
        <Text variant="body" color="textMuted">
          {t('sell.form.intro')}
        </Text>

        <Input
          label={t('sell.form.displayName')}
          value={displayName}
          onChangeText={setDisplayName}
          icon="storefront-outline"
          error={errors.displayName ? t(errors.displayName) : undefined}
        />
        <Input
          label={t('sell.form.legalName')}
          hint={t('sell.form.legalNamePlaceholder')}
          value={legalName}
          onChangeText={setLegalName}
          icon="document-outline"
        />
        <Input
          label={t('sell.form.phone')}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          icon="call-outline"
          error={errors.phone ? t(errors.phone) : undefined}
        />
        <Input
          label={t('sell.form.email')}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          icon="mail-outline"
          error={errors.email ? t(errors.email) : undefined}
        />
        <PickerField
          label={t('sell.form.city')}
          placeholder={t('onboarding.selectCity')}
          value={cityId}
          options={cityOptions}
          onChange={setCityId}
        />
        {errors.city ? (
          <Text variant="caption" color="danger">
            {t(errors.city)}
          </Text>
        ) : null}
        <Input
          label={t('sell.form.postalCode')}
          value={postalCode}
          onChangeText={setPostalCode}
          keyboardType="number-pad"
          icon="navigate-outline"
        />

        <View style={{ gap: theme.spacing.sm }}>
          <Text variant="label">{t('sell.form.categories')}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
            {CATEGORIES.map((c) => (
              <Chip
                key={c.id}
                label={t(`categories.${c.slug}`)}
                selected={categorySlugs.includes(c.slug)}
                onPress={() => toggleCategory(c.slug)}
              />
            ))}
          </View>
        </View>

        <View style={{ gap: theme.spacing.sm }}>
          <Text variant="label">{t('sell.form.verificationDocs')}</Text>
          <UploadButton
            label={t('sell.form.uploadId')}
            done={idUploaded}
            onPress={() => setIdUploaded(true)}
          />
          <UploadButton
            label={t('sell.form.uploadDocs')}
            done={docsUploaded}
            onPress={() => setDocsUploaded(true)}
          />
        </View>

        <Checkbox
          checked={acceptedTerms}
          onChange={setAcceptedTerms}
          label={t('sell.form.acceptTerms')}
        />
        {errors.terms ? (
          <Text variant="caption" color="danger">
            {t(errors.terms)}
          </Text>
        ) : null}

        <Button
          title={t('sell.form.submit')}
          onPress={submit}
          style={{ marginTop: theme.spacing.sm }}
        />
      </Screen>
    </KeyboardAvoidingView>
  );
}

function UploadButton({
  label,
  done,
  onPress,
}: {
  label: string;
  done: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        padding: theme.spacing.lg,
        borderRadius: theme.radii.md,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: done ? theme.colors.primary : theme.colors.borderStrong,
        backgroundColor: done ? theme.colors.primaryMuted : theme.colors.surface,
      }}
    >
      <Ionicons
        name={done ? 'checkmark-circle' : 'cloud-upload-outline'}
        size={22}
        color={done ? theme.colors.primary : theme.colors.textMuted}
      />
      <Text variant="body" style={{ flex: 1 }}>
        {label}
      </Text>
      <Text variant="caption" color={done ? 'primary' : 'textMuted'}>
        {done ? t('sell.form.uploaded') : t('common.optional')}
      </Text>
    </Pressable>
  );
}
