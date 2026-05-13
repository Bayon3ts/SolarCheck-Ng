import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/* ═══════════════════════════════════════ */
/* SolarCheck Nigeria — Utility Functions  */
/* ═══════════════════════════════════════ */

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format Nigerian Naira */
export function formatNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Generate a URL-friendly slug */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .trim();
}

/** Format date for display */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Calculate estimated reading time */
export function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

/** Truncate text with ellipsis */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, "") + "…";
}

/** Generate star rating array (for rendering) */
export function getStarArray(rating: number): ("full" | "half" | "empty")[] {
  const stars: ("full" | "half" | "empty")[] = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push("full");
    } else if (rating >= i - 0.5) {
      stars.push("half");
    } else {
      stars.push("empty");
    }
  }
  return stars;
}

/** Score a lead based on timeline and bill range */
export function scoreLeadIntent(
  timeline?: string,
  monthlyBillRange?: string
): "high" | "medium" | "low" {
  const highBillRanges = [
    "₦100,000 - ₦200,000",
    "₦200,000 - ₦500,000",
    "₦500,000+",
  ];

  if (timeline === "asap" && monthlyBillRange && highBillRanges.includes(monthlyBillRange)) {
    return "high";
  }
  if (timeline === "asap" || (monthlyBillRange && highBillRanges.includes(monthlyBillRange))) {
    return "medium";
  }
  return "low";
}

/** Absolute URL helper */
export function absoluteUrl(path: string): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://solarcheckng.com";
  return `${siteUrl}${path}`;
}
