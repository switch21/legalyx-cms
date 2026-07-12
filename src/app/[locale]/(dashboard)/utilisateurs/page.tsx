import { Users, UserPlus, Search, ShieldCheck, Mail, ShieldAlert, Database } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';
import { getRoleLabel, getRoleBadgeClasses } from '@/lib/roles';

export default async function UtilisateursPage() {
  const [t, tc] = await Promise.all([
    getTranslations('Users'),
    getTranslations('Common'),
  ]);
  let users: any[] = [];
  let dataError: string | null = null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('get_all_profiles');

    if (error) throw error;

    if (data && data.length > 0) {
      users = data.map((p: any) => ({
        id: p.id,
        name: `${p.first_name} ${p.last_name}`.trim(),
        firstName: p.first_name,
        lastName: p.last_name,
        role: p.role,
        createdAt: p.created_at,
      }));
    }
  } catch (err: any) {
    console.error('Failed to fetch users', err);
    dataError = err.message || 'Erreur de chargement des utilisateurs';
  }



  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            {t('title')}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
        </div>
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

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input 
                type="text" 
                placeholder={t('searchPlaceholder')}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-sm"
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {users.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      <th className="px-6 py-4 font-medium">{t('columnUser')}</th>
                      <th className="px-6 py-4 font-medium">{t('columnRole')}</th>
                      <th className="px-6 py-4 font-medium">{t('columnDate')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                              {user.name.split(' ').map((n: string) => n[0]).join('')}
                            </div>
                            <div>
                              <span className="font-semibold text-gray-900 block">{user.name}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${getRoleBadgeClasses(user.role)}`}>
                            {getRoleLabel(user.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : !dataError ? (
              <div className="text-center py-16 text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="text-sm font-medium">{t('noUsers')}</p>
                <p className="text-xs mt-1">{t('noUsersDesc')}</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}