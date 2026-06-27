import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { installerRegistrationSchema } from "@/lib/validations";
// import { generatePaymentLink } from "@/lib/paystack"; // Assume this exists
// import { sendEmail } from "@/lib/resend"; // Assume this exists

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Helper to get string from FormData
    const getString = (key: string) => {
      const val = formData.get(key);
      return typeof val === "string" ? val : "";
    };

    // Helper to get JSON from FormData
    const getJSON = (key: string) => {
      const val = formData.get(key);
      if (typeof val !== "string") return [];
      try {
        return JSON.parse(val);
      } catch {
        return [];
      }
    };

    // Extract textual data
    const rawData = {
      company_name: getString("company_name"),
      email: getString("email"),
      password: getString("password"),
      phone: getString("phone"),
      whatsapp: getString("whatsapp") || undefined,
      state: getString("state"),
      city: getString("city"),
      lga: getString("lga") || undefined,
      address: getString("address"),
      cac_number: getString("cac_number") || undefined,
      description: getString("description"),
      website: getString("website") || undefined,
      services: getJSON("services"),
      system_sizes: getJSON("system_sizes"),
      brands_used: getJSON("brands_used"),
      plan: getString("plan") || "free",
    };

    const validation = installerRegistrationSchema.safeParse(rawData);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;
    const supabase = createAdminClient();

    // ── Create Supabase Auth account FIRST ──
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { role: 'installer', company_name: data.company_name },
    });

    if (authError) {
      console.error("[Registration] Auth user creation failed:", authError);

      if (authError.code === 'email_exists' || authError.status === 422) {
        return NextResponse.json(
          { 
            success: false, 
            error: "An account with this email already exists. Try logging in instead, or use a different email to register a new company.",
            code: 'EMAIL_EXISTS',
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { success: false, error: "Could not create your account. Please try again." },
        { status: 500 }
      );
    }

    const authUserId = authData.user.id;

    // Remove password and plan from data before inserting to DB
    const { password: _, plan, ...dbData } = data;

    // Generate unique slug
    const slugBase = dbData.company_name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const slugSuffix = Math.floor(Math.random() * 1000).toString();
    const slug = `${slugBase}-${slugSuffix}`;

    // ── Now create the installer row, linked to the auth user ──
    const { data: insertedData, error } = await supabase.from("installers").insert({
      slug,
      ...dbData,
      subscription_tier: plan,
      user_id: authUserId,
      is_verified: false,
      is_active: false,
    }).select("id").single();

    if (error) {
      console.error("[Registration] Error inserting installer:", error);

      // IMPORTANT: if the installer row fails to insert AFTER the auth user was already 
      // created, we have an orphaned auth account with no installer profile. Clean it up 
      // rather than leaving a broken half-state.
      await supabase.auth.admin.deleteUser(authUserId);

      return NextResponse.json(
        { success: false, error: "Failed to register installer. Please try again." },
        { status: 500 }
      );
    }

    const installerId = insertedData.id;

    // Handle File Uploads (cac document, photos)
    const cacDoc = formData.get("cac_document") as File;
    if (cacDoc && cacDoc.size > 0) {
      const buffer = Buffer.from(await cacDoc.arrayBuffer());
      await supabase.storage
        .from("installer-documents")
        .upload(`${installerId}/cac/${cacDoc.name}`, buffer, {
          contentType: cacDoc.type,
          upsert: true,
        });
    }

    // Photo uploads
    const photos = formData.getAll("photos") as File[];
    for (const photo of photos) {
      if (photo.size > 0) {
        const buffer = Buffer.from(await photo.arrayBuffer());
        await supabase.storage
          .from("installer-documents")
          .upload(`${installerId}/photos/${photo.name}`, buffer, {
            contentType: photo.type,
            upsert: true,
          });
      }
    }

    // Handle Paystack Link Generation
    let checkoutUrl = null;
    if (data.plan !== "free") {
      // Stub: Generate Paystack Payment Link
      // checkoutUrl = await generatePaymentLink(installerId, data.plan, data.email);
      checkoutUrl = "https://checkout.paystack.com/stub_link";
    }

    // Stub: Send Emails via Resend
    // await sendEmail({ to: data.email, subject: "Welcome to SolarCheck Nigeria", html: "..." });
    // await sendEmail({ to: "admin@solarcheckng.com", subject: "New Installer Registration", html: "..." });

    return NextResponse.json({
      success: true,
      data: { id: installerId, checkoutUrl },
      message: "Registration successful. Pending verification.",
    });
  } catch (error) {
    console.error("[Registration] Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
