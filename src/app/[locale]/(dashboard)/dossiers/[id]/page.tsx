import { ArrowLeft, Calendar, FileText, Shield, User, MapPin, Database } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';
import PrintButton from '@/components/layout/PrintButton';
import DossierStatusForm from './DossierStatusForm';

export default async function DossierDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;

  let dossier: any = null;
  let audiences: any[] = [];
  let notFound = false;
  let dataError: string | null = null;

  try {
    const supabase = await createClient();

    const { data: dData, error: dErr } = await supabase.rpc('get_dossier_by_id', { p_id: id });

    if (dErr) throw dErr;

    if (dData && dData.length > 0) {
      const d = dData[0];
      dossier = {
        id: d.id,
        numero: d.numero,
        titre: d.titre,
        description: d.description || 'Aucune description fournie.',
        juridiction: d.juridiction,
        status: d.status,
        date: d.created_at,
      };

      // Fetch audiences for this dossier
      const { data: audData, error: audErr } = await supabase.rpc('get_audiences_for_dossier', { p_dossier_id: id });
      if (!audErr && audData) {
        audiences = audData;
      }
    } else {
      notFound = true;
    }
  } catch (err: any) {
    console.error('Error fetching dossier', err);
    dataError = err.message || 'Erreur de chargement du dossier';
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'OUVERT': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'EN_INSTRUCTION': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'AUDIENCE': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'JUGEMENT': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'ARCHIVE': return 'bg-gray-50 text-gray-700 border-gray-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  if (dataError) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Données indisponibles</h2>
        <p className="text-sm text-gray-500 mt-2">{dataError}</p>
        <Link href="/dossiers" className="text-sm text-primary hover:text-primary/80 mt-4 inline-block font-medium">
          Retour au registre
        </Link>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Dossier introuvable</h2>
        <p className="text-sm text-gray-500 mt-2">Ce dossier n'existe pas ou a été supprimé.</p>
        <Link href="/dossiers" className="text-sm text-primary hover:text-primary/80 mt-4 inline-block font-medium">
          Retour au registre
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto print:p-0 print:bg-white print:text-black">
      <div className="flex items-center justify-between gap-4 print:hidden">
        <Link href="/dossiers" className="inline-flex items-center gap-2 p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500">
          <ArrowLeft className="w-5 h-5" />
          <span>Retour au registre</span>
        </Link>
        <PrintButton />
      </div>

      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6 relative overflow-hidden print:shadow-none print:border-none print:p-0">
        <div className="absolute top-0 left-0 w-2 h-full bg-primary print:hidden"></div>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-gray-100 pb-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-primary bg-primary/5 px-3 py-1 rounded-full uppercase tracking-wider font-mono">
                {dossier.juridiction}
              </span>
              <span className={`px-3 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(dossier.status)}`}>
                {dossier.status.replace(/_/g, ' ')}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{dossier.titre}</h1>
            <p className="text-sm text-gray-400 font-mono">N° Dossier Unique : {dossier.numero}</p>
          </div>

          <div className="text-right text-xs text-gray-400 font-mono shrink-0 md:border-l md:pl-6 border-gray-100">
            <p>RÉPUBLIQUE DU CAMEROUN</p>
            <p>Paix - Travail - Patrie</p>
            <p className="font-semibold text-gray-600 mt-2">TGI DU MFOUNDI</p>
            <p className="text-[10px]">Créé le: {new Date(dossier.date).toLocaleDateString('fr-FR')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-2">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Exposé des faits / Résumé</h2>
              <p className="text-gray-700 leading-relaxed text-sm bg-gray-50/50 p-4 rounded-2xl border border-gray-100">{dossier.description}</p>
            </div>

            <div>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Historique des Audiences</h2>
              {audiences.length > 0 ? (
                <div className="space-y-3">
                  {audiences.map((aud: any) => (
                    <div key={aud.id} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-xs hover:border-primary/20 transition-all">
                      <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900">Audience programmée</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(aud.date_heure).toLocaleString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                        <MapPin className="w-3.5 h-3.5" />
                        {aud.salle}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 text-center font-medium">Aucune audience programmée pour le moment.</p>
              )}
            </div>
          </div>

          <div className="space-y-6 bg-gray-50/30 p-6 rounded-2xl border border-gray-100">
            <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-1.5">
              <User className="w-4 h-4 text-primary" />
              Intervenants Clés
            </h2>

            <div className="space-y-4 text-sm">
              <div>
                <span className="text-xs text-gray-400 block uppercase">Créé par</span>
                <span className="font-semibold text-gray-900">Greffier / Administrateur</span>
              </div>

              <div className="pt-2 border-t border-gray-100" id="status-section">
                <span className="text-xs text-gray-400 block uppercase mb-2">Changer le statut</span>
                <DossierStatusForm dossierId={dossier.id} currentStatus={dossier.status} />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 text-[10px] text-gray-400 text-center font-mono uppercase tracking-wider flex items-center justify-center gap-2">
          <FileText className="w-3.5 h-3.5" />
          Document généré par Legalyx CMS - Certifié conforme à la législation Camerounaise.
        </div>
      </div>
    </div>
  );
}