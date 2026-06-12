import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Normalize phone number
    const cleaned = phone.replace(/\D/g, '');
    const normalized = cleaned.startsWith('0')
      ? `+234${cleaned.slice(1)}`
      : cleaned.startsWith('234')
        ? `+${cleaned}`
        : `+234${cleaned}`;

    // Find installer by WhatsApp number
    const { data: installer, error: installerError } = await supabase
      .from('installers')
      .select('id, email, company_name')
      .or(
        `whatsapp.eq.${normalized},` +
        `phone.eq.${normalized},` +
        `whatsapp.eq.${cleaned},` +
        `phone.eq.${cleaned}`
      )
      .limit(1)
      .single();

    if (installerError || !installer) {
      return NextResponse.json(
        { 
          error: 'No installer account found with this number. Please use email login or apply to register.' 
        },
        { status: 404 }
      );
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in database
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    const { error: insertError } = await supabase
      .from('otp_codes')
      .insert({
        phone: normalized,
        email: installer.email,
        code,
        expires_at: expiresAt,
        used: false,
      });
      
    if (insertError) {
      console.error('Error inserting OTP:', insertError);
      return NextResponse.json({ error: 'Failed to generate OTP' }, { status: 500 });
    }

    // Send via WhatsApp
    const message = 
      `🔐 SolarCheck Login Code\n\n` +
      `Hi ${installer.company_name},\n\n` +
      `Your login code is:\n\n` +
      `*${code}*\n\n` +
      `This code expires in 10 minutes.\n` +
      `Do not share this code with anyone.\n\n` +
      `If you didn't request this, ignore this message.`;

    const sent = await sendWhatsAppMessage({
      to: normalized,
      text: message,
    });

    if (!sent) {
      return NextResponse.json(
        { 
          error: 'Could not send WhatsApp message. Check your number or use email login.' 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'OTP sent successfully'
    });
  } catch (err: unknown) {
    console.error('send-otp error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
