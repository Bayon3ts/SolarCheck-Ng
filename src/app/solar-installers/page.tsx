import { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import InteractiveDirectory from "./interactive-directory";

export const metadata: Metadata = {
  title: "Solar Installers Directory | SolarCheck Nigeria",
  description:
    "Browse our directory of verified solar installers across Nigeria. Filter by state, rating, and services to find the perfect solar company for your needs.",
};

export default async function DirectoryPage() {
  const supabase = await createServerClient();

  // Fetch all active installers
  const { data: installers, error } = await supabase
    .from("installers")
    .select("id, slug, company_name, city, state, average_rating, total_reviews, is_verified, services")
    .eq("is_active", true)
    .order("subscription_tier", { ascending: false }) // Premium/Featured first
    .order("average_rating", { ascending: false });

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
              Select your state to connect with trusted, verified solar installers near you.
            </p>
          </div>

          {error ? (
            <div className="rounded-2xl bg-red-50 p-6 text-center text-red-600 border border-red-100">
              <p>Failed to load installers. Please try again later.</p>
            </div>
          ) : (
            <InteractiveDirectory initialInstallers={installers || []} />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
