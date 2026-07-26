import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rematchUnmatchedLeads } from "@/lib/lead-matching";

export async function GET(req: Request) {
  // Add a simple security check for cron endpoints
  const authHeader = req.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = createAdminClient();

  // Find leads that have been matched for more than 10 minutes but not accepted
  // (In PostgreSQL: matched_at < NOW() - INTERVAL '10 minutes')
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

  const { data: staleLeads, error: fetchError } = await supabase
    .from("leads")
    .select("id, installer_id, missed_installer_ids, state")
    .not("installer_id", "is", null)
    .is("accepted_at", null)
    .lt("matched_at", tenMinutesAgo);

  if (fetchError) {
    console.error("[Speed Enforcer] Error fetching stale leads:", fetchError);
    return NextResponse.json({ error: "Fetch error" }, { status: 500 });
  }

  if (!staleLeads || staleLeads.length === 0) {
    return NextResponse.json({ success: true, processed: 0, message: "No stale leads found" });
  }

  console.log(`[Speed Enforcer] Found ${staleLeads.length} stale leads. Reassigning...`);

  const processedIds: string[] = [];
  const affectedStates = new Set<string>();

  for (const lead of staleLeads) {
    if (!lead.installer_id) continue;

    // Append the missed installer to the missed array
    const newMissedList = [...(lead.missed_installer_ids || []), lead.installer_id];

    const { error: updateError } = await supabase
      .from("leads")
      .update({
        installer_id: null,
        missed_installer_ids: newMissedList,
        status: "new", // Reset status just in case
      })
      .eq("id", lead.id);

    if (updateError) {
      console.error(`[Speed Enforcer] Error updating lead ${lead.id}:`, updateError);
    } else {
      processedIds.push(lead.id);
      if (lead.state) affectedStates.add(lead.state);
    }
  }

  // Trigger rematching for the states where leads were freed up
  let rematched = 0;
  for (const state of Array.from(affectedStates)) {
    const result = await rematchUnmatchedLeads(state);
    rematched += result.matched;
  }

  return NextResponse.json({
    success: true,
    processed: processedIds.length,
    rematched,
    message: `Processed ${processedIds.length} stale leads. Rematched ${rematched}.`,
  });
}
