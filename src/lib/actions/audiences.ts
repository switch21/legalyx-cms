'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createAudience(formData: FormData) {
  const supabase = await createClient()

  const dossierId = formData.get('dossier_id') as string
  const jugeId = (formData.get('juge_id') as string)?.trim() || null
  const dateStr = formData.get('date') as string
  const timeStr = formData.get('time') as string
  const salle = (formData.get('salle') as string)?.trim()

  if (!dossierId || !dateStr || !timeStr || !salle) {
    return { error: 'Le dossier, la date, l\'heure et la salle sont obligatoires.' }
  }

  const dateHeure = new Date(`${dateStr}T${timeStr}:00`)
  if (isNaN(dateHeure.getTime())) {
    return { error: 'Date ou heure invalide.' }
  }

  const { data, error } = await supabase.rpc('create_audience', {
    p_dossier_id: dossierId,
    p_juge_id: jugeId || null,
    p_date_heure: dateHeure.toISOString(),
    p_salle: salle,
  })

  if (error) {
    console.error('createAudience error:', error)
    return { error: error.message || "Erreur lors de la planification." }
  }

  if (data && data.length > 0) {
    if (data[0].conflict_message) {
      return { error: data[0].conflict_message }
    }
  }

  redirect('/audiences')
}

export async function cancelAudience(formData: FormData) {
  const supabase = await createClient()

  const id = formData.get('id') as string
  if (!id) {
    return { error: 'Identifiant requis.' }
  }

  const { error } = await supabase.rpc('cancel_audience', { p_id: id })

  if (error) {
    console.error('cancelAudience error:', error)
    return { error: error.message || "Erreur lors de l'annulation." }
  }

  return { success: true }
}