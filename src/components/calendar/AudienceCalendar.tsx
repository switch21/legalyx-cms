'use client'

import { useState, useEffect, useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { createBrowserClient } from '@supabase/ssr'
import type { EventSourceInput } from '@fullcalendar/core'

export default function AudienceCalendar() {
  const calendarRef = useRef<FullCalendar>(null)
  const [events, setEvents] = useState<EventSourceInput>([])
  const [loading, setLoading] = useState(true)

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

  const handleEventClick = (info: any) => {
    const dossierId = info.event.extendedProps?.dossierId
    if (dossierId) {
      window.location.href = `/dossiers/${dossierId}`
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
    </div>
  )
}