'use client'

import { useState, useTransition } from 'react'
import { Trash2, AlertTriangle } from 'lucide-react'
import { softDeleteDossier } from '@/lib/actions/dossiers'
import { useRouter } from '@/i18n/routing'

export default function DeleteDossierButton({ dossierId, dossierNumero }: { dossierId: string; dossierNumero: string }) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const router = useRouter()

  const handleDelete = () => {
    startTransition(async () => {
      const formData = new FormData()
      formData.append('id', dossierId)
      const result = await softDeleteDossier(formData)
      if (result?.error) {
        setMsg({ type: 'error', text: result.error })
      } else {
        router.push('/dossiers')
      }
    })
  }

  return (
    <>
      <button
        onClick={() => setConfirmOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-xl hover:bg-red-100 transition-colors border border-red-100"
        title="Supprimer le dossier"
      >
        <Trash2 className="w-4 h-4" />
        <span className="hidden sm:inline">Supprimer</span>
      </button>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Supprimer le dossier</h3>
                <p className="text-xs text-gray-500">Cette action est irréversible</p>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              Vous êtes sur le point de supprimer le dossier <span className="font-semibold font-mono">{dossierNumero}</span>.
              Toutes les données associées seront conservées mais le dossier ne sera plus visible.
            </p>

            {msg && (
              <div className={`p-3 rounded-xl text-sm ${msg.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                {msg.text}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => { setConfirmOpen(false); setMsg(null) }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isPending ? 'Suppression...' : 'Confirmer la suppression'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
