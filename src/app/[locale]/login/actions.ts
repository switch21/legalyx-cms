'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Redirect to locale-prefixed dashboard to avoid an extra
  // middleware hop where the i18n redirect could be lost.
  const locale = await getLocale()
  redirect(`/${locale}`)
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  const locale = await getLocale()
  redirect(`/${locale}/login`)
}