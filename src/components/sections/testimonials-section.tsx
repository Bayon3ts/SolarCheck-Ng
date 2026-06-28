import ScrollReveal from "@/components/animations/scroll-reveal";
import TestimonialsCarousel, {
  type TestimonialData,
} from "@/components/sections/testimonials-carousel";
import { createAdminClient } from "@/lib/supabase/admin";

/* ═══════════════════════════════════════ */
/* TestimonialsSection — Server Component  */
/* Fetches real published reviews from DB  */
/* Returns null (hides section) if empty   */
/* Fake data (Chioma/Emeka/Adebayo) GONE   */
/* ═══════════════════════════════════════ */

async function fetchTestimonials(): Promise<TestimonialData[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("reviews")
      .select("reviewer_name, reviewer_city, rating, body, system_size")
      .eq("is_published", true)
      .order("rating", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(5);

    if (error || !data || data.length === 0) return [];

    return data.map((r) => ({
      name: r.reviewer_name as string,
      city: (r.reviewer_city as string | null) ?? null,
      systemSize: (r.system_size as string | null) ?? null,
      rating: r.rating as number,
      quote: r.body as string,
    }));
  } catch (err) {
    console.error("[TestimonialsSection] Failed to fetch reviews:", err);
    return [];
  }
}

export default async function TestimonialsSection() {
  const testimonials = await fetchTestimonials();

  // Hide section entirely until real reviews exist
  if (testimonials.length === 0) return null;

  return (
    <section className="bg-gray-50 section-padding">
      <div className="container-custom">
        <ScrollReveal className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary-dark md:text-5xl">
            What Homeowners Say
          </h2>
        </ScrollReveal>

        <TestimonialsCarousel testimonials={testimonials} />
      </div>
    </section>
  );
}
