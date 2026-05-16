"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, Mail } from "lucide-react";

const WHY_LINKS = [
  { href: "/for-installers", label: "How we verify installers" },
  { href: "/blog", label: "How our reviews work" },
  { href: "/about", label: "About SolarCheck" },
  { href: "/contact", label: "Contact us" },
];

const RESOURCE_LINKS = [
  { href: "/solar-installers", label: "Installer directory" },
  { href: "/solar-calculator", label: "Solar calculator" },
  { href: "/get-quotes", label: "Get free quotes" },
  { href: "/for-installers", label: "For installers" },
  { href: "/blog", label: "Blog" },
];

const LEARN_LINKS = [
  { href: "/blog", label: "Cost of solar in Nigeria" },
  { href: "/blog", label: "Solar vs generator Nigeria" },
  { href: "/blog", label: "Best solar panels Nigeria" },
  { href: "/blog", label: "Solar payback period" },
  { href: "/solar-installers/lagos", label: "Solar in Lagos" },
];

export default function Footer() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const showBadge = (pathname === "/" || pathname === "/get-quotes") && mounted;

  if (!mounted) {
    return null;
  }

  return (
    <>
      <div className="bg-primary/5 border-t border-primary/10">
        <div className="max-w-screen-xl mx-auto px-4 md:px-10 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="font-bold text-primary text-lg">
                Stay updated on Nigerian solar
              </p>
              <p className="text-gray-600 text-sm">
                Price updates, installer news, and money-saving tips. Weekly.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full sm:flex-1 md:w-64 px-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary"
              />
              <button 
                type="button"
                className="w-full sm:w-auto bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium whitespace-nowrap hover:bg-primary/90 transition"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="bg-primary-dark">
        {/* Top border */}
        <div className="h-px bg-white/10" />

        <div className="container-custom py-16 md:py-20">
          {showBadge && (
            <div className="flex items-center gap-3 mb-10 p-3 bg-white/10 rounded-xl border border-white/20 max-w-lg">
              <div className="text-2xl flex-shrink-0">✅</div>
              <div>
                <p className="text-white font-semibold text-sm">SolarCheck Verified Installers</p>
                <p className="text-white/70 text-xs">
                  Every installer is verified, reviewed, and rated by real Nigerian homeowners. Free to contact. No obligation.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
            {/* Brand column */}
            <div className="space-y-6">
              <Link href="/" className="flex items-center gap-2">
                <Sun className="h-7 w-7 text-accent" />
                <span className="text-xl font-bold text-white tracking-tight">
                  Solar<span className="text-accent">Check</span>
                </span>
              </Link>
              <p className="text-sm leading-relaxed text-white/60">
                Nigeria&apos;s most trusted solar installer comparison platform. 
                Find verified companies, read real reviews, and get free quotes.
              </p>
              <div className="mt-4 space-y-1">
                <p className="text-sm text-white/60">
                  Installers: 
                  <a href="tel:+2348000000000" className="text-accent ml-1">
                    0800-SOLARNG
                  </a>
                </p>
                <p className="text-sm text-white/60">
                  Homeowners:
                  <a href="tel:+2348001234567" className="text-accent ml-1">
                    0800-SOLAR01
                  </a>
                </p>
              </div>
              <div className="flex items-center gap-4 mt-6">
                {/* Social icons - placeholder links */}
                {["twitter", "instagram", "linkedin", "facebook"].map((social) => (
                  <a
                    key={social}
                    href={`https://${social}.com/solarcheckng`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                    aria-label={social}
                  >
                    <span className="text-xs font-bold uppercase">
                      {social.charAt(0)}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* Why SolarCheck */}
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/40">
                Why SolarCheck
              </h4>
              <ul className="space-y-3">
                {WHY_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/40">
                Resources
              </h4>
              <ul className="space-y-3">
                {RESOURCE_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Learn More */}
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/40">
                Learn More
              </h4>
              <ul className="space-y-3">
                {LEARN_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-6 space-y-2">
                <a
                  href="mailto:hello@solarcheckng.com"
                  className="flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
                >
                  <Mail className="h-4 w-4" />
                  hello@solarcheckng.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10">
          <div className="container-custom flex flex-col items-center justify-between gap-4 py-6 md:flex-row">
            <div className="flex flex-wrap justify-center gap-4 text-xs text-white/40">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link>
            </div>
            <p className="text-xs text-center text-white/40">
              © {new Date().getFullYear()} SolarCheck Nigeria. All rights reserved.
            </p>
            <Link
              href="/for-installers"
              className="text-xs font-medium text-center text-accent transition-colors hover:text-accent-light"
            >
              Installers: List your company free →
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
