'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/routing'
import { Globe } from 'lucide-react'

export default function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale })
  }

  return (
    <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg p-1" role="group" aria-label="Language selector">
      <Globe className="w-3.5 h-3.5 text-gray-400 ml-1" />
      <button
        onClick={() => switchLocale('fr')}
        className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
          locale === 'fr'
            ? 'bg-white text-primary shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
        aria-label="Français"
        aria-pressed={locale === 'fr'}
      >
        FR
      </button>
      <button
        onClick={() => switchLocale('en')}
        className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
          locale === 'en'
            ? 'bg-white text-primary shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
        aria-label="English"
        aria-pressed={locale === 'en'}
      >
        EN
      </button>
    </div>
  )
}