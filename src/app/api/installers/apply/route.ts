import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/* ═══════════════════════════════════════ */
/* POST /api/installers/apply              */
/* Installer self-application endpoint     */
/* ═══════════════════════════════════════ */

import { Resend } from "resend";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Basic server-side validation
    const required = [
      "company_name",
      "contact_name",
      "whatsapp",
      "email",
      "primary_state",
      "primary_city",
    ];

    for (const field of required) {
      if (!body[field] || (typeof body[field] === "string" && !body[field].trim())) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email address" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { error } = await supabase.from("installer_applications").insert({
      company_name: body.company_name.trim(),
      contact_name: body.contact_name.trim(),
      role: body.role || null,
      phone: body.phone || null,
      whatsapp: body.whatsapp.trim(),
      email: body.email.trim().toLowerCase(),
      website: body.website?.trim() || null,
      years_in_business: body.years_in_business || null,
      primary_state: body.primary_state,
      other_states: body.other_states || [],
      primary_city: body.primary_city.trim(),
      business_type: body.business_type || null,
      system_size_range: body.system_size_range || null,
      price_range: body.price_range || null,
      cac_number: body.cac_number?.trim() || null,
      description: body.description?.trim() || null,
      status: "pending",
    });

    if (error) {
      console.error("[Installer Apply] Supabase insert error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to submit application. Please try again." },
        { status: 500 }
      );
    }

    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: "SolarCheck <noreply@solarcheckng.com>",
          to: "hello@solarcheckng.com",
          subject: `New installer application: ${body.company_name}`,
          html: `
            <h2>New Installer Application</h2>
            <table>
              <tr><td><b>Company:</b></td><td>${body.company_name}</td></tr>
              <tr><td><b>Contact:</b></td><td>${body.contact_name} (${body.role})</td></tr>
              <tr><td><b>WhatsApp:</b></td><td>${body.whatsapp}</td></tr>
              <tr><td><b>Email:</b></td><td>${body.email}</td></tr>
              <tr><td><b>State:</b></td><td>${body.primary_state} — ${body.primary_city}</td></tr>
              <tr><td><b>Years in business:</b></td><td>${body.years_in_business}</td></tr>
              <tr><td><b>Price range:</b></td><td>${body.price_range}</td></tr>
              <tr><td><b>Description:</b></td><td>${body.description}</td></tr>
            </table>
            <br>
            <a href="https://solarcheckng.com/admin/applications">Review application →</a>
          `,
        });
      } catch (err) {
        console.error("Failed to send email notification", err);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully!",
    });
  } catch (error) {
    console.error("[Installer Apply] Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
