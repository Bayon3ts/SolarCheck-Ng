import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json();

    if (!phone || !code) {
      return NextResponse.json(
        { error: 'Phone and code required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const cleaned = phone.replace(/\D/g, '');
    const normalized = cleaned.startsWith('0')
      ? `+234${cleaned.slice(1)}`
      : `+${cleaned}`;

    // Find valid unused OTP
    const { data: otp, error: otpError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('phone', normalized)
      .eq('code', code)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (otpError || !otp) {
      return NextResponse.json(
        { error: 'Invalid or expired code. Request a new one.' },
        { status: 401 }
      );
    }

    // Mark OTP as used
    await supabase
      .from('otp_codes')
      .update({ used: true })
      .eq('id', otp.id);

    // Generate Supabase session for user using magiclink creation
    const { data: authData, error: authError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: otp.email,
    });

    if (authError || !authData) {
      console.error('Magic link generation error:', authError);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      action_link: authData.properties.action_link,
    });
  } catch (err: unknown) {
    console.error('verify-otp error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
