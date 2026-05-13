import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Calendar, User } from "lucide-react";
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
    .select("title, excerpt")
    .eq("slug", params.slug)
    .single();

  if (!post) return { title: "Post Not Found" };

  return {
    title: `${post.title} | SolarCheck Nigeria`,
    description: post.excerpt || "Read our latest solar guide.",
  };
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

  // MDX Components mapping can be expanded here
  const components = {
    h1: (props: any) => <h1 className="text-3xl font-bold mt-8 mb-4 text-text-primary" {...props} />,
    h2: (props: any) => <h2 className="text-2xl font-bold mt-8 mb-4 text-text-primary" {...props} />,
    h3: (props: any) => <h3 className="text-xl font-bold mt-6 mb-3 text-text-primary" {...props} />,
    p: (props: any) => <p className="text-text-muted leading-relaxed mb-6" {...props} />,
    ul: (props: any) => <ul className="list-disc pl-6 mb-6 text-text-muted space-y-2" {...props} />,
    ol: (props: any) => <ol className="list-decimal pl-6 mb-6 text-text-muted space-y-2" {...props} />,
    li: (props: any) => <li {...props} />,
    blockquote: (props: any) => <blockquote className="border-l-4 border-primary pl-4 italic text-text-primary my-6" {...props} />,
    a: (props: any) => <a className="text-primary hover:underline underline-offset-4" {...props} />,
    CTA: (props: any) => (
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

      {/* Reading Progress Bar (placeholder visual, would need client component for actual scroll tracking) */}
      <div className="fixed top-0 left-0 w-full h-1 z-[60] bg-gray-200">
        <div className="h-full bg-primary" style={{ width: '0%' }} id="progress-bar"></div>
      </div>

      {/* Article JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": post.title,
            "datePublished": post.created_at,
            "author": [{
              "@type": "Organization",
              "name": "SolarCheck Nigeria",
              "url": "https://solarcheckng.com"
            }],
            "publisher": {
              "@type": "Organization",
              "name": "SolarCheck Nigeria",
              "logo": {
                "@type": "ImageObject",
                "url": "https://solarcheckng.com/logo.png"
              }
            }
          }),
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
                  <Calendar className="h-4 w-4" />
                  <time>{new Date(post.created_at).toLocaleDateString()}</time>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>SolarCheck Team</span>
                </div>
              </div>
            </header>

            {/* Content & TOC wrapper */}
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
              </div>

              {/* Sticky TOC (Desktop only) */}
              <aside className="hidden lg:block w-64 shrink-0 sticky top-32">
                <div className="card p-6">
                  <h4 className="font-bold text-text-primary mb-4 uppercase tracking-wider text-sm">Table of Contents</h4>
                  <ul className="space-y-3 text-sm text-text-muted">
                    {/* Simplified TOC - in reality, we'd parse the MDX headings */}
                    <li className="hover:text-primary cursor-pointer transition-colors">Introduction</li>
                    <li className="hover:text-primary cursor-pointer transition-colors">Key Benefits</li>
                    <li className="hover:text-primary cursor-pointer transition-colors">Cost Analysis</li>
                    <li className="hover:text-primary cursor-pointer transition-colors">Conclusion</li>
                  </ul>
                </div>
              </aside>
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
