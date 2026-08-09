import { Review } from "@/types/installer";

/**
 * Real, computed replacements for what src/lib/mock-installer-data.ts used to
 * fabricate. Every function here either derives a value from actual data on
 * the installer/reviews/leads, or returns null/empty so the UI hides that
 * section — it never invents a plausible-looking default.
 */

/** % of published reviews rated 4 stars or higher. Null if there are no reviews yet. */
export function computeRecommendationPercentage(reviews: Review[]): number | null {
    if (!reviews || reviews.length === 0) return null;
    const positive = reviews.filter((r) => r.rating >= 4).length;
    return Math.round((positive / reviews.length) * 100);
}

/**
 * The installer's best real review, used as the featured testimonial.
 * Prefers the highest-rated, most recent review with a non-trivial body.
 * Null if there are no reviews.
 */
export function getFeaturedTestimonial(reviews: Review[]): Review | null {
    if (!reviews || reviews.length === 0) return null;
    const candidates = reviews.filter((r) => r.body && r.body.trim().length > 20);
    if (candidates.length === 0) return null;
    return [...candidates].sort((a, b) => {
        if (b.rating !== a.rating) return b.rating - a.rating;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    })[0];
}

/**
 * Real trust badges ("Highly Rated", "Verified", "Experienced", "Certified")
 * derived from the installer's actual data — replaces the previous hardcoded
 * ["Clear Pricing", "Fast Permitting", "Clean Installation", "Great Communication"]
 * tags that were shown identically on every profile regardless of reality.
 */
export function computeTrustBadges(installer: {
    average_rating?: number;
    total_reviews: number;
    years_in_business?: string;
    certifications?: string[];
    crew_size?: string;
}): string[] {
    const badges: string[] = [];

    if ((installer.average_rating || 0) >= 4.5 && installer.total_reviews >= 3) {
        badges.push("Highly Rated");
    }
    if (installer.certifications && installer.certifications.length > 0) {
        badges.push("Certified");
    }
    if (installer.years_in_business === "5-10" || installer.years_in_business === "10+") {
        badges.push("Experienced Team");
    }
    if (installer.crew_size && installer.crew_size !== "1-5") {
        badges.push("Full Install Crew");
    }
    if (installer.total_reviews >= 10) {
        badges.push("Well Reviewed");
    }

    return badges;
}

/**
 * A real "recent demand" signal computed from actual quote requests, not a
 * fixed "12+ installations booked this week" string shown to every installer.
 * Only returns a badge when the count is genuinely worth surfacing — a
 * fabricated-feeling "1 request this week" does more harm than showing nothing.
 */
export function computeDemandBadge(recentLeadCount: number): string | null {
    if (recentLeadCount < 3) return null;
    return `${recentLeadCount}+ homeowners requested a quote this week`;
}