import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/* ═══════════════════════════════════════ */
/* POST /api/admin/reviews/[id]/toggle-publish */
/* Toggle review is_published status       */
/* ═══════════════════════════════════════ */

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createAdminClient();
    const { id } = await params;

    // Fetch current review state
    const { data: review, error: fetchError } = await supabase
      .from("reviews")
      .select("id, is_published, installer_id, rating")
      .eq("id", id)
      .single();

    if (fetchError || !review) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 }
      );
    }

    const newPublished = !review.is_published;

    // Toggle is_published
    const { error: updateError } = await supabase
      .from("reviews")
      .update({ is_published: newPublished })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    // Recalculate installer's average rating and total reviews
    const { data: publishedReviews } = await supabase
      .from("reviews")
      .select("rating")
      .eq("installer_id", review.installer_id)
      .eq("is_published", true);

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
      .eq("id", review.installer_id);

    // Redirect back to reviews admin page
    return NextResponse.redirect(new URL("/admin/reviews", request.url));
  } catch (error) {
    console.error("[Admin Review Toggle] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
