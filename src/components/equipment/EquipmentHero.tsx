"use client";

import { motion } from "framer-motion";

interface EquipmentHeroProps {
  emoji: string
  badge: string
  title: string
  description: string
  updatedText: string
}

export default function EquipmentHero({
  emoji,
  badge,
  title,
  description,
  updatedText,
}: EquipmentHeroProps) {
  return (
    <div className="text-center pt-32 pb-12 bg-gradient-to-b from-primary to-primary-dark px-4 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-xs font-semibold px-4 py-2 rounded-full mb-6 backdrop-blur-sm">
          <motion.span 
            className="text-accent inline-block"
            animate={{ 
              rotate: [0, 15, -15, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
          >
            {emoji}
          </motion.span>
          {badge}
        </div>
      </motion.div>

      <motion.h1 
        className="text-3xl md:text-5xl font-black mb-4 tracking-tight max-w-4xl mx-auto"
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
          {title}
        </motion.span>
      </motion.h1>

      <motion.p 
        className="text-white/80 max-w-2xl mx-auto text-base md:text-lg leading-relaxed mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.3 }}
      >
        {description}
      </motion.p>
      
      <motion.p 
        className="text-white/55 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.5 }}
      >
        {updatedText}
      </motion.p>
    </div>
  )
}
