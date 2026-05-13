"use client";

import Link from "next/link";
import { Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/animations/scroll-reveal";
import { StaggerContainer, StaggerItem } from "@/components/animations/scroll-reveal";

/* ═══════════════════════════════════════ */
/* Blog Teaser — 3 article cards           */
/* ═══════════════════════════════════════ */

const DEMO_POSTS = [
  {
    slug: "how-much-does-solar-cost-in-nigeria-2025",
    title: "How Much Does Solar Cost in Nigeria in 2025?",
    excerpt:
      "A comprehensive breakdown of solar panel, inverter, and battery prices across Nigeria. Plus a city-by-city comparison.",
    category: "Cost Guide",
    read_time: 8,
    cover_image_url: null,
  },
  {
    slug: "solar-vs-generator-nigeria",
    title: "Solar vs Generator: Which Saves More Money?",
    excerpt:
      "We compared the 5-year total cost of running a generator vs a solar system for a typical Nigerian household.",
    category: "Comparison",
    read_time: 6,
    cover_image_url: null,
  },
  {
    slug: "top-solar-panel-brands-nigeria",
    title: "Top 10 Solar Panel Brands Available in Nigeria",
    excerpt:
      "From Jinko to Canadian Solar — which brands offer the best value and reliability in Nigeria's climate?",
    category: "Reviews",
    read_time: 10,
    cover_image_url: null,
  },
];

export default function BlogTeaser() {
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
          {DEMO_POSTS.map((post) => (
            <StaggerItem key={post.slug}>
              <Link href={`/blog/${post.slug}`} className="group block">
                <div className="card overflow-hidden transition-all duration-300 group-hover:shadow-card-hover group-hover:scale-[1.02]">
                  {/* Cover image placeholder */}
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10" />

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
                      {post.read_time} min read
                    </div>
                  </div>
                </div>
              </Link>
            </StaggerItem>
          ))}
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
