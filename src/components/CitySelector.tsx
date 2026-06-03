import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { CITIES } from '@/data/cities';
import { useLocale } from '@/hooks/useLocale';
import { useLocationStore } from '@/store/locationStore';
import { useTheme } from '@/theme/ThemeProvider';
import { Sheet } from './ui/Sheet';
import { Text } from './ui/Text';

export function CitySelector() {
  const theme = useTheme();
  const { lang, cityName } = useLocale();
  const cityId = useLocationStore((s) => s.cityId);
  const setCity = useLocationStore((s) => s.setCity);
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
        hitSlop={theme.layout.hitSlop}
      >
        <Ionicons name="location" size={16} color={theme.colors.primary} />
        <Text variant="label" color="primary">
          {cityName(cityId) || '—'}
        </Text>
        <Ionicons name="chevron-down" size={14} color={theme.colors.primary} />
      </Pressable>

      <Sheet visible={open} onClose={() => setOpen(false)} title={cityName(cityId)}>
        <View style={{ gap: theme.spacing.sm }}>
          {CITIES.map((city) => {
            const active = city.id === cityId;
            return (
              <Pressable
                key={city.id}
                onPress={() => {
                  setCity(city.id);
                  setOpen(false);
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: theme.spacing.md,
                  borderRadius: theme.radii.md,
                  backgroundColor: active ? theme.colors.primaryMuted : theme.colors.surface,
                  borderWidth: 1,
                  borderColor: active ? theme.colors.primary : theme.colors.border,
                }}
              >
                <Text variant="body">{city.name[lang]}</Text>
                {active ? (
                  <Ionicons name="checkmark" size={18} color={theme.colors.primary} />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </Sheet>
    </>
  );
}
