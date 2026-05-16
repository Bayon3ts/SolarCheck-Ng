"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════ */
/* Navbar — Stitch Design Reference        */
/* Transparent on hero → white on scroll   */
/* ═══════════════════════════════════════ */

const NAV_LINKS = [
  { href: "/solar-installers", label: "Find Installers" },
  { href: "/solar-calculator", label: "Cost Calculator" },
  { href: "/blog", label: "Solar Guide" },
  { href: "/for-installers", label: "For Installers" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const showTransparent = isHomePage && !isScrolled;

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
        <nav className="container-custom flex h-16 items-center justify-between md:h-20">
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
          <div className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === link.href
                    ? showTransparent
                      ? "text-white"
                      : "text-primary"
                    : showTransparent
                      ? "text-white/80"
                      : "text-text-muted"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/solar-calculator"
              className="text-sm font-semibold text-accent hover:underline transition-colors"
            >
              Calculate Savings →
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
          >
            {isMobileOpen ? (
              <X className={cn("h-6 w-6", showTransparent ? "text-white" : "text-text-primary")} />
            ) : (
              <Menu className={cn("h-6 w-6", showTransparent ? "text-white" : "text-text-primary")} />
            )}
          </button>
        </nav>
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
          >
            <div className="container-custom flex flex-col gap-1 py-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-4 py-4 text-lg font-medium transition-colors",
                    pathname === link.href
                      ? "bg-primary/5 text-primary"
                      : "text-text-primary hover:bg-gray-50"
                  )}
                >
                  {link.label}
                  <ChevronRight className="h-5 w-5 text-text-muted" />
                </Link>
              ))}
              <div className="mt-6 space-y-3 px-4">
                <Button variant="primary" size="lg" className="w-full" asChild>
                  <Link href="/get-quotes">Get Free Quotes</Link>
                </Button>
                <Button variant="outline" size="lg" className="w-full" asChild>
                  <Link href="/for-installers">List Your Company</Link>
                </Button>
              </div>
              <div className="border-t border-gray-100 mt-4 pt-4 px-5 pb-4">
                <p className="text-xs text-gray-500 font-medium mb-2">
                  Free solar calculator
                </p>
                <Link 
                  href="/solar-calculator"
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
