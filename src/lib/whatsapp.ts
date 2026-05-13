/* ═══════════════════════════════════════ */
/* WhatsApp Cloud API Integration          */
/* ═══════════════════════════════════════ */

const WHATSAPP_API_URL = "https://graph.facebook.com/v18.0";
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_CLOUD_API_TOKEN;

interface WhatsAppMessagePayload {
  to: string;
  text: string;
}

/**
 * Send a WhatsApp text message via the Cloud API.
 * Formats the phone number to E.164 (Nigeria: +234...).
 */
export async function sendWhatsAppMessage({ to, text }: WhatsAppMessagePayload): Promise<boolean> {
  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
    console.warn("[WhatsApp] Missing API credentials. Message not sent.");
    return false;
  }

  // Normalize Nigerian phone number to +234 format
  const formattedPhone = formatNigerianPhone(to);

  try {
    const response = await fetch(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: formattedPhone,
          type: "text",
          text: { body: text },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("[WhatsApp] Send failed:", error);
      return false;
    }

    console.log(`[WhatsApp] Message sent to ${formattedPhone}`);
    return true;
  } catch (error) {
    console.error("[WhatsApp] Error:", error);
    return false;
  }
}

/**
 * Send lead notification to an installer via WhatsApp.
 */
export async function sendInstallerLeadNotification(
  installerPhone: string,
  lead: {
    full_name: string;
    city: string;
    state: string;
    monthly_bill_range: string;
    timeline?: string;
    whatsapp?: string;
    phone: string;
  }
): Promise<boolean> {
  const message = `🔔 New Solar Lead - SolarCheck Nigeria

Name: ${lead.full_name}
Location: ${lead.city}, ${lead.state}
Bill Range: ${lead.monthly_bill_range}
Timeline: ${lead.timeline || "Not specified"}
WhatsApp: ${lead.whatsapp || lead.phone}

Reply to this lead immediately.
View dashboard: https://solarcheckng.com/dashboard`;

  return sendWhatsAppMessage({ to: installerPhone, text: message });
}

/**
 * Send confirmation to a consumer after lead submission.
 */
export async function sendConsumerConfirmation(
  consumerPhone: string,
  city: string,
  matchCount: number
): Promise<boolean> {
  const message = `✅ We've matched you with ${matchCount} verified solar installer${matchCount > 1 ? "s" : ""} in ${city}. Expect calls within 2 hours. - SolarCheck Nigeria`;

  return sendWhatsAppMessage({ to: consumerPhone, text: message });
}

/** Normalize Nigerian phone to E.164 format */
function formatNigerianPhone(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "");

  // Handle various Nigerian formats
  if (cleaned.startsWith("234")) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith("0")) {
    return `+234${cleaned.slice(1)}`;
  }
  // If it's just digits without country code, assume +234
  if (cleaned.length === 10) {
    return `+234${cleaned}`;
  }

  return `+${cleaned}`;
}
