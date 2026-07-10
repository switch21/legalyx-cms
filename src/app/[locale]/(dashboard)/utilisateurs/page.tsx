import { Users, UserPlus, Search, ShieldCheck, Mail, ShieldAlert } from 'lucide-react';

export default function UtilisateursPage() {
  const users = [
    { id: '1', name: 'Pat Epee', email: 'pat.epee@gmail.com', role: 'ADMIN', status: 'ACTIVE', lastLogin: 'Il y a 5 min' },
    { id: '2', name: 'Jean Talla', email: 'juge@legalyx.cm', role: 'JUGE', status: 'ACTIVE', lastLogin: 'Hier à 14:30' },
    { id: '3', name: 'Marie Ndongo', email: 'greffier@legalyx.cm', role: 'GREFFIER', status: 'ACTIVE', lastLogin: 'Aujourd\'hui à 08:15' },
    { id: '4', name: 'Alain Kamga', email: 'avocat@legalyx.cm', role: 'AVOCAT', status: 'ACTIVE', lastLogin: '25 Mai 2026' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Gestion des Utilisateurs
          </h1>
          <p className="text-sm text-gray-500 mt-1">Gérez les comptes des collaborateurs de la juridiction et attribuez leurs rôles officiels.</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors text-sm font-medium shadow-sm">
          <UserPlus className="w-4 h-4" />
          Ajouter un utilisateur
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Quick info panel */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-fit space-y-4">
          <h2 className="font-semibold text-gray-900 text-lg">Rôles de Sécurité</h2>
          
          <div className="space-y-3">
            <div className="flex items-start gap-2.5 p-3 bg-red-50/50 rounded-2xl border border-red-100/50 text-xs text-red-900">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <div>
                <p className="font-bold">ADMINISTRATEUR</p>
                <p className="text-red-700 mt-0.5">Accès total, gestion des utilisateurs et journal d'audit.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2.5 p-3 bg-amber-50/50 rounded-2xl border border-amber-100/50 text-xs text-amber-900">
              <ShieldCheck className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="font-bold">JUGE / MAGISTRAT</p>
                <p className="text-amber-700 mt-0.5">Consultation totale, signature et prononcé des décisions.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 bg-blue-50/50 rounded-2xl border border-blue-100/50 text-xs text-blue-900">
              <ShieldCheck className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
              <div>
                <p className="font-bold">GREFFIER</p>
                <p className="text-blue-700 mt-0.5">Enregistrement des dossiers et planification des audiences.</p>
              </div>
            </div>
          </div>
        </div>

        {/* User list */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Rechercher par nom, email..." 
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-sm"
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    <th className="px-6 py-4 font-medium">Collaborateur</th>
                    <th className="px-6 py-4 font-medium">Rôle officiel</th>
                    <th className="px-6 py-4 font-medium">Statut</th>
                    <th className="px-6 py-4 font-medium">Dernier Accès</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900 block">{user.name}</span>
                            <span className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                          user.role === 'ADMIN' ? 'bg-red-50 text-red-700 border border-red-100' :
                          user.role === 'JUGE' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          'bg-blue-50 text-blue-700 border border-blue-100'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold text-xs bg-emerald-50 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                          Actif
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">{user.lastLogin}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-primary hover:text-primary/80 transition-colors font-medium text-sm">
                          Modifier
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
