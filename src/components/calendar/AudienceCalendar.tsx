'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { createBrowserClient } from '@supabase/ssr'
import type { EventSourceInput } from '@fullcalendar/core'
import { X } from 'lucide-react'
import { cancelAudience } from '@/lib/actions/audiences'

export default function AudienceCalendar() {
  const calendarRef = useRef<FullCalendar>(null)
  const [events, setEvents] = useState<EventSourceInput>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [canceling, setCanceling] = useState(false)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const fetchAudiences = async () => {
      try {
        const { data } = await supabase.rpc('get_audiences', { p_limit: 200, p_offset: 0 })
        if (data && data.length > 0) {
          const calendarEvents: EventSourceInput = data.map((a: any) => {
            const startDate = new Date(a.date_heure)
            const endDate = new Date(startDate.getTime() + 60 * 60 * 1000)

            const colorMap: Record<string, string> = {
              Civil: '#3b82f6',
              Commercial: '#f59e0b',
              'Pénal': '#ef4444',
              Social: '#22c55e',
              Administratif: '#a855f7',
            }

            return {
              id: a.id,
              title: `${a.dossier_numero || 'N/A'} — Salle ${a.salle}`,
              start: startDate.toISOString(),
              end: endDate.toISOString(),
              backgroundColor: colorMap[a.dossier_juridiction] || '#6b7280',
              borderColor: colorMap[a.dossier_juridiction] || '#6b7280',
              extendedProps: {
                dossierId: a.dossier_id,
                juge: a.juge_name,
                room: a.salle,
                type: a.dossier_juridiction,
              },
            }
          })
          setEvents(calendarEvents)
        }
      } catch (err) {
        console.error('Failed to fetch calendar events:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAudiences()
  }, [])

  const handleEventClick = useCallback((info: any) => {
    info.jsEvent.preventDefault()
    info.jsEvent.stopPropagation()
    setSelectedEvent({
      id: info.event.id,
      title: info.event.title,
      start: info.event.start,
      extendedProps: info.event.extendedProps,
      domRect: info.jsEvent.target.closest('.fc-event').getBoundingClientRect(),
    })
  }, [])

  const handleCancelAudience = async () => {
    if (!selectedEvent?.id) return
    setCanceling(true)
    try {
      const formData = new FormData()
      formData.append('id', selectedEvent.id)
      const result = await cancelAudience(formData)
      if (result?.error) throw new Error(result.error)
      setSelectedEvent(null)
      window.location.reload()
    } catch (err: any) {
      alert(err.message || "Erreur lors de l'annulation")
    } finally {
      setCanceling(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-100 rounded-lg w-1/3 mx-auto" />
          <div className="h-64 bg-gray-50 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek',
        }}
        locale="fr"
        firstDay={1}
        events={events}
        eventClick={handleEventClick}
        height="auto"
        dayMaxEvents={3}
        nowIndicator={true}
        editable={false}
        selectable={false}
        eventDisplay="block"
        buttonText={{
          today: "Aujourd'hui",
          month: 'Mois',
          week: 'Semaine',
        }}
      />

      {/* Event Popover */}
      {selectedEvent && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setSelectedEvent(null)} />
          <div className="fixed z-50 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 w-72 space-y-3 animate-in fade-in zoom-in-95 duration-150"
            style={{
              top: Math.min(selectedEvent.domRect.bottom + 8, window.innerHeight - 250),
              left: Math.min(selectedEvent.domRect.left, window.innerWidth - 300),
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{selectedEvent.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {selectedEvent.start?.toLocaleString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            {selectedEvent.extendedProps?.juge && (
              <p className="text-xs text-gray-600">Juge: {selectedEvent.extendedProps.juge}</p>
            )}
            <div className="flex gap-2 pt-1">
              {selectedEvent.extendedProps?.dossierId && (
                <a
                  href={`/dossiers/${selectedEvent.extendedProps.dossierId}`}
                  className="flex-1 text-center px-3 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-lg hover:bg-primary/20 transition-colors"
                >
                  Voir dossier
                </a>
              )}
              <button
                onClick={handleCancelAudience}
                disabled={canceling}
                className="flex-1 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                {canceling ? 'Annulation...' : 'Annuler'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}