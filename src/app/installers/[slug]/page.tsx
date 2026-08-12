import { Metadata } from "next";
export const dynamic = 'force-dynamic';
export const revalidate = 0; // Disable static caching so profile updates appear immediately
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight,
  MapPin,
  BadgeCheck,
  CheckCircle2,
  Clock,
  Calendar,
  Users,
  Award,
  Video,
  ShieldCheck,
  Zap,
  ThumbsUp,
  Globe,
} from "lucide-react";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import StarRating from "@/components/ui/star-rating";
import InstallerSidebar from "./installer-sidebar";
import ClientReviews from "./client-reviews";
import ClientStickyNav from "./client-sticky-nav";
import {
  computeRecommendationPercentage,
  getFeaturedTestimonial,
  computeTrustBadges,
  computeDemandBadge,
} from "@/lib/installer-derived-data";
import { SimilarInstaller } from "@/types/installer";

// ─── Types & Helpers ─────────────────────────────────────────────────────────

type BusinessHoursEntry = { open: string; close: string; closed: boolean };
type BusinessHours = Partial<Record<string, BusinessHoursEntry>>;

function isOpenNow(businessHours: BusinessHours): boolean | null {
  if (!businessHours || Object.keys(businessHours).length === 0) return null;
  const nowUtc = new Date();
  const lagosOffset = 60;
  const lagosMs = nowUtc.getTime() + lagosOffset * 60 * 1000;
  const lagosDate = new Date(lagosMs);
  const dayNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const todayKey = dayNames[lagosDate.getUTCDay()];
  const entry = businessHours[todayKey];
  if (!entry || entry.closed) return false;
  const hh = lagosDate.getUTCHours();
  const mm = lagosDate.getUTCMinutes();
  const nowMins = hh * 60 + mm;
  const [openH, openM] = entry.open.split(":").map(Number);
  const [closeH, closeM] = entry.close.split(":").map(Number);
  const openMins = openH * 60 + openM;
  const closeMins = closeH * 60 + closeM;
  return nowMins >= openMins && nowMins < closeMins;
}

