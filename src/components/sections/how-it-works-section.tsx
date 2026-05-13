"use client";

import { ClipboardList, Users, CheckCircle2 } from "lucide-react";
import ScrollReveal from "@/components/animations/scroll-reveal";
import { StaggerContainer, StaggerItem } from "@/components/animations/scroll-reveal";

/* ═══════════════════════════════════════ */
/* How It Works — 3 steps with path         */
/* Stitch: large step numbers, icons        */
/* ═══════════════════════════════════════ */

const STEPS = [
  {
    number: "01",
    icon: ClipboardList,
    title: "Tell us your needs",
    description:
      "Share your location, monthly electricity bill, and what you need. It takes less than 60 seconds.",
  },
  {
    number: "02",
    icon: Users,
    title: "We match verified installers",
    description:
      "Our algorithm connects you with the top 3 verified solar companies in your area, ranked by reviews and reliability.",
  },
  {
    number: "03",
    icon: CheckCircle2,
    title: "Compare and choose confidently",
    description:
      "Review their profiles, compare quotes, read real customer reviews, and pick the installer you trust most.",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="bg-white section-padding">
      <div className="container-custom">
        <ScrollReveal className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary-dark md:text-5xl">
            How SolarCheck Works
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-text-muted">
            Getting solar shouldn&apos;t be complicated. We make it simple.
          </p>
        </ScrollReveal>

        <StaggerContainer className="grid gap-8 md:grid-cols-3 md:gap-6">
          {STEPS.map((step, i) => (
            <StaggerItem key={i}>
              <div className="relative text-center">
                {/* Large decorative step number */}
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-8xl font-black text-primary/5">
                  {step.number}
                </span>

                {/* Icon */}
                <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <step.icon className="h-7 w-7 text-primary" />
                </div>

                <h3 className="mb-3 text-xl font-bold text-text-primary">
                  {step.title}
                </h3>
                <p className="text-text-muted leading-relaxed">
                  {step.description}
                </p>

                {/* Connecting line (desktop only) */}
                {i < STEPS.length - 1 && (
                  <div className="absolute right-0 top-12 hidden w-full translate-x-1/2 md:block">
                    <div className="mx-auto h-px w-3/4 bg-border" />
                  </div>
                )}
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
