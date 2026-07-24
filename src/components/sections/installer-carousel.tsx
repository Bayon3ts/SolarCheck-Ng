"use client";

import Link from "next/link";
import { MapPin, BadgeCheck, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import StarRating from "@/components/ui/star-rating";
import { StaggerContainer, StaggerItem } from "@/components/animations/scroll-reveal";

/* ═══════════════════════════════════════ */
/* InstallerCarousel                       */
/* Client wrapper for stagger animations   */
/* Receives real installer data as a prop  */
/* ═══════════════════════════════════════ */

export interface InstallerRow {
  id: string;
  slug: string;
  company_name: string;
  city: string;
  state: string;
  average_rating: number;
  total_reviews: number;
  is_verified: boolean;
  services: string[] | null;
  logo_url: string | null;
  cover_image_url: string | null;
}

interface InstallerCarouselProps {
  installers: InstallerRow[];
}

export default function InstallerCarousel({ installers }: InstallerCarouselProps) {
  return (
    /* Horizontal scroll on mobile, grid on desktop */
    <div className="overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible">
      <StaggerContainer className="flex gap-6 md:grid md:grid-cols-3 md:gap-8">
        {installers.map((installer) => (
          <StaggerItem key={installer.slug} className="min-w-[280px] md:min-w-0">
            <div className="card overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:scale-[1.02]">
              {/* Cover image: use cover_image_url if present, else gradient fallback */}
              <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-primary/5 overflow-hidden">
                {installer.cover_image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={installer.cover_image_url}
                    alt={`${installer.company_name} banner`}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
                {/* Verified badge */}
                {installer.is_verified && (
                  <span className="absolute right-3 top-3 badge-verified bg-white shadow-sm">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Verified
                  </span>
                )}
              </div>

              {/* Card content */}
              <div className="p-6">
                {/* Logo: use logo_url if present, else initial-letter circle */}
                <div className="-mt-12 mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-white bg-primary shadow-md overflow-hidden relative z-10">
                  {installer.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={installer.logo_url}
                      alt={`${installer.company_name} logo`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-bold text-white">
                      {installer.company_name.charAt(0)}
                    </span>
                  )}
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

                {installer.services && installer.services.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {installer.services.slice(0, 3).map((service) => (
                      <span key={service} className="tag text-[10px]">
                        {service.replace("-", " ")}
                      </span>
                    ))}
                    {installer.services.length > 3 && (
                      <span className="tag text-[10px]">
                        +{installer.services.length - 3}
                      </span>
                    )}
                  </div>
                )}

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
  );
}