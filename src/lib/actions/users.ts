'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Verify the caller is ADMIN.
 * Returns { error } if not, or the admin's user ID if valid.
 */
async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié', adminId: null }

  const { data: profile } = await supabase.rpc('get_my_profile_json')
  if (!profile || profile.role !== 'ADMIN') {
    return { error: 'Accès réservé aux administrateurs', adminId: null }
  }

  return { error: null, adminId: user.id }
}

export async function adminCreateUser(formData: FormData) {
  // 1. Verify caller is admin
  const { error: authError, adminId } = await verifyAdmin()
  if (authError) return { error: authError }

  // 2. Extract & validate fields
  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string
  const firstName = (formData.get('first_name') as string)?.trim()
  const lastName = (formData.get('last_name') as string)?.trim()
  const role = (formData.get('role') as string)?.trim()

  if (!email) return { error: "L'email est requis." }
  if (!password || password.length < 8) return { error: 'Le mot de passe doit contenir au moins 8 caractères.' }
  if (!firstName) return { error: 'Le prénom est requis.' }
  if (!lastName) return { error: 'Le nom est requis.' }
  if (!role) return { error: 'Le rôle est requis.' }

  const validRoles = ['ADMIN', 'GREFFIER', 'JUGE', 'AVOCAT', 'PARTIE']
  if (!validRoles.includes(role)) return { error: 'Rôle invalide.' }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return { error: "Format d'email invalide." }

  try {
    // 3. Create auth user via Admin API (bypasses RLS, creates in auth.users)
    const adminClient = createAdminClient()
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email: email.toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
      },
    })

    if (createError) {
      if (createError.message.includes('already registered')) {
        return { error: 'Un utilisateur avec cet email existe déjà.' }
      }
      console.error('adminCreateUser error:', createError)
      return { error: createError.message }
    }

    // 4. The trigger creates a profile with PARTIE role → override with desired role
    const { error: roleError } = await adminClient
      .from('profiles')
      .update({ role: role, first_name: firstName, last_name: lastName })
      .eq('id', newUser.user.id)

    if (roleError) {
      console.error('Failed to set role:', roleError)
      // User was created but role not set — still return success
    }

    // 5. Audit log
    await adminClient.from('audit_logs').insert({
      user_id: adminId,
      action: 'CREATE_USER',
      entity_type: 'user',
      entity_id: newUser.user.id,
      details: { email: email.toLowerCase(), role, first_name: firstName, last_name: lastName },
    })

    revalidatePath('/utilisateurs')
    return { success: true, message: 'Utilisateur créé avec succès.' }
  } catch (err: any) {
    console.error('adminCreateUser unexpected error:', err)
    return { error: err.message || "Erreur lors de la création de l'utilisateur." }
  }
}

export async function adminUpdateUserRole(formData: FormData) {
  // 1. Verify caller is admin
  const { error: authError, adminId } = await verifyAdmin()
  if (authError) return { error: authError }

  const targetUserId = formData.get('target_user_id') as string
  const newRole = (formData.get('new_role') as string)?.trim()

  if (!targetUserId) return { error: 'Identifiant utilisateur requis.' }
  if (!newRole) return { error: 'Le nouveau rôle est requis.' }

  if (targetUserId === adminId) return { error: 'Vous ne pouvez pas modifier votre propre rôle.' }

  const validRoles = ['ADMIN', 'GREFFIER', 'JUGE', 'AVOCAT', 'PARTIE']
  if (!validRoles.includes(newRole)) return { error: 'Rôle invalide.' }

  try {
    // Use admin client to bypass RLS
    const adminClient = createAdminClient()

    const { error: updateError } = await adminClient
      .from('profiles')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('id', targetUserId)

    if (updateError) {
      console.error('adminUpdateUserRole error:', updateError)
      return { error: updateError.message || "Erreur lors de la mise à jour du rôle." }
    }

    // Audit log
    await adminClient.from('audit_logs').insert({
      user_id: adminId,
      action: 'UPDATE_USER_ROLE',
      entity_type: 'user',
      entity_id: targetUserId,
      details: { new_role: newRole },
    })

    revalidatePath('/utilisateurs')
    return { success: true, message: 'Rôle mis à jour.' }
  } catch (err: any) {
    console.error('adminUpdateUserRole unexpected error:', err)
    return { error: err.message || "Erreur lors de la mise à jour du rôle." }
  }
}