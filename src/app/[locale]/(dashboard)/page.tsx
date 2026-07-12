import { Briefcase, Gavel, FileText, TrendingUp, AlertCircle, Clock, Database } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';

export default async function Dashboard() {
  let activeDossiersCount = 0;
  let todayAudiencesCount = 0;
  let totalAudiencesCount = 0;
  let upcomingAudiences: any[] = [];
  let recentAlerts: any[] = [];
  let dataLoaded = false;
  let dataError: string | null = null;

  try {
    const supabase = await createClient();
    
    // Dashboard stats via RPC
    const { data: statsData, error: statsErr } = await supabase.rpc('get_dashboard_stats');
    if (!statsErr && statsData && statsData.length > 0) {
      activeDossiersCount = statsData[0].dossiers_count || 0;
      totalAudiencesCount = statsData[0].audiences_count || 0;
      todayAudiencesCount = statsData[0].today_audiences_count || 0;
    }

    // Upcoming audiences via RPC (selective)
    const { data: audData, error: audErr } = await supabase.rpc('get_upcoming_audiences', { p_limit: 5 });
    if (!audErr && audData) {
      upcomingAudiences = audData.map((a: any) => ({
        id: a.id,
        time: new Date(a.date_heure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        case: a.dossier_numero || 'N/A',
        type: a.dossier_juridiction || 'Civil',
        room: a.salle,
        date: new Date(a.date_heure).toLocaleDateString('fr-FR'),
      }));
    }

    // Recent audit logs (selective columns)
    const { data: logs, error: logsErr } = await supabase
      .from('audit_logs')
      .select('id, action, created_at, details')
      .order('created_at', { ascending: false })
      .limit(3);

    if (!logsErr && logs && logs.length > 0) {
      recentAlerts = logs.map((log: any) => ({
        id: log.id,
        text: log.details?.numero 
          ? `Dossier ${log.details.numero} - ${log.action.replace(/_/g, ' ')}`
          : `${log.action.replace(/_/g, ' ')}`,
        type: 'info' as const,
        time: new Date(log.created_at).toLocaleString('fr-FR'),
      }));
    }

    dataLoaded = true;
  } catch (error: any) {
    console.error('Dashboard data fetch error:', error);
    dataError = error.message || 'Erreur de connexion à la base de données';
  }

  const stats = [
    { title: 'Dossiers Actifs', value: activeDossiersCount.toLocaleString(), icon: Briefcase, color: 'bg-blue-50 text-blue-600' },
    { title: "Audiences du Jour", value: todayAudiencesCount.toLocaleString(), icon: Gavel, color: 'bg-amber-50 text-amber-600' },
    { title: 'Total Audiences', value: totalAudiencesCount.toLocaleString(), icon: FileText, color: 'bg-emerald-50 text-emerald-600' },
    { title: 'Taux d\'Activité', value: activeDossiersCount > 0 ? `${Math.min(100, Math.round((todayAudiencesCount / Math.max(totalAudiencesCount, 1)) * 100))}%` : 'N/A', icon: TrendingUp, color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Tableau de bord</h1>
          <p className="text-gray-500 mt-1">Résumé de l'activité de votre juridiction.</p>
        </div>
      </div>

      {dataError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3 text-sm text-red-800">
          <Database className="w-5 h-5 text-red-600 shrink-0" />
          <div>
            <p className="font-semibold">Données indisponibles</p>
            <p className="text-xs text-red-700/80 mt-0.5">{dataError}</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`p-4 rounded-full ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Prochaines Audiences */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-secondary" />
              Prochaines Audiences
            </h2>
            <Link href="/audiences" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
              Voir tout
            </Link>
          </div>
          
          {upcomingAudiences.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-sm text-gray-500">
                    <th className="pb-3 font-medium">Heure</th>
                    <th className="pb-3 font-medium">N° Dossier</th>
                    <th className="pb-3 font-medium">Nature</th>
                    <th className="pb-3 font-medium">Salle</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-50">
                  {upcomingAudiences.map((audience) => (
                    <tr key={audience.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="py-4 font-medium text-gray-900">{audience.time}</td>
                      <td className="py-4 text-primary font-medium">{audience.case}</td>
                      <td className="py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {audience.type}
                        </span>
                      </td>
                      <td className="py-4 text-gray-600">{audience.room}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Clock className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">Aucune audience programmée</p>
              <Link href="/audiences/planifier" className="text-sm text-primary hover:text-primary/80 mt-2 inline-block">
                Planifier une audience
              </Link>
            </div>
          )}
        </div>

        {/* Alertes & Actions Rapides */}
        <div className="space-y-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-secondary" />
              Activité Récente
            </h2>
            {recentAlerts.length > 0 ? (
              <div className="space-y-4">
                {recentAlerts.map((alert) => (
                  <div key={alert.id} className={`p-4 rounded-xl border-l-4 border-blue-400 bg-blue-50 text-blue-900`}>
                    <p className="text-sm font-medium">{alert.text}</p>
                    <p className="text-xs text-blue-700/60 mt-1">{alert.time}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-6">Aucune activité récente.</p>
            )}
          </div>

          <div className="bg-primary rounded-2xl p-6 shadow-md text-white">
            <h2 className="text-xl font-semibold mb-4">Actions Rapides</h2>
            <div className="space-y-3">
              <Link href="/dossiers/nouveau" className="block w-full py-3 px-4 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-colors text-center backdrop-blur-sm">
                + Nouveau Dossier
              </Link>
              <Link href="/audiences/planifier" className="block w-full py-3 px-4 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-colors text-center backdrop-blur-sm">
                Planifier une Audience
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}