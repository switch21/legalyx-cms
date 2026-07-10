import { Link } from '@/i18n/routing';
import { ArrowLeft, Save } from 'lucide-react';

export default function NouveauDossierPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href="/dossiers" className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ouverture d'un nouveau dossier</h1>
          <p className="text-sm text-gray-500 mt-1">Renseignez les informations initiales de l'affaire.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <form className="p-8 space-y-8">
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Informations Générales</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Juridiction compétente</label>
                <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-sm">
                  <option value="">Sélectionner...</option>
                  <option value="civil">Tribunal de Première Instance (Civil)</option>
                  <option value="commercial">Tribunal de Commerce (OHADA)</option>
                  <option value="penal">Tribunal de Grande Instance (Pénal)</option>
                  <option value="social">Tribunal du Travail</option>
                  <option value="administratif">Tribunal Administratif</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Nature de l'affaire</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-sm"
                  placeholder="Ex: Litige foncier, Divorce..."
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Intitulé complet</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-sm"
                  placeholder="Intitulé officiel de l'affaire"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Description / Faits sommaires</label>
                <textarea 
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-sm resize-none"
                  placeholder="Résumé des faits..."
                ></textarea>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-4">
            <Link 
              href="/dossiers"
              className="px-6 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
            >
              Annuler
            </Link>
            <button 
              type="button"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98] shadow-sm"
            >
              <Save className="w-4 h-4" />
              Enregistrer et Générer N°
            </button>
          </div>
        </form>
      </div>
      
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3 text-sm text-blue-800">
        <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center shrink-0 mt-0.5">i</div>
        <p>Le numéro de dossier officiel (ex: 2026-CIV-001) sera généré automatiquement et de façon inaltérable lors de l'enregistrement, conformément à la procédure.</p>
      </div>
    </div>
  );
}
