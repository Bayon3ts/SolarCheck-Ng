import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/* ═══════════════════════════════════════════════════════ */
/* POST /api/banners/upload                               */
/* Accepts multipart/form-data with a `file` field.      */
/* Optional `type` field: "logo" (default) | "banner"   */
/* Size limit: 5 MB                                       */
/* ═══════════════════════════════════════════════════════ */

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const uploadType = (formData.get("type") as string | null) ?? "logo";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // 5 MB limit (banners can be larger assets)
    const MAX_BYTES = 5 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { success: false, error: "File exceeds 5 MB limit" },
        { status: 400 }
      );
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/svg+xml",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Invalid file type. Only JPG, PNG, WEBP, and SVG are allowed." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const bucketName = "sponsor-banners";

    try {
      await supabase.storage.createBucket(bucketName, { public: true });
    } catch {
      // Bucket likely already exists — continue
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const prefix = uploadType === "banner" ? "bg" : "logo";
    const fileName = `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("[Banners/Upload] Upload error:", uploadError);
      return NextResponse.json(
        { success: false, error: "Failed to upload file to storage" },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      url: publicUrlData.publicUrl,
    });
  } catch (error) {
    console.error("[Banners/Upload] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
