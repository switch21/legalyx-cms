import { createClient } from '@/lib/supabase/server';
import UserManagementClient from '@/components/users/UserManagementClient';

export default async function UtilisateursPage() {
  let users: any[] = [];
  let dataError: string | null = null;
  let currentUserId: string | null = null;

  try {
    const supabase = await createClient();

    // Get current user ID
    const { data: { user } } = await supabase.auth.getUser();
    if (user) currentUserId = user.id;

    // Fetch all profiles
    const { data, error } = await supabase.rpc('get_all_profiles');
    if (error) throw error;

    if (data && data.length > 0) {
      users = data.map((p: any) => ({
        id: p.id,
        name: `${p.first_name} ${p.last_name}`.trim(),
        firstName: p.first_name,
        lastName: p.last_name,
        role: p.role,
        createdAt: p.created_at,
      }));
    }
  } catch (err: any) {
    console.error('Failed to fetch users', err);
    dataError = err.message || 'Erreur de chargement des utilisateurs';
  }

  return (
    <UserManagementClient
      users={users}
      dataError={dataError}
      currentUserId={currentUserId}
    />
  );
}