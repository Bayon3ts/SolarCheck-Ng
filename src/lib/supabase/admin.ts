import { createClient } from "@supabase/supabase-js";

/* ═══════════════════════════════════════ */
/* Supabase Admin Client                   */
/* Uses SERVICE_ROLE_KEY — bypasses RLS    */
/* Only use in trusted server contexts     */
/* ═══════════════════════════════════════ */

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseServiceKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable.");
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
