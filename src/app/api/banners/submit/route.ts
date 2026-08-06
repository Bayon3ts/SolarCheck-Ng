import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { initializePayment, BANNER_PLANS, BANNER_PRICING_MATRIX, type BannerDuration } from "@/lib/paystack";

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

    const { company_name, logo_url, headline, cta_text, cta_url, plan, placementLocation, duration, bg_image_url } = body;

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
    if (!['calculator', 'directory', 'guides'].includes(placementLocation)) {
      return NextResponse.json({ success: false, error: "Invalid placement selected." }, { status: 400 });
    }
    const validDurations = [7, 14, 30];
    const durationDays = Number(duration);
    if (!validDurations.includes(durationDays)) {
      return NextResponse.json({ success: false, error: "Invalid campaign duration. Choose 7, 14, or 30 days." }, { status: 400 });
    }

    // ── Resolve price from the matrix server-side (prevents client tampering) ──
    const tier = plan as keyof typeof BANNER_PRICING_MATRIX;
    const priceRow = BANNER_PRICING_MATRIX[tier][durationDays as BannerDuration];
    const { priceNgn, priceKobo } = priceRow;
    const supabase = createAdminClient();

    // ── Generate a unique payment reference ─────────────────────────────────
    const paymentReference = `banner_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    // ── Calculate placeholder starts_at / ends_at (will be overwritten by webhook) ─
    const startsAt = new Date();
    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + durationDays);

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
        placement_location: placementLocation,
        amount_paid: priceNgn,
        payment_reference: paymentReference,
        payment_status: "pending",
        is_active: false,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        ...(bg_image_url ? { bg_image_url: bg_image_url.trim() } : {}),
      })
      .select("id")
      .single();

    if (insertError || !banner) {
      console.error("[Banners/Submit] Insert error:", insertError);
      return NextResponse.json({
        success: false,
        error: "Failed to create banner record.",
        detail: insertError?.message ?? "Unknown insert error",
        hint: insertError?.hint ?? null,
        code: insertError?.code ?? null,
      }, { status: 500 });
    }

    // ── Initialise Paystack payment ─────────────────────────────────────────
    const paystackRes = await initializePayment({
      email: `sponsor+${banner.id}@solarcheckng.com`,
      amount: priceKobo,
      reference: paymentReference,
      callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/advertise?status=success`,
      metadata: {
        banner_id: banner.id,
        plan,
        duration_days: durationDays,
        amount_ngn: priceNgn,
        company_name: company_name.trim(),
        placement_location: placementLocation,
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
