import { Calendar as CalendarIcon, Clock, MapPin, Users, Plus, Database } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';

export default async function AudiencesPage() {
  let audiences: any[] = [];
  let dataError: string | null = null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('get_audiences', {
      p_limit: 50,
      p_offset: 0,
    });

    if (error) throw error;

    if (data && data.length > 0) {
      // Group audiences by date
      const grouped: Record<string, any[]> = {};
      data.forEach((a: any) => {
        const dateKey = new Date(a.date_heure).toLocaleDateString('fr-FR', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push({
          id: a.id,
          date: new Date(a.date_heure).toLocaleDateString('fr-FR'),
          time: new Date(a.date_heure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          room: a.salle,
          case: a.dossier_numero || 'N/A',
          dossierId: a.dossier_id,
          juge: a.juge_name || 'Non assigné',
          type: a.dossier_juridiction || 'Civil',
          fullDate: a.date_heure,
        });
      });
      audiences = data.map((a: any) => ({
        id: a.id,
        date: new Date(a.date_heure).toLocaleDateString('fr-FR'),
        time: new Date(a.date_heure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        room: a.salle,
        case: a.dossier_numero || 'N/A',
        dossierId: a.dossier_id,
        juge: a.juge_name || 'Non assigné',
        type: a.dossier_juridiction || 'Civil',
        fullDate: a.date_heure,
      }));
    }
  } catch (err: any) {
    console.error('Failed to fetch audiences', err);
    dataError = err.message || 'Erreur de chargement des audiences';
  }

  // Get current month for calendar header
  const now = new Date();
  const monthName = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = (new Date(now.getFullYear(), now.getMonth(), 1).getDay() + 6) % 7; // Monday=0

  // Get audience dates for calendar highlights
  const audienceDates = new Set(
    audiences.map(a => new Date(a.fullDate).getDate())
  );

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'Civil': return 'bg-blue-500';
      case 'Commercial': return 'bg-amber-500';
      case 'Pénal': return 'bg-red-500';
      case 'Social': return 'bg-green-500';
      case 'Administratif': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

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

      {dataError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3 text-sm text-red-800">
          <Database className="w-5 h-5 text-red-600 shrink-0" />
          <div>
            <p className="font-semibold">Données indisponibles</p>
            <p className="text-xs text-red-700/80 mt-0.5">{dataError}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Sidebar */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-fit">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 capitalize">{monthName}</h3>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
            <div>Lu</div><div>Ma</div><div>Me</div><div>Je</div><div>Ve</div><div>Sa</div><div>Di</div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="py-1.5"></div>
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isToday = day === now.getDate();
              const hasAudience = audienceDates.has(day);
              return (
                <div 
                  key={day}
                  className={`py-1.5 rounded-md cursor-pointer text-sm ${
                    isToday ? 'bg-primary text-white font-bold shadow-sm' :
                    hasAudience ? 'bg-primary/10 text-primary font-semibold' :
                    'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {day}
                </div>
              );
            })}
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
            <h2 className="font-semibold text-gray-900">Toutes les audiences programmées</h2>
            <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
              {audiences.length} Programmée{audiences.length !== 1 ? 's' : ''}
            </span>
          </div>

          {audiences.length > 0 ? (
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
                          <span className={`w-2 h-2 rounded-full ${getTypeColor(aud.type)}`}></span>
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
                          <div className="flex items-center gap-1.5">
                            <CalendarIcon className="w-4 h-4 text-gray-400" />
                            {aud.date}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-row md:flex-col gap-2 justify-end">
                      {aud.dossierId && (
                        <Link 
                          href={`/dossiers/${aud.dossierId}`}
                          className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors"
                        >
                          Détails
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : !dataError ? (
            <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
              <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">Aucune audience programmée</p>
              <Link href="/audiences/planifier" className="text-sm text-primary hover:text-primary/80 mt-2 inline-block font-medium">
                Planifier une audience
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}