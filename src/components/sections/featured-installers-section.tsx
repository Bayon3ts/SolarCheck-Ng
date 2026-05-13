"use client";

import Link from "next/link";
import { MapPin, BadgeCheck, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import StarRating from "@/components/ui/star-rating";
import ScrollReveal from "@/components/animations/scroll-reveal";
import { StaggerContainer, StaggerItem } from "@/components/animations/scroll-reveal";

/* ═══════════════════════════════════════ */
/* Featured Installers Carousel            */
/* Stitch: white cards, horizontal scroll  */
/* ═══════════════════════════════════════ */

// Demo data — will be replaced by Supabase fetch
const DEMO_INSTALLERS = [
  {
    slug: "solar-solutions-ng",
    company_name: "Solar Solutions Nigeria",
    logo_url: null,
    cover_image_url: null,
    city: "Lekki",
    state: "Lagos",
    average_rating: 4.9,
    total_reviews: 127,
    is_verified: true,
    services: ["residential", "commercial"],
  },
  {
    slug: "greenpower-energy",
    company_name: "GreenPower Energy Systems",
    logo_url: null,
    cover_image_url: null,
    city: "Maitama",
    state: "Federal Capital Territory",
    average_rating: 4.7,
    total_reviews: 89,
    is_verified: true,
    services: ["residential", "maintenance"],
  },
  {
    slug: "sunwise-solar",
    company_name: "SunWise Solar",
    logo_url: null,
    cover_image_url: null,
    city: "Port Harcourt",
    state: "Rivers",
    average_rating: 4.8,
    total_reviews: 64,
    is_verified: true,
    services: ["commercial", "industrial"],
  },
  {
    slug: "wattmax-solar",
    company_name: "WattMax Solar",
    logo_url: null,
    cover_image_url: null,
    city: "Ibadan",
    state: "Oyo",
    average_rating: 4.6,
    total_reviews: 45,
    is_verified: true,
    services: ["residential"],
  },
  {
    slug: "volta-power",
    company_name: "Volta Power Solutions",
    logo_url: null,
    cover_image_url: null,
    city: "Benin City",
    state: "Edo",
    average_rating: 4.5,
    total_reviews: 38,
    is_verified: false,
    services: ["residential", "commercial"],
  },
  {
    slug: "apex-solar-ng",
    company_name: "Apex Solar Nigeria",
    logo_url: null,
    cover_image_url: null,
    city: "Ikeja",
    state: "Lagos",
    average_rating: 4.8,
    total_reviews: 93,
    is_verified: true,
    services: ["residential", "commercial", "maintenance"],
  },
];

export default function FeaturedInstallersSection() {
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

        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible">
          <StaggerContainer className="flex gap-6 md:grid md:grid-cols-3 md:gap-8">
            {DEMO_INSTALLERS.map((installer) => (
              <StaggerItem key={installer.slug} className="min-w-[280px] md:min-w-0">
                <div className="card overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:scale-[1.02]">
                  {/* Cover image placeholder */}
                  <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-primary/5">
                    {/* Verified badge */}
                    {installer.is_verified && (
                      <span className="absolute right-3 top-3 badge-verified">
                        <BadgeCheck className="h-3.5 w-3.5" />
                        Verified
                      </span>
                    )}
                  </div>

                  {/* Card content */}
                  <div className="p-6">
                    {/* Logo placeholder */}
                    <div className="-mt-12 mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-white bg-primary shadow-md">
                      <span className="text-lg font-bold text-white">
                        {installer.company_name.charAt(0)}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-text-primary">
                      {installer.company_name}
                    </h3>

                    <div className="mt-1 flex items-center gap-1 text-sm text-text-muted">
                      <MapPin className="h-3.5 w-3.5" />
                      {installer.city}, {installer.state}
                    </div>

                    <div className="mt-3">
                      <StarRating
                        rating={installer.average_rating}
                        showValue
                        reviewCount={installer.total_reviews}
                        size="sm"
                      />
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 w-full"
                      asChild
                    >
                      <Link href={`/installers/${installer.slug}`}>
                        View Profile
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>

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
