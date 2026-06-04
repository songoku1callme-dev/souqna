import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import {
  useMySellerProfile,
  useMyVerificationRequest,
  useSubmitVerification,
} from '@/api/hooks';
import { env } from '@/config/env';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
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
  const mockStatus = useSellerStore((s) => s.status);
  const submitApplication = useSellerStore((s) => s.submitApplication);
  const submitVerification = useSubmitVerification();
  const isAuthenticated = !!user;
  const liveProfile = useMySellerProfile(!env.useMocks && isAuthenticated);
  const status = env.useMocks ? mockStatus : (liveProfile.data?.status ?? 'not_submitted');
  const isResubmit = status === 'rejected';
  const liveRequest = useMyVerificationRequest(!env.useMocks && isAuthenticated && isResubmit);
  const rejectionReason = liveRequest.data?.reviewerNotes;

  const [displayName, setDisplayName] = useState(user?.fullName ?? '');
  const [legalName, setLegalName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(user?.email ?? '');
  const [cityId, setCityId] = useState<string | null>(defaultCity);
  const [postalCode, setPostalCode] = useState('');
  const [categorySlugs, setCategorySlugs] = useState<CategorySlug[]>([]);
  const [idDocUris, setIdDocUris] = useState<string[]>([]);
  const [businessDocUris, setBusinessDocUris] = useState<string[]>([]);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const pickDocs = async (onPicked: (uris: string[]) => void) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 3,
      quality: 0.7,
    });
    if (!result.canceled) onPicked(result.assets.map((a) => a.uri));
  };
  const [errors, setErrors] = useState<Record<string, string>>({});

  const cityOptions = CITIES.map((c) => ({ value: c.id, label: c.name[lang] }));

  const toggleCategory = (slug: CategorySlug) =>
    setCategorySlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );

  const submit = async () => {
    const nextErrors: Record<string, string> = {};
    const nameError = validateRequired(displayName);
    const phoneError = validateRequired(phone);
    const emailError = validateEmail(email);
    if (nameError) nextErrors.displayName = nameError;
    if (phoneError) nextErrors.phone = phoneError;
    if (emailError) nextErrors.email = emailError;
    if (!cityId) nextErrors.city = 'validation.required';
    if (idDocUris.length === 0) nextErrors.idDoc = 'sell.form.idRequired';
    if (!acceptedTerms) nextErrors.terms = 'validation.mustAcceptTerms';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error(t('validation.fixErrors'));
      return;
    }

    // Mock mode persists status through the local seller store so the gate
    // updates immediately; live mode writes to Supabase + uploads documents.
    submitApplication({
      displayName: displayName.trim(),
      legalName: legalName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      cityId,
      postalCode: postalCode.trim(),
      categorySlugs,
      idDocumentName: idDocUris[0],
      verificationDocNames: businessDocUris,
      acceptedTerms,
    });

    if (!env.useMocks) {
      try {
        await submitVerification.mutateAsync({
          displayName: displayName.trim(),
          legalName: legalName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          cityId,
          postalCode: postalCode.trim(),
          categorySlugs,
          acceptedTerms,
          documentUris: [...idDocUris, ...businessDocUris],
        });
      } catch {
        toast.error(t('sell.form.submitFailed'));
        return;
      }
    }

    toast.success(t('sell.form.submitted'));
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Screen scroll edges={['bottom']} contentContainerStyle={{ gap: theme.spacing.lg }}>
        {isResubmit ? (
          <Card padded style={{ gap: theme.spacing.xs }}>
            <Badge label={t('sell.statusRejected')} tone="danger" />
            <Text variant="subtitle">{t('sell.form.resubmitTitle')}</Text>
            <Text variant="body" color="textMuted">
              {rejectionReason ?? t('sell.rejectedBody')}
            </Text>
          </Card>
        ) : null}

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
            count={idDocUris.length}
            onPress={() => void pickDocs(setIdDocUris)}
          />
          {errors.idDoc ? (
            <Text variant="caption" color="danger">
              {t(errors.idDoc)}
            </Text>
          ) : null}
          <UploadButton
            label={t('sell.form.uploadDocs')}
            count={businessDocUris.length}
            onPress={() => void pickDocs(setBusinessDocUris)}
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
          title={isResubmit ? t('sell.resubmit') : t('sell.form.submit')}
          onPress={() => void submit()}
          loading={submitVerification.isPending}
          disabled={submitVerification.isPending}
          style={{ marginTop: theme.spacing.sm }}
        />
      </Screen>
    </KeyboardAvoidingView>
  );
}

function UploadButton({
  label,
  count,
  onPress,
}: {
  label: string;
  count: number;
  onPress: () => void;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  const done = count > 0;
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
        {done ? t('sell.form.uploadedCount', { count }) : t('common.optional')}
      </Text>
    </Pressable>
  );
}
