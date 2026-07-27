"use client";

import { useState } from "react";
import StarRating from "@/components/ui/star-rating";
import { Button } from "@/components/ui/button";

export function ReviewsClient({ reviews }: { reviews: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredReviews = reviews?.filter((review) => {
    const searchString = `${review.reviewer_name || ""} ${review.installers?.company_name || ""} ${review.title || ""} ${review.body || ""}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && review.is_published && !review.is_deleted) ||
      (statusFilter === "pending" && !review.is_published && !review.is_deleted) ||
      (statusFilter === "deleted" && review.is_deleted);

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (review: any) => {
    if (review.is_deleted) {
      return (
        <span className="text-xs font-medium text-red-700 bg-red-100 px-2 py-1 rounded-full flex items-center gap-1">
          <span>🗑</span> Deleted
        </span>
      );
    }
    if (review.is_published) {
      return (
        <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
          Published
        </span>
      );
    }
    return (
      <span className="text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
        Pending
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
      {/* Filter Bar */}
      <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 items-center bg-gray-50/50">
        <div className="relative w-full sm:max-w-md">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by reviewer, installer, or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-auto px-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
        >
          <option value="all">All Reviews</option>
          <option value="published">Published</option>
          <option value="pending">Pending</option>
          <option value="deleted">Deleted by Admin</option>
        </select>

        {/* Summary counts */}
        <div className="flex items-center gap-3 ml-auto text-xs text-text-muted whitespace-nowrap">
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
            {reviews.filter(r => r.is_published && !r.is_deleted).length} published
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-yellow-500"></span>
            {reviews.filter(r => !r.is_published && !r.is_deleted).length} pending
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500"></span>
            {reviews.filter(r => r.is_deleted).length} deleted
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
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
            {filteredReviews && filteredReviews.length > 0 ? (
              filteredReviews.map((review) => (
                <tr
                  key={review.id}
                  className={`hover:bg-gray-50/50 ${review.is_deleted ? "opacity-60 bg-red-50/30" : ""}`}
                >
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
                    {getStatusBadge(review)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Hide publish/unpublish for deleted reviews */}
                      {!review.is_deleted && (
                        <form action={`/api/admin/reviews/${review.id}/toggle-publish`} method="POST">
                          <Button type="submit" variant="outline" size="sm">
                            {review.is_published ? "Unpublish" : "Publish"}
                          </Button>
                        </form>
                      )}
                      {/* Soft-delete or restore */}
                      {review.is_deleted ? (
                        <form action={`/api/admin/reviews/${review.id}/restore`} method="POST">
                          <Button type="submit" variant="outline" size="sm" className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200">
                            Restore
                          </Button>
                        </form>
                      ) : (
                        <form action={`/api/admin/reviews/${review.id}/delete`} method="POST">
                          <Button type="submit" variant="secondary" size="sm" className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200">
                            Delete
                          </Button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-text-muted">
                  No reviews found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
