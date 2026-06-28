import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )

  try {
    await supabase.auth.signOut()
  } catch (err) {
    console.error("Sign out error:", err)
  }

  // Force clear the session cookies just in case the server-side signOut failed
  // (e.g. if the user was deleted manually from the database).
  // Supabase SSR uses chunked cookies, so we delete all cookies starting with 'sb-'
  const allCookies = cookieStore.getAll();
  for (const cookie of allCookies) {
    if (cookie.name.startsWith('sb-')) {
      cookieStore.delete(cookie.name);
    }
  }

  // Use the request's own origin so this works in both dev and production
  const origin = request.nextUrl.origin
  return NextResponse.redirect(new URL('/admin/login', origin), { status: 302 })
}
