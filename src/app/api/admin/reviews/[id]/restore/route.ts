import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/* ═══════════════════════════════════════════ */
/* POST /api/admin/reviews/[id]/restore          */
/* Restores a soft-deleted review (is_deleted = false) */
/* ════════════════════════════════════════════ */

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createAdminClient();
    const { id } = await params;

    // Fetch review to get installer_id before restoring
    const { data: review, error: fetchError } = await supabase
      .from("reviews")
      .select("id, installer_id, is_published")
      .eq("id", id)
      .single();

    if (fetchError || !review) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 }
      );
    }

    const installerId = review.installer_id;

    // Restore the review
    const { error: restoreError } = await supabase
      .from("reviews")
      .update({ is_deleted: false })
      .eq("id", id);

    if (restoreError) {
      return NextResponse.json(
        { success: false, error: restoreError.message },
        { status: 500 }
      );
    }

    // Recalculate installer's average rating — exclude deleted reviews
    const { data: publishedReviews } = await supabase
      .from("reviews")
      .select("rating")
      .eq("installer_id", installerId)
      .eq("is_published", true)
      .eq("is_deleted", false);

    const totalReviews = publishedReviews?.length || 0;
    const averageRating =
      totalReviews > 0
        ? publishedReviews!.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    await supabase
      .from("installers")
      .update({
        average_rating: Math.round(averageRating * 10) / 10,
        total_reviews: totalReviews,
      })
      .eq("id", installerId);

    // Redirect back to reviews admin page
    return NextResponse.redirect(new URL("/admin/reviews", request.url));
  } catch (error) {
    console.error("[Admin Review Restore] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
