import {useTranslations} from 'next-intl';

export default function HomePage() {
  const t = useTranslations('Index');
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background">
      <h1 className="text-4xl font-bold text-primary">{t('title')}</h1>
    </main>
  );
}