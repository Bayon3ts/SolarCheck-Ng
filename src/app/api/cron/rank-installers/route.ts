import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  // Security check
  const authHeader = req.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = createAdminClient();

  // 1. Fetch all active installers
  const { data: installers, error: installersError } = await supabase
    .from("installers")
    .select("id, average_rating, total_reviews")
    .eq("is_active", true);

  if (installersError || !installers) {
    console.error("[Rank Installers] Failed to fetch installers:", installersError);
    return NextResponse.json({ error: "Fetch error" }, { status: 500 });
  }

  // 2. Fetch all leads that have an installer assigned
  const { data: leads, error: leadsError } = await supabase
    .from("leads")
    .select("installer_id, matched_at, accepted_at, status")
    .not("installer_id", "is", null);

  if (leadsError || !leads) {
    console.error("[Rank Installers] Failed to fetch leads:", leadsError);
    return NextResponse.json({ error: "Fetch error" }, { status: 500 });
  }

  // 3. Group leads by installer
  const installerLeads = leads.reduce((acc, lead) => {
    if (lead.installer_id) {
      if (!acc[lead.installer_id]) acc[lead.installer_id] = [];
      acc[lead.installer_id].push(lead);
    }
    return acc;
  }, {} as Record<string, typeof leads>);

  // 4. Calculate scores
  const updates = [];

  for (const installer of installers) {
    let speedScore = 15; // Default if no leads
    let closeRateScore = 20; // Default if no leads
    let reviewScore = 15; // Default if no reviews

    const myLeads = installerLeads[installer.id] || [];

    // --- Calculate Speed Score (30 pts max) ---
    const acceptedLeads = myLeads.filter((l) => l.matched_at && l.accepted_at);
    if (acceptedLeads.length > 0) {
      let totalMinutes = 0;
      for (const lead of acceptedLeads) {
        const matched = new Date(lead.matched_at!).getTime();
        const accepted = new Date(lead.accepted_at!).getTime();
        totalMinutes += (accepted - matched) / (1000 * 60);
      }
      const avgMinutes = totalMinutes / acceptedLeads.length;

      if (avgMinutes <= 2) {
        speedScore = 30;
      } else if (avgMinutes <= 5) {
        speedScore = 15;
      } else {
        speedScore = 0;
      }
    }

    // --- Calculate Close Rate Score (40 pts max) ---
    if (myLeads.length > 0) {
      const convertedCount = myLeads.filter((l) => l.status === "converted").length;
      const closeRate = convertedCount / myLeads.length; // 0.0 to 1.0
      closeRateScore = closeRate * 40;
    }

    // --- Calculate Review Score (30 pts max) ---
    if (installer.total_reviews > 0) {
      // average_rating is out of 5
      reviewScore = (installer.average_rating / 5) * 30;
    }

    // --- Total Score ---
    const totalScore = Math.round(speedScore + closeRateScore + reviewScore);

    updates.push({
      id: installer.id,
      ranking_score: totalScore,
    });
  }

  // 5. Bulk update (Supabase allows upserting arrays for bulk updates if PK is included)
  const { error: updateError } = await supabase
    .from("installers")
    .upsert(updates, { onConflict: "id" });

  if (updateError) {
    console.error("[Rank Installers] Failed to bulk update scores:", updateError);
    return NextResponse.json({ error: "Update error" }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    processed: updates.length,
    message: `Successfully ranked ${updates.length} installers.`,
  });
}
