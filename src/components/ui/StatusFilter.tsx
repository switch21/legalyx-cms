'use client'
import { useRouter, usePathname, useSearchParams } from '@/i18n/routing'

export default function StatusFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = searchParams.get('status') || ''

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString())
    if (e.target.value) {
      params.set('status', e.target.value)
    } else {
      params.delete('status')
    }
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <select
      value={current}
      onChange={handleChange}
      className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
    >
      <option value="">Tous les statuts</option>
      <option value="OUVERT">Ouvert</option>
      <option value="EN_INSTRUCTION">En Instruction</option>
      <option value="AUDIENCE">Audience</option>
      <option value="JUGEMENT">Jugement</option>
      <option value="ARCHIVE">Archivé</option>
    </select>
  )
}