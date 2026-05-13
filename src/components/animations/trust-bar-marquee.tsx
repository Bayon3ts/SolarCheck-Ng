"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/* ═══════════════════════════════════════ */
/* TrustBarMarquee — GSAP infinite scroll  */
/* Stitch: dark semi-transparent band      */
/* ═══════════════════════════════════════ */

const TRUST_ITEMS = [
  "500+ Verified Installers",
  "12,000+ Homeowners Matched",
  "4.8★ Average Rating",
  "Lagos",
  "Abuja",
  "Port Harcourt",
  "Ibadan",
  "Kano",
  "Benin City",
  "Enugu",
];

export default function TrustBarMarquee() {
  const containerRef = useRef<HTMLDivElement>(null);
  const track1Ref = useRef<HTMLDivElement>(null);
  const track2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!track1Ref.current || !track2Ref.current) return;

    const tl = gsap.timeline({ repeat: -1 });

    // Set initial positions
    gsap.set(track2Ref.current, { xPercent: 100 });

    tl.to([track1Ref.current, track2Ref.current], {
      xPercent: "-=100",
      duration: 30,
      ease: "none",
    });

    return () => {
      tl.kill();
    };
  }, []);

  const renderItems = () =>
    TRUST_ITEMS.map((item, i) => (
      <span key={i} className="flex items-center whitespace-nowrap">
        <span className="text-sm text-white/75 font-medium tracking-wide">{item}</span>
        <span className="mx-8 text-white/40">◆</span>
      </span>
    ));

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden w-full bg-black/35 backdrop-blur shadow-inner"
    >
      <div className="flex py-4">
        <div ref={track1Ref} className="flex shrink-0">
          {renderItems()}
        </div>
        <div ref={track2Ref} className="flex shrink-0">
          {renderItems()}
        </div>
      </div>
    </div>
  );
}
