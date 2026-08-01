"use client";

import { motion } from "framer-motion";

export function CalculatorHero() {
  return (
    <div className="text-center py-14 bg-gradient-to-b from-primary to-primary-dark px-4 mb-12 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-xs font-semibold px-4 py-2 rounded-full mb-6">
          <motion.span 
            className="text-accent inline-block"
            animate={{ 
              rotate: [0, 15, -15, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
          >
            ⚡
          </motion.span>
          Free — installers charge{" "}
          <span className="line-through decoration-white/50 tabular-nums">₦25,000–₦50,000</span>{" "}
          for this
        </div>
      </motion.div>

      <motion.h1 
        className="text-3xl md:text-5xl font-black mb-4 tracking-tight"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 0.7, 
          type: "spring",
          bounce: 0.4,
          delay: 0.1 
        }}
      >
        <motion.span
          animate={{ 
            color: ["#FFFFFF", "#F5A623", "#FFFFFF"],
            textShadow: [
              "0px 0px 0px rgba(255,255,255,0)", 
              "0px 0px 25px rgba(245,166,35,0.6)", 
              "0px 0px 0px rgba(255,255,255,0)"
            ]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          Free Solar Load Analysis
        </motion.span>
      </motion.h1>

      <motion.p 
        className="text-white/80 max-w-xl mx-auto text-base md:text-lg leading-relaxed mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.3 }}
      >
        Enter your appliances below and get a complete load analysis —{" "}
        <span className="text-white font-medium">the same report installers charge for.</span>{" "}
        Includes exact system sizing, Naira pricing, and payback date.
      </motion.p>

      {/* Trust pills */}
      <motion.div 
        className="flex flex-wrap items-center justify-center gap-3 mt-5"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.1,
              delayChildren: 0.5
            }
          }
        }}
      >
        {[
          '✓ Free forever',
          '✓ No installer visit needed',
          '✓ Live fuel prices',
          '✓ Naira pricing',
        ].map(item => (
          <motion.span 
            key={item} 
            className="text-xs text-white/70 bg-white/10 px-3 py-1 rounded-full cursor-default"
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
            }}
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,1)" }}
          >
            {item}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}
