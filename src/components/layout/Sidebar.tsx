import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Home, FolderOpen, Calendar, Users, FileText, Settings, ShieldCheck } from 'lucide-react';

export default function Sidebar() {
  const t = useTranslations('Index'); // TODO: Add specific translations
  
  return (
    <aside className="w-64 bg-primary text-white flex flex-col h-full shadow-xl">
      <div className="p-6 flex items-center justify-center border-b border-white/10">
        <h1 className="text-2xl font-bold tracking-wider text-secondary">LEGALYX<span className="text-white text-sm font-light ml-1">CMS</span></h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 mt-4">
        <Link href="/" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors">
          <Home className="w-5 h-5 text-secondary" />
          <span>Tableau de bord</span>
        </Link>
        <Link href="/dossiers" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors">
          <FolderOpen className="w-5 h-5 text-secondary" />
          <span>Dossiers</span>
        </Link>
        <Link href="/audiences" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors">
          <Calendar className="w-5 h-5 text-secondary" />
          <span>Audiences</span>
        </Link>
        <Link href="/documents" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors">
          <FileText className="w-5 h-5 text-secondary" />
          <span>Documents</span>
        </Link>
        <Link href="/utilisateurs" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors">
          <Users className="w-5 h-5 text-secondary" />
          <span>Utilisateurs</span>
        </Link>
        <Link href="/audit" className="flex items-center space-x-3 p-3 rounded-lg bg-red-900/20 border border-red-500/20 hover:bg-red-900/40 transition-colors mt-4">
          <ShieldCheck className="w-5 h-5 text-red-400" />
          <span className="text-red-100 font-medium">Journal d'Audit</span>
        </Link>
      </nav>
      
      <div className="p-4 border-t border-white/10">
        <Link href="/parametres" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors">
          <Settings className="w-5 h-5 text-secondary" />
          <span>Paramètres</span>
        </Link>
      </div>
    </aside>
  );
}
