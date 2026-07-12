import { User, ShieldCheck, Settings, Database } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import ProfileForm from '@/components/settings/ProfileForm';
import PasswordForm from '@/components/settings/PasswordForm';
import { getRoleLabel } from '@/lib/roles';

export default async function ParametresPage() {
  let profile: { firstName: string; lastName: string; email: string; role: string } | null = null;
  let dataError: string | null = null;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: p, error } = await supabase.rpc('get_my_profile_json');

      if (error) {
        dataError = 'Erreur de chargement du profil: ' + error.message;
      } else if (p) {
        profile = {
          firstName: p.first_name || '',
          lastName: p.last_name || '',
          email: user.email || '',
          role: getRoleLabel(p.role),
        };
      }
    }
  } catch (err: any) {
    dataError = err.message || 'Erreur de chargement du profil';
  }

  if (dataError) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3 text-sm text-red-800">
          <Database className="w-5 h-5 text-red-600 shrink-0" />
          <p className="font-semibold">{dataError}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16 text-gray-400">
        <Settings className="w-12 h-12 mx-auto mb-3 opacity-40" />
        <p className="text-sm">Aucun profil trouvé.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          Paramètres
        </h1>
        <p className="text-sm text-gray-500 mt-1">Gérez votre profil et la sécurité de votre compte.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
        {/* Profile Section */}
        <div className="p-8 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Informations du profil
          </h2>
          <ProfileForm profile={profile} />
        </div>

        {/* Security Section */}
        <div className="p-8 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Sécurité du compte
          </h2>
          <PasswordForm />
        </div>
      </div>
    </div>
  );
}