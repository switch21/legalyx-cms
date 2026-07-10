import { ArrowLeft, Calendar, FileText, Printer, Shield, User, MapPin } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';

export default async function DossierDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;

  let dossier: any = null;
  let audiences: any[] = [];

  try {
    const supabase = await createClient();

    // Fetch dossier
    const { data: dData } = await supabase
      .from('dossiers')
      .select('*')
      .eq('id', id)
      .single();

    if (dData) {
      dossier = {
        id: dData.id,
        numero: dData.numero,
        titre: dData.titre,
        description: dData.description || 'Aucune description fournie.',
        juridiction: dData.juridiction,
        status: dData.status,
        date: dData.created_at,
      };

      // Fetch audiences for this dossier
      const { data: audData } = await supabase
        .from('audiences')
        .select('*')
        .eq('dossier_id', id);

      if (audData) {
        audiences = audData;
      }
    }
  } catch (err) {
    console.error('Error fetching dossier detail from Supabase', err);
  }

  // Fallbacks if not found
  if (!dossier) {
    const fallbacks: Record<string, any> = {
      '11111111-1111-1111-1111-111111111111': {
        id: '11111111-1111-1111-1111-111111111111',
        numero: '2026-CIV-001',
        titre: 'Litige Foncier Mballa',
        description: 'Conflit relatif à la délimitation de la parcelle 452 au quartier Bastos, Yaoundé. Opposition entre Mballa Paul et la succession Nkoa.',
        juridiction: 'Civil',
        status: 'EN_INSTRUCTION',
        date: '2026-05-20',
      },
      '22222222-2222-2222-2222-222222222222': {
        id: '22222222-2222-2222-2222-222222222222',
        numero: '2026-COM-042',
        titre: 'Recouvrement créance SA',
        description: 'Recouvrement de factures impayées d\'un montant de 15 000 000 FCFA par la société SOCATRAL SARL au profit de Bâtiment Force SA.',
        juridiction: 'Commercial',
        status: 'OUVERT',
        date: '2026-05-24',
      },
      '33333333-3333-3333-3333-333333333333': {
        id: '33333333-3333-3333-3333-333333333333',
        numero: '2026-PEN-018',
        titre: 'Affaire Ministère Public contre N. Jean',
        description: 'Poursuites pénales intentées par le procureur de la République pour abus de confiance et détournement de fonds privés dans une coopérative agricole.',
        juridiction: 'Pénal',
        status: 'AUDIENCE',
        date: '2026-05-25',
      }
    };
    dossier = fallbacks[id] || {
      id,
      numero: '2026-GEN-099',
      titre: 'Affaire non répertoriée',
      description: 'Ce dossier contient des données de test ou est en cours d\'enregistrement.',
      juridiction: 'Civil',
      status: 'OUVERT',
      date: new Date().toISOString(),
    };
  }

  if (audiences.length === 0 && dossier.id === '33333333-3333-3333-3333-333333333333') {
    audiences = [
      { id: 'a1', date_heure: new Date(Date.now() + 86400000).toISOString(), salle: 'Salle d\'audience 2' }
    ];
  } else if (audiences.length === 0 && dossier.id === '11111111-1111-1111-1111-111111111111') {
    audiences = [
      { id: 'a2', date_heure: new Date(Date.now() + 172800000).toISOString(), salle: 'Salle d\'audience 1' }
    ];
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'OUVERT': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'EN_INSTRUCTION': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'AUDIENCE': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'ARCHIVE': return 'bg-gray-50 text-gray-700 border-gray-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto print:p-0 print:bg-white print:text-black">
      {/* Back Button & Actions */}
      <div className="flex items-center justify-between gap-4 print:hidden">
        <Link href="/dossiers" className="inline-flex items-center gap-2 p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500">
          <ArrowLeft className="w-5 h-5" />
          <span>Retour au registre</span>
        </Link>
        
        {/* Print Action Trigger */}
        <button 
          onClick={() => { window.print(); }} 
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all text-sm font-semibold shadow-sm active:scale-[0.98]"
        >
          <Printer className="w-4 h-4" />
          Imprimer la Fiche (PDF)
        </button>
      </div>

      {/* Official Header for Print & Layout */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6 relative overflow-hidden print:shadow-none print:border-none print:p-0">
        <div className="absolute top-0 left-0 w-2 h-full bg-primary print:hidden"></div>
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-gray-100 pb-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-primary bg-primary/5 px-3 py-1 rounded-full uppercase tracking-wider font-mono">
                {dossier.juridiction}
              </span>
              <span className={`px-3 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(dossier.status)}`}>
                {dossier.status.replace('_', ' ')}
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

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-2">
          {/* Main Summary */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Exposé des faits / Résumé</h2>
              <p className="text-gray-700 leading-relaxed text-sm bg-gray-50/50 p-4 rounded-2xl border border-gray-100">{dossier.description}</p>
            </div>

            {/* Audiences Details */}
            <div>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Historique des Audiences</h2>
              {audiences.length > 0 ? (
                <div className="space-y-3">
                  {audiences.map((aud) => (
                    <div key={aud.id} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-xs hover:border-primary/20 transition-all">
                      <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900">
                          Audience programmée
                        </p>
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

          {/* Sidebar Info - Actors */}
          <div className="space-y-6 bg-gray-50/30 p-6 rounded-2xl border border-gray-100">
            <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-1.5">
              <User className="w-4 h-4 text-primary" />
              Intervenants Clés
            </h2>

            <div className="space-y-4 text-sm">
              <div>
                <span className="text-xs text-gray-400 block uppercase">Demandeur (Plaintif)</span>
                <span className="font-semibold text-gray-900">Mballa Paul</span>
                <span className="text-xs text-gray-400 block">Avocat: Me. Kamga Alain</span>
              </div>
              
              <div>
                <span className="text-xs text-gray-400 block uppercase">Défendeur</span>
                <span className="font-semibold text-gray-900">Succession Nkoa</span>
                <span className="text-xs text-gray-400 block">Avocat: Non représenté</span>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-400 block uppercase">Magistrat en Charge</span>
                <span className="font-semibold text-gray-900 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-primary" />
                  Jean Talla
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Compliance Footer */}
        <div className="pt-6 border-t border-gray-100 text-[10px] text-gray-400 text-center font-mono uppercase tracking-wider flex items-center justify-center gap-2">
          <FileText className="w-3.5 h-3.5" />
          Document généré par Legalyx CMS - Certifié conforme à la législation Camerounaise.
        </div>
      </div>
    </div>
  );
}
