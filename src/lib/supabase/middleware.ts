import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Lightweight JWT check without full Supabase call
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

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
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const pathname = request.nextUrl.pathname
  const match = pathname.match(/^\/(fr|en)(\/|$)/)
  const locale = match ? match[1] : 'fr'

  const isLoginPath = pathname.endsWith('/login')
  const isStatic = pathname.match(/\.(png|jpg|jpeg|gif|svg|css|js|ico)$/)

  if (isStatic) {
    return supabaseResponse
  }

  // Optimized: Check JWT expiration first (lightweight, no network call)
  const accessToken = request.cookies.get('sb-access-token')?.value 
    || request.cookies.get(`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/https?:\/\//, '').split('.')[0]}-auth-token`)?.value

  // If we have an access token that's not expired, skip the full getUser() call
  if (accessToken && !isTokenExpired(accessToken)) {
    // Token is valid, no need for full Supabase call
    if (isLoginPath) {
      const url = request.nextUrl.clone()
      url.pathname = `/${locale}`
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  // Token missing or expired - do full Supabase auth check (refreshes tokens)
  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    // Session invalid or expired
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