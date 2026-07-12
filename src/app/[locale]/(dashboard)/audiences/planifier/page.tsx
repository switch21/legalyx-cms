'use client'

import { useState, useTransition, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { ArrowLeft, Save, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { createAudience } from '@/lib/actions/audiences';
import { createBrowserClient } from '@supabase/ssr';

export default function PlanifierAudiencePage() {
  const [dossiers, setDossiers] = useState<{ id: string; numero: string; titre: string }[]>([]);
  const [juges, setJuges] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    Promise.all([
      supabase.rpc('get_dossiers_select'),
      supabase.rpc('get_juges_select'),
    ]).then(([dossiersRes, jugesRes]) => {
      if (dossiersRes.data) setDossiers(dossiersRes.data);
      if (jugesRes.data) setJuges(jugesRes.data);
      setLoaded(true);
    }).catch((err) => {
      console.error('Failed to load form data', err);
      setLoaded(true);
    });
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createAudience(formData);
      if (result && result.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href="/audiences" className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Planifier une Audience</h1>
          <p className="text-sm text-gray-500 mt-1">Inscrire une affaire au rôle d'audience.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-3 text-sm text-red-800">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
          <div>
            <p className="font-semibold">Erreur</p>
            <p className="text-xs text-red-700/80 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Détails de la planification</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="dossier_id" className="block text-sm font-medium text-gray-700">Dossier concerné *</label>
                <select 
                  id="dossier_id"
                  name="dossier_id"
                  required
                  disabled={!loaded}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-sm font-medium disabled:opacity-50"
                >
                  <option value="">{loaded ? 'Sélectionner un dossier...' : 'Chargement...'}</option>
                  {dossiers.map((d) => (
                    <option key={d.id} value={d.id}>{d.numero} - {d.titre}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date prévue *</label>
                <input 
                  id="date"
                  name="date"
                  type="date" 
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-sm"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="time" className="block text-sm font-medium text-gray-700">Heure de début *</label>
                <input 
                  id="time"
                  name="time"
                  type="time" 
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-sm"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="salle" className="block text-sm font-medium text-gray-700">Salle d'audience *</label>
                <select 
                  id="salle"
                  name="salle"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-sm"
                >
                  <option value="">Sélectionner une salle...</option>
                  <option value="Salle d'audience 1">Salle d'audience 1 (Grande instance)</option>
                  <option value="Salle d'audience 2">Salle d'audience 2</option>
                  <option value="Salle d'audience 3">Salle d'audience 3 (Cabinet juge)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="juge_id" className="block text-sm font-medium text-gray-700">Magistrat assigné</label>
                <select 
                  id="juge_id"
                  name="juge_id"
                  disabled={!loaded}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-sm disabled:opacity-50"
                >
                  <option value="">{loaded ? 'Sélectionner un juge...' : 'Chargement...'}</option>
                  {juges.map((j) => (
                    <option key={j.id} value={j.id}>{j.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-sm text-amber-800">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
            <div>
              <p className="font-semibold">Vérification de conflit</p>
              <p className="mt-1">Le système vérifiera automatiquement si la salle ou le magistrat sont déjà assignés à un autre dossier sur ce même créneau horaire avant de valider.</p>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-4">
            <Link 
              href="/audiences"
              className="px-6 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
            >
              Annuler
            </Link>
            <button 
              type="submit"
              disabled={isPending || !loaded}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98] shadow-sm disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="opacity-75"/></svg>
                  Planification...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Planifier l'audience
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}