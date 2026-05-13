import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPaystackWebhook } from "@/lib/paystack";
import { sendSubscriptionConfirmationEmail } from "@/lib/resend";
import { paystackWebhookSchema } from "@/lib/validations";

/* ═══════════════════════════════════════ */
/* POST /api/payments/paystack-webhook     */
/* Verify signature → Update subscription  */
/* ═══════════════════════════════════════ */

export async function POST(request: NextRequest) {
  try {
    // 1. Get raw body and verify Paystack signature
    const rawBody = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    if (!signature) {
      return NextResponse.json(
        { success: false, error: "Missing signature" },
        { status: 400 }
      );
    }

    if (!verifyPaystackWebhook(rawBody, signature)) {
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 401 }
      );
    }

    // 2. Parse and validate the webhook payload
    const body = JSON.parse(rawBody);
    const validation = paystackWebhookSchema.safeParse(body);

    if (!validation.success) {
      console.error("[Paystack Webhook] Invalid payload:", validation.error);
      return NextResponse.json(
        { success: false, error: "Invalid payload" },
        { status: 400 }
      );
    }

    const { event, data } = validation.data;

    // 3. Handle charge.success event
    if (event === "charge.success" && data.status === "success") {
      const supabase = createAdminClient();

      // Extract installer_id and plan from metadata
      const installerId = data.metadata?.installer_id as string;
      const plan = data.metadata?.plan as string;

      if (!installerId || !plan) {
        console.error("[Paystack Webhook] Missing metadata:", data.metadata);
        return NextResponse.json({ success: true, message: "Acknowledged but missing metadata" });
      }

      // Calculate subscription period (30 days)
      const startsAt = new Date();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      // 4. Update installer subscription_tier and subscription_expires_at
      const { error: updateError } = await supabase
        .from("installers")
        .update({
          subscription_tier: plan,
          subscription_expires_at: expiresAt.toISOString(),
        })
        .eq("id", installerId);

      if (updateError) {
        console.error("[Paystack Webhook] Installer update error:", updateError);
      }

      // 5. Log to installer_subscriptions table
      const { error: logError } = await supabase
        .from("installer_subscriptions")
        .insert({
          installer_id: installerId,
          paystack_reference: data.reference,
          plan: plan,
          amount: data.amount,
          status: "active",
          starts_at: startsAt.toISOString(),
          expires_at: expiresAt.toISOString(),
        });

      if (logError) {
        console.error("[Paystack Webhook] Subscription log error:", logError);
      }

      // 6. Send confirmation email via Resend
      const { data: installer } = await supabase
        .from("installers")
        .select("email, company_name")
        .eq("id", installerId)
        .single();

      if (installer?.email) {
        await sendSubscriptionConfirmationEmail(
          installer.email,
          installer.company_name,
          plan
        );
      }

      // 6. Log to webhook_logs table as requested
      const { error: webhookLogError } = await supabase
        .from("webhook_logs")
        .insert({
          event_type: event,
          paystack_reference: data.reference,
          installer_id: installerId,
          amount: data.amount,
          status: data.status,
          raw_payload: body,
        });

      if (webhookLogError) {
        console.error("[Paystack Webhook] Webhook log error:", webhookLogError);
      }

      console.log(`[Paystack Webhook] Subscription activated: ${installerId} → ${plan}`);
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ success: true, message: "Webhook processed" });
  } catch (error) {
    console.error("[Paystack Webhook] Error:", error);
    // Still return 200 to prevent Paystack retries on our errors
    return NextResponse.json({ success: true, message: "Acknowledged with error" });
  }
}
