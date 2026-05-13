import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";
import { getStarArray } from "@/lib/utils";

/* ═══════════════════════════════════════ */
/* StarRating — Amber filled, grey empty   */
/* ═══════════════════════════════════════ */

interface StarRatingProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  reviewCount?: number;
  className?: string;
}

const sizeMap = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export default function StarRating({
  rating,
  size = "md",
  showValue = false,
  reviewCount,
  className,
}: StarRatingProps) {
  const stars = getStarArray(rating);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {stars.map((type, i) => {
          if (type === "full") {
            return (
              <Star
                key={i}
                className={cn(sizeMap[size], "fill-accent text-accent")}
              />
            );
          }
          if (type === "half") {
            return (
              <StarHalf
                key={i}
                className={cn(sizeMap[size], "fill-accent text-accent")}
              />
            );
          }
          return (
            <Star
              key={i}
              className={cn(sizeMap[size], "fill-gray-200 text-gray-200")}
            />
          );
        })}
      </div>
      {showValue && (
        <span className="ml-1 text-sm font-semibold text-text-primary">
          {rating.toFixed(1)}
        </span>
      )}
      {reviewCount !== undefined && (
        <span className="ml-1 text-sm text-text-muted">
          ({reviewCount} review{reviewCount !== 1 ? "s" : ""})
        </span>
      )}
    </div>
  );
}
