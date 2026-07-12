import { Settings, ShieldCheck, MapPin, Globe, Save } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export default async function ParametresPage() {
  const t = await getTranslations('Settings');

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          {t('title')}
        </h1>
        <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
        {/* Juridiction Section */}
        <div className="p-8 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            {t('juridiction')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">{t('tribunalName')}</label>
              <input 
                type="text" 
                defaultValue="Tribunal de Grande Instance du Mfoundi"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">{t('region')}</label>
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

        {/* Security Section */}
        <div className="p-8 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            {t('security')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">{t('auditRetention')}</label>
              <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-sm">
                <option value="10">{t('audit10years')}</option>
                <option value="5">{t('audit5years')}</option>
                <option value="3">{t('audit3years')}</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">{t('passwordPolicy')}</label>
              <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-sm">
                <option value="strict">{t('passwordStrict')}</option>
                <option value="medium">{t('passwordMedium')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Languages Section */}
        <div className="p-8 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            {t('languages')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">{t('enabledLanguages')}</label>
              <div className="flex gap-4 items-center mt-3">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" defaultChecked disabled className="rounded text-primary focus:ring-primary" /> {t('french')}
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" defaultChecked disabled className="rounded text-primary focus:ring-primary" /> {t('english')}
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="p-8 bg-gray-50/50 flex items-center justify-end gap-4">
          <button className="px-6 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
            {t('reset')}
          </button>
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98] shadow-sm">
            <Save className="w-4 h-4" />
            {t('saveConfigs')}
          </button>
        </div>
      </div>
    </div>
  );
}