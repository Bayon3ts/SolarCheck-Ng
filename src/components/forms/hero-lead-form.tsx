"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NIGERIAN_STATES, MONTHLY_BILL_RANGES } from "@/lib/validations";

/* ═══════════════════════════════════════ */
/* HeroLeadForm — Floating white card      */
/* Stitch: high contrast on dark hero      */
/* ═══════════════════════════════════════ */

export default function HeroLeadForm() {
  const [formData, setFormData] = useState({
    state: "",
    monthly_bill_range: "",
    whatsapp: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Navigate to full quote form with pre-filled data
    const params = new URLSearchParams(formData).toString();
    window.location.href = `/get-quotes?${params}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
    >
      <form
        onSubmit={handleSubmit}
        className="mx-auto w-full max-w-md space-y-4 p-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-[20px] shadow-2xl"
      >
        <h3 className="text-xl font-bold text-white mb-2">
          Get Free Solar Quotes
        </h3>

        {/* State selector */}
        <div>
          <select
            value={formData.state}
            onChange={(e) =>
              setFormData({ ...formData, state: e.target.value })
            }
            className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-[14px] text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer"
            required
          >
            <option value="" className="text-gray-900">Select your state</option>
            {NIGERIAN_STATES.map((state) => (
              <option key={state} value={state} className="text-gray-900">
                {state}
              </option>
            ))}
          </select>
        </div>

        {/* Monthly bill range */}
        <div>
          <select
            value={formData.monthly_bill_range}
            onChange={(e) =>
              setFormData({ ...formData, monthly_bill_range: e.target.value })
            }
            className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-[14px] text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer"
            required
          >
            <option value="" className="text-gray-900">Monthly NEPA bill range</option>
            {MONTHLY_BILL_RANGES.map((range) => (
              <option key={range} value={range} className="text-gray-900">
                {range}
              </option>
            ))}
          </select>
        </div>

        {/* WhatsApp number */}
        <div className="relative">
          <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
          <input
            type="tel"
            value={formData.whatsapp}
            onChange={(e) =>
              setFormData({ ...formData, whatsapp: e.target.value })
            }
            placeholder="WhatsApp number"
            className="w-full bg-white/5 border border-white/20 rounded-xl pl-12 pr-4 py-[14px] text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            required
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full h-[56px] text-lg font-bold bg-[#0A5C36] hover:bg-[#084a2c] text-white border-none mt-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Matching you..." : "Get Free Quotes"}
          <ChevronRight className="ml-2 h-5 w-5" />
        </Button>

        <p className="text-center text-xs text-white/50 font-medium">
          ₦0 cost • No obligation • 3 verified installers
        </p>
      </form>
    </motion.div>
  );
}
