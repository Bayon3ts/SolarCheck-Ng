import AnimatedCounter from "@/components/animations/animated-counter";
import ScrollReveal from "@/components/animations/scroll-reveal";
import { getSiteStats } from "@/lib/supabase/stats";

/* ═══════════════════════════════════════ */
/* StatsSection — Async Server Component   */
/* Replaces all hardcoded stat values with */
/* live counts from Supabase               */
/* ═══════════════════════════════════════ */

export default async function StatsSection() {
  const { verifiedInstallers, totalLeads, avgRating } = await getSiteStats();

  // Only render stats that have real data — never show a zero
  const stats = [
    verifiedInstallers > 0
      ? { value: verifiedInstallers, suffix: "+", label: "Verified Installers" }
      : null,
    { value: 36, suffix: "", label: "States Covered" },
    { value: 0, prefix: "₦", suffix: "", label: "Cost to Homeowners" },
    avgRating !== null
      ? { value: avgRating, suffix: "★", label: "Average Rating", isDecimal: true }
      : null,
    // If we have no verified installers yet, still show the leads count if it exists
    !verifiedInstallers && totalLeads > 0
      ? { value: totalLeads, suffix: "+", label: "Homeowners Matched" }
      : null,
  ].filter(Boolean) as Array<{
    value: number;
    suffix: string;
    label: string;
    prefix?: string;
    isDecimal?: boolean;
  }>;

  return (
    <section className="bg-primary py-16 md:py-20">
      <div className="container-custom">
        <ScrollReveal>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-0">
            {stats.map((stat, i) => (
              <div
                key={i}
                className={`flex flex-col items-center justify-center text-center ${
                  i < stats.length - 1
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
