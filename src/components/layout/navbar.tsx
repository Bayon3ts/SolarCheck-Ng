"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════ */
/* Navbar — Stitch Design Reference        */
/* Transparent on hero → white on scroll   */
/* ═══════════════════════════════════════ */

const BUTTON_LABELS = [
  'Calculate My Savings →',
  'Calculate Now →',
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Mega menu states
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [labelIndex, setLabelIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLabelIndex(prev => prev === 0 ? 1 : 0);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Mobile accordion states
  const [mobileMegaOpen, setMobileMegaOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMobileOpen(false);
    setMegaMenuOpen(false);
    setMobileMegaOpen(false);
  }, [pathname]);

  // Handle focus trap and escape for mobile menu
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setIsMobileOpen(false);
        }
        // Basic focus trap
        if (e.key === "Tab" && mobileMenuRef.current) {
          const focusableElements = mobileMenuRef.current.querySelectorAll(
            'a[href], button:not([disabled]), textarea, input, select'
          );
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement?.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement?.focus();
            }
          }
        }
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isMobileOpen]);

  // Handle escape for desktop mega menu
  useEffect(() => {
    if (megaMenuOpen) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") setMegaMenuOpen(false);
      };
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [megaMenuOpen]);

  const showTransparent = isHomePage && !isScrolled;

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setMegaMenuOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setMegaMenuOpen(false);
    }, 150);
  };

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setMegaMenuOpen((prev) => !prev);
    }
  };

  const toggleAccordion = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          showTransparent
            ? "bg-transparent"
            : "bg-white/95 backdrop-blur-md shadow-nav"
        )}
      >
        <nav className="container-custom relative flex h-16 items-center justify-between md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Sun
              className={cn(
                "h-7 w-7 transition-colors",
                showTransparent ? "text-accent" : "text-primary"
              )}
            />
            <span
              className={cn(
                "text-xl font-bold tracking-tight transition-colors",
                showTransparent ? "text-white" : "text-primary-dark"
              )}
            >
              Solar<span className="text-accent">Check</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden items-center gap-8 md:flex h-full">
            <Link
              href="/solar-installers"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === "/solar-installers"
                  ? showTransparent
                    ? "text-white"
                    : "text-primary"
                  : showTransparent
                    ? "text-white/80"
                    : "text-text-muted"
              )}
            >
              Find Installers
            </Link>

            {/* Mega Menu Trigger */}
            <div 
              className="h-full flex items-center"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                aria-expanded={megaMenuOpen}
                aria-haspopup="true"
                onKeyDown={handleTriggerKeyDown}
                className={cn(
                  "flex items-center gap-1 font-medium text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md px-1 py-0.5",
                  megaMenuOpen || pathname.includes("/blog") || pathname.includes("/guides")
                    ? showTransparent
                      ? "text-white"
                      : "text-primary"
                    : showTransparent
                      ? "text-white/80"
                      : "text-text-muted",
                  "hover:text-primary"
                )}
              >
                Solar Guide
                <ChevronDown className={cn(
                  "w-4 h-4 transition-transform",
                  megaMenuOpen ? "rotate-180" : ""
                )}/>
              </button>
            </div>

            <Link
              href="/for-installers"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === "/for-installers"
                  ? showTransparent
                    ? "text-white"
                    : "text-primary"
                  : showTransparent
                    ? "text-white/80"
                    : "text-text-muted"
              )}
            >
              For Installers
            </Link>

            <Link
              href="/solar-calculator"
              className="text-sm font-semibold text-accent hover:underline transition-colors"
            >
              Solar Calculator →
            </Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-3 md:flex">
            <Button variant={showTransparent ? "secondary" : "primary"} size="sm" asChild>
              <Link href="/get-quotes">
                Get Free Quotes
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMobileOpen}
          >
            {isMobileOpen ? (
              <X className={cn("h-6 w-6", showTransparent ? "text-white" : "text-text-primary")} />
            ) : (
              <Menu className={cn("h-6 w-6", showTransparent ? "text-white" : "text-text-primary")} />
            )}
          </button>
        </nav>

        {/* Desktop Mega Menu Dropdown */}
        <AnimatePresence>
          {megaMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="absolute top-full left-0 right-0 bg-white border-t border-border shadow-2xl z-50 hidden md:grid grid-cols-4 gap-0"
            >
              {/* ── Column 1: Calculator Promo ── */}
              <div className="bg-primary/5 p-8 border-r border-border">
                <div className="text-2xl mb-3">☀️</div>
                <h3 className="font-bold text-base text-text-primary mb-2">
                  Free Load Analysis
                </h3>
                
                {/* New badge */}
                <div className="inline-flex items-center gap-1.5 bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full mb-3">
                  <span>💰</span>
                  Installers charge ₦25k–₦50k for this
                </div>

                <p className="text-sm text-text-muted mb-4 leading-relaxed">
                  Get a complete solar load analysis for your home — free. See exactly what system you need, what it costs in Naira, and when you break even. No installer visit required.
                </p>
                <Link
                  href="/solar-calculator"
                  onClick={() => setMegaMenuOpen(false)}
                  className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-primary-dark transition-colors overflow-hidden min-w-[200px] justify-center"
                >
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={labelIndex}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                    >
                      {BUTTON_LABELS[labelIndex]}
                    </motion.span>
                  </AnimatePresence>
                </Link>
                
                {/* Trust signal */}
                <p className="text-xs text-text-muted mt-4">
                  Free · No sign up · Replaces paid load analysis
                </p>
              </div>

              {/* ── Column 2: Reviews ── */}
              <div className="p-8 border-r border-border">
                <h4 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4">
                  Reviews
                </h4>
                <div className="space-y-3">
                  {[
                    { label: 'Solar Installers', href: '/solar-installers', desc: 'Find verified installers' },
                    { label: 'Solar Panels', href: '/solar-panels', desc: 'Jinko, LONGi, Canadian & more' },
                    { label: 'Solar Inverters', href: '/solar-inverters', desc: 'Growatt, Deye, Victron & more' },
                    { label: 'Solar Batteries', href: '/solar-batteries', desc: 'LFP vs Lead-Acid compared' },
                  ].map(item => (
                    <Link key={item.href} href={item.href}
                      onClick={() => setMegaMenuOpen(false)}
                      className="group flex flex-col hover:text-primary transition-colors">
                      <span className="text-sm font-semibold text-text-primary group-hover:text-primary">
                        {item.label}
                      </span>
                      <span className="text-xs text-text-muted">
                        {item.desc}
                      </span>
                    </Link>
                  ))}
                  
                  <div className="pt-2 border-t border-border">
                    <Link href="/write-review"
                      onClick={() => setMegaMenuOpen(false)}
                      className="text-sm text-primary font-semibold hover:underline">
                      Write a review →
                    </Link>
                  </div>
                </div>
              </div>

              {/* ── Column 3: Guides ── */}
              <div className="p-8 border-r border-border">
                <h4 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4">
                  Guides
                </h4>
                <div className="space-y-3">
                  {[
                    { label: 'Solar cost in Nigeria', href: '/guides/solar-cost-nigeria' },
                    { label: 'Solar vs generator', href: '/guides/solar-vs-generator-nigeria' },
                    { label: 'How many panels do I need?', href: '/guides/how-many-solar-panels-nigeria' },
                    { label: 'Is solar worth it?', href: '/guides/is-solar-worth-it-nigeria' },
                    { label: 'LFP vs Lead-Acid batteries', href: '/guides/lfp-vs-lead-acid-nigeria' },
                    { label: 'Growatt vs Deye', href: '/guides/growatt-vs-deye-nigeria' },
                    { label: 'Avoid solar scams', href: '/guides/avoid-solar-scams-nigeria' },
                  ].map(item => (
                    <Link key={item.href} href={item.href}
                      onClick={() => setMegaMenuOpen(false)}
                      className="block text-sm text-text-primary hover:text-primary transition-colors">
                      {item.label}
                    </Link>
                  ))}
                  
                  <div className="pt-2 border-t border-border">
                    <Link href="/blog"
                      onClick={() => setMegaMenuOpen(false)}
                      className="text-sm text-primary font-semibold hover:underline">
                      See all guides →
                    </Link>
                  </div>
                </div>
              </div>

              {/* ── Column 4: Nigerian Power ── */}
              <div className="p-8 bg-gray-50/50 h-full">
                <h4 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4">
                  🇳🇬 Nigerian Power
                </h4>
                <div className="space-y-3">
                  {[
                    { label: 'NEPA Band Checker', href: '/nepa-bands', badge: 'Tool' },
                    { label: 'Lagos Feeder Lookup', href: '/lagos-feeders', badge: 'Tool' },
                    { label: 'Live Fuel Prices', href: '/fuel-prices', badge: 'Live' },
                    { label: 'Solar for Businesses', href: '/solar-for-business', badge: null },
                    { label: 'Solar for Clinics', href: '/solar-for-clinics', badge: null },
                    { label: 'Solar for Boreholes', href: '/solar-for-boreholes', badge: null },
                  ].map(item => (
                    <Link key={item.href} href={item.href}
                      onClick={() => setMegaMenuOpen(false)}
                      className="flex items-center justify-between group">
                      <span className="text-sm text-text-primary group-hover:text-primary transition-colors">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className={cn(
                          "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full",
                          item.badge === 'Live' ? "bg-green-100 text-green-700" : "bg-primary/10 text-primary"
                        )}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>

                {/* Compare tools quick access */}
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs font-bold text-text-muted mb-2">
                    Compare Tools
                  </p>
                  {[
                    { label: 'Compare Panels', href: '/compare-panels' },
                    { label: 'Compare Batteries', href: '/compare-batteries' },
                    { label: 'Compare Inverters', href: '/compare-inverters' },
                  ].map(item => (
                    <Link key={item.href} href={item.href}
                      onClick={() => setMegaMenuOpen(false)}
                      className="block text-xs text-text-muted hover:text-primary py-0.5 transition-colors">
                      {item.label} →
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Menu — Full-screen slide-down */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-white pt-20 md:hidden overflow-y-auto pb-6"
            ref={mobileMenuRef}
          >
            {/* Mobile close button (Top Right Panel context fallback if they meant inside) */}
            <button 
              onClick={() => setIsMobileOpen(false)}
              className="absolute top-6 right-6 p-2 text-text-primary"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="container-custom flex flex-col gap-1 py-6 mt-4">
              <Link
                href="/solar-installers"
                className={cn(
                  "flex items-center justify-between rounded-xl px-4 py-4 text-lg font-medium transition-colors",
                  pathname === "/solar-installers"
                    ? "bg-primary/5 text-primary"
                    : "text-text-primary hover:bg-gray-50"
                )}
              >
                Find Installers
                <ChevronRight className="h-5 w-5 text-text-muted" />
              </Link>

              {/* Mobile Mega Menu Accordion */}
              <div className="flex flex-col rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => setMobileMegaOpen(!mobileMegaOpen)}
                  aria-expanded={mobileMegaOpen}
                  className={cn(
                    "flex items-center justify-between px-4 py-4 text-lg font-medium transition-colors",
                    mobileMegaOpen || pathname.includes("/blog") || pathname.includes("/guides")
                      ? "bg-primary/5 text-primary"
                      : "text-text-primary hover:bg-gray-50"
                  )}
                >
                  Solar Guide
                  <ChevronDown className={cn(
                    "h-5 w-5 transition-transform",
                    mobileMegaOpen ? "rotate-180 text-primary" : "text-text-muted"
                  )} />
                </button>

                <AnimatePresence>
                  {mobileMegaOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-gray-50/50"
                    >
                      <div className="px-4 py-2 space-y-2">
                        {/* Mobile Accordion: Reviews */}
                        <div className="rounded-lg bg-white border border-border overflow-hidden">
                          <button 
                            onClick={() => toggleAccordion('reviews')}
                            className="w-full flex items-center justify-between p-3 text-sm font-bold text-text-primary"
                          >
                            Reviews
                            <ChevronDown className={cn("w-4 h-4 transition-transform", expandedSection === 'reviews' && "rotate-180")} />
                          </button>
                          <AnimatePresence>
                            {expandedSection === 'reviews' && (
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: "auto" }}
                                exit={{ height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="px-3 pb-3 space-y-2 flex flex-col">
                                  {[
                                    { label: 'Solar Installers', href: '/solar-installers' },
                                    { label: 'Solar Panels', href: '/solar-panels' },
                                    { label: 'Solar Inverters', href: '/solar-inverters' },
                                    { label: 'Solar Batteries', href: '/solar-batteries' },
                                  ].map(item => (
                                    <Link key={item.href} href={item.href} onClick={() => setIsMobileOpen(false)} className="text-sm text-text-muted py-1 hover:text-primary">
                                      {item.label}
                                    </Link>
                                  ))}
                                  <Link href="/write-review" onClick={() => setIsMobileOpen(false)} className="text-sm font-semibold text-primary py-1 mt-1">
                                    Write a review →
                                  </Link>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Mobile Accordion: Guides */}
                        <div className="rounded-lg bg-white border border-border overflow-hidden">
                          <button 
                            onClick={() => toggleAccordion('guides')}
                            className="w-full flex items-center justify-between p-3 text-sm font-bold text-text-primary"
                          >
                            Guides
                            <ChevronDown className={cn("w-4 h-4 transition-transform", expandedSection === 'guides' && "rotate-180")} />
                          </button>
                          <AnimatePresence>
                            {expandedSection === 'guides' && (
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: "auto" }}
                                exit={{ height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="px-3 pb-3 space-y-2 flex flex-col">
                                  {[
                                    { label: 'Solar cost in Nigeria', href: '/guides/solar-cost-nigeria' },
                                    { label: 'Solar vs generator', href: '/guides/solar-vs-generator-nigeria' },
                                    { label: 'How many panels do I need?', href: '/guides/how-many-solar-panels-nigeria' },
                                    { label: 'Is solar worth it?', href: '/guides/is-solar-worth-it-nigeria' },
                                    { label: 'LFP vs Lead-Acid batteries', href: '/guides/lfp-vs-lead-acid-nigeria' },
                                  ].map(item => (
                                    <Link key={item.href} href={item.href} onClick={() => setIsMobileOpen(false)} className="text-sm text-text-muted py-1 hover:text-primary">
                                      {item.label}
                                    </Link>
                                  ))}
                                  <Link href="/blog" onClick={() => setIsMobileOpen(false)} className="text-sm font-semibold text-primary py-1 mt-1">
                                    See all guides →
                                  </Link>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Mobile Accordion: Nigerian Power */}
                        <div className="rounded-lg bg-white border border-border overflow-hidden">
                          <button 
                            onClick={() => toggleAccordion('power')}
                            className="w-full flex items-center justify-between p-3 text-sm font-bold text-text-primary"
                          >
                            🇳🇬 Nigerian Power
                            <ChevronDown className={cn("w-4 h-4 transition-transform", expandedSection === 'power' && "rotate-180")} />
                          </button>
                          <AnimatePresence>
                            {expandedSection === 'power' && (
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: "auto" }}
                                exit={{ height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="px-3 pb-3 space-y-2 flex flex-col">
                                  {[
                                    { label: 'NEPA Band Checker', href: '/nepa-bands', badge: 'Tool' },
                                    { label: 'Lagos Feeder Lookup', href: '/lagos-feeders', badge: 'Tool' },
                                    { label: 'Live Fuel Prices', href: '/fuel-prices', badge: 'Live' },
                                    { label: 'Solar for Businesses', href: '/solar-for-business' },
                                    { label: 'Solar for Clinics', href: '/solar-for-clinics' },
                                  ].map(item => (
                                    <Link key={item.href} href={item.href} onClick={() => setIsMobileOpen(false)} className="flex items-center justify-between text-sm text-text-muted py-1 hover:text-primary">
                                      {item.label}
                                      {item.badge && (
                                        <span className={cn(
                                          "text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full",
                                          item.badge === 'Live' ? "bg-green-100 text-green-700" : "bg-primary/10 text-primary"
                                        )}>
                                          {item.badge}
                                        </span>
                                      )}
                                    </Link>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Mobile Accordion: Calculator CTA */}
                        <div className="rounded-lg bg-primary/5 border border-primary/20 overflow-hidden p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl">☀️</span>
                            <h3 className="font-bold text-sm text-text-primary">Solar Savings Calculator</h3>
                          </div>
                          <p className="text-xs text-text-muted mb-3">
                            Get exact Naira pricing for your home. Uses live fuel prices.
                          </p>
                          <Link href="/solar-calculator" onClick={() => setIsMobileOpen(false)} className="flex items-center justify-center w-full bg-primary text-white text-sm font-semibold py-2.5 rounded-lg">
                            Calculate My Savings →
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link
                href="/for-installers"
                className={cn(
                  "flex items-center justify-between rounded-xl px-4 py-4 text-lg font-medium transition-colors",
                  pathname === "/for-installers"
                    ? "bg-primary/5 text-primary"
                    : "text-text-primary hover:bg-gray-50"
                )}
              >
                For Installers
                <ChevronRight className="h-5 w-5 text-text-muted" />
              </Link>

              <div className="mt-6 space-y-3 px-4">
                <Button variant="primary" size="lg" className="w-full" asChild>
                  <Link href="/get-quotes" onClick={() => setIsMobileOpen(false)}>Get Free Quotes</Link>
                </Button>
                <Button variant="outline" size="lg" className="w-full" asChild>
                  <Link href="/for-installers" onClick={() => setIsMobileOpen(false)}>List Your Company</Link>
                </Button>
              </div>
              <div className="border-t border-gray-100 mt-4 pt-4 px-5 pb-4">
                <p className="text-xs text-gray-500 font-medium mb-2">
                  Free solar calculator
                </p>
                <Link 
                  href="/solar-calculator"
                  onClick={() => setIsMobileOpen(false)}
                  className="block w-full text-center bg-primary text-white font-semibold py-3 rounded-xl text-sm"
                >
                  Calculate My Savings →
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

