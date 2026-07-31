"use client";

import { useEffect, useState } from "react";
import { ArrowDown } from "lucide-react";

interface ScrollDownIndicatorProps {
  isVisible: boolean;
  targetId?: string; // Optional ID to scroll to when clicked
}

export default function ScrollDownIndicator({ isVisible, targetId }: ScrollDownIndicatorProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      const initialScroll = window.scrollY;
      
      const handleScroll = () => {
        if (Math.abs(window.scrollY - initialScroll) > 50) {
          setShow(false);
        }
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    } else {
      setShow(false);
    }
  }, [isVisible]);

  if (!show) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 md:hidden animate-bounce">
      <button 
        onClick={() => {
          if (targetId) {
            document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
          } else {
            window.scrollBy({ top: 300, behavior: 'smooth' });
          }
          setShow(false);
        }}
        className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-white shadow-xl hover:bg-primary-dark transition-colors focus:outline-none focus:ring-4 focus:ring-primary/30"
        aria-label="Scroll down to see results"
      >
        <ArrowDown className="h-6 w-6" />
      </button>
    </div>
  );
}
