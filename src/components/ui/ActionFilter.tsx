'use client'
import { useRouter, usePathname } from '@/i18n/routing'
import { useSearchParams } from 'next/navigation'

const ACTIONS = [
  { value: '', label: 'Toutes les actions' },
  { value: 'CREATE_DOSSIER', label: 'Création Dossier' },
  { value: 'UPDATE_DOSSIER_STATUS', label: 'Mise à jour Statut' },
  { value: 'CREATE_AUDIENCE', label: 'Planification Audience' },
  { value: 'CANCEL_AUDIENCE', label: 'Annulation Audience' },
  { value: 'DELETE_DOSSIER', label: 'Suppression Dossier' },
  { value: 'UPLOAD_DOCUMENT', label: 'Dépôt Document' },
  { value: 'DELETE_DOCUMENT', label: 'Suppression Document' },
]

export default function ActionFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = searchParams.get('action') || ''

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString())
    if (e.target.value) {
      params.set('action', e.target.value)
    } else {
      params.delete('action')
    }
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <select
      value={current}
      onChange={handleChange}
      className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
    >
      {ACTIONS.map(a => (
        <option key={a.value} value={a.value}>{a.label}</option>
      ))}
    </select>
  )
}