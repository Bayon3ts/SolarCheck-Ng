"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const PAIN_POINTS = [
  "You don't know which installers are legit.",
  "You don't know if the price is fair.",
  "You don't know who to trust.",
];

export default function ProblemSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="bg-white section-padding" ref={ref}>
      <div className="container-custom max-w-4xl text-center">

        {/* Pain points */}
        <div className="space-y-6 mb-14">
          {PAIN_POINTS.map((point, i) => (
            <motion.p
              key={i}
              className="text-2xl md:text-4xl font-semibold leading-snug"
              style={{ color: "#374151" }}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.35, ease: "easeOut" }}
            >
              {point}
            </motion.p>
          ))}
        </div>

        {/* Divider */}
        <motion.div
          className="flex justify-center mb-14"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 1.2, ease: "easeOut" }}
          style={{ transformOrigin: "center" }}
        >
          <div
            style={{
              width: "60px",
              height: "3px",
              borderRadius: "999px",
              background: "#0A5C36",
            }}
          />
        </motion.div>

        {/* Reveal */}
        <motion.h2
          className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05]"
          style={{ color: "#0A5C36" }}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1.6, ease: "easeOut" }}
        >
          That&apos;s exactly why we built SolarCheck.
        </motion.h2>

      </div>
    </section>
  );
}