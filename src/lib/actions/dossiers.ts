'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createDossier(formData: FormData) {
  const supabase = await createClient()

  const titre = (formData.get('titre') as string)?.trim()
  const description = (formData.get('description') as string)?.trim() || null
  const juridiction = (formData.get('juridiction') as string)?.trim()

  if (!titre || !juridiction) {
    return { error: 'Le titre et la juridiction sont obligatoires.' }
  }

  const { data, error } = await supabase.rpc('create_dossier', {
    p_titre: titre,
    p_description: description,
    p_juridiction: juridiction,
  })

  if (error) {
    console.error('createDossier error:', error)
    return { error: error.message || "Erreur lors de la création du dossier." }
  }

  if (data && data.length > 0 && data[0].id) {
    redirect(`/dossiers/${data[0].id}`)
  }

  return { error: "Impossible de récupérer l'identifiant du dossier créé." }
}

export async function updateDossierStatus(formData: FormData) {
  const supabase = await createClient()

  const id = formData.get('id') as string
  const newStatus = formData.get('status') as string

  if (!id || !newStatus) {
    return { error: 'Identifiant et statut requis.' }
  }

  const validStatuses = ['OUVERT', 'EN_INSTRUCTION', 'AUDIENCE', 'JUGEMENT', 'ARCHIVE']
  if (!validStatuses.includes(newStatus)) {
    return { error: 'Statut invalide.' }
  }

  const { error } = await supabase.rpc('update_dossier_status', {
    p_id: id,
    p_new_status: newStatus,
  })

  if (error) {
    console.error('updateDossierStatus error:', error)
    return { error: error.message || "Erreur lors de la mise à jour du statut." }
  }

  return { success: true }
}

export async function softDeleteDossier(formData: FormData) {
  const supabase = await createClient()

  const id = formData.get('id') as string
  if (!id) {
    return { error: 'Identifiant requis.' }
  }

  const { error } = await supabase.rpc('soft_delete_dossier', { p_id: id })

  if (error) {
    console.error('softDeleteDossier error:', error)
    return { error: error.message || "Erreur lors de la suppression." }
  }

  return { success: true }
}