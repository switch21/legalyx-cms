'use client'
import { useState, useTransition } from 'react'
import { updateProfile } from '@/lib/actions/profile'
import { Save, CheckCircle, AlertCircle } from 'lucide-react'

export default function ProfileForm({ profile }: { profile: { firstName: string; lastName: string; email: string; role: string } }) {
  const [isPending, startTransition] = useTransition()
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMsg(null)
    startTransition(async () => {
      const formData = new FormData(e.currentTarget)
      const result = await updateProfile(formData)
      if (result?.error) {
        setMsg({ type: 'error', text: result.error })
      } else {
        setMsg({ type: 'success', text: 'Profil mis à jour avec succès.' })
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">Prénom</label>
          <input id="first_name" name="first_name" type="text" defaultValue={profile.firstName} required
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-sm" />
        </div>
        <div className="space-y-2">
          <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Nom</label>
          <input id="last_name" name="last_name" type="text" defaultValue={profile.lastName} required
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-sm" />
        </div>
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input type="text" value={profile.email} disabled
          className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed" />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Rôle</label>
        <input type="text" value={profile.role} disabled
          className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed" />
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" disabled={isPending}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98] shadow-sm disabled:opacity-50">
          <Save className="w-4 h-4" />
          {isPending ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  )
}