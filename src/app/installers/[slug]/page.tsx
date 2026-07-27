import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, MapPin, BadgeCheck, CheckCircle2, Star } from "lucide-react";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import StarRating from "@/components/ui/star-rating";
import InstallerSidebar from "./installer-sidebar";

export async function generateStaticParams() {
  // Use the cookie-free admin client — cookies() cannot be called at build time
  const supabase = createAdminClient();
  const { data: installers } = await supabase
    .from("installers")
    .select("slug")
    .eq("is_active", true);

  return installers?.map((installer) => ({ slug: installer.slug })) || [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const supabase = createAdminClient();
  const { data: installer } = await supabase
    .from("installers")
    .select("company_name, city, state, description")
    .eq("slug", (await params).slug)
    .single();

  if (!installer) return { title: "Installer Not Found" };

  return {
    title: `${installer.company_name} | Solar Installer in ${installer.city}, ${installer.state}`,
    description: installer.description ? installer.description.substring(0, 160) + "..." : `View ${installer.company_name}'s profile and reviews on SolarCheck.`,
  };
}

export default async function InstallerProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const supabase = await createServerClient();

  const { data: installer } = await supabase
    .from("installers")
    .select("*")
    .eq("slug", (await params).slug)
    .eq("is_active", true)
    .single();

  if (!installer) notFound();

  // Fetch verified reviews
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .eq("installer_id", installer.id)
    .eq("is_published", true)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  return (
    <>
      <Navbar />

      {/* LocalBusiness JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": installer.company_name,
            "image": installer.logo_url || installer.cover_image_url || "https://solarcheckng.com/default-installer.png",
            "@id": `https://solarcheckng.com/installers/${installer.slug}`,
            "url": `https://solarcheckng.com/installers/${installer.slug}`,
            "telephone": installer.phone || "",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": installer.address,
              "addressLocality": installer.city,
              "addressRegion": installer.state,
              "addressCountry": "NG"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "9.0820",
              "longitude": "8.6753"
            },
            "aggregateRating": installer.total_reviews > 0 ? {
              "@type": "AggregateRating",
              "ratingValue": installer.average_rating,
              "reviewCount": installer.total_reviews
            } : undefined
          }),
        }}
      />

      <main className="min-h-screen bg-background pt-24 pb-20">
        <div className="container-custom">
          {/* Breadcrumbs */}
          <nav className="mb-8 flex items-center gap-2 text-sm text-text-muted">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/solar-installers" className="hover:text-primary">Installers</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-text-primary font-medium">{installer.company_name}</span>
          </nav>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content (Left) */}
            <div className="lg:col-span-2 space-y-8">
              {/* Profile Header Card */}
              <div className="card overflow-hidden">
                {/* Cover Image Placeholder */}
                <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5 w-full object-cover relative">
                  {installer.cover_image_url && (
                    <Image
                      src={installer.cover_image_url}
                      alt={`${installer.company_name} cover`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                      className="object-cover"
                    />
                  )}
                </div>

                <div className="p-8">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    {/* Logo */}
                    <div className="-mt-16 h-24 w-24 shrink-0 rounded-xl border-4 border-white bg-white shadow-md overflow-hidden relative">
                      {installer.logo_url ? (
                        <Image src={installer.logo_url} alt="Logo" fill className="object-contain" />
                      ) : (
                        <div className="w-full h-full bg-primary flex items-center justify-center text-3xl font-bold text-white">
                          {installer.company_name.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-3xl font-bold text-text-primary">{installer.company_name}</h1>
                        {installer.is_verified && (
                          <span className="badge-verified"><BadgeCheck className="h-4 w-4" /> Verified Installer</span>
                        )}
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-4 text-text-muted">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {installer.address}, {installer.city}, {installer.state}
                        </div>
                        <div className="flex items-center gap-1">
                          <StarRating rating={installer.average_rating} size="sm" />
                          <span className="font-medium text-text-primary ml-1">{installer.average_rating.toFixed(1)}</span>
                          <span>({installer.total_reviews} reviews)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h2 className="text-xl font-bold text-text-primary mb-3">About Us</h2>
                    <p className="text-text-muted leading-relaxed whitespace-pre-wrap">
                      {installer.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reviews Section */}
              <div className="card p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-text-primary">Customer Reviews</h2>
                  <Button variant="outline" asChild>
                    <Link href={`/installers/${installer.slug}/review`}>Write a Review</Link>
                  </Button>
                </div>

                {reviews && reviews.length > 0 ? (
                  <div className="space-y-6 divide-y divide-border">
                    {reviews.map((review) => (
                      <div key={review.id} className="pt-6 first:pt-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-text-primary">{review.reviewer_name}</span>
                              {review.is_verified && (
                                <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3" /> Verified Customer
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-text-muted mt-1">
                              {new Date(review.created_at).toLocaleDateString()}
                              {review.system_size && ` • ${review.system_size} System`}
                            </div>
                          </div>
                          <StarRating rating={review.rating} size="sm" />
                        </div>
                        <h4 className="font-bold text-text-primary mt-3">{review.title}</h4>
                        <p className="text-text-muted mt-2">{review.body}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-text-muted">
                    <Star className="h-12 w-12 mx-auto text-gray-200 mb-3" />
                    <p>No reviews yet. Be the first to share your experience!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar (Right) — blur-gated client component */}
            <InstallerSidebar
              installer={{
                id: installer.id,
                company_name: installer.company_name,
                phone: installer.phone,
                website: installer.website,
                services: installer.services,
                system_sizes: installer.system_sizes,
                brands_used: installer.brands_used,
                cac_number: installer.cac_number,
                slug: installer.slug,
              }}
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
