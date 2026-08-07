import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/animations/scroll-reveal";

export default function B2BCalloutSection() {
  return (
    <section className="bg-gray-50 py-16 md:py-24">
      <div className="container-custom">
        <ScrollReveal>
          <div className="bg-primary-dark border border-emerald-900/60 rounded-3xl p-8 sm:p-12 mb-16 sm:mb-24 text-center shadow-2xl relative overflow-hidden max-w-5xl mx-auto">
            {/* Subtle Glow */}
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 bg-emerald-900/60 text-emerald-300 border border-emerald-700/40 text-xs font-semibold rounded-full tracking-wider uppercase mb-4">
                FOR INSTALLERS & BRANDS
              </span>
              
              <h3 className="text-2xl sm:text-4xl font-bold text-white mb-3">
                Grow your solar business on SolarCheck
              </h3>
              
              <p className="text-emerald-100/80 max-w-2xl mx-auto text-sm sm:text-base mb-8">
                Get your products and installation services in front of thousands of Nigerian homeowners actively calculating solar costs.
              </p>
              
              <Link 
                href="/advertise"
                className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold px-7 py-3.5 rounded-xl transition-transform hover:scale-105 shadow-md"
              >
                Sponsor SolarCheck
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
