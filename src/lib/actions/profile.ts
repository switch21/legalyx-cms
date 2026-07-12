'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const firstName = formData.get('first_name') as string
  const lastName = formData.get('last_name') as string

  if (!firstName?.trim() || !lastName?.trim()) {
    return { error: 'Le prénom et le nom sont requis.' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ first_name: firstName.trim(), last_name: lastName.trim(), updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/parametres')
  return { success: true }
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()

  const currentPassword = formData.get('current_password') as string
  const newPassword = formData.get('new_password') as string
  const confirmPassword = formData.get('confirm_password') as string

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: 'Tous les champs sont requis.' }
  }

  if (newPassword.length < 8) {
    return { error: 'Le nouveau mot de passe doit contenir au moins 8 caractères.' }
  }

  if (newPassword !== confirmPassword) {
    return { error: 'Les mots de passe ne correspondent pas.' }
  }

  // Verify current password by re-authenticating
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return { error: 'Non authentifié' }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })

  if (signInError) {
    return { error: 'Mot de passe actuel incorrect.' }
  }

  // Update password
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) return { error: error.message }

  return { success: true }
}