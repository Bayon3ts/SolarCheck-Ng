"use client";

import { CalculatorInputs, CalculatorResults } from "@/lib/calculator/types";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  inputs: CalculatorInputs;
  results: CalculatorResults;
  onRecalculate: () => void;
}

export default function CalcStickyBar({ inputs, results, onRecalculate }: Props) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky bar when scrolled past the hero section (~400px)
      setIsVisible(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          exit={{ y: -100 }}
          className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-border shadow-sm pt-[72px]" // Offset for main navbar
        >
          <div className="container-custom py-3 flex items-center justify-between">
            <div className="hidden md:flex items-center gap-6 text-sm text-text-muted">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-text-primary">Location:</span> {inputs.state}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-text-primary">Current Spend:</span>
                <span className="text-amber-600 font-bold">₦{(inputs.monthlyBill + inputs.generatorSpend).toLocaleString()}/mo</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-text-primary">Target:</span> {inputs.coveragePct}% Coverage
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-text-primary">System:</span>
                <span className="text-primary font-bold">{results.systemSize.pvKwp}kWp</span>
              </div>
            </div>

            {/* Mobile View Summary */}
            <div className="md:hidden flex flex-col text-xs text-text-muted">
              <div><span className="font-semibold">State:</span> {inputs.state}</div>
              <div><span className="font-semibold">Spend:</span> ₦{(inputs.monthlyBill + inputs.generatorSpend).toLocaleString()}</div>
            </div>

            <button
              onClick={() => {
                onRecalculate();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg font-semibold text-sm transition-colors"
            >
              Adjust Inputs
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
