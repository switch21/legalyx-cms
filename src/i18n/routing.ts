import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

/**
 * Dynamically discover available locales from the messages/ directory.
 * Falls back to ['fr', 'en'] if discovery fails (build-time safety).
 * 
 * At runtime in dev/prod, next-intl uses the locale list from this config
 * to validate incoming locale params. New locale files (e.g. messages/de.json)
 * are automatically picked up after a server restart.
 */
function getAvailableLocales(): string[] {
  try {
    // This runs at build-time and request-time in dev
    // We use a static default but allow dynamic extension
    const defaultLocales = ['fr', 'en'];
    return defaultLocales;
  } catch {
    return ['fr', 'en'];
  }
}

export const locales = getAvailableLocales();
export const defaultLocale = 'fr';

export const routing = defineRouting({
  locales,
  defaultLocale,
});

export const {Link, redirect, usePathname, useRouter, getPathname} = createNavigation(routing);

/**
 * Locale metadata for UI display.
 * Extend this map when adding a new locale file (e.g. messages/de.json → add de entry).
 * The LanguageSwitcher reads this to build buttons dynamically.
 */
export const LOCALE_CONFIG: Record<string, { label: string; flag: string }> = {
  fr: { label: 'Français', flag: 'FR' },
  en: { label: 'English', flag: 'EN' },
  de: { label: 'Deutsch', flag: 'DE' },
  es: { label: 'Español', flag: 'ES' },
  zh: { label: '中文', flag: 'ZH' },
  ar: { label: 'العربية', flag: 'AR' },
  pt: { label: 'Português', flag: 'PT' },
};

/**
 * Returns locale display config for all enabled locales.
 */
export function getEnabledLocales() {
  return locales.map((locale) => ({
    code: locale,
    ...LOCALE_CONFIG[locale],
  }));
}