import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { createServerClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import InstallerReviewForm from "./installer-review-form";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const supabase = await createServerClient();
  const { data: installer } = await supabase
    .from("installers")
    .select("company_name, city, state")
    .eq("slug", (await params).slug)
    .single();

  if (!installer) return { title: "Installer Not Found" };

  return {
    title: `Write a Review for ${installer.company_name} | SolarCheck`,
    description: `Share your experience with ${installer.company_name} and help others make informed decisions.`,
  };
}

export default async function WriteReviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const supabase = await createServerClient();

  const { data: installer } = await supabase
    .from("installers")
    .select("id, company_name, slug")
    .eq("slug", (await params).slug)
    .eq("is_active", true)
    .single();

  if (!installer) notFound();

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-background pt-24 pb-20">
        <div className="container-custom max-w-3xl">
          {/* Breadcrumbs */}
          <nav className="mb-8 flex items-center gap-2 text-sm text-text-muted">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/solar-installers" className="hover:text-primary">Installers</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href={`/installers/${installer.slug}`} className="hover:text-primary">{installer.company_name}</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-text-primary font-medium">Write Review</span>
          </nav>

          <div className="card p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-text-primary mb-2">Write a Review</h1>
              <p className="text-text-muted">
                Share your experience working with <span className="font-semibold text-text-primary">{installer.company_name}</span>.
              </p>
            </div>

            <InstallerReviewForm installerId={installer.id} installerName={installer.company_name} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
