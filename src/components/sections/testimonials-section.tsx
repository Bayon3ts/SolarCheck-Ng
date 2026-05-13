"use client";

import { useState, useEffect } from "react";
import { Quote } from "lucide-react";
import ScrollReveal from "@/components/animations/scroll-reveal";
import StarRating from "@/components/ui/star-rating";

/* ═══════════════════════════════════════ */
/* Testimonials — Auto-rotating carousel   */
/* Stitch: light grey bg, white cards      */
/* ═══════════════════════════════════════ */

const TESTIMONIALS = [
  {
    name: "Chioma Okafor",
    city: "Lekki, Lagos",
    systemSize: "5KVA",
    rating: 5,
    quote:
      "SolarCheck matched me with an amazing installer in less than 24 hours. I was quoted ₦2.8M by a random company, but the verified installer I found here did it for ₦1.9M with better panels. Saved me almost a million naira!",
  },
  {
    name: "Emeka Nwankwo",
    city: "Wuse, Abuja",
    systemSize: "10KVA",
    rating: 5,
    quote:
      "As a business owner, I needed a reliable commercial system. SolarCheck connected me with 3 verified companies, all of whom visited my site within 48 hours. The whole process was transparent and professional.",
  },
  {
    name: "Adebayo Johnson",
    city: "Ibadan, Oyo",
    systemSize: "3KVA",
    rating: 4,
    quote:
      "I was skeptical about solar but SolarCheck made it easy. The cost calculator showed me exactly what to expect, and the installer they matched me with delivered exactly as promised. No generator noise since!",
  },
];

export default function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <section className="bg-gray-50 section-padding">
      <div className="container-custom">
        <ScrollReveal className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary-dark md:text-5xl">
            What Homeowners Say
          </h2>
        </ScrollReveal>

        <div
          className="mx-auto max-w-3xl"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {TESTIMONIALS.map((testimonial, i) => (
            <div
              key={i}
              className={`transition-all duration-500 ${
                i === activeIndex
                  ? "block opacity-100"
                  : "hidden opacity-0"
              }`}
            >
              <div className="card relative p-8 md:p-10">
                {/* Decorative quote mark */}
                <Quote className="absolute left-6 top-6 h-10 w-10 text-primary/10" />

                <div className="relative">
                  <StarRating rating={testimonial.rating} size="md" />

                  <p className="mt-4 text-lg leading-relaxed text-text-primary md:text-xl">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>

                  <div className="mt-6 flex items-center gap-3">
                    {/* Avatar placeholder */}
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-sm font-bold text-primary">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">
                        {testimonial.name}
                      </p>
                      <p className="text-xs text-text-muted">
                        {testimonial.city} · {testimonial.systemSize} System
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Dots indicator */}
          <div className="mt-6 flex justify-center gap-2">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === activeIndex
                    ? "w-8 bg-primary"
                    : "w-2 bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
