import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { initializePayment, BANNER_PLANS } from "@/lib/paystack";

/* ═══════════════════════════════════════ */
/* POST /api/banners/submit                */
/* Validates → inserts pending row →      */
/* initialises Paystack → returns URL     */
/* ═══════════════════════════════════════ */

function isValidHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { company_name, logo_url, headline, cta_text, cta_url, plan } = body;

    // ── Basic field validation ──────────────────────────────────────────────
    if (!company_name?.trim()) {
      return NextResponse.json({ success: false, error: "Company name is required." }, { status: 400 });
    }
    if (!isValidHttpsUrl(logo_url)) {
      return NextResponse.json({ success: false, error: "Logo URL must be a valid https:// link." }, { status: 400 });
    }
    if (!headline?.trim() || headline.trim().length > 60) {
      return NextResponse.json({ success: false, error: "Headline is required and must be 60 characters or fewer." }, { status: 400 });
    }
    if (!cta_text?.trim()) {
      return NextResponse.json({ success: false, error: "Button text is required." }, { status: 400 });
    }
    if (!isValidHttpsUrl(cta_url)) {
      return NextResponse.json({ success: false, error: "Link URL must be a valid https:// link." }, { status: 400 });
    }
    if (!plan || !(plan in BANNER_PLANS)) {
      return NextResponse.json({ success: false, error: "Invalid plan selected." }, { status: 400 });
    }

    const planConfig = BANNER_PLANS[plan as keyof typeof BANNER_PLANS];
    const supabase = createAdminClient();

    // ── Generate a unique payment reference ─────────────────────────────────
    const paymentReference = `banner_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    // ── Calculate placeholder starts_at / ends_at (will be overwritten by webhook) ─
    const startsAt = new Date();
    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + planConfig.durationDays);

    // ── Insert pending row ───────────────────────────────────────────────────
    const { data: banner, error: insertError } = await supabase
      .from("sponsor_banners")
      .insert({
        company_name: company_name.trim(),
        logo_url: logo_url.trim(),
        headline: headline.trim(),
        cta_text: cta_text.trim(),
        cta_url: cta_url.trim(),
        plan,
        amount_paid: planConfig.priceKobo,
        payment_reference: paymentReference,
        payment_status: "pending",
        is_active: false,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
      })
      .select("id")
      .single();

    if (insertError || !banner) {
      console.error("[Banners/Submit] Insert error:", insertError);
      return NextResponse.json({ success: false, error: "Failed to create banner record." }, { status: 500 });
    }

    // ── Initialise Paystack payment ─────────────────────────────────────────
    const paystackRes = await initializePayment({
      // We need an email — use a placeholder for the advertiser since
      // we don't collect email on this form (they're businesses, not accounts).
      // In practice you'd collect it in the form; for now we embed company_name.
      email: `sponsor+${banner.id}@solarcheckng.com`,
      amount: planConfig.priceKobo,
      reference: paymentReference,
      callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/advertise?status=success`,
      metadata: {
        banner_id: banner.id,
        plan,
        company_name: company_name.trim(),
      },
    });

    if (!paystackRes || !paystackRes.status || !paystackRes.data) {
      console.error("[Banners/Submit] Paystack init failed");
      return NextResponse.json({ success: false, error: "Failed to initialize payment. Please try again." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: { checkoutUrl: paystackRes.data.authorization_url },
    });
  } catch (error) {
    console.error("[Banners/Submit] Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
