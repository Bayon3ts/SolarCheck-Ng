import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/* ═══════════════════════════════════════ */
/* POST /api/banners/[id]/click            */
/* Atomically increments click count      */
/* Rate-limited: 1 click per IP per       */
/* banner per 5 minutes                   */
/* ═══════════════════════════════════════ */

// Simple in-process rate limit map: `${ip}:${bannerId}` → last click timestamp
// Clicks are intentionally rate-limited more aggressively than impressions.
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_MS = 5 * 60_000; // 1 click per banner per IP per 5 min

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // ── Rate limiting ────────────────────────────────────────────────────────
  const ip =
    _req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    _req.headers.get("x-real-ip") ||
    "unknown";
  const rateKey = `${ip}:${id}`;
  const lastSeen = rateLimitMap.get(rateKey) ?? 0;
  const now = Date.now();

  if (now - lastSeen < RATE_LIMIT_MS) {
    return NextResponse.json({ success: true, skipped: true });
  }
  rateLimitMap.set(rateKey, now);

  // ── Atomic increment via RPC ─────────────────────────────────────────────
  const supabase = createAdminClient();
  const { error } = await supabase.rpc("increment_banner_stat", {
    p_banner_id: id,
    p_stat_type: "clicks",
  });

  if (error) {
    console.error("[Banners/Click] RPC error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
