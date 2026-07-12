import { Settings, ShieldCheck, MapPin, Globe, Save } from 'lucide-react';

export default function ParametresPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          Configuration du Système
        </h1>
        <p className="text-sm text-gray-500 mt-1">Configurez les paramètres globaux de votre juridiction et les politiques de sécurité.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
        {/* Juridiction Section */}
        <div className="p-8 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Juridiction Référente
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Nom du Tribunal</label>
              <input 
                type="text" 
                defaultValue="Tribunal de Grande Instance du Mfoundi"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Région</label>
              <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-sm">
                <option value="centre">Centre (Yaoundé)</option>
                <option value="littoral">Littoral (Douala)</option>
                <option value="ouest">Ouest (Bafoussam)</option>
                <option value="adamaoua">Adamaoua (Ngaoundéré)</option>
                <option value="nord">Nord (Garoua)</option>
                <option value="extreme-nord">Extrême-Nord (Maroua)</option>
                <option value="est">Est (Bertoua)</option>
                <option value="sud">Sud (Ebolowa)</option>
                <option value="nord-ouest">Nord-Ouest (Bamenda)</option>
                <option value="sud-ouest">Sud-Ouest (Buea)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Securite Section */}
        <div className="p-8 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Sécurité & Conformité (Loi n°2010/012)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Durée de conservation des journaux d'audit</label>
              <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-sm">
                <option value="10">10 ans (Recommandé par la loi)</option>
                <option value="5">5 ans</option>
                <option value="3">3 ans</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Politique de mots de passe</label>
              <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-sm">
                <option value="strict">Fort (12 caractères, Maj/Min/Spécial)</option>
                <option value="medium">Moyen (8 caractères)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Globalisation & Langue */}
        <div className="p-8 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Langues & Régionalisation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Langues Activées</label>
              <div className="flex gap-4 items-center mt-3">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" defaultChecked disabled className="rounded text-primary focus:ring-primary" /> Français
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" defaultChecked disabled className="rounded text-primary focus:ring-primary" /> Anglais (English)
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="p-8 bg-gray-50/50 flex items-center justify-end gap-4">
          <button className="px-6 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
            Réinitialiser
          </button>
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98] shadow-sm">
            <Save className="w-4 h-4" />
            Enregistrer les configurations
          </button>
        </div>
      </div>
    </div>
  );
}
