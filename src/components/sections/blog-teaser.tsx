import Link from "next/link";
import Image from "next/image";
import { Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/animations/scroll-reveal";
import { StaggerContainer, StaggerItem } from "@/components/animations/scroll-reveal";
import { createServerClient } from "@/lib/supabase/server";

export const revalidate = 0;

/* ═══════════════════════════════════════ */
/* Blog Teaser — 3 article cards           */
/* ═══════════════════════════════════════ */

export default async function BlogTeaser() {
  const supabase = await createServerClient();
  const { data: fetchedPosts, error } = await supabase
    .from("blog_posts")
    .select("slug, title, excerpt, category, cover_image, cover_image_alt")
    .eq("is_published", true)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(3);

  console.log("[BlogTeaser] posts:", fetchedPosts, "error:", error);

  const realPosts = fetchedPosts ?? [];

  // Build placeholder cards to fill remaining slots up to 3
  const PLACEHOLDER = {
    slug: null,
    title: "Coming Soon",
    excerpt: "New article coming soon. Check back later.",
    category: "COMING SOON",
    cover_image: null,
    cover_image_alt: null,
  };
  const placeholders = Array.from(
    { length: Math.max(0, 3 - realPosts.length) },
    (_, i) => ({ ...PLACEHOLDER, _key: `placeholder-${i}` })
  );
  const postsToDisplay = [...realPosts, ...placeholders];

  return (
    <section className="bg-white section-padding">
      <div className="container-custom">
        <ScrollReveal className="mb-12">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-primary-dark md:text-5xl">
                Solar Knowledge
              </h2>
              <p className="mt-4 text-lg text-text-muted">
                Expert guides to help you make smarter solar decisions.
              </p>
            </div>
            <Button variant="ghost" className="hidden md:flex" asChild>
              <Link href="/blog">
                View All Articles
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </ScrollReveal>

        <StaggerContainer className="grid gap-6 md:grid-cols-3 md:gap-8">
          {postsToDisplay.map((post, i) => {
            const isPlaceholder = !post.slug;
            const key = post.slug ?? `placeholder-${i}`;
            const cardContent = (
              <div className={`card overflow-hidden transition-all duration-300 ${!isPlaceholder ? "group-hover:shadow-card-hover group-hover:scale-[1.02]" : "opacity-50"}`}>
                {/* Cover image or fallback */}
                {post.cover_image ? (
                  <div className="relative w-full h-48 rounded-t-2xl overflow-hidden bg-primary/5">
                    <Image
                      src={post.cover_image}
                      alt={post.cover_image_alt || post.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 rounded-t-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <span className="text-4xl">☀️</span>
                  </div>
                )}

                <div className="p-6">
                  <span className="tag">{post.category}</span>
                  <h3 className="mt-3 text-lg font-bold text-text-primary line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-sm text-text-muted line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-xs text-text-muted">
                    <Clock className="h-3.5 w-3.5" />
                    5 min read
                  </div>
                </div>
              </div>
            );

            return (
              <StaggerItem key={key}>
                {isPlaceholder ? (
                  cardContent
                ) : (
                  <Link href={`/blog/${post.slug}`} className="group block">
                    {cardContent}
                  </Link>
                )}
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        <div className="mt-8 text-center md:hidden">
          <Button variant="outline" asChild>
            <Link href="/blog">View All Articles</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
