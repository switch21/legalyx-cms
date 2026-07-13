'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function adminCreateUser(formData: FormData) {
  const supabase = await createClient()

  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string
  const firstName = (formData.get('first_name') as string)?.trim()
  const lastName = (formData.get('last_name') as string)?.trim()
  const role = (formData.get('role') as string)?.trim()

  // Validations
  if (!email) return { error: "L'email est requis." }
  if (!password || password.length < 8) return { error: 'Le mot de passe doit contenir au moins 8 caractères.' }
  if (!firstName) return { error: 'Le prénom est requis.' }
  if (!lastName) return { error: 'Le nom est requis.' }
  if (!role) return { error: 'Le rôle est requis.' }

  const validRoles = ['ADMIN', 'GREFFIER', 'JUGE', 'AVOCAT', 'PARTIE']
  if (!validRoles.includes(role)) return { error: 'Rôle invalide.' }

  // Simple email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return { error: "Format d'email invalide." }

  const { data, error } = await supabase.rpc('admin_create_user', {
    p_email: email.toLowerCase(),
    p_password,
    p_first_name: firstName,
    p_last_name: lastName,
    p_role: role,
  })

  if (error) {
    console.error('adminCreateUser RPC error:', error)
    return { error: error.message || "Erreur lors de la création de l'utilisateur." }
  }

  if (data?.error) {
    return { error: data.error }
  }

  revalidatePath('/utilisateurs')
  return { success: true, message: data?.message || 'Utilisateur créé avec succès.' }
}

export async function adminUpdateUserRole(formData: FormData) {
  const supabase = await createClient()

  const targetUserId = formData.get('target_user_id') as string
  const newRole = (formData.get('new_role') as string)?.trim()

  if (!targetUserId) return { error: 'Identifiant utilisateur requis.' }
  if (!newRole) return { error: 'Le nouveau rôle est requis.' }

  const validRoles = ['ADMIN', 'GREFFIER', 'JUGE', 'AVOCAT', 'PARTIE']
  if (!validRoles.includes(newRole)) return { error: 'Rôle invalide.' }

  const { data, error } = await supabase.rpc('admin_update_user_role', {
    p_target_user_id: targetUserId,
    p_new_role: newRole,
  })

  if (error) {
    console.error('adminUpdateUserRole RPC error:', error)
    return { error: error.message || "Erreur lors de la mise à jour du rôle." }
  }

  if (data?.error) {
    return { error: data.error }
  }

  revalidatePath('/utilisateurs')
  return { success: true, message: data?.message || 'Rôle mis à jour.' }
}