import { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { createServerClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Solar Energy Guide & Blog | SolarCheck Nigeria",
  description: "Learn about solar energy, financing, case studies, and maintenance in Nigeria. Read the latest insights from SolarCheck.",
};

export default async function BlogPage() {
  const supabase = createServerClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("title, slug, category, created_at, excerpt")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  // Group by category for a simple filter, or just display all
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-24 pb-20">
        <div className="container-custom">
          {/* Breadcrumbs */}
          <nav className="mb-8 flex items-center gap-2 text-sm text-text-muted">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-text-primary font-medium">Solar Guide</span>
          </nav>

          <div className="mb-12">
            <h1 className="text-4xl font-bold text-text-primary md:text-5xl">
              Solar Energy Guide
            </h1>
            <p className="mt-4 text-lg text-text-muted max-w-2xl">
              Everything you need to know about switching to solar in Nigeria.
              From basic concepts to financing options and maintenance.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts?.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                <article className="card h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
                  {/* Placeholder image */}
                  <div className="h-48 w-full bg-gradient-to-br from-primary/10 to-primary/5 group-hover:scale-105 transition-transform duration-500"></div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <span className="tag">{post.category}</span>
                      <time className="text-xs text-text-muted">
                        {new Date(post.created_at).toLocaleDateString()}
                      </time>
                    </div>
                    <h2 className="text-xl font-bold text-text-primary group-hover:text-primary transition-colors mb-3 line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-sm text-text-muted line-clamp-3 mb-6 flex-1">
                      {post.excerpt || "Read more about this topic in our comprehensive guide..."}
                    </p>
                    <div className="mt-auto text-sm font-semibold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read Article <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </article>
              </Link>
            ))}
            {(!posts || posts.length === 0) && (
              <div className="col-span-full text-center py-12 text-text-muted">
                No articles published yet. Check back soon!
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
