import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/* ═══════════════════════════════════════ */
/* POST /api/banners/[id]/impression       */
/* Atomically increments impression count  */
/* Rate-limited: 1 impression per IP per  */
/* banner per 60 seconds                  */
/* ═══════════════════════════════════════ */

// Simple in-process rate limit map: `${ip}:${bannerId}` → last recorded timestamp
// This resets on server restart — intentional for v1, avoids Redis dependency.
// Worst case under high load or serverless cold starts, some impressions slip through.
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_MS = 60_000; // 1 impression per banner per IP per 60 s

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
    // Silently return OK — don't error, just skip the increment
    return NextResponse.json({ success: true, skipped: true });
  }
  rateLimitMap.set(rateKey, now);

  // ── Atomic increment via RPC ─────────────────────────────────────────────
  const supabase = createAdminClient();
  const { error } = await supabase.rpc("increment_banner_stat", {
    p_banner_id: id,
    p_stat_type: "impressions",
  });

  if (error) {
    console.error("[Banners/Impression] RPC error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
