import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/animations/scroll-reveal";
import { createServerClient } from "@/lib/supabase/server";
import InstallerCarousel, { type InstallerRow } from "@/components/sections/installer-carousel";

/* ═══════════════════════════════════════ */
/* Featured Installers Section             */
/* Server component — fetches real data    */
/* from Supabase, no fake fallback data    */
/* ═══════════════════════════════════════ */

export default async function FeaturedInstallersSection() {
  const supabase = await createServerClient();

  const { data: installers } = await supabase
    .from("installers")
    .select(
      "id, slug, company_name, city, state, " +
      "average_rating, total_reviews, " +
      "is_verified, services, logo_url, cover_image_url"
    )
    .eq("is_verified", true)
    .eq("is_active", true)
    .order("total_reviews", { ascending: false })
    .limit(6);

  /* ── Empty state: no verified+active installers yet ── */
  if (!installers || installers.length === 0) {
    return (
      <section className="bg-background section-padding">
        <div className="container-custom">
          <ScrollReveal className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-primary-dark md:text-5xl">
              Installers Nigerians Actually Trust
            </h2>
            <p className="mt-4 text-lg text-text-muted">
              Verified solar companies with real reviews from real customers.
            </p>
          </ScrollReveal>

          <div className="rounded-2xl bg-white border border-border p-12 text-center shadow-sm">
            <h3 className="text-2xl font-bold text-text-primary mb-3">
              Verified Installers Coming Soon
            </h3>
            <p className="text-text-muted mb-6 max-w-xl mx-auto">
              We&apos;re onboarding Nigeria&apos;s first wave of CAC-verified
              solar installers. Check back soon, or be one of the first to join.
            </p>
            <Link
              href="/for-installers/apply"
              className="inline-flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-2xl hover:bg-primary-dark transition-colors"
            >
              Apply as a Verified Installer →
            </Link>
          </div>
        </div>
      </section>
    );
  }

  /* ── Real installers found — render cards ── */
  return (
    <section className="bg-background section-padding">
      <div className="container-custom">
        <ScrollReveal className="mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-primary-dark md:text-5xl">
            Installers Nigerians Actually Trust
          </h2>
          <p className="mt-4 text-lg text-text-muted">
            Verified solar companies with real reviews from real customers.
          </p>
        </ScrollReveal>

        {/* Client wrapper handles the stagger animation */}
        <InstallerCarousel installers={(installers as unknown as InstallerRow[])} />

        <ScrollReveal className="mt-10 text-center">
          <Button variant="primary" asChild>
            <Link href="/solar-installers">
              Browse All Installers
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </ScrollReveal>
      </div>
    </section>
  );
}