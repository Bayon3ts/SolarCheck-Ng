import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { initializePayment, SUBSCRIPTION_PLANS } from "@/lib/paystack";

export async function POST(request: NextRequest) {
  try {
    const { plan } = await request.json();

    if (!plan || (plan !== "featured" && plan !== "premium")) {
      return NextResponse.json({ success: false, error: "Invalid plan selected" }, { status: 400 });
    }

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const adminDb = createAdminClient();

    // Try matching by user_id
    let installer = null;
    const { data: byUserId } = await adminDb
      .from('installers')
      .select('*')
      .eq('user_id', user.id)
      .single();

    installer = byUserId;

    // Fallback: match by email
    if (!installer && user.email) {
      const { data: byEmail } = await adminDb
        .from('installers')
        .select('*')
        .eq('email', user.email)
        .single();
      installer = byEmail;
    }

    if (!installer) {
      return NextResponse.json({ success: false, error: "Installer profile not found" }, { status: 404 });
    }

    const planConfig = SUBSCRIPTION_PLANS[plan as keyof typeof SUBSCRIPTION_PLANS];
    if (!planConfig) {
      return NextResponse.json({ success: false, error: "Invalid plan configuration" }, { status: 400 });
    }

    const paystackRes = await initializePayment({
      email: user.email || installer.email,
      amount: planConfig.priceKobo,
      metadata: { installer_id: installer.id, plan },
      callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?upgrade=success`,
    });

    if (paystackRes && paystackRes.status && paystackRes.data) {
      return NextResponse.json({
        success: true,
        data: { checkoutUrl: paystackRes.data.authorization_url }
      });
    } else {
      console.error("[Upgrade] Paystack init failed:", paystackRes);
      return NextResponse.json({ success: false, error: "Failed to initialize payment with Paystack" }, { status: 500 });
    }

  } catch (error) {
    console.error("[Upgrade API] Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
