import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { installerRegistrationSchema } from "@/lib/validations";
// import { generatePaymentLink } from "@/lib/paystack"; // Assume this exists
// import { sendEmail } from "@/lib/resend"; // Assume this exists

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract textual data
    const rawData = {
      company_name: formData.get("company_name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      whatsapp: (formData.get("whatsapp") as string) || undefined,
      state: formData.get("state") as string,
      city: formData.get("city") as string,
      lga: (formData.get("lga") as string) || undefined,
      address: formData.get("address") as string,
      cac_number: (formData.get("cac_number") as string) || undefined,
      description: formData.get("description") as string,
      website: (formData.get("website") as string) || undefined,
      services: JSON.parse((formData.get("services") as string) || "[]"),
      system_sizes: JSON.parse((formData.get("system_sizes") as string) || "[]"),
      brands_used: JSON.parse((formData.get("brands_used") as string) || "[]"),
      plan: (formData.get("plan") as string) || "free",
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

    // Generate unique slug
    const slugBase = data.company_name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const slugSuffix = Math.floor(Math.random() * 1000).toString();
    const slug = `${slugBase}-${slugSuffix}`;

    const { data: insertedData, error } = await supabase.from("installers").insert({
      slug,
      ...data,
      is_verified: false,
      is_active: false,
    }).select("id").single();

    if (error) {
      console.error("[Registration] Error inserting installer:", error);
      return NextResponse.json({ success: false, error: "Failed to register installer" }, { status: 500 });
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
