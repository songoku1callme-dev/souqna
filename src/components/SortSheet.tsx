import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/theme/ThemeProvider';
import type { SortOption } from '@/types';
import { Sheet } from './ui/Sheet';
import { Text } from './ui/Text';

const SORTS: { value: SortOption; key: string }[] = [
  { value: 'newest', key: 'search.sortNewest' },
  { value: 'price_low', key: 'search.sortPriceLow' },
  { value: 'price_high', key: 'search.sortPriceHigh' },
  { value: 'nearest', key: 'search.sortNearest' },
];

export type SortSheetProps = {
  visible: boolean;
  onClose: () => void;
  value: SortOption;
  onChange: (value: SortOption) => void;
};

export function SortSheet({ visible, onClose, value, onChange }: SortSheetProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <Sheet visible={visible} onClose={onClose} title={t('search.sort')}>
      <View style={{ gap: theme.spacing.sm }}>
        {SORTS.map((sort) => {
          const active = sort.value === value;
          return (
            <Pressable
              key={sort.value}
              onPress={() => {
                onChange(sort.value);
                onClose();
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
              <Text variant="body">{t(sort.key)}</Text>
              {active ? <Ionicons name="checkmark" size={18} color={theme.colors.primary} /> : null}
            </Pressable>
          );
        })}
      </View>
    </Sheet>
  );
}
