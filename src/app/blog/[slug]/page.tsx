import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Calendar, User, Clock } from "lucide-react";
import { createServerClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Button } from "@/components/ui/button";

export async function generateStaticParams() {
  const supabase = createServerClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug")
    .eq("is_published", true);

  return posts?.map((post) => ({ slug: post.slug })) || [];
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = createServerClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("title, excerpt, cover_image")
    .eq("slug", params.slug)
    .single();

  if (!post) return { title: "Post Not Found" };

  return {
    title: `${post.title} | SolarCheck Nigeria`,
    description: post.excerpt || "Read our latest solar guide.",
    openGraph: {
      images: [
        {
          url:
            post.cover_image ||
            "https://solarcheckng.com/og-default.png",
        },
      ],
    },
  };
}

/** Extract h2 headings from MDX/markdown content */
function extractHeadings(content: string): { text: string; id: string }[] {
  const regex = /^##\s+(.+)$/gm;
  const headings: { text: string; id: string }[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    const text = match[1].trim();
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    headings.push({ text, id });
  }
  return headings;
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const supabase = createServerClient();

  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", params.slug)
    .eq("is_published", true)
    .single();

  if (!post) notFound();

  // Reading time
  const wordCount = post.content.split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Table of contents
  const headings = extractHeadings(post.content);

  // Article schema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt || "",
    datePublished: post.created_at,
    dateModified: post.updated_at || post.created_at,
    author: {
      "@type": "Organization",
      name: "SolarCheck Nigeria",
      url: "https://solarcheckng.com",
    },
    publisher: {
      "@type": "Organization",
      name: "SolarCheck Nigeria",
      logo: {
        "@type": "ImageObject",
        url: "https://solarcheckng.com/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://solarcheckng.com/blog/${post.slug}`,
    },
  };

  interface CTAProps {
    title?: string;
    description?: string;
    buttonText?: string;
  }

  // MDX Components mapping
  const components = {
    h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h1 className="text-3xl font-bold mt-8 mb-4 text-text-primary" {...props} />,
    h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => {
      const text = typeof props.children === "string" ? props.children : "";
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
      return <h2 id={id} className="text-2xl font-bold mt-8 mb-4 text-text-primary scroll-mt-24" {...props} />;
    },
    h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h3 className="text-xl font-bold mt-6 mb-3 text-text-primary" {...props} />,
    p: (props: React.HTMLAttributes<HTMLParagraphElement>) => <p className="text-text-muted leading-relaxed mb-6" {...props} />,
    ul: (props: React.HTMLAttributes<HTMLUListElement>) => <ul className="list-disc pl-6 mb-6 text-text-muted space-y-2" {...props} />,
    ol: (props: React.HTMLAttributes<HTMLOListElement>) => <ol className="list-decimal pl-6 mb-6 text-text-muted space-y-2" {...props} />,
    li: (props: React.LiHTMLAttributes<HTMLLIElement>) => <li {...props} />,
    blockquote: (props: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) => <blockquote className="border-l-4 border-primary pl-4 italic text-text-primary my-6" {...props} />,
    a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a className="text-primary hover:underline underline-offset-4" {...props} />,
    CTA: (props: CTAProps) => (
      <div className="bg-primary/5 border border-primary/10 rounded-2xl p-8 my-8 text-center">
        <h3 className="text-2xl font-bold text-primary-dark mb-4">{props.title || "Ready to switch to solar?"}</h3>
        <p className="text-text-muted mb-6 max-w-lg mx-auto">{props.description || "Get competitive quotes from verified installers in your area."}</p>
        <Button variant="primary" size="lg" asChild>
          <Link href="/get-quotes">{props.buttonText || "Get Free Quotes"}</Link>
        </Button>
      </div>
    ),
  };

  return (
    <>
      <Navbar />

      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-[60] bg-gray-200">
        <div className="h-full bg-primary" style={{ width: '0%' }} id="progress-bar"></div>
      </div>

      {/* Article JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema),
        }}
      />

      <main className="min-h-screen bg-background pt-24 pb-20">
        <div className="container-custom max-w-4xl">
          {/* Breadcrumbs */}
          <nav className="mb-8 flex items-center gap-2 text-sm text-text-muted">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/blog" className="hover:text-primary">Blog</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-text-primary font-medium truncate max-w-[200px]">{post.title}</span>
          </nav>

          <article>
            <header className="mb-12 text-center">
              <span className="tag mb-4 inline-block">{post.category}</span>
              <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-6 leading-tight">
                {post.title}
              </h1>
              <div className="flex items-center justify-center gap-6 text-sm text-text-muted">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{readingTime} min read</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <time>{new Date(post.created_at).toLocaleDateString()}</time>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>SolarCheck Team</span>
                </div>
              </div>
            </header>

            {/* Cover image */}
            {post.cover_image && (
              <div className="w-full aspect-[1200/630] rounded-2xl overflow-hidden mb-8 -mx-4 sm:mx-0">
                <img
                  src={post.cover_image}
                  alt={post.cover_image_alt || post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="relative flex items-start gap-12">
              {/* Main Content */}
              <div className="flex-1 w-full max-w-none prose prose-lg prose-gray">
                <MDXRemote source={post.content} components={components} />

                {/* Fallback Mid-article CTA if not included in MDX */}
                {!post.content.includes('<CTA') && (
                  <div className="bg-primary/5 border border-primary/10 rounded-2xl p-8 my-12 text-center">
                    <h3 className="text-2xl font-bold text-primary-dark mb-4">Ready to switch to solar?</h3>
                    <p className="text-text-muted mb-6 max-w-lg mx-auto">Get competitive quotes from verified installers in your area.</p>
                    <Button variant="primary" size="lg" asChild>
                      <Link href="/get-quotes">Get Free Quotes</Link>
                    </Button>
                  </div>
                )}

                {/* Was this helpful? */}
                <div className="border-t border-border pt-8 mt-8 text-center">
                  <p className="font-semibold text-text-primary mb-4">
                    Was this article helpful?
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button className="px-5 py-2 rounded-full border border-border hover:bg-primary hover:text-white transition-colors">
                      👍 Yes, helpful
                    </button>
                    <button className="px-5 py-2 rounded-full border border-border hover:bg-gray-100 transition-colors">
                      👎 Needs work
                    </button>
                  </div>
                </div>

                {/* Calculator CTA */}
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center mt-8">
                  <p className="font-bold text-primary text-lg mb-2">
                    Ready to calculate your savings?
                  </p>
                  <p className="text-text-muted text-sm mb-4">
                    Use real Nigerian market data to size your solar system and
                    payback period.
                  </p>
                  <Link
                    href="/solar-calculator"
                    className="btn-primary px-6 py-3 inline-block"
                  >
                    Calculate My Savings →
                  </Link>
                </div>
              </div>

              {/* Sticky TOC (Desktop only) */}
              {headings.length > 0 && (
                <aside className="hidden lg:block w-64 shrink-0 sticky top-32">
                  <div className="card p-6">
                    <h4 className="font-bold text-text-primary mb-4 uppercase tracking-wider text-sm">
                      Table of Contents
                    </h4>
                    <ul className="space-y-3 text-sm text-text-muted">
                      {headings.map((heading) => (
                        <li key={heading.id}>
                          <a
                            href={`#${heading.id}`}
                            className="hover:text-primary cursor-pointer transition-colors block"
                          >
                            {heading.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </aside>
              )}
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
