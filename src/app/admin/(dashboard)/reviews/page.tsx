import { createAdminClient } from "@/lib/supabase/admin";
import { ReviewsClient } from "./reviews-client";

export default async function AdminReviewsPage() {
  const supabase = createAdminClient();
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, installers(company_name)")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-text-primary mb-8">Review Moderation</h1>

      <ReviewsClient reviews={reviews || []} />
    </div>
  );
}
