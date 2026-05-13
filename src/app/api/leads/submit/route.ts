import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { leadSubmitSchema } from "@/lib/validations";
import { sendInstallerLeadNotification, sendConsumerConfirmation } from "@/lib/whatsapp";
import { sendInstallerLeadEmail } from "@/lib/resend";
import { scoreLeadIntent } from "@/lib/utils";

/* ═══════════════════════════════════════ */
/* POST /api/leads/submit                  */
/* Lead scoring → Installer matching →     */
/* WhatsApp/Email dispatch                 */
/* ═══════════════════════════════════════ */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Validate input with Zod
    const validation = leadSubmitSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;
    const supabase = createAdminClient();

    // 2. Score the lead
    const intentScore = scoreLeadIntent(data.timeline, data.monthly_bill_range);

    // 3. Match installers
    //    WHERE state matches AND is_verified = true AND is_active = true
    //    ORDER BY subscription_tier DESC, average_rating DESC
    //    LIMIT 3 (shared) or 1 (exclusive)
    const limit = data.lead_type === "exclusive" ? 1 : 3;

    // const tierOrder = "CASE subscription_tier WHEN 'premium' THEN 3 WHEN 'featured' THEN 2 WHEN 'free' THEN 1 ELSE 0 END";

    const { data: installers, error: matchError } = await supabase
      .from("installers")
      .select("id, company_name, email, whatsapp, phone")
      .eq("state", data.state)
      .eq("is_verified", true)
      .eq("is_active", true)
      .order("subscription_tier", { ascending: false })
      .order("average_rating", { ascending: false })
      .limit(limit);

    if (matchError) {
      console.error("[Lead Submit] Installer match error:", matchError);
      return NextResponse.json(
        { success: false, error: "Failed to match installers" },
        { status: 500 }
      );
    }

    if (!installers || installers.length === 0) {
      // Still save the lead even if no match
      const { error } = await supabase.from("leads").insert({
        ...data,
        installer_id: null,
        status: "new",
        whatsapp_sent: false,
        email_sent: false,
      });

      if (error) console.error("Error saving unmatched lead:", error);

      return NextResponse.json({
        success: true,
        message: "Lead saved. No installers available in your area yet — we'll notify you when one joins.",
        matched_count: 0,
      });
    }

    // 4. Create a lead record for each matched installer
    const leadInserts = installers.map((installer) => ({
      installer_id: installer.id,
      full_name: data.full_name,
      phone: data.phone,
      whatsapp: data.whatsapp || data.phone,
      email: data.email || null,
      state: data.state,
      city: data.city || null,
      monthly_bill_range: data.monthly_bill_range,
      system_size_interest: data.system_size_interest || null,
      ownership_status: data.ownership_status || null,
      timeline: data.timeline || null,
      message: data.message || null,
      lead_type: data.lead_type,
      status: "new" as const,
      whatsapp_sent: false,
      email_sent: false,
    }));

    const { error: insertError } = await supabase.from("leads").insert(leadInserts);

    if (insertError) {
      console.error("[Lead Submit] Insert error:", insertError);
      return NextResponse.json(
        { success: false, error: "Failed to save lead" },
        { status: 500 }
      );
    }

    // 5. Send WhatsApp notifications to each matched installer
    const whatsappPromises = installers.map(async (installer) => {
      if (installer.whatsapp || installer.phone) {
        return sendInstallerLeadNotification(
          installer.whatsapp || installer.phone!,
          {
            full_name: data.full_name,
            city: data.city || data.state,
            state: data.state,
            monthly_bill_range: data.monthly_bill_range,
            timeline: data.timeline,
            whatsapp: data.whatsapp,
            phone: data.phone,
          }
        );
      }
      return false;
    });

    // 6. Send email notifications
    const emailPromises = installers.map(async (installer) => {
      if (installer.email) {
        return sendInstallerLeadEmail(installer.email, installer.company_name, {
          full_name: data.full_name,
          city: data.city || data.state,
          state: data.state,
          monthly_bill_range: data.monthly_bill_range,
          timeline: data.timeline,
          phone: data.phone,
        });
      }
      return false;
    });

    // 7. Send consumer confirmation WhatsApp
    const consumerPhone = data.whatsapp || data.phone;
    const consumerConfirmation = sendConsumerConfirmation(
      consumerPhone,
      data.city || data.state,
      installers.length
    );

    // Fire all notifications in parallel (don't block response)
    Promise.allSettled([
      ...whatsappPromises,
      ...emailPromises,
      consumerConfirmation,
    ]).then((results) => {
      // Update lead records with notification status
      results.forEach((result, i) => {
        if (result.status === "fulfilled") {
          console.log(`[Lead Submit] Notification ${i} sent successfully`);
        } else {
          console.error(`[Lead Submit] Notification ${i} failed:`, result.reason);
        }
      });
    });

    return NextResponse.json({
      success: true,
      message: `We've matched you with ${installers.length} verified solar installer${installers.length > 1 ? "s" : ""}. Expect contact within 2 hours.`,
      matched_count: installers.length,
      intent_score: intentScore,
    });
  } catch (error) {
    console.error("[Lead Submit] Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
