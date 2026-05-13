import { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, MapPin, Search } from "lucide-react";
import { createServerClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import StarRating from "@/components/ui/star-rating";
import { NIGERIAN_STATES } from "@/lib/validations";


export const metadata: Metadata = {
  title: "Solar Installers Directory | SolarCheck Nigeria",
  description:
    "Browse our directory of verified solar installers across Nigeria. Filter by state, rating, and services to find the perfect solar company for your needs.",
};

interface SearchParams {
  state?: string;
  rating?: string;
  q?: string;
}

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = createServerClient();

  // Extract filters from searchParams
  const stateFilter = searchParams.state || "";
  const ratingFilter = searchParams.rating ? parseInt(searchParams.rating, 10) : 0;
  const queryFilter = searchParams.q || "";

  // Build the Supabase query directly in the server component
  let query = supabase
    .from("installers")
    .select("id, slug, company_name, city, state, average_rating, total_reviews, is_verified, services")
    .eq("is_active", true)
    .order("subscription_tier", { ascending: false }) // Premium/Featured first
    .order("average_rating", { ascending: false });

  if (stateFilter && (NIGERIAN_STATES as readonly string[]).includes(stateFilter)) {
    query = query.eq("state", stateFilter);
  }

  if (ratingFilter > 0) {
    query = query.gte("average_rating", ratingFilter);
  }

  if (queryFilter) {
    query = query.ilike("company_name", `%${queryFilter}%`);
  }

  // Execute query
  const { data: installers, error } = await query;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-24 pb-20">
        <div className="container-custom">
          {/* Header */}
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-4xl font-bold text-text-primary md:text-5xl">
              Verified Solar Installers
            </h1>
            <p className="mt-4 text-lg text-text-muted">
              Find and compare the best solar companies in Nigeria.
            </p>
          </div>

          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Filter Sidebar */}
            <aside className="w-full lg:w-1/4">
              <div className="sticky top-24 rounded-2xl bg-white p-6 shadow-sm border border-border">
                <h2 className="text-lg font-bold text-text-primary mb-6">Filters</h2>

                <form className="space-y-6" action="/solar-installers" method="GET">
                  {/* Search input */}
                  <div className="space-y-2">
                    <label htmlFor="q" className="text-sm font-medium text-text-primary">
                      Search Name
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                      <input
                        type="text"
                        id="q"
                        name="q"
                        defaultValue={queryFilter}
                        placeholder="e.g. GreenPower"
                        className="input-field pl-10 w-full"
                      />
                    </div>
                  </div>

                  {/* State Filter */}
                  <div className="space-y-2">
                    <label htmlFor="state" className="text-sm font-medium text-text-primary">
                      State
                    </label>
                    <select
                      id="state"
                      name="state"
                      defaultValue={stateFilter}
                      className="select-field w-full"
                    >
                      <option value="">All States</option>
                      {NIGERIAN_STATES.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Rating Filter */}
                  <div className="space-y-2">
                    <label htmlFor="rating" className="text-sm font-medium text-text-primary">
                      Minimum Rating
                    </label>
                    <select
                      id="rating"
                      name="rating"
                      defaultValue={ratingFilter.toString()}
                      className="select-field w-full"
                    >
                      <option value="0">Any Rating</option>
                      <option value="4">4+ Stars</option>
                      <option value="3">3+ Stars</option>
                    </select>
                  </div>

                  <Button type="submit" className="w-full" variant="primary">
                    Apply Filters
                  </Button>

                  {/* Clear filters link */}
                  {(stateFilter || ratingFilter > 0 || queryFilter) && (
                    <div className="text-center mt-3">
                      <Link href="/solar-installers" className="text-sm text-text-muted hover:text-primary underline">
                        Clear all filters
                      </Link>
                    </div>
                  )}
                </form>
              </div>
            </aside>

            {/* Results Grid */}
            <div className="w-full lg:w-3/4">
              {error ? (
                <div className="rounded-2xl bg-red-50 p-6 text-center text-red-600 border border-red-100">
                  <p>Failed to load installers. Please try again later.</p>
                </div>
              ) : !installers || installers.length === 0 ? (
                <div className="rounded-2xl bg-white p-12 text-center shadow-sm border border-border">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
                    <Search className="h-8 w-8 text-text-muted" />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary">No installers found</h3>
                  <p className="mt-2 text-text-muted">
                    We couldn&apos;t find any installers matching your current filters.
                  </p>
                  <Button variant="outline" className="mt-6" asChild>
                    <Link href="/solar-installers">Clear Filters</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {installers.map((installer) => (
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

                        <div className="mt-5 flex flex-wrap gap-2">
                          {installer.services?.slice(0, 3).map((service: string) => (
                            <span key={service} className="tag text-[10px]">
                              {service.replace("-", " ")}
                            </span>
                          ))}
                          {installer.services?.length > 3 && (
                            <span className="tag text-[10px]">+{installer.services.length - 3}</span>
                          )}
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t border-border">
                        <Button variant="outline" className="w-full" asChild>
                          <Link href={`/installers/${installer.slug}`}>
                            View Profile
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
