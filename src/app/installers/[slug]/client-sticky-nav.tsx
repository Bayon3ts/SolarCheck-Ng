"use client";

import { useState, useEffect } from "react";

interface StickyNavProps {
  price?: number;
  installerName: string;
}

export default function ClientStickyNav({ price, installerName }: StickyNavProps) {
  const [isSticky, setIsSticky] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky nav after scrolling past the hero/header section
      if (window.scrollY > 400) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }

      // Very simple active section detection
      const sections = ["overview", "specifications", "workflow", "company", "reviews"];
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && window.scrollY >= el.offsetTop - 150) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({
        top: el.offsetTop - 120,
        behavior: "smooth"
      });
    }
  };

  if (!isSticky) return null;

  return (
    <div className="fixed top-[72px] left-0 right-0 z-40 bg-white border-b border-border shadow-sm animate-in slide-in-from-top-2 duration-300">
      <div className="container-custom flex items-center justify-between py-3">
        {/* Nav Links (Hidden on small screens) */}
        <nav className="hidden md:flex items-center gap-6">
          {[
            { to: "overview", label: "Overview" },
            { to: "specifications", label: "Specifications" },
            { to: "workflow", label: "Workflow" },
            { to: "company", label: "Company Profile" },
            { to: "reviews", label: "Reviews" },
          ].map((link) => (
            <button
              key={link.to}
              onClick={() => scrollToSection(link.to)}
              className={`text-sm font-medium pb-1 transition-colors ${
                activeSection === link.to
                  ? "text-primary font-bold border-b-2 border-primary"
                  : "text-text-muted hover:text-primary"
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4 ml-auto">
          {/* Price Summary */}
          {price && (
            <div className="hidden sm:block text-right">
              <div className="text-xs text-text-muted">Starting from</div>
              <div className="text-sm font-bold text-text-primary">
                ₦{price.toLocaleString()} / Watt
              </div>
            </div>
          )}
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="btn-primary py-2 px-6 text-sm"
          >
            Check Availability
          </button>
        </div>
      </div>
    </div>
  );
}
