import Link from "next/link";
import { Sun, Mail, Phone } from "lucide-react";

/* ═══════════════════════════════════════ */
/* Footer — Stitch Design Reference        */
/* Dark #0D1B12 bg, 4-column layout        */
/* ═══════════════════════════════════════ */

const COMPANY_LINKS = [
  { href: "/about", label: "About Us" },
  { href: "/for-installers", label: "For Installers" },
  { href: "/blog", label: "Solar Guide" },
  { href: "/get-quotes", label: "Get Quotes" },
  { href: "/contact", label: "Contact" },
];

const CITY_LINKS = [
  { href: "/solar-installers/lagos/lekki", label: "Lagos" },
  { href: "/solar-installers/federal-capital-territory/maitama", label: "Abuja" },
  { href: "/solar-installers/rivers/port-harcourt", label: "Port Harcourt" },
  { href: "/solar-installers/oyo/ibadan", label: "Ibadan" },
  { href: "/solar-installers/kano/kano", label: "Kano" },
  { href: "/solar-installers/edo/benin-city", label: "Benin City" },
];

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/cookies", label: "Cookie Policy" },
];

export default function Footer() {
  return (
    <footer className="bg-primary-dark">
      {/* Top border */}
      <div className="h-px bg-white/10" />

      <div className="container-custom py-16 md:py-20">
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
            <div className="flex items-center gap-4">
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

          {/* Company links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/40">
              Company
            </h4>
            <ul className="space-y-3">
              {COMPANY_LINKS.map((link) => (
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

          {/* Top cities */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/40">
              Top Cities
            </h4>
            <ul className="space-y-3">
              {CITY_LINKS.map((link) => (
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

          {/* Legal + contact */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/40">
              Legal
            </h4>
            <ul className="space-y-3">
              {LEGAL_LINKS.map((link) => (
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
              <a
                href="tel:+2348001234567"
                className="flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
              >
                <Phone className="h-4 w-4" />
                0800-SOLAR-NG
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-custom flex flex-col items-center justify-between gap-4 py-6 md:flex-row">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} SolarCheck Nigeria. All rights reserved.
          </p>
          <Link
            href="/for-installers"
            className="text-xs font-medium text-accent transition-colors hover:text-accent-light"
          >
            Installers: List your company free →
          </Link>
        </div>
      </div>
    </footer>
  );
}