function formatTime(time: string): string {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

function getVideoEmbed(url: string): { type: "youtube" | "vimeo" | "direct"; embedUrl: string } | null {
  if (!url) return null;
  const youtubeMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);
  if (youtubeMatch) return { type: "youtube", embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}` };
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return { type: "vimeo", embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
  if (url.match(/\.(mp4|webm|ogg)(\?|$)/i)) return { type: "direct", embedUrl: url };
  return null;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function OpenNowBadge({ isOpen }: { isOpen: boolean | null }) {
  if (isOpen === null) return null;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
        }`}
    >
      <span className={`h-2 w-2 rounded-full ${isOpen ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
      {isOpen ? "Open now" : "Closed now"}
    </span>
  );
}

function PhotoGallery({ photos }: { photos: string[] }) {
  if (!photos || photos.length === 0) return null;
  const primary = photos[0];
  const thumbnails = photos.slice(1, 3); // TripAdvisor style: 1 large, 2 stacked on the right
  const remaining = photos.length - 3;

  return (
    <div className={`grid gap-2 rounded-2xl overflow-hidden ${thumbnails.length > 0 ? "grid-cols-[2fr_1fr]" : ""}`}>
      <div className="relative h-[300px] md:h-[400px] bg-gray-100">
        <Image src={primary} alt="Primary installation photo" fill unoptimized={true} className="object-cover" sizes="(max-width: 768px) 100vw, 66vw" />
      </div>
      {thumbnails.length > 0 && (
        <div className={`grid gap-2 ${thumbnails.length >= 2 ? "grid-rows-2" : "grid-rows-1"}`}>
          {thumbnails.map((url, i) => {
            const isLast = i === thumbnails.length - 1 && remaining > 0;
            return (
              <div key={i} className="relative bg-gray-100 overflow-hidden h-full">
                <Image src={url} alt={`Installation photo ${i + 2}`} fill unoptimized={true} className="object-cover" sizes="(max-width: 768px) 50vw, 33vw" />
                {isLast && remaining > 0 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer hover:bg-black/40 transition-colors">
                    <span className="text-white text-xl md:text-2xl font-bold">+{remaining} Photos</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function VideoEmbed({ url }: { url: string }) {
  const embed = getVideoEmbed(url);
  if (!embed) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-xl font-bold flex items-center gap-2">
        <Video className="h-5 w-5 text-primary" /> Video
      </h3>
      <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black">
        {embed.type === "direct" ? (
          <video key={embed.embedUrl} controls preload="metadata" crossOrigin="anonymous" className="w-full h-full">
            <source src={embed.embedUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <iframe
            src={embed.embedUrl}
            title="Installer video"
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
    </div>
  );
}

// ─── Static Generation ───────────────────────────────────────────────────────

export async function generateStaticParams() {
  const supabase = createAdminClient();
  const { data: installers } = await supabase.from("installers").select("slug").eq("is_active", true);
  return installers?.map((installer) => ({ slug: installer.slug })) || [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const supabase = createAdminClient();
  const slug = (await params).slug;
  const { data: installer } = await supabase
    .from("installers")
    .select("company_name, city, state, description, slug, photo_urls, logo_url, cover_image_url, average_rating, total_reviews")
    .eq("slug", slug)
    .single();

  if (!installer) return { title: "Installer Not Found" };

  const title = `${installer.company_name} | Top Solar Installer in ${installer.city}, ${installer.state}`;
  const description = installer.description
    ? installer.description.substring(0, 160) + "..."
    : `View ${installer.company_name}'s profile, pricing, reviews, and portfolio on SolarCheck.`;

  // Prefer a real gallery photo for the share-card image, then cover image,
  // then logo — whichever the installer actually has. Without this, sharing
  // a profile link on WhatsApp (the most common way these links spread)
  // shows a blank generic preview instead of the installer's own photo.
  const shareImage =
    installer.photo_urls?.[0] || installer.cover_image_url || installer.logo_url;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://solarcheckng.com";
  const url = `${siteUrl}/installers/${installer.slug}`;

  // Route the raw uploaded photo through Next.js's image optimizer instead
  // of serving it straight from Supabase storage. Raw phone-camera uploads
  // are typically 2000-3000px wide and several MB — WhatsApp in particular
  // is much stricter about image weight than Facebook/Twitter and can
  // silently show no preview at all for an oversized image, even when the
  // declared og:image:width/height are otherwise correct. Resizing to a
  // real ~1200px-wide, compressed JPEG fixes this at the source rather than
  // declaring dimensions we can't actually guarantee.
  const ogImage = shareImage
    ? `${siteUrl}/_next/image?url=${encodeURIComponent(shareImage)}&w=1200&q=75`
    : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "SolarCheck Nigeria",
      type: "website",
      // No explicit width/height: the source photo's own aspect ratio
      // varies per installer, and declaring a fixed 1200x630 here when the
      // actual served image doesn't match that ratio is what OpenGraph.xyz
      // flagged as "Image aspect ratio is wrong" — better to let crawlers
      // read the real dimensions themselves.
      images: ogImage ? [{ url: ogImage, alt: installer.company_name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

// ─── Page Component ──────────────────────────────────────────────────────────

export default async function InstallerProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const supabase = await createServerClient();
  const slug = (await params).slug;

  const { data: rawInstaller } = await supabase
    .from("installers")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!rawInstaller) notFound();

  const installer = rawInstaller;

  // Fetch verified reviews
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .eq("installer_id", installer.id)
    .eq("is_published", true)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  const reviewList = reviews || [];

  // Real quote-request count in the last 7 days — replaces the fixed
  // "12+ installations booked this week" string that used to show on every
  // installer's page regardless of actual demand.
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { count: recentLeadCount } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("installer_id", installer.id)
    .gte("created_at", sevenDaysAgo);

  // Fetch similar installers
  const { data: similarInstallersData } = await supabase
    .from("installers")
    .select("id, company_name, slug, city, state, average_rating, total_reviews, services, logo_url, price_per_watt")
    .eq("state", installer.state)
    .neq("slug", slug)
    .eq("is_active", true)
    .limit(3);

  const similarInstallers: SimilarInstaller[] = similarInstallersData || [];

  const businessHours = (installer.business_hours ?? {}) as BusinessHours;
  const hoursExist = Object.keys(businessHours).length > 0;
  const openStatus = isOpenNow(businessHours);
  const photoUrls: string[] = installer.photo_urls ?? [];
  const hasPhotos = photoUrls.length > 0;
  const certifications: string[] = installer.certifications ?? [];

  // Real, computed replacements for what used to be fabricated defaults —
  // each of these is null/empty (and hidden in the UI) unless there's real
  // data behind it. See src/lib/installer-derived-data.ts.
  const recommendationPercentage = computeRecommendationPercentage(reviewList);
  const featuredTestimonial = getFeaturedTestimonial(reviewList);
  const trustBadges = computeTrustBadges({
    average_rating: installer.average_rating,
    total_reviews: installer.total_reviews,
    years_in_business: installer.years_in_business,
    certifications,
    crew_size: installer.crew_size,
  });
  const demandBadge = computeDemandBadge(recentLeadCount || 0);
  const hasWarrantyInfo = !!(
    installer.warranty_workmanship ||
    installer.warranty_roof_leak ||
    installer.warranty_equipment
  );
  const languagesSpoken: string[] = installer.languages_spoken ?? [];

  return (
    <>
      <Navbar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: installer.company_name,
            image:
              photoUrls[0] ||
              installer.logo_url ||
              installer.cover_image_url ||
              "https://solar-check-ng-zx7q.vercel.app/default-installer.png",
            "@id": `https://solar-check-ng-zx7q.vercel.app/installers/${installer.slug}`,
            url: `https://solar-check-ng-zx7q.vercel.app/installers/${installer.slug}`,
            //`${process.env.NEXT_PUBLIC_SITE_URL || "https://solarcheckng.com"}/default-installer.png`,
            //"@id": `${process.env.NEXT_PUBLIC_SITE_URL || "https://solarcheckng.com"}/installers/${installer.slug}`,
            //url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://solarcheckng.com"}/installers/${installer.slug}`,
            // Intentionally NOT including telephone here. The UI blurs the
            // phone number behind "Request a quote to unlock contact
            // details" as the core lead-capture mechanic — putting it in
            // this schema block would expose it in plain text to search
            // engines and anyone viewing page source, bypassing that gate
            // entirely.
            address: {
              "@type": "PostalAddress",
              streetAddress: installer.address,
              addressLocality: installer.city,
              addressRegion: installer.state,
              addressCountry: "NG",
            },
            aggregateRating:
              installer.total_reviews > 0
                ? {
                  "@type": "AggregateRating",
                  ratingValue: installer.average_rating,
                  reviewCount: installer.total_reviews,
                }
                : undefined,
          }),
        }}
      />

      <ClientStickyNav price={installer.price_per_watt} installerName={installer.company_name} />

      <main className="min-h-screen bg-background pt-24 pb-20">
        <div className="container-custom">
          {/* Breadcrumbs */}
          <nav className="mb-6 flex items-center gap-2 text-sm text-text-muted">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/solar-installers" className="hover:text-primary">Installers</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="hover:text-primary cursor-pointer">{installer.state}</span>
            <ChevronRight className="h-4 w-4" />
            <span className="hover:text-primary cursor-pointer">{installer.city}</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-text-primary font-medium truncate max-w-[200px]">
              {installer.company_name}
            </span>
          </nav>

          {/* Listing Header / Photos */}
          <div className="grid gap-8 lg:grid-cols-3 relative mt-6">
            {/* ── Main Content Column (Left) ── */}
            <div className="lg:col-span-2 space-y-8">

              {/* Header Info */}
              <div id="overview" className="space-y-4">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className={`h-24 w-24 shrink-0 rounded-xl border border-border bg-white shadow-sm overflow-hidden relative flex items-center justify-center ${!hasPhotos ? 'mt-0' : ''}`}>
                    {installer.logo_url ? (
                      <Image src={installer.logo_url} alt="Logo" fill className="object-contain p-2" />
                    ) : (
                      <span className="text-4xl font-bold text-primary">{installer.company_name.charAt(0)}</span>
                    )}
                  </div>

                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-text-primary mb-1">{installer.company_name}</h1>
                    {installer.description && (
                      <p className="text-lg text-text-muted mb-3 line-clamp-1">
                        {installer.description.split(/[.\n]/)[0]}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
                      <div className="flex items-center gap-1.5">
                        <StarRating rating={installer.average_rating || 0} size="sm" />
                        <span className="font-bold text-text-primary">{Number(installer.average_rating || 0).toFixed(1)}</span>
                        <span className="underline cursor-pointer">({installer.total_reviews} reviews)</span>
                      </div>
                      {recommendationPercentage !== null && (
                        <div className="flex items-center gap-1.5 font-medium text-green-700">
                          <ThumbsUp className="h-4 w-4" /> {recommendationPercentage}% recommended
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" /> {installer.city}, {installer.state}
                      </div>
                      {installer.website && (
                        <a
                          href={installer.website.startsWith('http') ? installer.website : `https://${installer.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary hover:underline font-medium"
                        >
                          <Globe className="h-4 w-4" /> Visit Website
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {demandBadge && (
                  <div className="inline-block bg-orange-100 text-orange-800 text-sm font-semibold px-4 py-2 rounded-lg">
                    🔥 {demandBadge}
                  </div>
                )}
              </div>

              {/* Photo Gallery - Positioned exactly like TripAdvisor (below title) */}
              {hasPhotos && (
                <div className="mt-6 mb-8">
                  <PhotoGallery photos={photoUrls} />
                </div>
              )}

              {/* Video, if the installer has added one */}
              {installer.video_url && <VideoEmbed url={installer.video_url} />}

              {/* Value Guarantees Banner */}
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-8 w-8 text-primary shrink-0" />
                  <div>
                    <h4 className="font-bold text-text-primary">SolaCheck Verified Guarantee</h4>
                    <p className="text-sm text-text-muted">Lowest Price Guarantee &amp; Free Cancellation.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-primary whitespace-nowrap bg-white px-4 py-2 rounded-xl shadow-sm">
                  <Zap className="h-4 w-4 fill-primary" />
                  ₦0 Down Payment Financing
                </div>
              </div>

              {/* Trust badges (real, computed) & featured testimonial (a real review) */}
              {(trustBadges.length > 0 || featuredTestimonial) && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Why Homeowners Choose This Installer</h3>
                  {trustBadges.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {trustBadges.map((tag) => (
                        <span key={tag} className="px-4 py-1.5 bg-white border border-border rounded-full text-sm font-medium text-text-primary shadow-sm hover:border-primary transition-colors cursor-default">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {featuredTestimonial && (
                    <blockquote className="border-l-4 border-primary pl-4 py-1 italic text-text-muted">
                      "{featuredTestimonial.body}"
                      <footer className="not-italic text-xs text-text-muted mt-1">
                        — {featuredTestimonial.reviewer_name}
                        {featuredTestimonial.reviewer_city ? `, ${featuredTestimonial.reviewer_city}` : ""}
                      </footer>
                    </blockquote>
                  )}
                </div>
              )}

              <hr className="border-border" />

              {/* Description */}
              {installer.description && (
                <div className="space-y-3">
                  <h3 className="text-xl font-bold">About {installer.company_name}</h3>
                  <p className="text-text-muted whitespace-pre-wrap">{installer.description}</p>
                </div>
              )}

              {/* Key Specifications Grid */}
              <div id="specifications" className="space-y-4 pt-4">
                <h3 className="text-xl font-bold">Key Specifications</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="card p-4 space-y-1">
                    <div className="text-xs font-bold text-text-muted uppercase tracking-wider">Service Areas</div>
                    <div className="font-medium">
                      {installer.states_covered && installer.states_covered.length > 0 
                        ? installer.states_covered.join(", ")
                        : `${installer.city} & surrounding areas (${installer.state})`}
                    </div>
                  </div>
                  <div className="card p-4 space-y-1">
                    <div className="text-xs font-bold text-text-muted uppercase tracking-wider">System Capacities</div>
                    <div className="font-medium">{installer.system_sizes.join(", ")}</div>
                  </div>
                  {languagesSpoken.length > 0 && (
                    <div className="card p-4 space-y-1">
                      <div className="text-xs font-bold text-text-muted uppercase tracking-wider">Languages</div>
                      <div className="font-medium">{languagesSpoken.join(", ")}</div>
                    </div>
                  )}
                  {hasWarrantyInfo && (
                    <div className="card p-4 space-y-1 sm:col-span-2">
                      <div className="text-xs font-bold text-text-muted uppercase tracking-wider">Warranties</div>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <div>
                          <span className="text-sm font-semibold block">{installer.warranty_workmanship || "—"}</span>
                          <span className="text-xs text-text-muted">Workmanship</span>
                        </div>
                        <div>
                          <span className="text-sm font-semibold block">{installer.warranty_roof_leak || "—"}</span>
                          <span className="text-xs text-text-muted">Roof Leak</span>
                        </div>
                        <div>
                          <span className="text-sm font-semibold block">{installer.warranty_equipment || "—"}</span>
                          <span className="text-xs text-text-muted">Equipment</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {installer.workflow && installer.workflow.length > 0 && (
                <>
                  <hr className="border-border" />
                  <div id="workflow" className="space-y-4 pt-4">
                    <h3 className="text-xl font-bold">How We Work</h3>
                    <div className="space-y-6">
                      {(installer.workflow as import("@/types/installer").WorkflowStep[]).map((step, index) => (
                        <div key={step.id || index} className="flex gap-4">
                          <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-bold text-text-primary">{step.title}</h4>
                            <p className="text-text-muted text-sm mt-1">{step.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <hr className="border-border" />

              {/* Reviews Section */}
              <div id="reviews" className="space-y-6 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-text-primary">Ratings &amp; Reviews</h3>
                  <Button variant="outline" asChild>
                    <Link href={`/installers/${installer.slug}/review`}>Write a Review</Link>
                  </Button>
                </div>

                <ClientReviews reviews={reviews || []} overallRating={installer.average_rating || 0} />
              </div>

            </div>

            {/* ── Sidebar Column (Right) ── */}
            <div id="company" className="lg:col-span-1">
              {/* Note: In a real layout, the sidebar itself is sticky, but ClientStickyNav already handles top bar. We apply sticky to the sidebar wrapper. */}
              <div className="sticky top-32 space-y-6">
                <InstallerSidebar installer={installer} />
              </div>
            </div>
          </div>

          {/* Similar Installers Matrix */}
          {similarInstallers.length > 0 && (
            <div className="mt-16 pt-12 border-t border-border">
              <h3 className="text-2xl font-bold mb-6">Similar Verified Installers in {installer.state}</h3>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                {similarInstallers.map((si) => (
                  <Link key={si.id} href={`/installers/${si.slug}`} className="card hover:shadow-lg transition-shadow group flex flex-col h-full overflow-hidden">
                    <div className="h-32 bg-gray-100 flex items-center justify-center p-4 relative">
                      {si.logo_url ? (
                        <Image src={si.logo_url} alt={si.company_name} fill className="object-contain p-4 mix-blend-multiply" />
                      ) : (
                        <span className="text-3xl font-bold text-gray-300">{si.company_name.charAt(0)}</span>
                      )}
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h4 className="font-bold text-lg group-hover:text-primary transition-colors">{si.company_name}</h4>
                      <div className="flex items-center gap-1.5 text-sm text-text-muted mt-2 mb-4">
                        <StarRating rating={si.average_rating} size="sm" />
                        <span className="font-semibold">{Number(si.average_rating).toFixed(1)}</span>
                        <span>({si.total_reviews})</span>
                      </div>
                      <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                        {si.price_per_watt ? (
                          <span className="text-sm font-medium text-text-primary">From ₦{si.price_per_watt.toLocaleString()}/W</span>
                        ) : (
                          <span className="text-sm font-medium text-text-primary">Get a quote</span>
                        )}
                        <span className="text-primary text-sm font-semibold flex items-center gap-1">
                          View Profile <ChevronRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}