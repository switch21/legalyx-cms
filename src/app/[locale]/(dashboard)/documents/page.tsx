import { FileText, Upload, Search, Database } from 'lucide-react';

export default function DocumentsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion Documentaire</h1>
          <p className="text-sm text-gray-500 mt-1">Déposez et consultez les pièces jointes et actes juridiques des dossiers.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Zone */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-fit space-y-4">
          <h2 className="font-semibold text-gray-900 text-lg">Déposer une nouvelle pièce</h2>
          
          <div className="border-2 border-dashed border-gray-200 hover:border-primary/50 transition-colors rounded-2xl p-8 text-center cursor-pointer bg-gray-50/50">
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-4" />
            <p className="text-sm font-semibold text-gray-900">Glissez-déposez votre fichier ici</p>
            <p className="text-xs text-gray-500 mt-1">Formats acceptés : PDF, PNG, JPG (Max 15 Mo)</p>
            <button className="mt-4 px-4 py-2 bg-gray-100 text-gray-500 rounded-xl text-xs font-semibold cursor-not-allowed">
              Bientôt disponible
            </button>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-800">
            <p className="font-semibold">Module en préparation</p>
            <p className="mt-1">Le stockage de documents sera disponible dans la prochaine mise à jour avec le support du bucket Supabase Storage.</p>
          </div>
        </div>

        {/* Documents Table - Empty State */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 mb-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Rechercher un document..." 
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-sm"
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="text-center py-20 text-gray-400">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-sm font-medium text-gray-500">Aucun document déposé</p>
              <p className="text-xs text-gray-400 mt-1">Les documents associés aux dossiers apparaîtront ici.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}