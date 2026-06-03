import type { City } from '@/types';

/** Preloaded Syrian cities used for onboarding, filters and seed listings. */
export const CITIES: City[] = [
  { id: 'damascus', countryCode: 'SY', name: { en: 'Damascus', ar: 'دمشق' }, postalPrefix: '00' },
  { id: 'aleppo', countryCode: 'SY', name: { en: 'Aleppo', ar: 'حلب' }, postalPrefix: '02' },
  { id: 'homs', countryCode: 'SY', name: { en: 'Homs', ar: 'حمص' }, postalPrefix: '03' },
  { id: 'hama', countryCode: 'SY', name: { en: 'Hama', ar: 'حماة' }, postalPrefix: '04' },
  { id: 'latakia', countryCode: 'SY', name: { en: 'Latakia', ar: 'اللاذقية' }, postalPrefix: '05' },
  {
    id: 'deir-ez-zor',
    countryCode: 'SY',
    name: { en: 'Deir ez-Zor', ar: 'دير الزور' },
    postalPrefix: '06',
  },
];

export const COUNTRIES = [
  { code: 'SY', name: { en: 'Syria', ar: 'سوريا' } },
  { code: 'TR', name: { en: 'Türkiye', ar: 'تركيا' } },
  { code: 'DE', name: { en: 'Germany', ar: 'ألمانيا' } },
  { code: 'JO', name: { en: 'Jordan', ar: 'الأردن' } },
  { code: 'LB', name: { en: 'Lebanon', ar: 'لبنان' } },
];

export function getCityById(id?: string | null): City | undefined {
  if (!id) return undefined;
  return CITIES.find((c) => c.id === id);
}
