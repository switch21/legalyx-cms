'use client'

import { useState } from 'react'
import { Search, UserPlus, Pencil, Mail, ShieldCheck, ShieldAlert, Database } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { getRoleLabel, getRoleBadgeClasses } from '@/lib/roles'
import AddUserModal from '@/components/users/AddUserModal'
import EditRoleModal from '@/components/users/EditRoleModal'

interface User {
  id: string
  name: string
  firstName: string
  lastName: string
  role: string
  createdAt: string
}

interface UserManagementClientProps {
  users: User[]
  dataError: string | null
  currentUserId: string | null
}

export default function UserManagementClient({ users: initialUsers, dataError, currentUserId }: UserManagementClientProps) {
  const t = useTranslations('Users')
  const tc = useTranslations('Common')
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editUser, setEditUser] = useState<{ id: string; name: string; role: string } | null>(null)

  const filteredUsers = search.trim()
    ? initialUsers.filter((u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.role.toLowerCase().includes(search.toLowerCase())
      )
    : initialUsers

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            {t('title')}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          {t('addUserButton')}
        </button>
      </div>

      {dataError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3 text-sm text-red-800">
          <Database className="w-5 h-5 text-red-600 shrink-0" />
          <div>
            <p className="font-semibold">{tc('dataUnavailable')}</p>
            <p className="text-xs text-red-700/80 mt-0.5">{dataError}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Role cards sidebar */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-fit space-y-4">
          <h2 className="font-semibold text-gray-900 text-lg">{t('roles')}</h2>

          <div className="space-y-3">
            <div className="flex items-start gap-2.5 p-3 bg-red-50/50 rounded-2xl border border-red-100/50 text-xs text-red-900">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <div>
                <p className="font-bold">{t('admin')}</p>
                <p className="text-red-700 mt-0.5">{t('adminDesc')}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 bg-amber-50/50 rounded-2xl border border-amber-100/50 text-xs text-amber-900">
              <ShieldCheck className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="font-bold">{t('juge')}</p>
                <p className="text-amber-700 mt-0.5">{t('jugeDesc')}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 bg-blue-50/50 rounded-2xl border border-blue-100/50 text-xs text-blue-900">
              <ShieldCheck className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
              <div>
                <p className="font-bold">{t('greffier')}</p>
                <p className="text-blue-700 mt-0.5">{t('greffierDesc')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Users table */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-sm"
              />
            </div>
            <span className="text-xs text-gray-400 ml-3">
              {filteredUsers.length} {filteredUsers.length <= 1 ? t('userSingular') : t('userPlural')}
            </span>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {filteredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      <th className="px-6 py-4 font-medium">{t('columnUser')}</th>
                      <th className="px-6 py-4 font-medium">{t('columnRole')}</th>
                      <th className="px-6 py-4 font-medium">{t('columnDate')}</th>
                      <th className="px-6 py-4 font-medium">{tc('actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                              {user.name.split(' ').map((n: string) => n[0]).join('')}
                            </div>
                            <div>
                              <span className="font-semibold text-gray-900 block">{user.name}</span>
                              {user.id === currentUserId && (
                                <span className="text-[10px] text-primary font-medium">{t('you')}</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => user.id !== currentUserId && setEditUser({ id: user.id, name: user.name, role: user.role })}
                            disabled={user.id === currentUserId}
                            className={`group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${getRoleBadgeClasses(user.role)} ${
                              user.id !== currentUserId ? 'hover:opacity-80 cursor-pointer' : 'cursor-default'
                            }`}
                          >
                            {getRoleLabel(user.role)}
                            {user.id !== currentUserId && (
                              <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setEditUser({ id: user.id, name: user.name, role: user.role })}
                            disabled={user.id === currentUserId}
                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-default"
                            title={t('editRoleTitle')}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : !dataError ? (
              <div className="text-center py-16 text-gray-400">
                <Mail className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="text-sm font-medium">
                  {search ? t('noSearchResults') : t('noUsers')}
                </p>
                <p className="text-xs mt-1">
                  {search ? t('noSearchResultsDesc') : t('noUsersDesc')}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddUserModal open={showAddModal} onClose={() => setShowAddModal(false)} />
      {editUser && (
        <EditRoleModal
          open={!!editUser}
          onClose={() => setEditUser(null)}
          userId={editUser.id}
          userName={editUser.name}
          currentRole={editUser.role}
        />
      )}
    </div>
  )
}