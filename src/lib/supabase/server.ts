import { createClient } from "@supabase/supabase-js";

/* ═══════════════════════════════════════ */
/* Supabase Server Client                  */
/* Used in Server Components & API Routes  */
/* ═══════════════════════════════════════ */

export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });
}
