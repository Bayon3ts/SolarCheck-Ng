import { createServerClient } from "@/lib/supabase/server";
import SponsorBannerCarousel, { type BannerData } from "@/components/sections/sponsor-banner-carousel";

/* ═══════════════════════════════════════ */
/* SponsorBannerSection — async server    */
/* component, mirrors the pattern in      */
/* featured-installers-section.tsx        */
/* Returns null when no active banners    */
/* (same convention as testimonials)      */
/* ═══════════════════════════════════════ */

export default async function SponsorBannerSection() {
  const supabase = await createServerClient();

  const { data } = await supabase
    .from("sponsor_banners")
    .select("id, company_name, logo_url, headline, cta_text, cta_url, plan")
    .eq("is_active", true)
    .gt("ends_at", new Date().toISOString())
    .order("plan", { ascending: false }); // 'standard' < 'featured' alphabetically puts featured last —
    // we'll handle weighting in JS below

  if (!data || data.length === 0) return null;

  // ── Weight featured banners 2x by duplicating them, then shuffle ─────────
  const weighted: BannerData[] = [];
  for (const banner of data as BannerData[]) {
    weighted.push(banner);
    if (banner.plan === "featured") {
      weighted.push({ ...banner }); // duplicate to achieve 2x rotation weight
    }
  }

  // Fisher-Yates shuffle
  for (let i = weighted.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [weighted[i], weighted[j]] = [weighted[j], weighted[i]];
  }

  return (
    // py-6 intentional — slim banner strip, not a full content section
    <section className="py-6 bg-background">
      <div className="container-custom">
        <SponsorBannerCarousel banners={weighted} />
      </div>
    </section>
  );
}
