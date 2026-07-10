const fs = require('fs');
const path = require('path');

fs.mkdirSync('messages', { recursive: true });
fs.writeFileSync('messages/fr.json', JSON.stringify({ Index: { title: "Bienvenue sur Legalyx CMS" } }, null, 2));
fs.writeFileSync('messages/en.json', JSON.stringify({ Index: { title: "Welcome to Legalyx CMS" } }, null, 2));

fs.mkdirSync('src/i18n', { recursive: true });
fs.writeFileSync('src/i18n/routing.ts', `import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['fr', 'en'],
  defaultLocale: 'fr'
});

export const {Link, redirect, usePathname, useRouter, getPathname} = createNavigation(routing);`);

fs.writeFileSync('src/i18n/request.ts', `import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';

export default getRequestConfig(async ({requestLocale}) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }
  return {
    locale,
    messages: (await import(\`../../messages/\${locale}.json\`)).default
  };
});`);

fs.writeFileSync('src/middleware.ts', `import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: ['/', '/(fr|en)/:path*']
};`);

fs.writeFileSync('next.config.ts', `import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig = {};

export default withNextIntl(nextConfig);`);

fs.mkdirSync('src/app/[locale]', { recursive: true });

fs.writeFileSync('src/app/[locale]/layout.tsx', `import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import '../globals.css';

export const metadata = {
  title: 'Legalyx CMS',
  description: 'Court Management System',
};

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }
 
  const messages = await getMessages();
 
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}`);

fs.writeFileSync('src/app/[locale]/page.tsx', `import {useTranslations} from 'next-intl';

export default function HomePage() {
  const t = useTranslations('Index');
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background">
      <h1 className="text-4xl font-bold text-primary">{t('title')}</h1>
    </main>
  );
}`);

if (fs.existsSync('src/app/layout.tsx')) fs.unlinkSync('src/app/layout.tsx');
if (fs.existsSync('src/app/page.tsx')) fs.unlinkSync('src/app/page.tsx');
