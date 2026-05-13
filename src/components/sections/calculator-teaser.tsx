"use client";

import Link from "next/link";
import { ChevronRight, Zap, Banknote, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/animations/scroll-reveal";
import { StaggerContainer, StaggerItem } from "@/components/animations/scroll-reveal";

/* ═══════════════════════════════════════ */
/* Calculator Teaser — Amber background    */
/* Stitch: accent bg, dark text, 3 steps   */
/* ═══════════════════════════════════════ */

const PREVIEW_STEPS = [
  { icon: Banknote, label: "Enter your NEPA bill" },
  { icon: Zap, label: "Select your appliances" },
  { icon: BarChart3, label: "See your estimate" },
];

export default function CalculatorTeaser() {
  return (
    <section className="bg-accent section-padding">
      <div className="container-custom">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left: Text */}
          <ScrollReveal>
            <h2 className="text-3xl font-bold tracking-tight text-text-primary md:text-5xl">
              What will solar cost you in Nigeria?
            </h2>
            <p className="mt-4 max-w-md text-lg text-text-primary/70">
              Use our free calculator to estimate your solar system size and 
              cost in under 2 minutes. No signup required.
            </p>
            <Button variant="dark" size="lg" className="mt-8" asChild>
              <Link href="/solar-calculator">
                Try the Free Calculator
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </ScrollReveal>

          {/* Right: Mini step preview */}
          <StaggerContainer className="space-y-4">
            {PREVIEW_STEPS.map((step, i) => (
              <StaggerItem key={i}>
                <div className="flex items-center gap-4 rounded-2xl bg-white/30 p-5 backdrop-blur-sm">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/60">
                    <step.icon className="h-6 w-6 text-text-primary" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-text-primary/50">
                      Step {i + 1}
                    </span>
                    <p className="text-base font-semibold text-text-primary">
                      {step.label}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
}
