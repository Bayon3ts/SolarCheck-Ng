"use client";

import AnimatedCounter from "@/components/animations/animated-counter";
import ScrollReveal from "@/components/animations/scroll-reveal";

/* ═══════════════════════════════════════ */
/* Stats Band — Full-width primary green   */
/* Stitch: 4 stats, dividers, count-up     */
/* ═══════════════════════════════════════ */

const STATS = [
  { value: 500, suffix: "+", label: "Verified Installers" },
  { value: 36, suffix: "", label: "States Covered" },
  { value: 0, prefix: "₦", suffix: "", label: "Cost to Homeowners" },
  { value: 4.8, suffix: "★", label: "Average Rating", isDecimal: true },
];

export default function StatsSection() {
  return (
    <section className="bg-primary py-16 md:py-20">
      <div className="container-custom">
        <ScrollReveal>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-0">
            {STATS.map((stat, i) => (
              <div
                key={i}
                className={`flex flex-col items-center justify-center text-center ${
                  i < STATS.length - 1
                    ? "md:border-r md:border-white/20"
                    : ""
                }`}
              >
                <div className="text-3xl font-bold text-white md:text-4xl">
                  {stat.isDecimal ? (
                    <span>
                      {stat.prefix}
                      {stat.value}
                      {stat.suffix}
                    </span>
                  ) : (
                    <AnimatedCounter
                      target={stat.value}
                      prefix={stat.prefix}
                      suffix={stat.suffix}
                      className=""
                    />
                  )}
                </div>
                <p className="mt-2 text-sm text-white/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
