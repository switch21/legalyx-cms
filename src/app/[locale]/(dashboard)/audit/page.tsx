import { ShieldAlert, Database } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';
import Pagination from '@/components/ui/Pagination';
import SearchBar from '@/components/ui/SearchBar';
import ActionFilter from '@/components/ui/ActionFilter';

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; action?: string }>;
}) {
  const params = await searchParams;
  const [t, tc] = await Promise.all([
    getTranslations('Audit'),
    getTranslations('Common'),
  ]);
  const page = Math.max(1, parseInt(params.page || '1', 10));
  const search = params.q || null;
  const actionFilter = params.action || null;
  const limit = 20;
  const offset = (page - 1) * limit;

  let auditLogs: any[] = [];
  let totalCount = 0;
  let dataError: string | null = null;

  try {
    const supabase = await createClient();

    let query = supabase
      .from('audit_logs')
      .select('id, user_id, action, entity_type, entity_id, details, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (actionFilter) {
      query = query.eq('action', actionFilter);
    }

    const { data: logsData, error, count } = await query;

    if (error) throw error;
    totalCount = count || 0;

    if (logsData && logsData.length > 0) {
      const userIds = [...new Set(logsData.map((l: any) => l.user_id).filter(Boolean))] as string[];
      let userNames: Record<string, string> = {};

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', userIds);

        if (profiles) {
          profiles.forEach((p: any) => {
            userNames[p.id] = `${p.first_name} ${p.last_name}`;
          });
        }
      }

      auditLogs = logsData.map((l: any) => {
        // Client-side search filter
        if (search) {
          const userName = userNames[l.user_id] || 'Système';
          const hay = `${userName} ${l.action} ${l.entity_type}`.toLowerCase();
          if (!hay.includes(search.toLowerCase())) return null;
        }
        return {
          id: l.id,
          timestamp: new Date(l.created_at).toLocaleString('fr-FR'),
          user: userNames[l.user_id] || 'Système',
          action: l.action,
          target: l.entity_type + (l.entity_id ? ` #${l.entity_id.toString().substring(0, 8)}` : ''),
          details: l.details,
        };
      }).filter(Boolean);
    }
  } catch (err: any) {
    console.error('Error fetching audit logs', err);
    dataError = err.message || "Erreur de chargement du journal d'audit";
  }

  const getActionStyle = (action: string) => {
    if (action.includes('DELETE') || action.includes('CANCEL')) return 'bg-red-50 text-red-700 border-red-100';
    if (action.includes('CREATE')) return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    if (action.includes('UPDATE')) return 'bg-blue-50 text-blue-700 border-blue-100';
    return 'bg-gray-50 text-gray-700 border-gray-100';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-red-600" />
          {t('title')}
        </h1>
        <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
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

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <SearchBar placeholder="Rechercher un utilisateur, une action..." className="flex-1" />
          <ActionFilter />
        </div>

        {auditLogs.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/30 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    <th className="px-6 py-4 font-medium">{t('columnTimestamp')}</th>
                    <th className="px-6 py-4 font-medium">{t('columnUser')}</th>
                    <th className="px-6 py-4 font-medium">{t('columnAction')}</th>
                    <th className="px-6 py-4 font-medium">{t('columnTarget')}</th>
                    <th className="px-6 py-4 font-medium">Détails</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {auditLogs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-gray-500 text-xs whitespace-nowrap">{log.timestamp}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{log.user}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${getActionStyle(log.action)}`}>
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-xs">{log.target}</td>
                      <td className="px-6 py-4 text-gray-500 text-xs max-w-[200px] truncate">
                        {log.details ? JSON.stringify(log.details) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-gray-100">
              <Pagination total={totalCount} currentPage={page} limit={limit} />
            </div>
          </>
        ) : !dataError ? (
          <div className="text-center py-16 text-gray-400">
            <ShieldAlert className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">{t('noLogs')}</p>
            <p className="text-xs mt-1">{t('noLogsDesc')}</p>
          </div>
        ) : null}

        <div className="p-4 border-t border-gray-100 bg-gray-50/30 text-xs text-gray-500 text-center">
          {t('retention')}
        </div>
      </div>
    </div>
  );
}