'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { X, Bell, Info, AlertTriangle } from 'lucide-react'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'success'
  timestamp: Date
}

interface NotificationContextType {
  notifications: Notification[]
  dismiss: (id: string) => void
  unreadCount: number
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  dismiss: () => {},
  unreadCount: 0,
})

export function useNotifications() {
  return useContext(NotificationContext)
}

const ACTION_LABELS: Record<string, string> = {
  CREATE_DOSSIER: 'Nouveau dossier',
  UPDATE_DOSSIER_STATUS: 'Statut modifié',
  CREATE_AUDIENCE: 'Audience planifiée',
  CANCEL_AUDIENCE: 'Audience annulée',
  UPLOAD_DOCUMENT: 'Document déposé',
  DELETE_DOCUMENT: 'Document supprimé',
  DELETE_DOSSIER: 'Dossier supprimé',
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const dismiss = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  // Auto-dismiss after 8 seconds
  useEffect(() => {
    if (notifications.length === 0) return
    const timer = setTimeout(() => {
      setNotifications(prev => prev.slice(1))
    }, 8000)
    return () => clearTimeout(timer)
  }, [notifications])

  // Subscribe to Supabase Realtime for audit_logs
  useEffect(() => {
    const channel = supabase
      .channel('audit-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'audit_logs',
      }, (payload) => {
        const action = payload.new?.action as string || 'Action'
        const details = payload.new?.details as Record<string, any> || {}
        const notification: Notification = {
          id: payload.new?.id || String(Date.now()),
          title: ACTION_LABELS[action] || action.replace(/_/g, ' '),
          message: details.numero || details.titre || details.salle || 'Action enregistrée',
          type: action.includes('DELETE') || action.includes('CANCEL') ? 'warning' : 'info',
          timestamp: new Date(payload.new?.created_at || Date.now()),
        }
        setNotifications(prev => [notification, ...prev].slice(0, 10))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return (
    <NotificationContext.Provider value={{ notifications, dismiss, unreadCount: notifications.length }}>
      {children}

      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[100] space-y-2 max-w-sm w-full pointer-events-none">
        {notifications.map((n) => (
          <div
            key={n.id}
            className="pointer-events-auto bg-white border border-gray-200 rounded-xl shadow-lg p-4 flex items-start gap-3 animate-in slide-in-from-right-2 duration-300 hover:shadow-xl transition-shadow"
            role="alert"
          >
            <div className={`p-2 rounded-lg shrink-0 ${
              n.type === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
            }`}>
              {n.type === 'warning' ? <AlertTriangle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">{n.title}</p>
              <p className="text-xs text-gray-500 mt-0.5 truncate">{n.message}</p>
            </div>
            <button
              onClick={() => dismiss(n.id)}
              className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 shrink-0 transition-colors"
              aria-label="Fermer la notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  )
}