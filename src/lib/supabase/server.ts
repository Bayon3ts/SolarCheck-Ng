import { createServerClient as createSSRClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/* ═══════════════════════════════════════ */
/* Supabase Server Client                  */
/* Used in Server Components & API Routes  */
/* ═══════════════════════════════════════ */

export async function createServerClient() {
  const cookieStore = await cookies();

  return createSSRClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Server Component — can't set cookies; handled by middleware
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // Server Component — can't remove cookies; handled by middleware
          }
        },
      },
    }
  );
}
