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
          <div className="container-custom py-2 md:py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 overflow-x-auto text-xs md:text-sm text-text-muted flex-1 no-scrollbar pb-1 md:pb-0">
              {/* Load Analysis label */}
              <span className="flex-shrink-0 font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full whitespace-nowrap">
                📋 Load Analysis
              </span>

              {/* Divider */}
              <span className="text-border flex-shrink-0">|</span>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="font-semibold text-text-primary">Location:</span> {inputs.state}
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="font-semibold text-text-primary">Current Spend:</span>
                <span className="text-amber-600 font-bold">₦{(inputs.monthlyBill + inputs.generatorSpend).toLocaleString()}/mo</span>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="font-semibold text-text-primary">Target:</span> {inputs.coveragePct}% Coverage
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="font-semibold text-text-primary">System:</span>
                <span className="text-primary font-bold">{results.pvKwp.toFixed(1)}kWp</span>
              </div>
            </div>

            <button
              onClick={() => {
                onRecalculate();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex-shrink-0 px-3 py-1.5 md:px-4 md:py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg font-semibold text-xs md:text-sm transition-colors whitespace-nowrap"
            >
              Adjust Inputs
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
