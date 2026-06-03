import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { OnboardingScaffold } from '@/components/onboarding/OnboardingScaffold';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PickerField } from '@/components/ui/PickerField';
import { CITIES, COUNTRIES } from '@/data/cities';
import { useLocale } from '@/hooks/useLocale';
import { useLocationStore } from '@/store/locationStore';
import { useTheme } from '@/theme/ThemeProvider';

export default function OnboardingLocation() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { lang } = useLocale();

  const countryCode = useLocationStore((s) => s.countryCode);
  const cityId = useLocationStore((s) => s.cityId);
  const postalCode = useLocationStore((s) => s.postalCode);
  const setCountry = useLocationStore((s) => s.setCountry);
  const setCity = useLocationStore((s) => s.setCity);
  const setPostalCode = useLocationStore((s) => s.setPostalCode);

  const countryOptions = COUNTRIES.map((c) => ({ value: c.code, label: c.name[lang] }));
  const cityOptions = CITIES.map((c) => ({ value: c.id, label: c.name[lang] }));

  return (
    <OnboardingScaffold
      step={2}
      totalSteps={4}
      title={t('onboarding.locationTitle')}
      body={t('onboarding.locationBody')}
      footer={
        <Button
          title={t('common.continue')}
          disabled={!cityId}
          onPress={() => router.push('/onboarding/role')}
        />
      }
    >
      <View style={{ gap: theme.spacing.lg }}>
        <PickerField
          label={t('onboarding.country')}
          placeholder={t('onboarding.selectCountry')}
          value={countryCode}
          options={countryOptions}
          onChange={setCountry}
          icon="earth-outline"
          sheetTitle={t('onboarding.country')}
        />
        <PickerField
          label={t('onboarding.city')}
          placeholder={t('onboarding.selectCity')}
          value={cityId}
          options={cityOptions}
          onChange={setCity}
          icon="business-outline"
          sheetTitle={t('onboarding.city')}
        />
        <Input
          label={t('onboarding.postalCode')}
          placeholder={t('onboarding.postalCodePlaceholder')}
          value={postalCode}
          onChangeText={setPostalCode}
          keyboardType="number-pad"
          icon="navigate-outline"
        />
      </View>
    </OnboardingScaffold>
  );
}
