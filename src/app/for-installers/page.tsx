import { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, TrendingUp, Users, Zap, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "For Solar Installers | Grow Your Business with SolarCheck",
  description: "Join Nigeria's #1 network of verified solar installers. Get exclusive, high-intent leads and build trust with verified customer reviews.",
};

const BENEFITS = [
  {
    icon: TrendingUp,
    title: "High-Intent Leads",
    description: "We filter out the noise. Our leads have high purchasing intent, complete with monthly bill estimates and location data."
  },
  {
    icon: ShieldCheck,
    title: "Instant Trust",
    description: "The SolarCheck Verified Badge proves to homeowners that your company is legitimate, vetted, and reliable."
  },
  {
    icon: Users,
    title: "Fair Competition",
    description: "We only match leads with a maximum of 3 verified installers. No race to the bottom on pricing."
  },
  {
    icon: Zap,
    title: "Direct WhatsApp Delivery",
    description: "Leads are sent instantly to your WhatsApp and email. Respond fast and close more deals."
  }
];

export default function ForInstallersPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-24 pb-20">
        {/* Hero Section */}
        <section className="bg-primary-dark text-white py-20 px-4 md:px-0 rounded-b-[3rem] md:rounded-b-[5rem] overflow-hidden relative">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-accent via-transparent to-transparent" />
          
          <div className="container-custom relative z-10 text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Stop Chasing Leads. <br className="hidden md:block" />
              <span className="text-accent">Let Them Find You.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              Join Nigeria&apos;s most trusted solar installer network. Get verified, build your reputation, and receive high-quality residential and commercial leads.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto" asChild>
                <Link href="/installers/register">Apply for Verification</Link>
              </Button>
              <p className="text-sm text-white/50">Approval takes 24-48 hours.</p>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="container-custom py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary">Why Join SolarCheck?</h2>
            <p className="text-text-muted mt-4 max-w-2xl mx-auto">
              We&apos;re changing how Nigerians buy solar by bringing transparency to the market. Be part of the solution.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {BENEFITS.map((b, i) => (
              <div key={i} className="card p-6 border-transparent hover:border-primary/20 transition-colors">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <b.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-3">{b.title}</h3>
                <p className="text-text-muted leading-relaxed">{b.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing/Plans Section */}
        <section className="bg-gray-50 py-20 border-y border-border">
          <div className="container-custom">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary">Simple, Transparent Pricing</h2>
              <p className="text-text-muted mt-4">Choose the plan that fits your business goals.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Free Plan */}
              <div className="card p-8 bg-white border border-border">
                <h3 className="text-2xl font-bold text-text-primary mb-2">Verified Basic</h3>
                <p className="text-text-muted mb-6">For new installers building trust.</p>
                <div className="text-4xl font-bold text-text-primary mb-8">
                  Free <span className="text-lg font-normal text-text-muted">/forever</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-text-muted"><CheckCircle2 className="h-5 w-5 text-primary" /> Verified Profile Page</li>
                  <li className="flex items-center gap-3 text-text-muted"><CheckCircle2 className="h-5 w-5 text-primary" /> Collect Customer Reviews</li>
                  <li className="flex items-center gap-3 text-text-muted"><CheckCircle2 className="h-5 w-5 text-primary" /> Standard Directory Listing</li>
                  <li className="flex items-center gap-3 text-text-muted opacity-50"><CheckCircle2 className="h-5 w-5 text-gray-300" /> Pay-per-lead only</li>
                </ul>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/installers/register?plan=free">Get Started Free</Link>
                </Button>
              </div>

              {/* Featured Plan */}
              <div className="card p-8 bg-primary-dark text-white shadow-xl relative transform md:-translate-y-4">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-accent text-primary-dark text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Most Popular
                </div>
                <h3 className="text-2xl font-bold mb-2">Featured</h3>
                <p className="text-white/70 mb-6">For growing solar businesses.</p>
                <div className="text-4xl font-bold text-accent mb-8">
                  ₦25k <span className="text-lg font-normal text-white/50">/month</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-accent" /> Everything in Basic</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-accent" /> Featured Directory Ranking</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-accent" /> 5 Free Shared Leads/mo</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-accent" /> Priority Support</li>
                </ul>
                <Button variant="secondary" className="w-full text-primary-dark" asChild>
                  <Link href="/installers/register?plan=featured">Choose Featured</Link>
                </Button>
              </div>

              {/* Premium Plan */}
              <div className="card p-8 bg-white border border-border">
                <h3 className="text-2xl font-bold text-text-primary mb-2">Premium Partner</h3>
                <p className="text-text-muted mb-6">Dominate your local market.</p>
                <div className="text-4xl font-bold text-text-primary mb-8">
                  ₦75k <span className="text-lg font-normal text-text-muted">/month</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-text-muted"><CheckCircle2 className="h-5 w-5 text-primary" /> Everything in Featured</li>
                  <li className="flex items-center gap-3 text-text-muted"><CheckCircle2 className="h-5 w-5 text-primary" /> Top 3 Directory Guarantee</li>
                  <li className="flex items-center gap-3 text-text-muted"><CheckCircle2 className="h-5 w-5 text-primary" /> 10 Free Shared Leads/mo</li>
                  <li className="flex items-center gap-3 text-text-muted"><CheckCircle2 className="h-5 w-5 text-primary" /> Access to Exclusive Leads</li>
                </ul>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/installers/register?plan=premium">Choose Premium</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
