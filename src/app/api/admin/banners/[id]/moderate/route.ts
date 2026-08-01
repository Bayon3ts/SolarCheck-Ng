import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/* ═══════════════════════════════════════ */
/* POST /api/admin/banners/[id]/moderate   */
/* body: { action: 'publish' | 'reject' } */
/* Mirrors toggle-active pattern for       */
/* installer admin routes                  */
/* ═══════════════════════════════════════ */

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { action } = await req.json();

  if (action !== "publish" && action !== "reject" && action !== "deactivate") {
    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  }

  const supabase = createAdminClient();

  let update: Record<string, unknown>;

  if (action === "publish") {
    update = { is_active: true };
  } else if (action === "reject") {
    update = { payment_status: "rejected", is_active: false };
  } else {
    // deactivate — pause a live banner
    update = { is_active: false };
  }

  const { error } = await supabase
    .from("sponsor_banners")
    .update(update)
    .eq("id", id);

  if (error) {
    console.error("[Admin/Banners/Moderate] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
