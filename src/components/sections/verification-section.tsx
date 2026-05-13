"use client";

import { Building2, Search, UserCheck, TrendingUp } from "lucide-react";
import ScrollReveal from "@/components/animations/scroll-reveal";
import { StaggerContainer, StaggerItem } from "@/components/animations/scroll-reveal";

/* ═══════════════════════════════════════ */
/* Verification Section — How we verify    */
/* Stitch: scrollytelling 4-step reveal    */
/* ═══════════════════════════════════════ */

const VERIFICATION_STEPS = [
  {
    icon: Building2,
    title: "CAC Registration Check",
    description:
      "Every installer must provide a valid Corporate Affairs Commission registration number. We verify it against the national registry.",
  },
  {
    icon: Search,
    title: "Physical Inspection",
    description:
      "Our team visits the installer's office and warehouse to confirm they have the capacity and inventory to deliver quality solar installations.",
  },
  {
    icon: UserCheck,
    title: "Customer Reference Verification",
    description:
      "We call past customers directly to verify the installer's work quality, professionalism, and post-installation support.",
  },
  {
    icon: TrendingUp,
    title: "Ongoing Rating Monitoring",
    description:
      "Verified installers are continuously monitored through customer reviews. Consistently poor ratings lead to de-listing.",
  },
];

export default function VerificationSection() {
  return (
    <section className="bg-white section-padding">
      <div className="container-custom">
        <ScrollReveal className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary-dark md:text-5xl">
            How We Verify Installers
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-text-muted">
            Only the best get the SolarCheck verified badge. Here&apos;s our 
            rigorous 4-step process.
          </p>
        </ScrollReveal>

        <StaggerContainer className="grid gap-6 md:grid-cols-2 md:gap-8">
          {VERIFICATION_STEPS.map((step, i) => (
            <StaggerItem key={i}>
              <div className="card flex gap-5 p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-primary">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-text-muted leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
