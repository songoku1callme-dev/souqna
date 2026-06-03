import type { Category, CategorySlug } from '@/types';

/** Top-level marketplace categories. `icon` is an Ionicons glyph name. */
export const CATEGORIES: Category[] = [
  { id: 'clothing', slug: 'clothing', icon: 'shirt-outline' },
  { id: 'electronics', slug: 'electronics', icon: 'phone-portrait-outline' },
  { id: 'home', slug: 'home', icon: 'home-outline' },
  { id: 'beauty', slug: 'beauty', icon: 'sparkles-outline' },
  { id: 'kids', slug: 'kids', icon: 'happy-outline' },
  { id: 'services', slug: 'services', icon: 'construct-outline' },
  { id: 'misc', slug: 'misc', icon: 'ellipsis-horizontal-circle-outline' },
];

export function getCategoryBySlug(slug?: CategorySlug | null): Category | undefined {
  if (!slug) return undefined;
  return CATEGORIES.find((c) => c.slug === slug);
}
