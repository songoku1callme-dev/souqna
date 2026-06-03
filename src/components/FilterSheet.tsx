import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { CATEGORIES } from '@/data/categories';
import { CITIES } from '@/data/cities';
import { useLocale } from '@/hooks/useLocale';
import { useTheme } from '@/theme/ThemeProvider';
import type { CategorySlug, ListingCondition, ListingFilters } from '@/types';
import { Button } from './ui/Button';
import { Chip } from './ui/Chip';
import { Input } from './ui/Input';
import { Sheet } from './ui/Sheet';
import { Text } from './ui/Text';

const CONDITIONS: { value: ListingCondition; key: string }[] = [
  { value: 'new', key: 'condition.new' },
  { value: 'like_new', key: 'condition.likeNew' },
  { value: 'good', key: 'condition.good' },
  { value: 'used', key: 'condition.used' },
];

export type FilterSheetProps = {
  visible: boolean;
  onClose: () => void;
  filters: ListingFilters;
  onApply: (filters: ListingFilters) => void;
};

export function FilterSheet({ visible, onClose, filters, onApply }: FilterSheetProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { lang } = useLocale();
  const [draft, setDraft] = useState<ListingFilters>(filters);
  const [wasVisible, setWasVisible] = useState(visible);

  // Reset the draft to the applied filters each time the sheet opens.
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setDraft(filters);
  }

  const update = (patch: Partial<ListingFilters>) => setDraft((d) => ({ ...d, ...patch }));

  const apply = () => {
    onApply(draft);
    onClose();
  };

  const clear = () => {
    const cleared: ListingFilters = { query: filters.query, sort: filters.sort };
    setDraft(cleared);
    onApply(cleared);
    onClose();
  };

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={t('search.filters')}
      footer={
        <View
          style={{ flexDirection: 'row', gap: theme.spacing.md, paddingBottom: theme.spacing.sm }}
        >
          <Button title={t('search.clearFilters')} variant="ghost" onPress={clear} />
          <View style={{ flex: 1 }}>
            <Button title={t('search.applyFilters')} onPress={apply} />
          </View>
        </View>
      }
    >
      <View style={{ gap: theme.spacing.xl }}>
        <FilterBlock label={t('search.filterCategory')}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
            {CATEGORIES.map((c) => (
              <Chip
                key={c.id}
                label={t(`categories.${c.slug}`)}
                selected={draft.categorySlug === c.slug}
                onPress={() =>
                  update({
                    categorySlug: draft.categorySlug === c.slug ? null : (c.slug as CategorySlug),
                  })
                }
              />
            ))}
          </View>
        </FilterBlock>

        <FilterBlock label={t('search.filterCity')}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
            {CITIES.map((c) => (
              <Chip
                key={c.id}
                label={c.name[lang]}
                selected={draft.cityId === c.id}
                onPress={() => update({ cityId: draft.cityId === c.id ? null : c.id })}
              />
            ))}
          </View>
        </FilterBlock>

        <FilterBlock label={t('search.filterPostalCode')}>
          <Input
            placeholder={t('onboarding.postalCodePlaceholder')}
            value={draft.postalCode ?? ''}
            onChangeText={(v) => update({ postalCode: v })}
            keyboardType="number-pad"
          />
        </FilterBlock>

        <FilterBlock label={t('search.filterPrice')}>
          <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
            <View style={{ flex: 1 }}>
              <Input
                placeholder={t('search.filterMinPrice')}
                value={draft.minPrice != null ? String(draft.minPrice) : ''}
                onChangeText={(v) => update({ minPrice: v ? Number(v) : null })}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                placeholder={t('search.filterMaxPrice')}
                value={draft.maxPrice != null ? String(draft.maxPrice) : ''}
                onChangeText={(v) => update({ maxPrice: v ? Number(v) : null })}
                keyboardType="numeric"
              />
            </View>
          </View>
        </FilterBlock>

        <FilterBlock label={t('search.filterCondition')}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
            {CONDITIONS.map((c) => (
              <Chip
                key={c.value}
                label={t(c.key)}
                selected={draft.condition === c.value}
                onPress={() => update({ condition: draft.condition === c.value ? null : c.value })}
              />
            ))}
          </View>
        </FilterBlock>

        <FilterBlock label={t('search.filterVerifiedOnly')}>
          <Chip
            label={t('home.verifiedBadge')}
            icon="shield-checkmark"
            selected={!!draft.verifiedOnly}
            onPress={() => update({ verifiedOnly: !draft.verifiedOnly })}
          />
        </FilterBlock>
      </View>
    </Sheet>
  );
}

function FilterBlock({ label, children }: { label: string; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing.sm }}>
      <Text variant="label">{label}</Text>
      {children}
    </View>
  );
}
