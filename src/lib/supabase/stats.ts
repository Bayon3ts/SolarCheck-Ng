import { createAdminClient } from "@/lib/supabase/admin";

/* ═══════════════════════════════════════ */
/* getSiteStats — Real-time trust numbers  */
/* Replaces all hardcoded stat strings     */
/* Used server-side only (admin client)    */
/* ═══════════════════════════════════════ */

export interface SiteStats {
  verifiedInstallers: number;
  totalLeads: number;
  avgRating: number | null;
}

/**
 * Fetches live stats from Supabase.
 * - verifiedInstallers: active, verified installer count
 * - totalLeads: all-time lead submissions (proxy for "homeowners matched")
 * - avgRating: mean rating across all published reviews
 *
 * Returns 0 / null for any stat if the DB is empty — callers should
 * hide rather than display a zero to the user.
 * Never throws: returns zeroed stats on any DB error so the page still renders.
 */
export async function getSiteStats(): Promise<SiteStats> {
  try {
    const supabase = createAdminClient();

    const [installersRes, leadsRes, ratingsRes] = await Promise.all([
      supabase
        .from("installers")
        .select("id", { count: "exact", head: true })
        .eq("is_verified", true)
        .eq("is_active", true),

      supabase
        .from("leads")
        .select("id", { count: "exact", head: true }),

      supabase
        .from("reviews")
        .select("rating")
        .eq("is_published", true),
    ]);

    const verifiedInstallers = installersRes.count ?? 0;
    const totalLeads = leadsRes.count ?? 0;

    let avgRating: number | null = null;
    if (ratingsRes.data && ratingsRes.data.length > 0) {
      const sum = ratingsRes.data.reduce((acc, r) => acc + (r.rating as number), 0);
      avgRating = Math.round((sum / ratingsRes.data.length) * 10) / 10;
    }

    return { verifiedInstallers, totalLeads, avgRating };
  } catch (err) {
    console.error("[getSiteStats] Failed to fetch site stats:", err);
    return { verifiedInstallers: 0, totalLeads: 0, avgRating: null };
  }
}
