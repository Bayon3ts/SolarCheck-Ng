import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname
  if (
    path.startsWith('/_next') ||
    path.startsWith('/api') ||
    path === '/favicon.ico' ||
    path === '/robots.txt' ||
    path === '/sitemap.xml' ||
    path.match(/\.(svg|png|jpg|jpeg|gif|webp)$/)
  ) {
    return NextResponse.next()
  }

  // Only /admin and /dashboard actually need an auth check below — every
  // other route (including public pages like /installers/[slug], which
  // social-media link-preview crawlers fetch) was still paying for a full
  // Supabase session round-trip on every single request for no reason.
  // WhatsApp's crawler in particular is known to have a much shorter fetch
  // timeout than most; this unnecessary latency on a public page is a
  // plausible contributor to previews failing there specifically while
  // more lenient crawlers (Telegram, Facebook's debugger) still succeed.
  if (!path.startsWith('/admin') && !path.startsWith('/dashboard')) {
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // ✅ Removed duplicate `const path = ...` that was here

  if (path.startsWith('/admin')) {
    // Exclude /admin/login from the auth check so it's always accessible
    if (path === '/admin/login') {
      return response
    }

    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];
    const isAdmin =
      session.user?.user_metadata?.role === 'admin' ||
      (session.user?.email && adminEmails.includes(session.user.email.toLowerCase()));

    if (!isAdmin) {
      // Not an admin — kick back to the admin login with a clear message
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  if (path.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}