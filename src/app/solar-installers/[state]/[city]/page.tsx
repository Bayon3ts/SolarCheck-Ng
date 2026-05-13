import { Metadata } from "next";

import Link from "next/link";
import { ChevronRight, MapPin, CheckCircle2 } from "lucide-react";
import { createServerClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import StarRating from "@/components/ui/star-rating";

// The LGA column is for matching only. One URL per unique state+city.
export async function generateStaticParams() {
  const supabase = createServerClient();
  const { data: locations } = await supabase
    .from("nigerian_locations")
    .select("state, city"); // Need to filter duplicates later if not DISTINCT

  if (!locations) return [];

  // Remove duplicates manually since Supabase js client doesn't support SELECT DISTINCT natively in .select()
  const uniqueLocations = Array.from(
    new Set(locations.map((l) => `${l.state}|${l.city}`))
  ).map((str) => {
    const [state, city] = str.split("|");
    return {
      state: state.toLowerCase().replace(/ /g, "-"),
      city: city.toLowerCase().replace(/ /g, "-"),
    };
  });

  return uniqueLocations;
}

function unslugify(slug: string) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function generateMetadata({
  params,
}: {
  params: { state: string; city: string };
}): Promise<Metadata> {
  const state = unslugify(params.state);
  const city = unslugify(params.city);

  return {
    title: `Best Solar Installers in ${city}, ${state} | SolarCheck Nigeria`,
    description: `Compare verified solar companies and installers in ${city}, ${state}. Get free quotes, read reviews, and find the best solar system for your home.`,
  };
}

export default async function LocationPage({
  params,
}: {
  params: { state: string; city: string };
}) {
  const state = unslugify(params.state);
  const city = unslugify(params.city);

  const supabase = createServerClient();

  // Fetch installers in this city/state
  const { data: installers } = await supabase
    .from("installers")
    .select("id, slug, company_name, city, state, average_rating, total_reviews, is_verified, services")
    .eq("state", state)
    .eq("city", city)
    .eq("is_active", true)
    .order("subscription_tier", { ascending: false })
    .order("average_rating", { ascending: false });

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-24 pb-20">
        {/* SEO JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: `How much does solar cost in ${city}?`,
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: `The cost of solar in ${city} varies depending on your energy needs. A typical 3KVA system for a 3-bedroom apartment costs between ₦900,000 to ₦1.5M. Use our calculator to get an exact estimate.`,
                  },
                },
                {
                  "@type": "Question",
                  name: `Who are the best solar installers in ${city}?`,
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: `There are ${installers?.length || "several"} verified installers operating in ${city}. SolarCheck ranks them based on real customer reviews, CAC verification, and physical inspection.`,
                  },
                },
              ],
            }),
          }}
        />

        <div className="container-custom">
          {/* Breadcrumbs */}
          <nav className="mb-8 flex items-center gap-2 text-sm text-text-muted">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/solar-installers" className="hover:text-primary">Installers</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href={`/solar-installers/${params.state}`} className="hover:text-primary">{state}</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-text-primary font-medium">{city}</span>
          </nav>

          <div className="mb-12">
            <h1 className="text-4xl font-bold text-text-primary md:text-5xl">
              Solar Installers in {city}, {state}
            </h1>
            <p className="mt-4 text-lg text-text-muted max-w-2xl">
              We&apos;ve verified {installers?.length || 0} solar companies operating in {city}. 
              Compare their ratings, read real reviews, and request free quotes directly.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {installers?.map((installer) => (
              <div
                key={installer.id}
                className="card flex flex-col justify-between overflow-hidden p-6 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-text-primary group-hover:text-primary transition-colors">
                        {installer.company_name}
                      </h3>
                      <div className="mt-2 flex items-center gap-1.5 text-sm text-text-muted">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span>{installer.city}, {installer.state}</span>
                      </div>
                    </div>
                    {installer.is_verified && (
                      <span className="badge-verified shrink-0">Verified</span>
                    )}
                  </div>

                  <div className="mt-4">
                    <StarRating
                      rating={installer.average_rating}
                      reviewCount={installer.total_reviews}
                      showValue
                    />
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/installers/${installer.slug}`}>
                      View Profile
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Location SEO Content */}
          <div className="mt-20 card p-8 md:p-12">
            <h2 className="text-2xl font-bold text-text-primary mb-6">
              Going Solar in {city}
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
                  <div>
                    <h3 className="font-semibold text-text-primary">High Sunshine Hours</h3>
                    <p className="text-sm text-text-muted mt-1">
                      {state} receives excellent solar irradiation year-round, making it highly efficient for solar panel generation.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
                  <div>
                    <h3 className="font-semibold text-text-primary">Beat Grid Unreliability</h3>
                    <p className="text-sm text-text-muted mt-1">
                      With frequent power outages in {city}, a battery storage system is essential to maintain 24/7 power.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-primary/5 rounded-xl p-6 border border-primary/10">
                <h3 className="font-bold text-primary-dark mb-4">Ready to get started?</h3>
                <p className="text-sm text-text-muted mb-6">
                  Get up to 3 competitive quotes from verified installers in {city} completely free of charge.
                </p>
                <Button variant="primary" className="w-full" asChild>
                  <Link href={`/get-quotes?state=${state}&city=${city}`}>
                    Get Free Quotes in {city}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
