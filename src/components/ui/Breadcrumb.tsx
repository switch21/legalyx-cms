'use client'

import { usePathname } from '@/i18n/routing'
import { ChevronRight, Home } from 'lucide-react'
import { Link } from '@/i18n/routing'

const ROUTE_LABELS: Record<string, string> = {
  dossiers: 'Dossiers',
  audiences: 'Audiences',
  documents: 'Documents',
  utilisateurs: 'Utilisateurs',
  audit: 'Journal d\'audit',
  parametres: 'Paramètres',
  nouveau: 'Nouveau',
  planifier: 'Planifier',
}

export default function Breadcrumb() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean) // e.g. ['dossiers', 'abc123']

  if (segments.length <= 1) return null // No breadcrumb on top-level pages

  return (
    <nav aria-label="Fil d'Ariane" className="flex items-center gap-1 text-sm text-gray-500 mb-4">
      <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
        <Home className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Accueil</span>
      </Link>
      {segments.map((segment, i) => {
        const href = '/' + segments.slice(0, i + 1).join('/')
        const isLast = i === segments.length - 1
        const label = ROUTE_LABELS[segment] || (isLast && segment.length > 8 ? segment.slice(0, 8) + '...' : segment)

        return (
          <span key={href} className="flex items-center gap-1">
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            {isLast ? (
              <span className="text-gray-900 font-medium">{label}</span>
            ) : (
              <Link href={href} className="hover:text-primary transition-colors">{label}</Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
