import { useTranslations } from 'next-intl';
import { Briefcase, Gavel, FileText, TrendingUp, AlertCircle, Clock } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';

export default async function Dashboard() {
  let activeDossiersCount = 0;
  let todayAudiencesCount = 0;
  let documentsCount = 0;
  let upcomingAudiences: any[] = [];
  let recentAlerts: any[] = [];

  try {
    const supabase = await createClient();
    
    // Count dossiers
    const { count: dossiersCount } = await supabase
      .from('dossiers')
      .select('*', { count: 'exact', head: true });
    activeDossiersCount = dossiersCount || 0;

    // Count audiences
    const { count: audCount } = await supabase
      .from('audiences')
      .select('*', { count: 'exact', head: true });
    todayAudiencesCount = audCount || 0;

    // Count documents (audit_logs for now or we will check if table exists)
    documentsCount = 12; // Static or query bucket files

    // Fetch upcoming audiences
    const { data: audData } = await supabase
      .from('audiences')
      .select(`
        id,
        date_heure,
        salle,
        dossier_id
      `)
      .order('date_heure', { ascending: true })
      .limit(5);

    if (audData && audData.length > 0) {
      // Fetch corresponding dossiers
      const dossierIds = audData.map(a => a.dossier_id).filter(Boolean);
      const { data: dossiersData } = await supabase
        .from('dossiers')
        .select('id, numero, juridiction')
        .in('id', dossierIds);

      upcomingAudiences = audData.map((a: any) => {
        const time = new Date(a.date_heure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        const dossier = dossiersData?.find(d => d.id === a.dossier_id);
        return {
          id: a.id,
          time,
          case: dossier?.numero || 'N° Inconnu',
          type: dossier?.juridiction || 'Civil',
          room: a.salle,
        };
      });
    }

    // Fetch recent logs
    const { data: logs } = await supabase
      .from('audit_logs')
      .select('id, action, created_at')
      .order('created_at', { ascending: false })
      .limit(3);

    if (logs && logs.length > 0) {
      recentAlerts = logs.map((log: any) => ({
        id: log.id,
        text: `Action ${log.action} enregistrée avec succès.`,
        type: 'info'
      }));
    }
  } catch (error) {
    console.error('Supabase query failed, falling back to mock data', error);
  }

  // Fallbacks if data is empty (just for demo richness)
  if (activeDossiersCount === 0) activeDossiersCount = 1284;
  if (todayAudiencesCount === 0) todayAudiencesCount = 24;
  if (documentsCount === 0) documentsCount = 142;
  if (upcomingAudiences.length === 0) {
    upcomingAudiences = [
      { id: 1, time: '09:00', case: '2026-CIV-001', type: 'Civil', room: 'Salle 1' },
      { id: 2, time: '10:30', case: '2026-COM-042', type: 'Commercial', room: 'Salle 3' },
      { id: 3, time: '14:00', case: '2026-PEN-018', type: 'Pénal', room: 'Salle 2' },
    ];
  }
  if (recentAlerts.length === 0) {
    recentAlerts = [
      { id: 1, text: 'Délai de prescription proche pour 2025-CIV-890', type: 'warning' },
      { id: 2, text: 'Nouvelle pièce déposée dans 2026-COM-018', type: 'info' },
    ];
  }

  const stats = [
    { title: 'Dossiers Actifs', value: activeDossiersCount.toLocaleString(), icon: Briefcase, color: 'bg-blue-50 text-blue-600' },
    { title: "Audiences du Jour", value: todayAudiencesCount.toLocaleString(), icon: Gavel, color: 'bg-amber-50 text-amber-600' },
    { title: 'Pièces Déposées', value: documentsCount.toLocaleString(), icon: FileText, color: 'bg-emerald-50 text-emerald-600' },
    { title: 'Taux de Clôture', value: '68%', icon: TrendingUp, color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Tableau de bord</h1>
          <p className="text-gray-500 mt-1">Voici le résumé de l'activité de votre juridiction aujourd'hui.</p>
        </div>
      </div>

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
        {/* Audiences du jour */}
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
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-sm text-gray-500">
                  <th className="pb-3 font-medium">Heure</th>
                  <th className="pb-3 font-medium">N° Dossier</th>
                  <th className="pb-3 font-medium">Nature</th>
                  <th className="pb-3 font-medium">Salle</th>
                  <th className="pb-3 font-medium"></th>
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
                    <td className="py-4 text-right">
                      <button className="text-primary opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                        Détails
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alertes & Raccourcis */}
        <div className="space-y-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-secondary" />
              Alertes Récentes
            </h2>
            <div className="space-y-4">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className={`p-4 rounded-xl border-l-4 ${alert.type === 'warning' ? 'border-amber-400 bg-amber-50 text-amber-900' : 'border-blue-400 bg-blue-50 text-blue-900'}`}>
                  <p className="text-sm font-medium">{alert.text}</p>
                </div>
              ))}
            </div>
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
