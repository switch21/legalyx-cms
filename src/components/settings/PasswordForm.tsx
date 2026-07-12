'use client'
import { useState, useTransition } from 'react'
import { updatePassword } from '@/lib/actions/profile'
import { ShieldCheck, CheckCircle, AlertCircle } from 'lucide-react'

export default function PasswordForm() {
  const [isPending, startTransition] = useTransition()
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMsg(null)
    startTransition(async () => {
      const result = await updatePassword(new FormData(e.currentTarget))
      if (result?.error) {
        setMsg({ type: 'error', text: result.error })
      } else {
        setMsg({ type: 'success', text: 'Mot de passe modifié avec succès.' })
        ;(e.target as HTMLFormElement).reset()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {msg && (
        <div className={`p-3 rounded-xl text-sm flex items-center gap-2 ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-red-50 text-red-800 border border-red-100'}`}>
          {msg.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {msg.text}
        </div>
      )}
      <div className="space-y-2">
        <label htmlFor="current_password" className="block text-sm font-medium text-gray-700">Mot de passe actuel</label>
        <input id="current_password" name="current_password" type="password" required autoComplete="current-password"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-sm" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">Nouveau mot de passe</label>
          <input id="new_password" name="new_password" type="password" required minLength={8} autoComplete="new-password"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-sm" />
          <p className="text-xs text-gray-400">Minimum 8 caractères</p>
        </div>
        <div className="space-y-2">
          <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
          <input id="confirm_password" name="confirm_password" type="password" required minLength={8} autoComplete="new-password"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-sm" />
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" disabled={isPending}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98] shadow-sm disabled:opacity-50">
          <ShieldCheck className="w-4 h-4" />
          {isPending ? 'Mise à jour...' : 'Modifier le mot de passe'}
        </button>
      </div>
    </form>
  )
}