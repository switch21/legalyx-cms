import { Bell, Search, User, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { logout } from '@/app/[locale]/login/actions';
import { SidebarToggle } from '@/components/layout/Sidebar';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';
import { getRoleLabel } from '@/lib/roles';

export default async function Header() {
  const supabase = await createClient();

  let name = 'Visiteur';
  let roleLabel = 'Utilisateur';

  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      name = user.email || 'Utilisateur';

      // Use direct query instead of RPC — avoids dependency on a migration
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, role')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
        name = fullName || user.email || 'Utilisateur';
      }

      roleLabel = getRoleLabel(profile?.role);
    }
  } catch (error) {
    // Graceful fallback: keep default name/role on any auth or DB error
    console.error('Header: failed to load user profile', error);
  }

  return (
    <header className="h-16 md:h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 shadow-sm gap-3">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <SidebarToggle />
        <div className="hidden sm:flex items-center bg-gray-50 rounded-full px-4 py-2 w-full max-w-md focus-within:ring-2 focus-within:ring-primary/20 transition-all" data-onboarding="header-search">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input 
            type="text" 
            placeholder="Rechercher un dossier, une audience..." 
            className="bg-transparent border-none outline-none ml-3 w-full text-sm placeholder:text-gray-400 text-gray-700"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2 md:space-x-4 shrink-0">
        <LanguageSwitcher />
        
        <button className="relative p-2 text-gray-400 hover:text-primary transition-colors" aria-label="Notifications">
          <Bell className="w-5 h-5 md:w-6 md:h-6" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-secondary rounded-full border-2 border-white"></span>
        </button>
        
        <div className="flex items-center space-x-2 md:space-x-3 pl-2 md:pl-4 border-l border-gray-200">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-gray-700">{name}</p>
            <p className="text-xs text-primary font-bold">{roleLabel}</p>
          </div>
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
            <User className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          
          <form action={logout} className="inline-block">
            <button 
              type="submit" 
              className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 transition-colors"
              title="Déconnexion"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}