import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Switch, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ImageUploadGrid } from '@/components/ImageUploadGrid';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Input } from '@/components/ui/Input';
import { PickerField } from '@/components/ui/PickerField';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { CATEGORIES } from '@/data/categories';
import { CITIES } from '@/data/cities';
import { useLocale } from '@/hooks/useLocale';
import { useLocationStore } from '@/store/locationStore';
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

  const submit = (publish: boolean) => {
    const nextErrors: Record<string, string> = {};
    const titleError = validateRequired(title);
    const priceError = validateRequired(price);
    if (titleError) nextErrors.title = titleError;
    if (priceError) nextErrors.price = priceError;
    if (!category) nextErrors.category = 'validation.required';
    if (!cityId) nextErrors.city = 'validation.required';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error(t('validation.fixErrors'));
      return;
    }
    // Mock: acknowledge submission. A Supabase build inserts into `listings`.
    toast.success(publish ? t('createListing.published') : t('createListing.draftSaved'));
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Screen scroll edges={['bottom']} contentContainerStyle={{ gap: theme.spacing.lg }}>
        <View style={{ gap: theme.spacing.sm }}>
          <Text variant="label">{t('createListing.images')}</Text>
          <ImageUploadGrid images={images} onChange={setImages} />
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
          <Button title={t('createListing.publish')} onPress={() => submit(true)} />
          <Button
            title={t('createListing.saveDraft')}
            variant="secondary"
            onPress={() => submit(false)}
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
