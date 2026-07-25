import { cn } from "@/lib/utils";
import { getStarArray } from "@/lib/utils";

/* ═══════════════════════════════════════ */
/* StarRating — Amber filled, grey empty   */
/* Uses custom SVG for proper half-stars   */
/* ═══════════════════════════════════════ */

interface StarRatingProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  reviewCount?: number;
  className?: string;
}

const sizeMap = {
  sm: { className: "h-3.5 w-3.5", px: 14 },
  md: { className: "h-4 w-4", px: 16 },
  lg: { className: "h-5 w-5", px: 20 },
};

/* SVG star path matching Lucide's star shape */
const STAR_PATH =
  "M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z";

function FullStar({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={STAR_PATH} />
    </svg>
  );
}

function HalfStar({ className, size }: { className: string; size: number }) {
  const id = `half-star-clip-${size}-${Math.random().toString(36).slice(2, 6)}`;
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        <clipPath id={id}>
          <rect x="0" y="0" width="12" height="24" />
        </clipPath>
      </defs>
      {/* Empty star background */}
      <path
        d={STAR_PATH}
        fill="#D1D5DB"
        stroke="#D1D5DB"
      />
      {/* Filled half */}
      <path
        d={STAR_PATH}
        fill="currentColor"
        stroke="currentColor"
        clipPath={`url(#${id})`}
      />
    </svg>
  );
}

function EmptyStar({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="#D1D5DB"
      stroke="#D1D5DB"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={STAR_PATH} />
    </svg>
  );
}

export default function StarRating({
  rating,
  size = "md",
  showValue = false,
  reviewCount,
  className,
}: StarRatingProps) {
  const stars = getStarArray(rating);
  const { className: sizeClass, px } = sizeMap[size];

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {stars.map((type, i) => {
          if (type === "full") {
            return (
              <FullStar
                key={i}
                className={cn(sizeClass, "text-accent")}
              />
            );
          }
          if (type === "half") {
            return (
              <HalfStar
                key={i}
                className={cn(sizeClass, "text-accent")}
                size={px}
              />
            );
          }
          return (
            <EmptyStar
              key={i}
              className={sizeClass}
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
