import { FileText, Upload, Download, Search, Filter, Trash2, ExternalLink } from 'lucide-react';

export default function DocumentsPage() {
  const documents = [
    { id: '1', name: 'Conclusions_Demandeurs.pdf', category: 'Conclusions', dossier: '2026-CIV-001', size: '2.4 MB', date: '2026-05-24', author: 'Me. Kamga' },
    { id: '2', name: 'Titre_Propriete_Certifie.pdf', category: 'Pièces Jointes', dossier: '2026-CIV-001', size: '4.8 MB', date: '2026-05-20', author: 'Marie Ndongo' },
    { id: '3', name: 'Contrat_Pret_Signe.pdf', category: 'Pièces Jointes', dossier: '2026-COM-042', size: '1.2 MB', date: '2026-05-22', author: 'Pat Epee' },
    { id: '4', name: 'Ordonnance_Cloture.pdf', category: 'Jugements', dossier: '2026-PEN-018', size: '840 KB', date: '2026-05-25', author: 'Jean Talla' },
  ];

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
            <button className="mt-4 px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm">
              Parcourir
            </button>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Dossier Associé</label>
              <select className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm text-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                <option value="">Sélectionner un dossier...</option>
                <option value="1">2026-CIV-001 - Foncier Bastos</option>
                <option value="2">2026-COM-042 - Créance SA</option>
                <option value="3">2026-PEN-018 - Ministère Public</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Catégorie</label>
              <select className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm text-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                <option value="pieces">Pièce Jointe</option>
                <option value="conclusions">Conclusions</option>
                <option value="actes">Acte de Procédure</option>
                <option value="jugements">Jugement / Décision</option>
              </select>
            </div>
          </div>
        </div>

        {/* Documents Table */}
        <div className="lg:col-span-2 space-y-4">
          {/* Controls */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Rechercher un document..." 
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-sm"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <select className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 font-medium">
                <option value="">Toutes catégories</option>
                <option value="conclusions">Conclusions</option>
                <option value="pieces">Pièces</option>
                <option value="jugements">Jugements</option>
              </select>
              <button className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors text-xs font-semibold">
                <Filter className="w-3.5 h-3.5" />
                Filtres
              </button>
            </div>
          </div>

          {/* List */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    <th className="px-6 py-4 font-medium">Nom du fichier</th>
                    <th className="px-6 py-4 font-medium">Dossier</th>
                    <th className="px-6 py-4 font-medium">Catégorie</th>
                    <th className="px-6 py-4 font-medium">Ajouté le</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900 block max-w-[180px] truncate" title={doc.name}>
                              {doc.name}
                            </span>
                            <span className="text-xs text-gray-400 block mt-0.5">{doc.size} • par {doc.author}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-primary font-bold">{doc.dossier}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          doc.category === 'Conclusions' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                          doc.category === 'Jugements' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          'bg-blue-50 text-blue-700 border border-blue-100'
                        }`}>
                          {doc.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">{new Date(doc.date).toLocaleDateString('fr-FR')}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-primary transition-colors" title="Visualiser">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-primary transition-colors" title="Télécharger">
                            <Download className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-red-600 transition-colors" title="Supprimer">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50/20 text-center text-xs text-gray-400">
              Tous les documents stockés sont chiffrés et signés numériquement selon la norme d'audit légal.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
