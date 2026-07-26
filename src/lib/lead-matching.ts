import { createAdminClient } from "@/lib/supabase/admin";
import { sendInstallerLeadNotification, sendConsumerConfirmation } from "@/lib/whatsapp";
import { sendInstallerLeadEmail } from "@/lib/resend";

/* ═══════════════════════════════════════ */
/* Lead Matching Engine                    */
/* Reusable matching + rematch logic       */
/* ═══════════════════════════════════════ */

export interface RematchResult {
  matched: number;
  skipped: number;
  details: Array<{
    leadId: string;
    leadName: string;
    state: string;
    installerName: string | null;
    status: "matched" | "no_installer";
  }>;
}

/**
 * Find the best available installers for a given state.
 * Orders by subscription tier (premium > featured > free), then by rating.
 */
export async function findInstallersForState(
  state: string,
  limit: number = 3,
  excludeIds: string[] = []
) {
  const supabase = createAdminClient();

  let query = supabase
    .from("installers")
    .select("id, company_name, email, whatsapp, phone, state, subscription_tier")
    .eq("state", state)
    .eq("is_verified", true)
    .eq("is_active", true);

  if (excludeIds.length > 0) {
    // PostgREST syntax for NOT IN is .not('id', 'in', `(${excludeIds.join(',')})`)
    // Alternatively just filter it in JS, but better in DB.
    // Since we're dealing with string arrays, Supabase JS uses `.not('id', 'in', `(${excludeIds.join(',')})`)`
    query = query.not("id", "in", `(${excludeIds.join(',')})`);
  }

  const { data: installers, error } = await query
    .order("subscription_tier", { ascending: false })
    .order("ranking_score", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[Lead Matching] Error finding installers:", error);
    return [];
  }

  return installers || [];
}

/**
 * Rematch all unmatched leads (installer_id IS NULL) to available installers.
 * Called when:
 *  - An installer is verified + activated
 *  - Admin clicks "Rematch" in the dashboard
 *
 * Optionally filter to a specific state (e.g. when a new installer joins).
 */
export async function rematchUnmatchedLeads(
  filterState?: string
): Promise<RematchResult> {
  const supabase = createAdminClient();

  // 1. Fetch all unmatched leads
  let query = supabase
    .from("leads")
    .select("id, full_name, phone, whatsapp, email, state, city, monthly_bill_range, timeline, lead_type, missed_installer_ids")
    .is("installer_id", null);

  if (filterState) {
    query = query.eq("state", filterState);
  }

  const { data: unmatchedLeads, error: fetchError } = await query;

  if (fetchError || !unmatchedLeads) {
    console.error("[Lead Matching] Error fetching unmatched leads:", fetchError);
    return { matched: 0, skipped: 0, details: [] };
  }

  const result: RematchResult = { matched: 0, skipped: 0, details: [] };

  // 2. For each unmatched lead, try to find an installer
  for (const lead of unmatchedLeads) {
    const limit = lead.lead_type === "exclusive" ? 1 : 3;
    const excludeIds = lead.missed_installer_ids || [];
    const installers = await findInstallersForState(lead.state, limit, excludeIds);

    if (installers.length === 0) {
      result.skipped++;
      result.details.push({
        leadId: lead.id,
        leadName: lead.full_name,
        state: lead.state,
        installerName: null,
        status: "no_installer",
      });
      continue;
    }

    // 3. Assign the best installer
    const bestInstaller = installers[0];
    const { error: updateError } = await supabase
      .from("leads")
      .update({ 
        installer_id: bestInstaller.id, 
        status: "new",
        matched_at: new Date().toISOString(),
      })
      .eq("id", lead.id);

    if (updateError) {
      console.error(`[Lead Matching] Failed to update lead ${lead.id}:`, updateError);
      result.skipped++;
      continue;
    }

    result.matched++;
    result.details.push({
      leadId: lead.id,
      leadName: lead.full_name,
      state: lead.state,
      installerName: bestInstaller.company_name,
      status: "matched",
    });

    // 4. Send notifications to the installer (fire-and-forget)
    sendNotificationsForRematch(bestInstaller, lead).catch((err) =>
      console.error("[Lead Matching] Notification error:", err)
    );
  }

  console.log(
    `[Lead Matching] Rematch complete: ${result.matched} matched, ${result.skipped} skipped`
  );

  return result;
}

/**
 * Send WhatsApp + Email notifications for a rematched lead.
 */
async function sendNotificationsForRematch(
  installer: {
    id: string;
    company_name: string;
    email: string | null;
    whatsapp: string | null;
    phone: string | null;
  },
  lead: {
    id: string;
    full_name: string;
    phone: string;
    whatsapp: string | null;
    email: string | null;
    state: string;
    city: string | null;
    monthly_bill_range: string | null;
    timeline: string | null;
  }
) {
  const promises: Promise<boolean>[] = [];

  // WhatsApp to installer
  if (installer.whatsapp || installer.phone) {
    promises.push(
      sendInstallerLeadNotification(installer.whatsapp || installer.phone!, installer.id, {
        id: lead.id,
        full_name: lead.full_name,
        city: lead.city || lead.state,
        state: lead.state,
        monthly_bill_range: lead.monthly_bill_range || "Not specified",
        timeline: lead.timeline || undefined,
        whatsapp: lead.whatsapp || undefined,
        phone: lead.phone,
      })
    );
  }

  // Email to installer
  if (installer.email) {
    promises.push(
      sendInstallerLeadEmail(installer.email, installer.company_name, installer.id, {
        id: lead.id,
        full_name: lead.full_name,
        city: lead.city || lead.state,
        state: lead.state,
        monthly_bill_range: lead.monthly_bill_range || "Not specified",
        timeline: lead.timeline || undefined,
        phone: lead.phone,
      })
    );
  }

  // WhatsApp confirmation to consumer
  const consumerPhone = lead.whatsapp || lead.phone;
  if (consumerPhone) {
    promises.push(sendConsumerConfirmation(consumerPhone, lead.city || lead.state, 1));
  }

  const results = await Promise.allSettled(promises);
  results.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error(`[Lead Matching] Notification ${i} failed:`, r.reason);
    }
  });
}
