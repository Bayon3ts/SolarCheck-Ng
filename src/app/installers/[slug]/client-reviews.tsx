"use client";

import { useState, useMemo } from "react";
import { Search, CheckCircle2, Star } from "lucide-react";
import StarRating from "@/components/ui/star-rating";
import { Review } from "@/types/installer";

interface ClientReviewsProps {
  reviews: Review[];
  overallRating: number;
}

export default function ClientReviews({ reviews, overallRating }: ClientReviewsProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredReviews = useMemo(() => {
    if (!searchTerm) return reviews;
    const lower = searchTerm.toLowerCase();
    return reviews.filter(
      (r) =>
        r.title?.toLowerCase().includes(lower) ||
        r.body?.toLowerCase().includes(lower) ||
        r.reviewer_name?.toLowerCase().includes(lower)
    );
  }, [reviews, searchTerm]);

  // Calculate distribution
  const distribution = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const star = Math.round(r.rating) as keyof typeof counts;
      if (counts[star] !== undefined) counts[star]++;
    });
    return counts;
  }, [reviews]);

  const total = reviews.length;

  return (
    <div className="space-y-6">
      {/* Overview & Distribution */}
      <div className="flex flex-col md:flex-row gap-8 pb-6 border-b border-border">
        {/* Overall Score */}
        <div className="md:w-1/3 flex flex-col items-center justify-center text-center p-6 bg-primary/5 rounded-2xl">
          <div className="text-5xl font-bold text-text-primary mb-2">
            {overallRating.toFixed(1)}
          </div>
          <StarRating rating={overallRating} size="lg" />
          <div className="text-sm text-text-muted mt-2">
            Based on {total} {total === 1 ? "review" : "reviews"}
          </div>
        </div>

        {/* Breakdown bars */}
        <div className="md:w-2/3 space-y-2 flex flex-col justify-center">
          {([5, 4, 3, 2, 1] as const).map((star) => {
            const count = distribution[star];
            const percent = total > 0 ? (count / total) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-3 text-sm">
                <span className="w-12 shrink-0 font-medium text-text-muted flex items-center justify-end gap-1">
                  {star} <Star className="h-3.5 w-3.5" />
                </span>
                <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right text-text-muted">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search & Filter */}
      {total > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search reviews (e.g., 'installation', 'customer service')"
            className="input-field w-full pl-10 py-3"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      {/* Review List */}
      {filteredReviews.length > 0 ? (
        <div className="space-y-6 divide-y divide-border">
          {filteredReviews.map((review) => (
            <div key={review.id} className="pt-6 first:pt-0">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-text-primary">
                      {review.reviewer_name}
                    </span>
                    {review.reviewer_city && (
                      <span className="text-xs text-text-muted">
                        {review.reviewer_city}
                      </span>
                    )}
                    {review.is_verified && (
                      <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Verified
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-text-muted mt-1">
                    {new Date(review.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                    {review.system_size && ` · ${review.system_size} System`}
                  </div>
                </div>
                <StarRating rating={review.rating} size="sm" />
              </div>
              <h4 className="font-bold text-text-primary mt-3">{review.title}</h4>
              <p className="text-text-muted mt-1 leading-relaxed">
                {review.body}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-text-muted">
          <p className="font-medium">No reviews match your search.</p>
          <button
            onClick={() => setSearchTerm("")}
            className="text-primary hover:underline text-sm mt-2"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
