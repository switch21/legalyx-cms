import { ShieldAlert, Download, Filter, Search, Database } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export default async function AuditPage() {
  let auditLogs: any[] = [];
  let dataError: string | null = null;

  try {
    const supabase = await createClient();
    
    const { data: logsData, error } = await supabase
      .from('audit_logs')
      .select('id, user_id, action, entity_type, entity_id, details, created_at')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    if (logsData && logsData.length > 0) {
      const userIds = [...new Set(logsData.map(l => l.user_id).filter(Boolean))] as string[];
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

      auditLogs = logsData.map((l: any) => ({
        id: l.id,
        timestamp: new Date(l.created_at).toLocaleString('fr-FR'),
        user: userNames[l.user_id] || 'Système',
        action: l.action,
        target: l.entity_type + (l.entity_id ? ` ID: ${l.entity_id.toString().substring(0, 8)}...` : ''),
        status: 'SUCCESS',
        details: l.details,
      }));
    }
  } catch (err: any) {
    console.error('Error fetching audit logs', err);
    dataError = err.message || 'Erreur de chargement du journal d\'audit';
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-600" />
            Journal d'Audit Sécurisé
          </h1>
          <p className="text-sm text-gray-500 mt-1">Registre inaltérable des actions du système (Conformité légale).</p>
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

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Rechercher un utilisateur, une action..." 
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
              />
            </div>
            <select className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700">
              <option value="">Toutes les actions</option>
              <option value="CREATE_DOSSIER">Création Dossier</option>
              <option value="UPDATE_DOSSIER_STATUS">Mise à jour Statut</option>
              <option value="CREATE_AUDIENCE">Planification Audience</option>
              <option value="CANCEL_AUDIENCE">Annulation Audience</option>
              <option value="DELETE_DOSSIER">Suppression Dossier</option>
            </select>
          </div>
        </div>

        {auditLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/30 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <th className="px-6 py-4 font-medium">Horodatage</th>
                  <th className="px-6 py-4 font-medium">Utilisateur</th>
                  <th className="px-6 py-4 font-medium">Action</th>
                  <th className="px-6 py-4 font-medium">Cible</th>
                  <th className="px-6 py-4 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors font-mono text-xs">
                    <td className="px-6 py-4 text-gray-500">{log.timestamp}</td>
                    <td className="px-6 py-4 font-sans font-medium text-gray-900">{log.user}</td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-primary">{log.action}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-sans">{log.target}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md font-sans font-medium text-xs bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : !dataError ? (
          <div className="text-center py-16 text-gray-400">
            <ShieldAlert className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">Aucune action enregistrée</p>
            <p className="text-xs mt-1">Les actions des utilisateurs apparaîtront ici.</p>
          </div>
        ) : null}
        
        <div className="p-4 border-t border-gray-100 bg-gray-50/30 text-xs text-gray-500 text-center font-sans">
          Conformément à la loi n°2010/012, ces journaux sont conservés pendant 10 ans.
        </div>
      </div>
    </div>
  );
}