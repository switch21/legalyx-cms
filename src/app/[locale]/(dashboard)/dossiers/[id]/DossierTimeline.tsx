'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Clock, ArrowRight, FilePlus, CalendarPlus, Trash2, Shield } from 'lucide-react'

interface TimelineEntry {
  id: string
  action: string
  created_at: string
  details: Record<string, any> | null
  user_name: string
}

const ACTION_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  CREATE_DOSSIER: { label: 'Dossier créé', color: 'bg-blue-500', icon: FilePlus },
  UPDATE_DOSSIER_STATUS: { label: 'Statut modifié', color: 'bg-amber-500', icon: ArrowRight },
  CREATE_AUDIENCE: { label: 'Audience planifiée', color: 'bg-emerald-500', icon: CalendarPlus },
  CANCEL_AUDIENCE: { label: 'Audience annulée', color: 'bg-red-500', icon: CalendarPlus },
  DELETE_DOSSIER: { label: 'Dossier supprimé', color: 'bg-red-500', icon: Trash2 },
  UPLOAD_DOCUMENT: { label: 'Document déposé', color: 'bg-purple-500', icon: FilePlus },
  DELETE_DOCUMENT: { label: 'Document supprimé', color: 'bg-red-500', icon: Trash2 },
}

const STATUS_LABELS: Record<string, string> = {
  OUVERT: 'Ouvert',
  EN_INSTRUCTION: 'En Instruction',
  AUDIENCE: 'Audience',
  JUGEMENT: 'Jugement',
  ARCHIVE: 'Archivé',
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

        if (!cancelled && data && data.length > 0) {
          // Fetch user names
          const userIds = [...new Set(data.map((d: any) => d.details?.user_id).filter(Boolean))]
          let userMap: Record<string, string> = {}

          if (userIds.length > 0) {
            const { data: profiles } = await supabase
              .from('profiles')
              .select('id, first_name, last_name')
              .in('id', userIds)
            if (profiles) {
              profiles.forEach((p: any) => {
                userMap[p.id] = `${p.first_name} ${p.last_name}`
              })
            }
          }

          const timeline: TimelineEntry[] = data.map((entry: any) => ({
            id: entry.id,
            action: entry.action,
            created_at: entry.created_at,
            details: entry.details,
            user_name: entry.details?.user_name || userMap[entry.details?.user_id] || 'Utilisateur',
          }))
          setEntries(timeline)
        }
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
        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
        <div className="h-12 bg-gray-100 rounded-xl animate-pulse"></div>
        <div className="h-12 bg-gray-100 rounded-xl animate-pulse"></div>
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <p className="text-xs text-gray-400 text-center py-4">Aucune activité enregistrée pour ce dossier.</p>
    )
  }

  return (
    <div className="space-y-2" role="list" aria-label="Activité du dossier">
      {entries.slice(0, 10).map((entry) => {
        const config = ACTION_CONFIG[entry.action] || { label: entry.action, color: 'bg-gray-500', icon: Shield }
        const Icon = config.icon
        return (
          <div key={entry.id} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-100" role="listitem">
            <div className="flex flex-col items-center gap-1 mt-1">
              <div className={`w-3 h-3 rounded-full ${config.color}`} />
              <div className="w-0.5 h-6 bg-gray-200"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs">
                <Icon className="w-3 h-3 text-gray-400" />
                <span className="font-semibold text-gray-900">{config.label}</span>
                {entry.action === 'UPDATE_DOSSIER_STATUS' && entry.details?.new_status && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium text-white bg-amber-500">
                    {STATUS_LABELS[entry.details.new_status] || entry.details.new_status}
                  </span>
                )}
                {entry.action === 'CREATE_DOSSIER' && (
                  <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">NOUVEAU</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400">
                <Clock className="w-3 h-3" />
                {new Date(entry.created_at).toLocaleString('fr-FR')}
                <span>par {entry.user_name}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}