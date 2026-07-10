import { Link } from '@/i18n/routing';
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react';

export default function PlanifierAudiencePage() {
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

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <form className="p-8 space-y-8">
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Détails de la planification</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Dossier concerné</label>
                <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-sm font-medium">
                  <option value="">Sélectionner un dossier...</option>
                  <option value="1">2026-CIV-001 - Litige Foncier Mballa</option>
                  <option value="2">2026-COM-042 - Recouvrement créance SA</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Date prévue</label>
                <input 
                  type="date" 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Heure de début</label>
                <input 
                  type="time" 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Salle d'audience</label>
                <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-sm">
                  <option value="">Sélectionner une salle...</option>
                  <option value="s1">Salle d'audience 1 (Grande instance)</option>
                  <option value="s2">Salle d'audience 2</option>
                  <option value="s3">Salle d'audience 3 (Cabinet juge)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Magistrat assigné</label>
                <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-sm">
                  <option value="">Sélectionner un juge...</option>
                  <option value="j1">M. le Juge Talla</option>
                  <option value="j2">Mme la Juge Ndongo</option>
                  <option value="j3">M. le Juge Kamga</option>
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
              type="button"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98] shadow-sm"
            >
              <Save className="w-4 h-4" />
              Planifier l'audience
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
