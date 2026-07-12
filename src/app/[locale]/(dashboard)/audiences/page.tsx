import { Calendar as CalendarIcon, Plus, Database } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';
import AudienceCalendar from '@/components/calendar/AudienceCalendar';

export default async function AudiencesPage() {
  const t = await getTranslations('Audiences');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
        </div>
        <Link 
          href="/audiences/planifier" 
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors text-sm font-medium shadow-sm"
        >
          <Plus className="w-4 h-4" />
          {t('schedule')}
        </Link>
      </div>

      <AudienceCalendar />

      <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
        <span>{t('legend')} :</span>
        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Civil</div>
        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Commercial</div>
        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500"></span> Pénal</div>
        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span> Social</div>
        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-purple-500"></span> Administratif</div>
      </div>
    </div>
  );
}