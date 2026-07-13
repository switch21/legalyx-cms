'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/routing'
import { getEnabledLocales } from '@/i18n/routing'
import { Globe } from 'lucide-react'

export default function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const enabledLocales = getEnabledLocales()

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale })
  }

  return (
    <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1" role="group" aria-label="Language selector">
      <Globe className="w-3.5 h-3.5 text-gray-400 ml-1" />
      {enabledLocales.map((loc) => (
        <button
          key={loc.code}
          onClick={() => switchLocale(loc.code)}
          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
            locale === loc.code
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          aria-label={loc.label}
          aria-pressed={locale === loc.code}
        >
          {loc.flag}
        </button>
      ))}
    </div>
  )
}