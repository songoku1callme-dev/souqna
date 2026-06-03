import i18n from '@/i18n';

/** Format a price with currency. Uses Intl when available, falls back gracefully. */
export function formatPrice(amount: number, currency = 'USD'): string {
  const locale = i18n.language === 'ar' ? 'ar' : 'en';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

/** Relative-ish, human date used in cards and chats. */
export function formatDate(iso: string): string {
  const locale = i18n.language === 'ar' ? 'ar' : 'en';
  try {
    return new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric' }).format(
      new Date(iso),
    );
  } catch {
    return iso.slice(0, 10);
  }
}

export function formatTime(iso: string): string {
  const locale = i18n.language === 'ar' ? 'ar' : 'en';
  try {
    return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(
      new Date(iso),
    );
  } catch {
    return iso.slice(11, 16);
  }
}
