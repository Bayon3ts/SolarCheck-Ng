import { NextResponse } from "next/server";
import { rematchUnmatchedLeads } from "@/lib/lead-matching";

/* ═══════════════════════════════════════ */
/* POST /api/admin/leads/rematch           */
/* Manually trigger rematch for all        */
/* unmatched leads (or a specific state)   */
/* ═══════════════════════════════════════ */

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const state = body.state as string | undefined;

    const result = await rematchUnmatchedLeads(state);

    return NextResponse.json({
      success: true,
      matched: result.matched,
      skipped: result.skipped,
      details: result.details,
      message: result.matched > 0
        ? `Successfully matched ${result.matched} lead${result.matched > 1 ? "s" : ""} to installers.`
        : "No unmatched leads could be matched. Either all leads are already matched or there are no available installers in those states.",
    });
  } catch (error) {
    console.error("[Rematch API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to rematch leads" },
      { status: 500 }
    );
  }
}
