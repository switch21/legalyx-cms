'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function uploadDocument(formData: FormData) {
  const supabase = await createClient()
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || null
  const userAgent = headersList.get('user-agent') || null

  const file = formData.get('file') as File | null
  const dossierId = formData.get('dossier_id') as string
  const category = (formData.get('category') as string) || 'piece_jointe'

  if (!file || !dossierId) {
    return { error: 'Le fichier et le dossier sont obligatoires.' }
  }

  // Validate file type
  const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  if (!allowedTypes.includes(file.type)) {
    return { error: 'Type de fichier non autorisé. Utilisez PDF, PNG, JPG ou DOCX.' }
  }

  // Validate file size (10MB max)
  if (file.size > 10 * 1024 * 1024) {
    return { error: 'Le fichier ne doit pas dépasser 10 Mo.' }
  }

  try {
    // Upload to Supabase Storage
    const timestamp = Date.now()
    const ext = file.name.split('.').pop()
    const storagePath = `${dossierId}/${timestamp}_${file.name}`

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return { error: uploadError.message || "Erreur lors de l'upload." }
    }

    // Insert metadata into documents table
    const { error: dbError } = await supabase
      .from('documents')
      .insert({
        dossier_id: dossierId,
        filename: `${timestamp}_${file.name}`,
        original_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        category,
        storage_path: storagePath,
      })

    if (dbError) {
      // Clean up uploaded file if DB insert fails
      await supabase.storage.from('documents').remove([storagePath])
      console.error('DB insert error:', dbError)
      return { error: dbError.message || "Erreur lors de l'enregistrement." }
    }

    // Audit log
    await supabase.rpc('log_audit_action', {
      p_action: 'UPLOAD_DOCUMENT',
      p_entity_type: 'document',
      p_details: { file_name: file.name, size: file.size, category, dossier_id: dossierId },
      p_ip: ip,
      p_user_agent: userAgent,
    })

    return { success: true }
  } catch (err: any) {
    console.error('Upload exception:', err)
    return { error: 'Erreur inattendue lors de l\'upload.' }
  }
}

export async function removeDocument(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string
  if (!id) return { error: 'Identifiant requis.' }

  try {
    // Get storage path first
    const { data: doc, error: fetchErr } = await supabase
      .from('documents')
      .select('storage_path, dossier_id')
      .eq('id', id)
      .single()

    if (fetchErr || !doc) {
      return { error: 'Document introuvable.' }
    }

    // Delete from storage
    await supabase.storage.from('documents').remove([doc.storage_path])

    // Delete from DB
    const { error: delErr } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)

    if (delErr) return { error: delErr.message }

    return { success: true }
  } catch (err: any) {
    console.error('Remove document error:', err)
    return { error: "Erreur lors de la suppression." }
  }
}

export async function getDocumentUrl(storagePath: string) {
  const supabase = await createClient()
  const { data } = await supabase.storage
    .from('documents')
    .createSignedUrl(storagePath, 3600) // 1 hour
  return data?.signedUrl || null
}