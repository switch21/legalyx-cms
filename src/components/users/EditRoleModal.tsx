'use client'

import { useState, useTransition } from 'react'
import { X, Shield, Loader2 } from 'lucide-react'
import { adminUpdateUserRole } from '@/lib/actions/users'
import { useTranslations } from 'next-intl'
import { getRoleBadgeClasses } from '@/lib/roles'

interface EditRoleModalProps {
  open: boolean
  onClose: () => void
  userId: string
  userName: string
  currentRole: string
}

const ROLES = ['ADMIN', 'GREFFIER', 'JUGE', 'AVOCAT', 'PARTIE'] as const

export default function EditRoleModal({ open, onClose, userId, userName, currentRole }: EditRoleModalProps) {
  const t = useTranslations('Users')
  const tc = useTranslations('Common')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [newRole, setNewRole] = useState(currentRole)

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (newRole === currentRole) {
      onClose()
      return
    }

    const formData = new FormData()
    formData.append('target_user_id', userId)
    formData.append('new_role', newRole)

    startTransition(async () => {
      const result = await adminUpdateUserRole(formData)
      if (result.error) {
        setError(result.error)
      } else {
        onClose()
      }
    })
  }

  const roleOptions = ROLES.map((r) => ({
    value: r,
    label: t(`roleOptions.${r}`),
  }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md animate-in zoom-in-95 fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center">
              <Shield className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{t('editRoleTitle')}</h2>
              <p className="text-xs text-gray-500">{userName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-100 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('currentRole')}
            </label>
            <span className={`inline-block px-3 py-1.5 rounded-lg text-sm font-semibold ${getRoleBadgeClasses(currentRole)}`}>
              {t(`roleOptions.${currentRole}`)}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('newRole')}
            </label>
            <select
              value={newRole}
              onChange={(e) => { setNewRole(e.target.value); if (error) setError(null) }}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-sm appearance-none cursor-pointer"
            >
              {roleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
            >
              {tc('cancel')}
            </button>
            <button
              type="submit"
              disabled={isPending || newRole === currentRole}
              className="px-5 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {tc('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}