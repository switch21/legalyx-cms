import { Plus, Filter, Folder, Database } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';
import Pagination from '@/components/ui/Pagination';
import SearchBar from '@/components/ui/SearchBar';
import StatusFilter from '@/components/ui/StatusFilter';

export default async function DossiersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || '1', 10));
  const search = params.q || null;
  const statusFilter = params.status || null;
  const limit = 20;
  const offset = (page - 1) * limit;

  let dossiers: any[] = [];
  let totalCount = 0;
  let dataError: string | null = null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('get_dossiers', {
      p_limit: limit,
      p_offset: offset,
      p_search: search,
      p_status: statusFilter,
    });

    if (error) throw error;

    if (data && data.length > 0) {
      dossiers = data.map((d: any) => ({
        id: d.id,
        numero: d.numero,
        titre: d.titre,
        juridiction: d.juridiction,
        status: d.status,
        date: d.created_at,
      }));
    }

    const { data: countData } = await supabase.rpc('count_dossiers', {
      p_search: search,
      p_status: statusFilter,
    });
    totalCount = (countData as number) || 0;
  } catch (err: any) {
    console.error('Failed to fetch dossiers', err);
    dataError = err.message || 'Erreur de chargement des dossiers';
  }

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'OUVERT': return 'bg-blue-100 text-blue-800';
      case 'EN_INSTRUCTION': return 'bg-amber-100 text-amber-800';
      case 'AUDIENCE': return 'bg-emerald-100 text-emerald-800';
      case 'JUGEMENT': return 'bg-purple-100 text-purple-800';
      case 'ARCHIVE': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Registre des Dossiers</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez et consultez l'ensemble des affaires en cours.</p>
        </div>
        <Link 
          href="/dossiers/nouveau" 
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors text-sm font-medium shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nouveau Dossier
        </Link>
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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4">
          <SearchBar
            placeholder="Rechercher par numéro, titre..."
            className="flex-1"
          />
          <div className="flex gap-2">
            <StatusFilter />
            <button className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors text-sm font-medium">
              <Filter className="w-4 h-4" />
              Filtres
            </button>
          </div>
        </div>

        {dossiers.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 text-xs text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-4 font-medium">N° Dossier</th>
                    <th className="px-6 py-4 font-medium">Intitulé de l'affaire</th>
                    <th className="px-6 py-4 font-medium">Juridiction</th>
                    <th className="px-6 py-4 font-medium">Date d'ouverture</th>
                    <th className="px-6 py-4 font-medium">Statut</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {dossiers.map((dossier) => (
                    <tr key={dossier.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Folder className="w-4 h-4" />
                          </div>
                          <span className="font-semibold text-gray-900">{dossier.numero}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-700">{dossier.titre}</td>
                      <td className="px-6 py-4 text-gray-500">{dossier.juridiction}</td>
                      <td className="px-6 py-4 text-gray-500">{new Date(dossier.date).toLocaleDateString('fr-FR')}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(dossier.status)}`}>
                          {dossier.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={`/dossiers/${dossier.id}`}
                          className="text-primary font-medium hover:text-primary/80 transition-colors inline-block"
                        >
                          Consulter
                        </Link>
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
            <Folder className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">
              {search ? `Aucun résultat pour "${search}"` : 'Aucun dossier enregistré'}
            </p>
            {!search && (
              <Link href="/dossiers/nouveau" className="text-sm text-primary hover:text-primary/80 mt-2 inline-block font-medium">
                + Créer un dossier
              </Link>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}