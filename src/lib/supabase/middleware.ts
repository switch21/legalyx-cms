import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest, response: NextResponse) {
  let supabaseResponse = response

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )

          // CRITICAL: Preserve redirect if i18n already produced one.
          // Without this, NextResponse.next() for the original URL (e.g. `/`)
          // would overwrite the i18n redirect to `/fr`, and Next.js would
          // fail to match any route for `/` → "This page couldn't load".
          if (
            supabaseResponse.status >= 300 &&
            supabaseResponse.status < 400
          ) {
            const location = supabaseResponse.headers.get('location')!
            supabaseResponse = NextResponse.redirect(
              new URL(location, request.url)
            )
          } else {
            supabaseResponse = NextResponse.next({ request })
          }

          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    // Session invalid or expired — treat as unauthenticated
  }

  const pathname = request.nextUrl.pathname
  const match = pathname.match(/^\/(fr|en)(\/|$)/)
  const locale = match ? match[1] : 'fr'

  const isLoginPath = pathname.endsWith('/login')
  const isStatic = pathname.match(/\.(png|jpg|jpeg|gif|svg|css|js|ico)$/)

  if (isStatic) {
    return supabaseResponse
  }

  if (!user && !isLoginPath) {
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}/login`
    return NextResponse.redirect(url)
  }

  if (user && isLoginPath) {
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}`
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}