"use client";

import { useState, useEffect } from "react";
import { Quote } from "lucide-react";
import StarRating from "@/components/ui/star-rating";

/* ═══════════════════════════════════════ */
/* TestimonialsCarousel — client sub-comp  */
/* Receives real reviews as props from     */
/* the server-side TestimonialsSection     */
/* ═══════════════════════════════════════ */

export interface TestimonialData {
  name: string;
  city: string | null;
  systemSize: string | null;
  rating: number;
  quote: string;
}

interface Props {
  testimonials: TestimonialData[];
}

export default function TestimonialsCarousel({ testimonials }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || testimonials.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, testimonials.length]);

  return (
    <div
      className="mx-auto max-w-3xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {testimonials.map((testimonial, i) => (
        <div
          key={i}
          className={`transition-all duration-500 ${
            i === activeIndex ? "block opacity-100" : "hidden opacity-0"
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
                    {[testimonial.city, testimonial.systemSize ? `${testimonial.systemSize} System` : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Dots indicator — only render if more than one */}
      {testimonials.length > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {testimonials.map((_, i) => (
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
      )}
    </div>
  );
}
