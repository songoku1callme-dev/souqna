import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Switch, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useCreateListing, useMySellerProfile } from '@/api/hooks';
import { SellerNotVerifiedError } from '@/api/listingsApi';
import { ImageUploadGrid } from '@/components/ImageUploadGrid';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Input } from '@/components/ui/Input';
import { PickerField } from '@/components/ui/PickerField';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { env } from '@/config/env';
import { CATEGORIES } from '@/data/categories';
import { CITIES } from '@/data/cities';
import { useLocale } from '@/hooks/useLocale';
import { useLocationStore } from '@/store/locationStore';
import { useSellerStore } from '@/store/sellerStore';
import { useTheme } from '@/theme/ThemeProvider';
import type { CategorySlug, ListingCondition } from '@/types';
import { validateRequired } from '@/utils/validation';

const CONDITIONS: { value: ListingCondition; key: string }[] = [
  { value: 'new', key: 'condition.new' },
  { value: 'like_new', key: 'condition.likeNew' },
  { value: 'good', key: 'condition.good' },
  { value: 'used', key: 'condition.used' },
];

export default function CreateListing() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const toast = useToast();
  const { lang } = useLocale();
  const defaultCity = useLocationStore((s) => s.cityId);
  const createListing = useCreateListing();
  const mockStatus = useSellerStore((s) => s.status);
  const liveProfile = useMySellerProfile(!env.useMocks);
  const sellerStatus = env.useMocks ? mockStatus : (liveProfile.data?.status ?? 'not_submitted');
  const isVerified = sellerStatus === 'verified';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CategorySlug | null>(null);
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [condition, setCondition] = useState<ListingCondition>('good');
  const [cityId, setCityId] = useState<string | null>(defaultCity);
  const [postalCode, setPostalCode] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [delivery, setDelivery] = useState(true);
  const [pickup, setPickup] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categoryOptions = CATEGORIES.map((c) => ({
    value: c.slug,
    label: t(`categories.${c.slug}`),
  }));
  const cityOptions = CITIES.map((c) => ({ value: c.id, label: c.name[lang] }));
  const currencyOptions = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'TRY', label: 'TRY (₺)' },
    { value: 'EUR', label: 'EUR (€)' },
  ];

  const submit = async (publish: boolean) => {
    if (publish && !isVerified) {
      toast.error(t('createListing.verificationRequired'));
      return;
    }
    const nextErrors: Record<string, string> = {};
    const titleError = validateRequired(title);
    const priceError = validateRequired(price);
    if (titleError) nextErrors.title = titleError;
    if (priceError) nextErrors.price = priceError;
    if (!category) nextErrors.category = 'validation.required';
    if (!cityId) nextErrors.city = 'validation.required';
    if (publish && images.length === 0) nextErrors.images = 'createListing.imagesRequired';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error(t('validation.fixErrors'));
      return;
    }

    try {
      const listing = await createListing.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        categorySlug: category as CategorySlug,
        price: Number(price),
        currency,
        condition,
        cityId: cityId as string,
        postalCode: postalCode.trim() || undefined,
        delivery,
        pickup,
        imageUris: images,
        publish,
      });
      toast.success(publish ? t('createListing.published') : t('createListing.draftSaved'));
      if (publish) {
        router.replace(`/listing/${listing.id}`);
      } else {
        router.back();
      }
    } catch (err) {
      if (err instanceof SellerNotVerifiedError) {
        toast.error(t('createListing.verificationRequired'));
      } else {
        toast.error(t('createListing.submitFailed'));
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Screen scroll edges={['bottom']} contentContainerStyle={{ gap: theme.spacing.lg }}>
        {!isVerified ? (
          <Card padded style={{ flexDirection: 'row', gap: theme.spacing.md, alignItems: 'flex-start' }}>
            <Ionicons name="shield-outline" size={20} color={theme.colors.warning} />
            <Text variant="caption" color="textMuted" style={{ flex: 1 }}>
              {t('createListing.verificationRequired')}
            </Text>
          </Card>
        ) : null}

        <View style={{ gap: theme.spacing.sm }}>
          <Text variant="label">{t('createListing.images')}</Text>
          <ImageUploadGrid images={images} onChange={setImages} />
          {errors.images ? (
            <Text variant="caption" color="danger">
              {t(errors.images)}
            </Text>
          ) : null}
        </View>

        <Input
          label={t('createListing.listingTitle')}
          placeholder={t('createListing.listingTitlePlaceholder')}
          value={title}
          onChangeText={setTitle}
          error={errors.title ? t(errors.title) : undefined}
        />
        <Input
          label={t('createListing.description')}
          placeholder={t('createListing.descriptionPlaceholder')}
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <PickerField
          label={t('createListing.category')}
          placeholder={t('createListing.selectCategory')}
          value={category}
          options={categoryOptions}
          onChange={(v) => setCategory(v as CategorySlug)}
        />
        {errors.category ? (
          <Text variant="caption" color="danger">
            {t(errors.category)}
          </Text>
        ) : null}

        <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
          <View style={{ flex: 2 }}>
            <Input
              label={t('createListing.price')}
              placeholder="0"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              error={errors.price ? t(errors.price) : undefined}
            />
          </View>
          <View style={{ flex: 1 }}>
            <PickerField
              label={t('createListing.currency')}
              placeholder="USD"
              value={currency}
              options={currencyOptions}
              onChange={setCurrency}
            />
          </View>
        </View>

        <View style={{ gap: theme.spacing.sm }}>
          <Text variant="label">{t('createListing.condition')}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
            {CONDITIONS.map((c) => (
              <Chip
                key={c.value}
                label={t(c.key)}
                selected={condition === c.value}
                onPress={() => setCondition(c.value)}
              />
            ))}
          </View>
        </View>

        <PickerField
          label={t('createListing.city')}
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
          label={t('createListing.postalCode')}
          placeholder={t('onboarding.postalCodePlaceholder')}
          value={postalCode}
          onChangeText={setPostalCode}
          keyboardType="number-pad"
        />

        <ToggleRow label={t('createListing.delivery')} value={delivery} onChange={setDelivery} />
        <ToggleRow label={t('createListing.pickup')} value={pickup} onChange={setPickup} />

        <View style={{ gap: theme.spacing.md, marginTop: theme.spacing.sm }}>
          <Button
            title={t('createListing.publish')}
            onPress={() => void submit(true)}
            loading={createListing.isPending}
            disabled={createListing.isPending || !isVerified}
          />
          <Button
            title={t('createListing.saveDraft')}
            variant="secondary"
            onPress={() => void submit(false)}
            disabled={createListing.isPending}
          />
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: theme.spacing.xs,
      }}
    >
      <Text variant="body">{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: theme.colors.primary, false: theme.colors.borderStrong }}
        thumbColor={theme.colors.surface}
      />
    </View>
  );
}
