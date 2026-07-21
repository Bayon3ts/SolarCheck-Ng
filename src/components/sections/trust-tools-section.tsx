import Link from "next/link";
import { ShieldAlert, Zap } from "lucide-react";
import ScrollReveal from "@/components/animations/scroll-reveal";

/* ═══════════════════════════════════════ */
/* TrustToolsSection — Homepage section    */
/* Links to Check Battery + Check          */
/* Controller fraud-detection tools        */
/* Purpose: pre-qualify / warm up visitors */
/* before the quote-capture form           */
/* ═══════════════════════════════════════ */

export default function TrustToolsSection() {
  return (
    <section className="py-16 bg-primary-dark">
      <div className="container-custom">
        <ScrollReveal className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            <ShieldAlert className="h-4 w-4" />
            Free Equipment Verification
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Before you pay anyone — check your equipment free
          </h2>
          <p className="text-white/65 max-w-2xl mx-auto text-lg leading-relaxed">
            Nigerian installers sell fake MPPT controllers and relabelled lead-acid batteries as
            lithium every day. Our free physics-based checkers catch it in 60 seconds — no
            sign-up required.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">

            {/* Check Battery Card */}
            <Link
              href="/check-battery"
              className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-8 hover:bg-white/10 hover:border-white/25 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/20 group-hover:bg-accent/30 transition-colors">
                  <span className="text-2xl">🔋</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-accent transition-colors">
                    Check Your Battery
                  </h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    Is it really lithium? Does the claimed capacity match the weight?
                    Enter your battery specs and we'll flag fraud instantly.
                  </p>
                  <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent/80 group-hover:text-accent transition-colors">
                    Run free check →
                  </div>
                </div>
              </div>
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl ring-1 ring-accent/0 group-hover:ring-accent/20 transition-all pointer-events-none" />
            </Link>

            {/* Check Controller Card */}
            <Link
              href="/check-controller"
              className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-8 hover:bg-white/10 hover:border-white/25 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/30 group-hover:bg-primary/40 transition-colors">
                  <Zap className="h-6 w-6 text-primary-light" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary-light transition-colors">
                    Check Your Controller
                  </h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    Is your "MPPT" actually PWM? Is the amperage rating real?
                    We check the physics and the price against the Nigerian market.
                  </p>
                  <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary-light/80 group-hover:text-primary-light transition-colors">
                    Run free check →
                  </div>
                </div>
              </div>
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl ring-1 ring-primary-light/0 group-hover:ring-primary-light/20 transition-all pointer-events-none" />
            </Link>

          </div>
        </ScrollReveal>

        {/* Already installed? — warranty registration link (additive, separate from the pre-purchase checks above) */}
        <ScrollReveal delay={0.25}>
          <div className="text-center mt-8">
            <p className="text-white/50 text-sm">
              Already had your system installed?{" "}
              <Link href="/warranty-register" className="text-accent font-semibold hover:underline">
                Register your warranty free →
              </Link>
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}