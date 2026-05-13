"use client";

import { useState } from "react";
import { ChevronRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NIGERIAN_STATES } from "@/lib/validations";
import ScrollReveal from "@/components/animations/scroll-reveal";

/* ═══════════════════════════════════════ */
/* Final CTA — Full-width dark section     */
/* ═══════════════════════════════════════ */

export default function FinalCTA() {
  const [formData, setFormData] = useState({
    state: "",
    monthly_bill_range: "",
    whatsapp: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(formData).toString();
    window.location.href = `/get-quotes?${params}`;
  };

  return (
    <section className="bg-primary-dark section-padding">
      <div className="container-custom text-center">
        <ScrollReveal>
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
            Ready to stop overpaying for power?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/70">
            Join 12,000+ Nigerian homeowners who found trusted solar
            installers through SolarCheck. It&apos;s free.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 md:flex-row"
          >
            <select
              value={formData.state}
              onChange={(e) =>
                setFormData({ ...formData, state: e.target.value })
              }
              className="select-field flex-1 bg-white/10 text-white border-white/20 placeholder:text-white/40"
              required
            >
              <option value="" className="text-text-primary">
                Select your state
              </option>
              {NIGERIAN_STATES.map((state) => (
                <option key={state} value={state} className="text-text-primary">
                  {state}
                </option>
              ))}
            </select>

            <div className="relative flex-1">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                type="tel"
                value={formData.whatsapp}
                onChange={(e) =>
                  setFormData({ ...formData, whatsapp: e.target.value })
                }
                placeholder="WhatsApp number"
                className="input-field bg-white/10 text-white border-white/20 placeholder:text-white/40 pl-10"
                required
              />
            </div>

            <Button type="submit" variant="secondary" size="lg">
              Get Free Quotes
              <ChevronRight className="h-4 w-4" />
            </Button>
          </form>
        </ScrollReveal>
      </div>
    </section>
  );
}
