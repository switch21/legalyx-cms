'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Clock, ArrowRight } from 'lucide-react'

interface TimelineEntry {
  id: string
  old_status: string | null
  new_status: string
  changer_name: string
  comment: string | null
  created_at: string
}

const STATUS_LABELS: Record<string, string> = {
  OUVERT: 'Ouvert',
  EN_INSTRUCTION: 'En Instruction',
  AUDIENCE: 'Audience',
  JUGEMENT: 'Jugement',
  ARCHIVE: 'Archivé',
}

const STATUS_COLORS: Record<string, string> = {
  OUVERT: 'bg-blue-500',
  EN_INSTRUCTION: 'bg-amber-500',
  AUDIENCE: 'bg-emerald-500',
  JUGEMENT: 'bg-purple-500',
  ARCHIVE: 'bg-gray-500',
}

export default function DossierTimeline({ dossierId }: { dossierId: string }) {
  const [entries, setEntries] = useState<TimelineEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data } = await supabase.rpc('get_dossier_timeline', { p_dossier_id: dossierId })
        if (!cancelled && data) setEntries(data)
      } catch {
        // Silently fail
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [dossierId])

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
        <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>
        <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <p className="text-xs text-gray-400 text-center py-4">Aucun changement de statut enregistré.</p>
    )
  }

  return (
    <div className="space-y-2" role="list" aria-label="Historique des changements de statut">
      {entries.slice(0, 5).map((entry) => (
        <div key={entry.id} className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700" role="listitem">
          <div className="flex flex-col items-center gap-1 mt-1">
            <div className={`w-3 h-3 rounded-full ${STATUS_COLORS[entry.new_status] || 'bg-gray-400'}`} />
            <div className="w-0.5 h-6 bg-gray-200 dark:bg-gray-600"></div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs">
              {entry.old_status ? (
                <>
                  <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] font-medium">
                    {STATUS_LABELS[entry.old_status] || entry.old_status}
                  </span>
                  <ArrowRight className="w-3 h-3 text-gray-400" />
                </>
              ) : (
                <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">CRÉATION</span>
              )}
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium text-white ${STATUS_COLORS[entry.new_status] || 'bg-gray-400'}`}>
                {STATUS_LABELS[entry.new_status] || entry.new_status}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400">
              <Clock className="w-3 h-3" />
              {new Date(entry.created_at).toLocaleString('fr-FR')}
              <span>par {entry.changer_name}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}