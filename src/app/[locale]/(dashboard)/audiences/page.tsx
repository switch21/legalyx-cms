import { Calendar as CalendarIcon, Clock, MapPin, Users, Plus } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function AudiencesPage() {
  const audiences = [
    { id: '1', date: '26 Mai 2026', time: '09:00', room: 'Salle d\'audience 1', case: '2026-CIV-042', juge: 'M. le Juge Talla', type: 'Civil' },
    { id: '2', date: '26 Mai 2026', time: '10:30', room: 'Salle d\'audience 3', case: '2026-COM-018', juge: 'Mme la Juge Ndongo', type: 'Commercial' },
    { id: '3', date: '27 Mai 2026', time: '14:00', room: 'Salle d\'audience 2', case: '2026-PEN-089', juge: 'M. le Juge Kamga', type: 'Pénal' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendrier des Audiences</h1>
          <p className="text-sm text-gray-500 mt-1">Planifiez et consultez le rôle d'audience.</p>
        </div>
        <Link 
          href="/audiences/planifier" 
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors text-sm font-medium shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Planifier
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Simple Calendar Sidebar */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-fit">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Mai 2026</h3>
            <div className="flex gap-1">
              <button className="p-1 hover:bg-gray-100 rounded text-gray-500">&lt;</button>
              <button className="p-1 hover:bg-gray-100 rounded text-gray-500">&gt;</button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
            <div>Lu</div><div>Ma</div><div>Me</div><div>Je</div><div>Ve</div><div>Sa</div><div>Di</div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {/* Dummy dates */}
            {Array.from({ length: 31 }).map((_, i) => (
              <div 
                key={i} 
                className={`py-1.5 rounded-md cursor-pointer ${i + 1 === 26 ? 'bg-primary text-white font-bold shadow-sm' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                {i + 1}
              </div>
            ))}
          </div>
          
          <div className="mt-6 space-y-2">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Légende</h4>
            <div className="flex items-center gap-2 text-sm text-gray-600"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Civil</div>
            <div className="flex items-center gap-2 text-sm text-gray-600"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Commercial</div>
            <div className="flex items-center gap-2 text-sm text-gray-600"><span className="w-2 h-2 rounded-full bg-red-500"></span> Pénal</div>
          </div>
        </div>

        {/* Audiences List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Audiences du 26 Mai 2026</h2>
            <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">3 Programmées</span>
          </div>

          <div className="space-y-4">
            {audiences.map((aud) => (
              <div key={aud.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-primary/30 transition-colors group">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center justify-center w-16 h-16 bg-gray-50 rounded-xl border border-gray-100 shrink-0">
                      <span className="text-xl font-bold text-primary">{aud.time.split(':')[0]}</span>
                      <span className="text-xs text-gray-500 font-medium">{aud.time.split(':')[1]}</span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${aud.type === 'Civil' ? 'bg-blue-500' : aud.type === 'Commercial' ? 'bg-amber-500' : 'bg-red-500'}`}></span>
                        <h3 className="font-bold text-gray-900 text-lg">Dossier N° {aud.case}</h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          {aud.room}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-gray-400" />
                          {aud.juge}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-row md:flex-col gap-2 justify-end">
                    <button className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors">Détails</button>
                    <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Modifier</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
