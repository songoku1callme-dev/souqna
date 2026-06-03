import { useTranslation } from 'react-i18next';

import { getCategoryBySlug } from '@/data/categories';
import { getCityById } from '@/data/cities';
import type { CategorySlug, LocalizedText } from '@/types';

export type Lang = 'en' | 'ar';

/** Helpers to resolve localized domain data against the active language. */
export function useLocale() {
  const { i18n, t } = useTranslation();
  const lang: Lang = i18n.language === 'ar' ? 'ar' : 'en';

  return {
    lang,
    localized: (text?: LocalizedText) => (text ? text[lang] : ''),
    cityName: (cityId?: string | null) => {
      const city = getCityById(cityId);
      return city ? city.name[lang] : '';
    },
    categoryName: (slug?: CategorySlug | null) => {
      const category = getCategoryBySlug(slug);
      return category ? t(`categories.${category.slug}`) : '';
    },
  };
}
