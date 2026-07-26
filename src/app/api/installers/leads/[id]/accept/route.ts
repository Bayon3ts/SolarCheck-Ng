import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const leadId = resolvedParams.id;
  const installerId = req.nextUrl.searchParams.get("installer");

  if (!installerId) {
    return NextResponse.json({ error: "Missing installer ID" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // 1. Fetch the lead
  const { data: lead, error: fetchError } = await supabase
    .from("leads")
    .select("installer_id, accepted_at")
    .eq("id", leadId)
    .single();

  if (fetchError || !lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  // 2. Check if the lead is still assigned to this installer
  if (lead.installer_id !== installerId) {
    // Lead was reassigned
    return NextResponse.redirect(
      new URL(`/installers/leads/${leadId}/expired`, req.nextUrl.origin)
    );
  }

  // 3. Mark as accepted if not already
  if (!lead.accepted_at) {
    const { error: updateError } = await supabase
      .from("leads")
      .update({
        accepted_at: new Date().toISOString(),
        status: "contacted",
      })
      .eq("id", leadId);

    if (updateError) {
      console.error("[Accept Lead] Failed to update lead:", updateError);
      return NextResponse.json({ error: "Failed to accept lead" }, { status: 500 });
    }
  }

  // 4. Redirect to success page to view full details
  return NextResponse.redirect(
    new URL(`/installers/leads/${leadId}/success?installer=${installerId}`, req.nextUrl.origin)
  );
}
