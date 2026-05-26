import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

// SUPABASE_SERVICE_ROLE_KEY bypasses RLS.
// This file is server-only (Next.js Route Handler).
// The key is never sent to the browser.
// Access to this endpoint is restricted by middleware
// protecting all /admin/* page routes.

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await request.json();
    const { status } = body;
    const { id } = params;

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
    }

    // Update status
    const { data: application, error: updateError } = await supabase
      .from("installer_applications")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    if (status === 'approved' && application) {
      // Create slug from company name
      const slug = application.company_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      const { error: insertError } = await supabase
        .from("installers")
        .insert({
          company_name: application.company_name,
          slug: slug,
          contact_name: application.contact_name,
          phone: application.phone,
          whatsapp: application.whatsapp,
          email: application.email,
          website: application.website,
          state: application.primary_state,
          city: application.primary_city,
          is_verified: false,
          is_active: false,
          subscription_tier: "free",
          is_featured: false
        });
        
      if (insertError) {
         console.error("Failed to insert into installers:", insertError);
      }
    }

    if (status === 'rejected' && application.email && process.env.RESEND_API_KEY) {
       try {
         const resend = new Resend(process.env.RESEND_API_KEY);
         await resend.emails.send({
           from: "SolarCheck <noreply@solarcheckng.com>",
           to: application.email,
           subject: "Your SolarCheck Nigeria application",
           text: `Thank you for applying to SolarCheck Nigeria. We weren't able to verify ${application.company_name} at this time. You're welcome to reapply after 30 days.`,
         });
       } catch(err) {
         console.error("Failed to send rejection email", err);
       }
    }

    return NextResponse.json({ success: true, data: application });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
