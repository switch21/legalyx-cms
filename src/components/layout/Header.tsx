import { Bell, Search, User, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { logout } from '@/app/[locale]/login/actions';

export default async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let name = 'Visiteur';
  let roleLabel = 'Utilisateur';

  if (user) {
    name = user.email || 'Utilisateur';
    roleLabel = 'Agent';

    // Use SECURITY DEFINER function to bypass RLS issues on Vercel
    const { data: profile } = await supabase
      .rpc('get_my_profile');

    if (profile && profile.length > 0) {
      name = `${profile[0].first_name} ${profile[0].last_name}`.trim() || user.email || 'Utilisateur';
      roleLabel = profile[0].role;
    }
  }

  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 shadow-sm">
      <div className="flex items-center bg-gray-50 rounded-full px-4 py-2 w-96 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
        <Search className="w-5 h-5 text-gray-400" />
        <input 
          type="text" 
          placeholder="Rechercher un dossier, une audience..." 
          className="bg-transparent border-none outline-none ml-3 w-full text-sm placeholder:text-gray-400 text-gray-700"
        />
      </div>
      
      <div className="flex items-center space-x-6">
        <button className="relative p-2 text-gray-400 hover:text-primary transition-colors">
          <Bell className="w-6 h-6" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-secondary rounded-full border-2 border-white"></span>
        </button>
        
        <div className="flex items-center space-x-3 pl-6 border-l border-gray-200">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-gray-700">{name}</p>
            <p className="text-xs text-primary font-bold">{roleLabel}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
            <User className="w-5 h-5" />
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
