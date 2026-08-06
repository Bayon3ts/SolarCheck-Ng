import { createServerClient } from "@/lib/supabase/server";
import SponsorBannerCarousel, { type BannerData } from "@/components/sections/sponsor-banner-carousel";

/* ═══════════════════════════════════════════════════════ */
/* SponsorBannerSection — async server component          */
/* Full-width hero carousel; returns null when no         */
/* active banners exist                                   */
/* ═══════════════════════════════════════════════════════ */

export default async function SponsorBannerSection() {
  const supabase = await createServerClient();

  const { data } = await supabase
    .from("sponsor_banners")
    .select("id, company_name, logo_url, headline, cta_text, cta_url, plan, placement_location")
    .eq("is_active", true)
    .gt("ends_at", new Date().toISOString())
    .order("plan", { ascending: false });

  if (!data || data.length === 0) return null;

  // ── Weight featured banners 2x by duplicating them, then shuffle ─────────
  const weighted: BannerData[] = [];
  for (const banner of data as BannerData[]) {
    weighted.push(banner);
    if (banner.plan === "featured") {
      weighted.push({ ...banner }); // 2x rotation weight
    }
  }

  // Fisher-Yates shuffle
  for (let i = weighted.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [weighted[i], weighted[j]] = [weighted[j], weighted[i]];
  }

  return (
    <section className="py-8 bg-background">
      <div className="group w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SponsorBannerCarousel banners={weighted} />
      </div>
    </section>
  );
}
