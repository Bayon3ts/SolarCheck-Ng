import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { reviewSubmitSchema } from "@/lib/validations";

/* ═══════════════════════════════════════ */
/* POST /api/reviews/submit                */
/* Save review (pending moderation)        */
/* ═══════════════════════════════════════ */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate
    const validation = reviewSubmitSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;
    const supabase = createAdminClient();

    // Verify installer exists
    const { data: installer } = await supabase
      .from("installers")
      .select("id, company_name, email")
      .eq("id", data.installer_id)
      .single();

    if (!installer) {
      return NextResponse.json(
        { success: false, error: "Installer not found" },
        { status: 404 }
      );
    }

    // Save review (is_published: false → pending moderation)
    const { error } = await supabase.from("reviews").insert({
      installer_id: data.installer_id,
      reviewer_name: data.reviewer_name,
      reviewer_phone: data.reviewer_phone || null,
      rating: data.rating,
      title: data.title,
      body: data.body,
      system_size: data.system_size || null,
      install_date: data.install_date || null,
      is_verified: false,
      is_published: false,
      helpful_count: 0,
    });

    if (error) {
      console.error("[Review Submit] Error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to save review" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Your review has been submitted and is pending moderation. Thank you!",
    });
  } catch (error) {
    console.error("[Review Submit] Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
