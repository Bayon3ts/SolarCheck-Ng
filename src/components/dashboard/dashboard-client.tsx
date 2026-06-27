'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { Loader2, Eye, EyeOff } from 'lucide-react';

import { SidebarNav } from './sidebar-nav';
import { StatCard } from './stat-card';
import { LeadCard, Lead } from './lead-card';

/* ─────────────────── types ─────────────────── */

interface Installer {
  id: string;
  company_name: string;
  description: string;
  whatsapp: string;
  phone: string;
  website: string;
  services: string[];
  states_covered: string[];
  years_in_business: string;
  logo_url: string;
  subscription_tier: string;
  subscription_expires_at: string | null;
  slug: string;
  is_approved: boolean;
}

interface Props {
  installer: Installer;
  leads: Lead[];
  reviews: unknown[];
  isLoggedIn: boolean;
}

/* ═══════════════════════════════════════════════
   LOGIN OVERLAY (Carried over)
═══════════════════════════════════════════════ */

function LoginOverlay() {
  const [tab, setTab] = useState<'email' | 'whatsapp'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleEmailLogin = async () => {
    if (!email || !password) { setError('Enter your email and password'); return; }
    setLoading(true); setError('');
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(err.message === 'Invalid login credentials' ? 'Wrong email or password' : err.message);
      setLoading(false);
    } else {
      router.refresh();
    }
  };

  const handleForgot = async () => {
    if (!email) { setError('Enter your email above first'); return; }
    await supabase.auth.resetPasswordForEmail(email);
    setInfo('Password reset link sent! Check your inbox.');
  };

  const handleSendOtp = async () => {
    setLoading(true); setError('');
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error || 'Could not send OTP');
    else setOtpSent(true);
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    setLoading(true); setError('');
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code: otp }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Invalid code'); setLoading(false); return; }
    if (data.action_link) window.location.href = data.action_link;
    else router.refresh();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', background: 'rgba(13,27,18,0.55)' }}>
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-[#1A5E38] px-8 pt-8 pb-6">
          <Link href="/" className="text-2xl font-black text-white block mb-4">
            Solar<span className="text-[#F5A623]">Check</span>
          </Link>
          <h1 className="text-xl font-black text-white leading-tight">
            Sign in to your<br />Installer Dashboard
          </h1>
          <p className="text-white/60 text-sm mt-1">Manage your leads, profile &amp; reviews</p>
        </div>
        <div className="px-8 py-6">
          <div className="flex bg-gray-100 rounded-2xl p-1 mb-5">
            {([
              { id: 'email', label: '✉️ Email' },
              { id: 'whatsapp', label: '💬 WhatsApp OTP' },
            ] as const).map(t => (
              <button key={t.id} onClick={() => { setTab(t.id); setError(''); setInfo(''); }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  tab === t.id ? 'bg-white text-[#1A5E38] shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'email' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-[#1A5E38] outline-none transition-colors" />
              </div>
              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Password</label>
                  <button onClick={handleForgot} className="text-xs text-[#1A5E38] hover:underline">Forgot?</button>
                </div>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Your password"
                    onKeyDown={e => e.key === 'Enter' && handleEmailLogin()}
                    className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-xl text-sm focus:border-[#1A5E38] outline-none transition-colors" />
                  <button onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">⚠️ {error}</p>}
              {info && <p className="text-xs text-green-700 bg-green-50 border border-green-100 rounded-xl px-3 py-2.5">✓ {info}</p>}

              <button onClick={handleEmailLogin} disabled={loading}
                className="w-full bg-[#1A5E38] text-white font-bold py-3.5 rounded-xl hover:bg-[#0F3D24] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 text-sm">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Signing in...' : 'Sign In →'}
              </button>
            </div>
          )}

          {tab === 'whatsapp' && (
            <div className="space-y-4">
              {!otpSent ? (
                <>
                  <div className="bg-[#EAF6EE] border border-[#1A5E38]/20 rounded-xl p-3 text-xs text-[#1A5E38]">
                    💬 We&apos;ll send a 6-digit code to your WhatsApp registered number
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">WhatsApp Number</label>
                    <div className="flex gap-2">
                      <div className="px-3 py-3 bg-gray-100 border-2 border-gray-200 rounded-xl text-xs font-bold text-gray-500 flex-shrink-0">🇳🇬 +234</div>
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="0803 XXX XXXX" maxLength={11}
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-[#1A5E38] outline-none" />
                    </div>
                  </div>
                  {error && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">⚠️ {error}</p>}
                  <button onClick={handleSendOtp} disabled={loading || phone.length < 10}
                    className="w-full bg-[#1A5E38] text-white font-bold py-3.5 rounded-xl hover:bg-[#0F3D24] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 text-sm">
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {loading ? 'Sending...' : '💬 Send WhatsApp Code'}
                  </button>
                </>
              ) : (
                <>
                  <div className="text-center py-2">
                    <div className="text-3xl mb-2">📱</div>
                    <p className="font-bold text-gray-800 text-sm">Code sent! Check your WhatsApp</p>
                    <p className="text-xs text-gray-400 mt-1">Valid for 10 minutes</p>
                  </div>
                  <input type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000" maxLength={6}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-2xl font-mono text-center tracking-[0.5em] focus:border-[#1A5E38] outline-none" />
                  {error && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 text-center">⚠️ {error}</p>}
                  <button onClick={handleVerifyOtp} disabled={loading || otp.length < 6}
                    className="w-full bg-[#1A5E38] text-white font-bold py-3.5 rounded-xl hover:bg-[#0F3D24] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 text-sm">
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {loading ? 'Verifying...' : 'Verify & Sign In →'}
                  </button>
                  <button onClick={() => { setOtpSent(false); setOtp(''); setError(''); }}
                    className="w-full text-xs text-gray-400 hover:text-gray-600 py-1">← Use different number</button>
                </>
              )}
            </div>
          )}

          <div className="mt-5 pt-5 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">Not registered yet?{' '}
              <Link href="/for-installers/apply" className="text-[#1A5E38] font-bold hover:underline">
                Apply for free listing →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SETTINGS TAB (Carried over & restyled slightly)
═══════════════════════════════════════════════ */

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT - Abuja','Gombe',
  'Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos',
  'Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara'
];

const SERVICES_LIST = [
  'Residential Installation','Commercial Installation','Maintenance & Servicing',
  'System Audit','Battery Replacement','Inverter Repair','Solar Panel Cleaning',
  'Off-Grid Systems','Hybrid Systems'
];

function SettingsTab({ installer, isLoggedIn }: { installer: Installer; isLoggedIn: boolean }) {
  const [form, setForm] = useState({
    company_name: installer.company_name || '',
    description: installer.description || '',
    whatsapp: installer.whatsapp || '',
    phone: installer.phone || '',
    website: installer.website || '',
    services: installer.services || [],
    states_covered: installer.states_covered || [],
    years_in_business: installer.years_in_business || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggle = (key: 'services' | 'states_covered', val: string) =>
    setForm(p => ({
      ...p,
      [key]: p[key].includes(val) ? p[key].filter(x => x !== val) : [...p[key], val],
    }));

  const save = async () => {
    if (!isLoggedIn) return;
    setSaving(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { error } = await supabase.from('installers').update({ ...form }).eq('id', installer.id);
    setSaving(false);
    if (!error) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-[#EAF6EE] border border-[#1A5E38]/10 rounded-2xl p-5 flex items-center justify-between">
        <div>
          <p className="font-bold text-[#1A1A1A]">
            {installer.subscription_tier === 'pro' ? '🏆 Pro Plan' : installer.subscription_tier === 'featured' ? '⭐ Featured Plan' : '🆓 Free Plan'}
          </p>
          <p className="text-xs text-[#6B6B6B] mt-0.5">
            {installer.subscription_expires_at
              ? `Expires ${new Date(installer.subscription_expires_at).toLocaleDateString()}`
              : 'No active subscription'}
          </p>
        </div>
        <Link href="/for-installers/apply?plan=featured"
          className="bg-[#1A5E38] text-white text-xs font-bold px-4 py-2.5 rounded-full hover:bg-[#0F3D24] transition-colors">
          Upgrade
        </Link>
      </div>

      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E5E0] shadow-sm p-8 space-y-8">
        <section className="space-y-4">
          <h3 className="font-bold text-sm text-[#1A1A1A] border-b border-[#E5E5E0] pb-2 uppercase tracking-wide">Company Info</h3>
          <div>
            <label className="block text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider mb-2">Company Name</label>
            <input type="text" value={form.company_name} onChange={e => setForm({...form, company_name: e.target.value})}
              className="w-full border border-[#E5E5E0] rounded-xl px-4 py-3 text-sm focus:border-[#1A5E38] outline-none" />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="block text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider">Description</label>
              <span className="text-[10px] text-[#6B6B6B]">{form.description.length}/300</span>
            </div>
            <textarea rows={3} maxLength={300} value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              className="w-full border border-[#E5E5E0] rounded-xl px-4 py-3 text-sm focus:border-[#1A5E38] outline-none resize-none" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider mb-2">Years in Business</label>
            <select value={form.years_in_business} onChange={e => setForm({...form, years_in_business: e.target.value})}
              className="w-full border border-[#E5E5E0] rounded-xl px-4 py-3 text-sm focus:border-[#1A5E38] outline-none bg-white">
              <option value="">Select...</option>
              <option value="0-2">0 – 2 Years</option>
              <option value="3-5">3 – 5 Years</option>
              <option value="6-10">6 – 10 Years</option>
              <option value="10+">10+ Years</option>
            </select>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="font-bold text-sm text-[#1A1A1A] border-b border-[#E5E5E0] pb-2 uppercase tracking-wide">Contact & Lead Delivery</h3>
          <div>
            <label className="block text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider mb-2">WhatsApp (receives leads)</label>
            <input type="tel" value={form.whatsapp} onChange={e => setForm({...form, whatsapp: e.target.value})}
              placeholder="+234 XXX XXXX"
              className="w-full border border-[#E5E5E0] rounded-xl px-4 py-3 text-sm focus:border-[#1A5E38] outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider mb-2">Business Phone</label>
            <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
              className="w-full border border-[#E5E5E0] rounded-xl px-4 py-3 text-sm focus:border-[#1A5E38] outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider mb-2">Website URL</label>
            <input type="url" value={form.website} onChange={e => setForm({...form, website: e.target.value})} placeholder="https://"
              className="w-full border border-[#E5E5E0] rounded-xl px-4 py-3 text-sm focus:border-[#1A5E38] outline-none" />
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="font-bold text-sm text-[#1A1A1A] border-b border-[#E5E5E0] pb-2 uppercase tracking-wide">Services Offered</h3>
          <div className="grid grid-cols-2 gap-3">
            {SERVICES_LIST.map(s => (
              <label key={s} className="flex items-center gap-3 p-3 border border-[#E5E5E0] rounded-xl cursor-pointer hover:bg-[#FAFAF8] transition-colors">
                <input type="checkbox" checked={form.services.includes(s)} onChange={() => toggle('services', s)}
                  className="w-4 h-4 rounded text-[#1A5E38]" />
                <span className="text-sm font-medium text-[#1A1A1A]">{s}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="font-bold text-sm text-[#1A1A1A] border-b border-[#E5E5E0] pb-2 uppercase tracking-wide">Service Areas</h3>
          <div className="h-64 overflow-y-auto border border-[#E5E5E0] rounded-xl p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#FAFAF8]">
            {NIGERIAN_STATES.map(s => (
              <label key={s} className="flex items-center gap-3 p-2 rounded hover:bg-white transition-colors cursor-pointer text-sm font-medium">
                <input type="checkbox" checked={form.states_covered.includes(s)} onChange={() => toggle('states_covered', s)}
                  className="w-4 h-4 rounded text-[#1A5E38]" />
                {s}
              </label>
            ))}
          </div>
          <p className="text-[10px] uppercase font-bold text-[#6B6B6B]">Only receive leads from selected states.</p>
        </section>

        <div className="pt-4 border-t border-[#E5E5E0]">
          <button onClick={save} disabled={saving || !isLoggedIn}
            className="w-full bg-[#1A5E38] text-white font-bold py-4 rounded-full hover:bg-[#0F3D24] transition-colors disabled:opacity-50 text-sm">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          {saved && <p className="text-center text-xs font-bold text-[#1A5E38] mt-4">✓ Profile updated!</p>}
          {!isLoggedIn && <p className="text-center text-xs text-[#6B6B6B] mt-3">Sign in to save changes</p>}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN DASHBOARD CLIENT
═══════════════════════════════════════════════ */

export default function DashboardClient({ installer, leads: initialLeads, reviews, isLoggedIn }: Props) {
  const [activeTab, setActiveTab] = useState('leads');
  const [localLeads, setLocalLeads] = useState<Lead[]>(initialLeads);
  const [statusFilter, setStatusFilter] = useState('all');
  
  const router = useRouter();

  const newLeadsCount = localLeads.filter(l => l.status === 'new').length;

  const updateLeadStatus = async (leadId: string, status: string) => {
    if (!isLoggedIn) return;
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.from('leads').update({ status }).eq('id', leadId);
    setLocalLeads(prev => prev.map(l => l.id === leadId ? { ...l, status } : l));
  };

  const handleSignOut = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signOut();
    router.refresh();
  };

  const now = Date.now();
  const thisMonthCount = localLeads.filter(l => now - new Date(l.created_at).getTime() < 30 * 86400000).length;
  const wonCount = localLeads.filter(l => l.status === 'won').length;

  const filteredLeads = statusFilter === 'all' 
    ? localLeads 
    : localLeads.filter(l => (l.status || 'new') === statusFilter);

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col md:flex-row relative font-sans">
      {!isLoggedIn && <LoginOverlay />}

      <SidebarNav 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        newLeadsCount={newLeadsCount}
        installer={installer}
        isLoggedIn={isLoggedIn}
        onSignOut={handleSignOut}
      />

      <main className="flex-1 md:ml-64 p-5 md:p-10 pb-32 md:pb-10 min-h-screen">
        <div className="max-w-4xl mx-auto space-y-10">
          
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-black text-[#1A1A1A] tracking-tight">
              {isLoggedIn ? `Welcome, ${installer.company_name.split(' ')[0]}` : installer.company_name}
            </h1>
            <div className="hidden md:flex items-center gap-3">
              <span className="text-xs font-bold text-[#6B6B6B] uppercase tracking-widest">{isLoggedIn ? installer.subscription_tier + ' Plan' : 'Preview Mode'}</span>
            </div>
          </div>

          {isLoggedIn && !installer.is_approved && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
              <div className="text-3xl">⏳</div>
              <div>
                <h4 className="text-amber-900 font-bold text-lg mb-1">Your account is pending verification</h4>
                <p className="text-amber-800 text-sm">
                  Welcome to SolarCheck! We are currently reviewing your registration. 
                  Your profile is not yet visible to the public, and you won't receive leads until approved.
                  This usually takes 24-48 hours.
                </p>
              </div>
            </div>
          )}

          <div className={!isLoggedIn ? 'pointer-events-none select-none' : ''}>
            
            {/* ── LEADS TAB ── */}
            {activeTab === 'leads' && (
              <div className="space-y-10">
                {/* Stats row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <StatCard label="Total Leads" value={localLeads.length} icon="📥" />
                  <StatCard label="This Month" value={thisMonthCount} icon="📅" />
                  <StatCard label="Converted" value={wonCount} icon="🏆" />
                </div>

                {/* WhatsApp Connection Banner */}
                {!installer.whatsapp && (
                  <div className="bg-[#FEF3E2] rounded-2xl p-6 border border-[#92610E]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-[#92610E] font-bold text-sm mb-1">WhatsApp Not Connected</h4>
                      <p className="text-xs text-[#92610E]/80">Add your number to receive instant lead alerts when they arrive.</p>
                    </div>
                    <button onClick={() => setActiveTab('settings')} className="bg-[#92610E] text-white text-xs font-bold px-5 py-2.5 rounded-full whitespace-nowrap">
                      Connect Number
                    </button>
                  </div>
                )}

                {/* Status Filter Tabs (Pill Style) */}
                <div className="bg-[#FAFAF8] p-1.5 rounded-2xl border border-[#E5E5E0] inline-flex flex-wrap">
                  {[
                    { id: 'all', label: 'All Leads' },
                    { id: 'new', label: 'New' },
                    { id: 'contacted', label: 'Contacted' },
                    { id: 'quoted', label: 'Quoted' },
                    { id: 'won', label: 'Won' },
                    { id: 'lost', label: 'Lost' },
                  ].map(tab => (
                    <button 
                      key={tab.id}
                      onClick={() => setStatusFilter(tab.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        statusFilter === tab.id 
                          ? 'bg-[#FFFFFF] text-[#1A5E38] shadow-sm' 
                          : 'text-[#6B6B6B] hover:text-[#1A1A1A]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Leads List */}
                {filteredLeads.length === 0 ? (
                  <div className="text-center py-20 bg-[#FFFFFF] rounded-2xl border border-[#E5E5E0] shadow-sm">
                    <p className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-widest mb-4">No Leads Found</p>
                    <h3 className="font-bold text-lg text-[#1A1A1A] mb-2">You're all caught up.</h3>
                    <p className="text-sm text-[#6B6B6B] max-w-sm mx-auto mb-6">
                      Leads arrive here when homeowners request quotes in your service area. Ensure your WhatsApp number is connected for instant alerts.
                    </p>
                    {!installer.whatsapp && (
                      <button onClick={() => setActiveTab('settings')} className="text-xs font-bold text-[#1A5E38] underline underline-offset-4">
                        Connect WhatsApp Number →
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredLeads.map(lead => (
                      <LeadCard 
                        key={lead.id} 
                        lead={lead} 
                        isFree={installer.subscription_tier === 'free'} 
                        isLoggedIn={isLoggedIn}
                        updateLeadStatus={updateLeadStatus} 
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── PROFILE TAB ── */}
            {activeTab === 'profile' && (
              <div className="text-center py-24 bg-[#FFFFFF] rounded-2xl border border-[#E5E5E0] shadow-sm max-w-3xl">
                <div className="text-5xl mb-4 opacity-50">👤</div>
                <h3 className="font-bold text-xl text-[#1A1A1A] mb-2">Public Profile</h3>
                <p className="text-[#6B6B6B] text-sm mb-6 max-w-sm mx-auto">This is how customers see your company on SolarCheck.</p>
                <Link href={`/installers/${installer.slug}`} target="_blank"
                  className="inline-block bg-[#1A5E38] text-white text-sm font-bold px-8 py-3 rounded-full hover:bg-[#0F3D24] transition-colors">
                  View Public Profile →
                </Link>
              </div>
            )}

            {/* ── REVIEWS TAB ── */}
            {activeTab === 'reviews' && (
              <div className="text-center py-24 bg-[#FFFFFF] rounded-2xl border border-[#E5E5E0] shadow-sm max-w-3xl">
                <div className="text-5xl mb-4 opacity-50">⭐</div>
                <h3 className="font-bold text-xl text-[#1A1A1A] mb-2">Customer Reviews</h3>
                <p className="text-[#6B6B6B] text-sm">You have <strong className="text-[#1A1A1A]">{reviews.length}</strong> published reviews.</p>
              </div>
            )}

            {/* ── SETTINGS TAB ── */}
            {activeTab === 'settings' && (
              <SettingsTab installer={installer} isLoggedIn={isLoggedIn} />
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
