'use client'

import { useState, useTransition } from 'react'
import { XCircle, AlertTriangle } from 'lucide-react'
import { cancelAudience } from '@/lib/actions/audiences'

export default function CancelAudienceButton({ audienceId, onCanceled }: { audienceId: string; onCanceled?: () => void }) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleCancel = () => {
    startTransition(async () => {
      const formData = new FormData()
      formData.append('id', audienceId)
      const result = await cancelAudience(formData)
      if (result?.error) {
        setMsg({ type: 'error', text: result.error })
      } else {
        setConfirmOpen(false)
        onCanceled?.()
      }
    })
  }

  return (
    <>
      <button
        onClick={() => setConfirmOpen(true)}
        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        title="Annuler l'audience"
      >
        <XCircle className="w-4 h-4" />
      </button>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Annuler l&apos;audience</h3>
                <p className="text-xs text-gray-500">Confirmation requise</p>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              Êtes-vous sûr de vouloir annuler cette audience ? L&apos;entrée sera supprimée du calendrier.
            </p>

            {msg && (
              <div className="p-3 rounded-xl text-sm bg-red-50 text-red-700 border border-red-100">
                {msg.text}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => { setConfirmOpen(false); setMsg(null) }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Retour
              </button>
              <button
                onClick={handleCancel}
                disabled={isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-50"
              >
                {isPending ? 'Annulation...' : 'Confirmer l\'annulation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
