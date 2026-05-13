/* ═══════════════════════════════════════ */
/* Resend Email Integration                */
/* ═══════════════════════════════════════ */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = "SolarCheck Nigeria <noreply@solarcheckng.com>";

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send an email via the Resend API.
 */
export async function sendEmail({ to, subject, html }: EmailPayload): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn("[Resend] Missing API key. Email not sent.");
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("[Resend] Send failed:", error);
      return false;
    }

    console.log(`[Resend] Email sent to ${to}: "${subject}"`);
    return true;
  } catch (error) {
    console.error("[Resend] Error:", error);
    return false;
  }
}

/**
 * Send lead notification email to an installer.
 */
export async function sendInstallerLeadEmail(
  installerEmail: string,
  companyName: string,
  lead: {
    full_name: string;
    city: string;
    state: string;
    monthly_bill_range: string;
    timeline?: string;
    phone: string;
  }
): Promise<boolean> {
  const html = `
    <div style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0A5C36; padding: 32px; border-radius: 16px 16px 0 0;">
        <h1 style="color: white; font-size: 24px; margin: 0;">🔔 New Solar Lead</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">SolarCheck Nigeria</p>
      </div>
      <div style="background: white; padding: 32px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 16px 16px;">
        <p style="color: #1A1A1A; font-size: 16px;">Hi ${companyName},</p>
        <p style="color: #6B7280;">A new lead has been matched to your company:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 8px 0; color: #6B7280;">Name</td><td style="padding: 8px 0; color: #1A1A1A; font-weight: 600;">${lead.full_name}</td></tr>
          <tr><td style="padding: 8px 0; color: #6B7280;">Location</td><td style="padding: 8px 0; color: #1A1A1A; font-weight: 600;">${lead.city}, ${lead.state}</td></tr>
          <tr><td style="padding: 8px 0; color: #6B7280;">Bill Range</td><td style="padding: 8px 0; color: #1A1A1A; font-weight: 600;">${lead.monthly_bill_range}</td></tr>
          <tr><td style="padding: 8px 0; color: #6B7280;">Timeline</td><td style="padding: 8px 0; color: #1A1A1A; font-weight: 600;">${lead.timeline || "Not specified"}</td></tr>
          <tr><td style="padding: 8px 0; color: #6B7280;">Phone</td><td style="padding: 8px 0; color: #1A1A1A; font-weight: 600;">${lead.phone}</td></tr>
        </table>
        <a href="https://solarcheckng.com/dashboard" style="display: inline-block; background: #0A5C36; color: white; padding: 12px 32px; border-radius: 999px; text-decoration: none; font-weight: 600; margin-top: 16px;">View in Dashboard →</a>
        <p style="color: #6B7280; font-size: 13px; margin-top: 24px;">Please respond to this lead within 2 hours for the best results.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: installerEmail,
    subject: `New Solar Lead in ${lead.city} — ${lead.full_name}`,
    html,
  });
}

/**
 * Send welcome email after installer registration.
 */
export async function sendInstallerWelcomeEmail(
  email: string,
  companyName: string
): Promise<boolean> {
  const html = `
    <div style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0A5C36; padding: 32px; border-radius: 16px 16px 0 0;">
        <h1 style="color: white; font-size: 24px; margin: 0;">Welcome to SolarCheck Nigeria! 🎉</h1>
      </div>
      <div style="background: white; padding: 32px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 16px 16px;">
        <p style="color: #1A1A1A; font-size: 16px;">Hi ${companyName},</p>
        <p style="color: #6B7280;">Your company has been registered on SolarCheck Nigeria. Our team will review and verify your profile within 48 hours.</p>
        <p style="color: #6B7280;">Once verified, you'll start receiving solar leads from homeowners and businesses in your service area.</p>
        <a href="https://solarcheckng.com/dashboard" style="display: inline-block; background: #0A5C36; color: white; padding: 12px 32px; border-radius: 999px; text-decoration: none; font-weight: 600; margin-top: 16px;">Go to Dashboard →</a>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `Welcome to SolarCheck Nigeria, ${companyName}!`,
    html,
  });
}

/**
 * Send subscription confirmation email.
 */
export async function sendSubscriptionConfirmationEmail(
  email: string,
  companyName: string,
  plan: string
): Promise<boolean> {
  const html = `
    <div style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0A5C36; padding: 32px; border-radius: 16px 16px 0 0;">
        <h1 style="color: white; font-size: 24px; margin: 0;">Subscription Confirmed ✅</h1>
      </div>
      <div style="background: white; padding: 32px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 16px 16px;">
        <p style="color: #1A1A1A; font-size: 16px;">Hi ${companyName},</p>
        <p style="color: #6B7280;">Your <strong>${plan}</strong> subscription is now active. You'll receive priority leads and enhanced visibility on the platform.</p>
        <a href="https://solarcheckng.com/dashboard" style="display: inline-block; background: #0A5C36; color: white; padding: 12px 32px; border-radius: 999px; text-decoration: none; font-weight: 600; margin-top: 16px;">View Dashboard →</a>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `${plan} Subscription Active — SolarCheck Nigeria`,
    html,
  });
}
