"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

const NIGERIAN_STATES = [
  "Lagos", "Abuja", "Kano", "Rivers", "Oyo", "Kaduna", "Ogun", "Anambra",
  "Delta", "Edo", "Enugu", "Imo", "Plateau", "Cross River", "Akwa Ibom",
  "Ondo", "Osun", "Kwara", "Katsina", "Bauchi", "Other",
];

export default function WarrantyRegisterPage() {
  const [form, setForm] = useState({
    homeowner_name: "",
    homeowner_phone: "",
    homeowner_email: "",
    state: "",
    installer_name_manual: "",
    system_size_kva: "",
    battery_kwh: "",
    panel_count: "",
    install_date: "",
    total_paid_naira: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.homeowner_name.trim() || !form.homeowner_phone.trim() || !form.state || !form.install_date) {
      setError("Please fill in your name, phone, state, and install date.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/warranty/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          homeowner_name: form.homeowner_name.trim(),
          homeowner_phone: form.homeowner_phone.trim(),
          homeowner_email: form.homeowner_email.trim() || undefined,
          state: form.state,
          installer_name_manual: form.installer_name_manual.trim() || undefined,
          system_size_kva: form.system_size_kva.trim() || undefined,
          battery_kwh: form.battery_kwh.trim() || undefined,
          panel_count: form.panel_count ? Number(form.panel_count) : undefined,
          install_date: form.install_date,
          total_paid_naira: form.total_paid_naira ? Number(form.total_paid_naira) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setDone(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1A5C38]/10 mb-4">
            <ShieldCheck className="w-7 h-7 text-[#1A5C38]" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            Register Your Solar Warranty
          </h1>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
            Just had your system installed? Register it with SolarCheck — free — so
            you always have a record, even if you lose your paperwork or switch phones.
          </p>
        </div>

        {done ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">You&apos;re all set!</h2>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              We&apos;ve saved your warranty details and sent a confirmation to your
              WhatsApp. We&apos;ll check in with you in a few weeks to see how your
              system is performing.
            </p>
            <Link href="/" className="inline-flex mt-6">
              <Button variant="outline">Back to home</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  value={form.homeowner_name}
                  onChange={(e) => update("homeowner_name", e.target.value)}
                  placeholder="e.g. Chinedu Okafor"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">WhatsApp Number *</label>
                <input
                  type="tel"
                  value={form.homeowner_phone}
                  onChange={(e) => update("homeowner_phone", e.target.value)}
                  placeholder="e.g. 08012345678"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email (optional)</label>
              <input
                type="email"
                value={form.homeowner_email}
                onChange={(e) => update("homeowner_email", e.target.value)}
                placeholder="e.g. chinedu@email.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">State *</label>
                <select
                  value={form.state}
                  onChange={(e) => update("state", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm bg-white"
                  required
                >
                  <option value="">Select state</option>
                  {NIGERIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Install Date *</label>
                <input
                  type="date"
                  value={form.install_date}
                  onChange={(e) => update("install_date", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Installer Name</label>
              <input
                type="text"
                value={form.installer_name_manual}
                onChange={(e) => update("installer_name_manual", e.target.value)}
                placeholder="e.g. SunPower Solutions Ltd"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">System Size</label>
                <input
                  type="text"
                  value={form.system_size_kva}
                  onChange={(e) => update("system_size_kva", e.target.value)}
                  placeholder="e.g. 5kVA"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Battery Size</label>
                <input
                  type="text"
                  value={form.battery_kwh}
                  onChange={(e) => update("battery_kwh", e.target.value)}
                  placeholder="e.g. 5.12kWh"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5"># of Panels</label>
                <input
                  type="number"
                  value={form.panel_count}
                  onChange={(e) => update("panel_count", e.target.value)}
                  placeholder="e.g. 8"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Total Paid (optional, ₦)</label>
              <input
                type="number"
                value={form.total_paid_naira}
                onChange={(e) => update("total_paid_naira", e.target.value)}
                placeholder="e.g. 2500000"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
              />
              <p className="text-xs text-slate-400 mt-1">
                Helps other homeowners compare real prices. Never shown publicly with your name.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {submitting ? "Registering..." : (<>Register My Warranty <ArrowRight className="w-4 h-4" /></>)}
            </button>
            <p className="text-center text-xs text-slate-400">
              Free forever · Takes 2 minutes · No spam
            </p>
          </form>
        )}
      </main>
      <Footer />
    </>
  );
}