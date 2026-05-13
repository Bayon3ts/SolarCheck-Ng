/* ═══════════════════════════════════════ */
/* Paystack Integration                    */
/* ═══════════════════════════════════════ */

import crypto from "crypto";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = "https://api.paystack.co";

interface PaystackInitPayload {
  email: string;
  amount: number; // in kobo (₦1 = 100 kobo)
  reference?: string;
  callback_url?: string;
  metadata?: Record<string, unknown>;
}

interface PaystackInitResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

/**
 * Initialize a Paystack transaction.
 * Returns the payment URL to redirect the user to.
 */
export async function initializePayment(
  payload: PaystackInitPayload
): Promise<PaystackInitResponse | null> {
  if (!PAYSTACK_SECRET_KEY) {
    console.warn("[Paystack] Missing secret key. Payment not initialized.");
    return null;
  }

  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...payload,
        callback_url:
          payload.callback_url ||
          `${process.env.NEXT_PUBLIC_SITE_URL}/installers/register?step=success`,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("[Paystack] Init failed:", error);
      return null;
    }

    const data = (await response.json()) as PaystackInitResponse;
    return data;
  } catch (error) {
    console.error("[Paystack] Error:", error);
    return null;
  }
}

/**
 * Verify a Paystack webhook signature.
 * Returns true if the signature is valid.
 */
export function verifyPaystackWebhook(
  body: string,
  signature: string
): boolean {
  if (!PAYSTACK_SECRET_KEY) {
    console.error("[Paystack] Cannot verify webhook: missing secret key.");
    return false;
  }

  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(body)
    .digest("hex");

  return hash === signature;
}

/**
 * Subscription plan pricing (in Naira).
 */
export const SUBSCRIPTION_PLANS = {
  free: {
    name: "Free",
    price: 0,
    priceKobo: 0,
    features: [
      "Basic company listing",
      "Up to 5 shared leads/month",
      "Customer reviews",
      "Basic profile page",
    ],
  },
  featured: {
    name: "Featured",
    price: 25000,
    priceKobo: 2500000,
    features: [
      "Priority listing in search results",
      "Up to 20 shared leads/month",
      "Featured badge on profile",
      "Analytics dashboard",
      "WhatsApp lead notifications",
    ],
  },
  premium: {
    name: "Premium",
    price: 75000,
    priceKobo: 7500000,
    features: [
      "Top of search results",
      "Unlimited shared leads",
      "Exclusive leads option",
      "Premium badge + verified seal",
      "Priority customer support",
      "Custom profile branding",
      "Monthly performance reports",
    ],
  },
} as const;
