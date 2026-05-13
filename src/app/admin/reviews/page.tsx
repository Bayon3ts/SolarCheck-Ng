import { createServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import StarRating from "@/components/ui/star-rating";

export default async function AdminReviewsPage() {
  const supabase = createServerClient();
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, installers(company_name)")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-text-primary mb-8">Review Moderation</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-border">
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">Reviewer</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">Installer</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-muted w-1/3">Content</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-muted text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {reviews?.map((review) => (
              <tr key={review.id} className="hover:bg-gray-50/50">
                <td className="px-6 py-4 text-sm">
                  <div className="font-medium text-text-primary">{review.reviewer_name}</div>
                  <div className="text-text-muted">{new Date(review.created_at).toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-primary">
                  {review.installers?.company_name}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center mb-1">
                    <StarRating rating={review.rating} size="sm" />
                  </div>
                  <div className="font-medium text-sm text-text-primary">{review.title}</div>
                  <p className="text-xs text-text-muted mt-1 line-clamp-2">{review.body}</p>
                </td>
                <td className="px-6 py-4">
                  {review.is_published ? (
                    <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">Published</span>
                  ) : (
                    <span className="text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">Pending</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <form action={`/api/admin/reviews/${review.id}/toggle-publish`} method="POST">
                      <Button type="submit" variant="outline" size="sm">
                        {review.is_published ? "Unpublish" : "Publish"}
                      </Button>
                    </form>
                    <form action={`/api/admin/reviews/${review.id}/delete`} method="POST">
                      <Button type="submit" variant="secondary" size="sm" className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200">
                        Delete
                      </Button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
