import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { z } from "zod";

const sendOtpSchema = z.object({
  phone: z.string().min(10).max(15),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = sendOtpSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }
    const { phone } = validation.data;
    const supabase = createAdminClient();

    // Check rate limit (60s cooldown)
    const { data: recent } = await supabase
      .from('otp_verifications')
      .select('created_at')
      .eq('phone', phone)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (recent) {
      const elapsed = (Date.now() - new Date(recent.created_at).getTime()) / 1000;
      if (elapsed < 60) {
        return NextResponse.json({ 
          error: `Please wait ${Math.ceil(60 - elapsed)}s before requesting again.`,
          expires_in: Math.ceil(60 - elapsed)
        }, { status: 429 });
      }
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { error } = await supabase.from('otp_verifications').insert({
      phone,
      code,
      expires_at
    });

    if (error) {
      console.error("[OTP Send] DB error:", error);
      return NextResponse.json({ error: "Failed to generate OTP" }, { status: 500 });
    }

    const message = `Your SolarCheck verification code is: ${code}. Valid for 10 minutes.`;
    await sendWhatsAppMessage({ to: phone, text: message });

    return NextResponse.json({ success: true, message: "OTP sent" });
  } catch (err) {
    console.error("[OTP Send] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
