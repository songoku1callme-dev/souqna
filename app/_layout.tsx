import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui/Text';
import { useBootstrap } from '@/hooks/useBootstrap';
import { AppProviders } from '@/providers/AppProviders';
import { useSettingsStore } from '@/store/settingsStore';
import { useTheme } from '@/theme/ThemeProvider';

export default function RootLayout() {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}

function RootNavigator() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { ready } = useBootstrap();
  const onboardingComplete = useSettingsStore((s) => s.onboardingComplete);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    const root = segments[0];
    const inOnboarding = root === 'onboarding';
    if (!onboardingComplete && !inOnboarding) {
      router.replace('/onboarding');
    } else if (onboardingComplete && inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [ready, onboardingComplete, segments, router]);

  if (!ready) return <SplashView />;

  return (
    <>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.text,
          headerTitleStyle: { fontWeight: '600', color: theme.colors.text },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: theme.colors.background },
          headerBackButtonDisplayMode: 'minimal',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="listing/[id]" options={{ title: '' }} />
        <Stack.Screen name="seller/[id]" options={{ title: t('listing.viewSeller') }} />
        <Stack.Screen name="chat/[id]" options={{ title: '' }} />
        <Stack.Screen
          name="create-listing"
          options={{ title: t('createListing.title'), presentation: 'modal' }}
        />
        <Stack.Screen name="seller-onboarding" options={{ title: t('sell.form.title') }} />
        <Stack.Screen name="settings/language" options={{ title: t('language.title') }} />
        <Stack.Screen name="settings/theme" options={{ title: t('theme.title') }} />
        <Stack.Screen name="legal/[doc]" options={{ title: '' }} />
        <Stack.Screen name="+not-found" options={{ title: t('errors.notFound') }} />
      </Stack>
    </>
  );
}

function SplashView() {
  const theme = useTheme();
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.background,
        gap: theme.spacing.lg,
      }}
    >
      <Text variant="title" color="primary">
        Souqna
      </Text>
      <ActivityIndicator color={theme.colors.primary} />
    </View>
  );
}
