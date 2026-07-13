import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';

/**
 * Dynamically loads translation messages for the resolved locale.
 * If a locale file doesn't exist for a given locale, it falls back to
 * the default locale (fr). This means adding a new language is as simple
 * as creating a new file: messages/<locale>.json
 */
export default getRequestConfig(async ({requestLocale}) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch {
    // Fallback to default locale if translation file is missing
    console.warn(`[i18n] No translation file found for locale "${locale}", falling back to "${routing.defaultLocale}"`);
    messages = (await import(`../../messages/${routing.defaultLocale}.json`)).default;
  }

  return {
    locale,
    messages,
  };
});