import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const verifyOtpSchema = z.object({
  phone: z.string().min(10).max(15),
  code: z.string().length(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = verifyOtpSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input format" }, { status: 400 });
    }
    const { phone, code } = validation.data;
    const supabase = createAdminClient();

    // Get the most recent unverified OTP for this phone
    const { data: otpRecord } = await supabase
      .from('otp_verifications')
      .select('*')
      .eq('phone', phone)
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!otpRecord) {
      return NextResponse.json({ error: "No pending OTP found" }, { status: 404 });
    }

    // Check expiration
    if (new Date() > new Date(otpRecord.expires_at)) {
      return NextResponse.json({ error: "OTP has expired" }, { status: 400 });
    }

    // Check attempts
    if (otpRecord.attempts >= 3) {
      return NextResponse.json({ error: "Too many failed attempts. Request a new code." }, { status: 400 });
    }

    if (otpRecord.code !== code) {
      // Increment attempts
      await supabase
        .from('otp_verifications')
        .update({ attempts: otpRecord.attempts + 1 })
        .eq('id', otpRecord.id);
      
      const remaining = 3 - (otpRecord.attempts + 1);
      return NextResponse.json({ error: `Incorrect code. ${remaining} attempts remaining.` }, { status: 400 });
    }

    // Mark as verified
    await supabase
      .from('otp_verifications')
      .update({ verified: true })
      .eq('id', otpRecord.id);

    return NextResponse.json({ success: true, message: "Phone verified" });
  } catch (err) {
    console.error("[OTP Verify] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
