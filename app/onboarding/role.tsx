import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { OnboardingScaffold } from '@/components/onboarding/OnboardingScaffold';
import { SelectableOption } from '@/components/SelectableOption';
import { Button } from '@/components/ui/Button';
import { useLocationStore } from '@/store/locationStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useTheme } from '@/theme/ThemeProvider';
import type { RoleInterest } from '@/types';

const ROLES: {
  value: RoleInterest;
  labelKey: string;
  descKey: string;
  icon: 'bag-handle-outline' | 'pricetags-outline' | 'swap-horizontal-outline';
}[] = [
  {
    value: 'buyer',
    labelKey: 'onboarding.roleBuyer',
    descKey: 'onboarding.roleBuyerDesc',
    icon: 'bag-handle-outline',
  },
  {
    value: 'seller',
    labelKey: 'onboarding.roleSeller',
    descKey: 'onboarding.roleSellerDesc',
    icon: 'pricetags-outline',
  },
  {
    value: 'both',
    labelKey: 'onboarding.roleBoth',
    descKey: 'onboarding.roleBothDesc',
    icon: 'swap-horizontal-outline',
  },
];

export default function OnboardingRole() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const roleInterest = useLocationStore((s) => s.roleInterest);
  const setRoleInterest = useLocationStore((s) => s.setRoleInterest);
  const completeOnboarding = useSettingsStore((s) => s.completeOnboarding);

  const finish = () => {
    completeOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <OnboardingScaffold
      step={3}
      totalSteps={4}
      title={t('onboarding.roleTitle')}
      body={t('onboarding.roleBody')}
      footer={<Button title={t('onboarding.finish')} onPress={finish} />}
    >
      <View style={{ gap: theme.spacing.md }}>
        {ROLES.map((role) => (
          <SelectableOption
            key={role.value}
            label={t(role.labelKey)}
            description={t(role.descKey)}
            icon={role.icon}
            selected={roleInterest === role.value}
            onPress={() => setRoleInterest(role.value)}
          />
        ))}
      </View>
    </OnboardingScaffold>
  );
}
