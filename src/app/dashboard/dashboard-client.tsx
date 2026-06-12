'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { LogOut, Loader2, Eye, EyeOff } from 'lucide-react';

/* ─────────────────── helpers ─────────────────── */

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

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
}

interface Lead {
  id: string;
  created_at: string;
  full_name: string;
  city: string;
  state: string;
  system_size: string;
  monthly_bill_range: string;
  status: string;
  phone: string;
  whatsapp: string;
}

interface Props {
  installer: Installer;
  leads: Lead[];
  reviews: unknown[];
  isLoggedIn: boolean;
}

/* ═══════════════════════════════════════════════
   LOGIN OVERLAY COMPONENT
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
    /* Full-screen overlay with blur */
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', background: 'rgba(13,27,18,0.55)' }}>
      
      {/* Card */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Green header strip */}
        <div className="bg-[#0A5C36] px-8 pt-8 pb-6">
          <Link href="/" className="text-2xl font-black text-white block mb-4">
            Solar<span className="text-[#F5A623]">Check</span>
          </Link>
          <h1 className="text-xl font-black text-white leading-tight">
            Sign in to your<br />Installer Dashboard
          </h1>
          <p className="text-white/60 text-sm mt-1">Manage your leads, profile &amp; reviews</p>
        </div>

        {/* Form area */}
        <div className="px-8 py-6">

          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-2xl p-1 mb-5">
            {([
              { id: 'email', label: '✉️ Email' },
              { id: 'whatsapp', label: '💬 WhatsApp OTP' },
            ] as const).map(t => (
              <button key={t.id} onClick={() => { setTab(t.id); setError(''); setInfo(''); }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  tab === t.id ? 'bg-white text-[#0A5C36] shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── EMAIL FORM ── */}
          {tab === 'email' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-[#0A5C36] outline-none transition-colors" />
              </div>
              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Password</label>
                  <button onClick={handleForgot} className="text-xs text-[#0A5C36] hover:underline">Forgot?</button>
                </div>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Your password"
                    onKeyDown={e => e.key === 'Enter' && handleEmailLogin()}
                    className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-xl text-sm focus:border-[#0A5C36] outline-none transition-colors" />
                  <button onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">⚠️ {error}</p>}
              {info && <p className="text-xs text-green-700 bg-green-50 border border-green-100 rounded-xl px-3 py-2.5">✓ {info}</p>}

              <button onClick={handleEmailLogin} disabled={loading}
                className="w-full bg-[#0A5C36] text-white font-bold py-3.5 rounded-xl hover:bg-[#0D1B12] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 text-sm">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Signing in...' : 'Sign In →'}
              </button>
            </div>
          )}

          {/* ── WHATSAPP OTP FORM ── */}
          {tab === 'whatsapp' && (
            <div className="space-y-4">
              {!otpSent ? (
                <>
                  <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-xs text-green-800">
                    💬 We&apos;ll send a 6-digit code to your WhatsApp registered number
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">WhatsApp Number</label>
                    <div className="flex gap-2">
                      <div className="px-3 py-3 bg-gray-100 border-2 border-gray-200 rounded-xl text-xs font-bold text-gray-500 flex-shrink-0">🇳🇬 +234</div>
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="0803 XXX XXXX" maxLength={11}
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-[#0A5C36] outline-none" />
                    </div>
                  </div>
                  {error && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">⚠️ {error}</p>}
                  <button onClick={handleSendOtp} disabled={loading || phone.length < 10}
                    className="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 text-sm">
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
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-2xl font-mono text-center tracking-[0.5em] focus:border-[#0A5C36] outline-none" />
                  {error && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 text-center">⚠️ {error}</p>}
                  <button onClick={handleVerifyOtp} disabled={loading || otp.length < 6}
                    className="w-full bg-[#0A5C36] text-white font-bold py-3.5 rounded-xl hover:bg-[#0D1B12] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 text-sm">
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {loading ? 'Verifying...' : 'Verify & Sign In →'}
                  </button>
                  <button onClick={() => { setOtpSent(false); setOtp(''); setError(''); }}
                    className="w-full text-xs text-gray-400 hover:text-gray-600 py-1">← Use different number</button>
                </>
              )}
            </div>
          )}

          {/* Register link */}
          <div className="mt-5 pt-5 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">Not registered yet?{' '}
              <Link href="/for-installers/apply" className="text-[#0A5C36] font-bold hover:underline">
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
   MAIN DASHBOARD CLIENT
═══════════════════════════════════════════════ */

export default function DashboardClient({ installer, leads: initialLeads, reviews, isLoggedIn }: Props) {
  const [activeTab, setActiveTab] = useState('leads');
  const [localLeads, setLocalLeads] = useState<Lead[]>(initialLeads);
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row relative">
      {/* ── LOGIN OVERLAY (shown only when not logged in) ── */}
      {!isLoggedIn && <LoginOverlay />}

      {/* ══════════════ SIDEBAR (desktop) ══════════════ */}
      <aside className="hidden md:flex w-56 flex-col bg-white border-r border-gray-100 min-h-screen p-4 fixed h-full z-10">
        <Link href="/" className="text-xl font-black text-[#0D1B12] mb-8 block">
          Solar<span className="text-[#0A5C36]">Check</span>
        </Link>

        {/* Installer avatar pill */}
        <div className="mb-6 p-3 bg-[#0A5C36]/5 rounded-2xl">
          <div className="w-10 h-10 rounded-full bg-[#0A5C36]/10 flex items-center justify-center font-black text-[#0A5C36] text-lg mb-1.5 uppercase">
            {installer.company_name.charAt(0)}
          </div>
          <p className="font-bold text-sm text-gray-900 truncate">{installer.company_name}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${isLoggedIn ? 'bg-green-500' : 'bg-gray-300'}`} />
            <p className="text-xs text-gray-400 capitalize">{isLoggedIn ? installer.subscription_tier + ' Plan' : 'Not signed in'}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 flex-1">
          {[
            { id: 'leads', icon: '📥', label: 'Leads' },
            { id: 'profile', icon: '👤', label: 'Profile' },
            { id: 'reviews', icon: '⭐', label: 'Reviews' },
            { id: 'settings', icon: '⚙️', label: 'Settings' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                activeTab === tab.id ? 'bg-[#0A5C36]/10 text-[#0A5C36]' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-700'
              }`}>
              <span className="text-base w-5 text-center">{tab.icon}</span>
              {tab.label}
              {tab.id === 'leads' && newLeadsCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">{newLeadsCount}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Sign out */}
        {isLoggedIn ? (
          <button onClick={handleSignOut}
            className="mt-auto text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-2 px-3 py-2">
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        ) : (
          <div className="mt-auto px-3 py-2">
            <div className="text-xs text-gray-300 text-center">Preview Mode</div>
          </div>
        )}
      </aside>

      {/* ══════════════ BOTTOM NAV (mobile) ══════════════ */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex md:hidden z-40">
        {[
          { id: 'leads', icon: '📥', label: 'Leads', badge: newLeadsCount },
          { id: 'profile', icon: '👤', label: 'Profile', badge: 0 },
          { id: 'reviews', icon: '⭐', label: 'Reviews', badge: 0 },
          { id: 'settings', icon: '⚙️', label: 'Settings', badge: 0 },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center py-3 gap-0.5 relative ${
              activeTab === tab.id ? 'text-[#0A5C36]' : 'text-gray-400'
            }`}>
            <span className="text-lg relative">
              {tab.icon}
              {tab.badge > 0 && (
                <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">{tab.badge}</span>
              )}
            </span>
            <span className="text-[10px] font-semibold">{tab.label}</span>
            {activeTab === tab.id && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#0A5C36] rounded-full" />
            )}
          </button>
        ))}
      </nav>

      {/* ══════════════ MAIN CONTENT ══════════════ */}
      <main className="flex-1 md:ml-56 p-4 md:p-8 pb-28 md:pb-8 min-h-screen">
        <div className="max-w-3xl mx-auto">

          {/* ── Header ── */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-black text-gray-900">
                {isLoggedIn ? `Welcome, ${installer.company_name.split(' ')[0]}` : installer.company_name}
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {isLoggedIn ? "Here's your dashboard overview" : 'Preview Mode — Sign in to manage your account'}
              </p>
            </div>
            {isLoggedIn && (
              <Link href={`/installers/${installer.slug}`} target="_blank"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 border-2 border-gray-200 rounded-full text-xs font-bold text-gray-600 hover:border-[#0A5C36] hover:text-[#0A5C36] transition-colors">
                View Profile →
              </Link>
            )}
          </div>

          {/* ── TAB CONTENT ── */}
          <div className={!isLoggedIn ? 'pointer-events-none select-none' : ''}>
            {activeTab === 'leads' && (
              <LeadsTab installer={installer} leads={localLeads} updateLeadStatus={updateLeadStatus} setActiveTab={setActiveTab} isLoggedIn={isLoggedIn} />
            )}
            {activeTab === 'profile' && (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="text-5xl mb-3">👤</div>
                <h3 className="font-bold text-gray-800 mb-2">Public Profile</h3>
                <p className="text-gray-400 text-sm mb-5">This is how customers see your company on SolarCheck.</p>
                <Link href={`/installers/${installer.slug}`} target="_blank"
                  className="inline-block bg-[#0A5C36] text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-[#0D1B12] transition-colors">
                  View Public Profile →
                </Link>
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="text-5xl mb-3">⭐</div>
                <h3 className="font-bold text-gray-800 mb-2">Customer Reviews</h3>
                <p className="text-gray-400 text-sm">You have {reviews.length} published reviews.</p>
              </div>
            )}
            {activeTab === 'settings' && (
              <SettingsTab installer={installer} isLoggedIn={isLoggedIn} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   LEADS TAB
═══════════════════════════════════════════════ */

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-amber-100 text-amber-700',
  quoted: 'bg-purple-100 text-purple-700',
  won: 'bg-green-100 text-green-700',
  lost: 'bg-gray-100 text-gray-500',
};

function LeadsTab({ installer, leads, updateLeadStatus, setActiveTab, isLoggedIn }: {
  installer: Installer;
  leads: Lead[];
  updateLeadStatus: (id: string, status: string) => void;
  setActiveTab: (tab: string) => void;
  isLoggedIn: boolean;
}) {
  const isFree = installer.subscription_tier === 'free';
  const now = Date.now();
  const thisMonth = leads.filter(l => now - new Date(l.created_at).getTime() < 30 * 86400000).length;

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total', value: leads.length, icon: '📥', color: 'bg-blue-50 text-blue-700' },
          { label: 'This Month', value: thisMonth, icon: '📅', color: 'bg-amber-50 text-amber-700' },
          { label: 'Won', value: leads.filter(l => l.status === 'won').length, icon: '🏆', color: 'bg-green-50 text-green-700' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-2xl font-black text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* WhatsApp delivery banner */}
      <div className={`flex items-center justify-between p-3.5 rounded-2xl ${
        installer.whatsapp ? 'bg-green-50 border border-green-100' : 'bg-amber-50 border border-amber-100'
      }`}>
        <div className="flex items-center gap-2.5">
          <span className="text-lg">{installer.whatsapp ? '✅' : '⚠️'}</span>
          <div>
            <p className={`text-xs font-bold ${installer.whatsapp ? 'text-green-800' : 'text-amber-800'}`}>
              {installer.whatsapp ? 'WhatsApp lead delivery active' : 'WhatsApp not connected'}
            </p>
            <p className="text-xs text-gray-400">
              {installer.whatsapp ? `Leads sent to ${installer.whatsapp}` : 'Add your number in Settings to receive lead alerts'}
            </p>
          </div>
        </div>
        {!installer.whatsapp && (
          <button onClick={() => setActiveTab('settings')}
            className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1.5 rounded-full hover:bg-amber-200 transition-colors">
            Set up →
          </button>
        )}
      </div>

      {/* Lead cards */}
      {leads.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-5xl mb-3">📭</div>
          <h3 className="font-bold text-gray-800 mb-1">No leads yet</h3>
          <p className="text-sm text-gray-400 max-w-xs mx-auto">
            Leads appear when homeowners request quotes in your service area.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map(lead => (
            <div key={lead.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Card top */}
              <div className="p-4 flex items-start gap-3">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0A5C36]/20 to-[#F5A623]/20 flex items-center justify-center font-black text-sm text-[#0A5C36] flex-shrink-0 uppercase">
                  {lead.full_name.charAt(0)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-gray-900">{lead.full_name}</span>
                    {lead.status === 'new' && (
                      <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded-full font-bold">NEW</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">📍 {lead.city}, {lead.state} · {timeAgo(lead.created_at)}</p>
                  <p className="text-xs text-gray-500 mt-0.5">⚡ {lead.system_size || lead.monthly_bill_range}</p>
                </div>

                {/* Status dropdown */}
                <select value={lead.status || 'new'} onChange={e => updateLeadStatus(lead.id, e.target.value)}
                  className={`text-[11px] font-bold px-2 py-1 rounded-full border-0 outline-none cursor-pointer appearance-none flex-shrink-0 ${STATUS_COLORS[lead.status] || STATUS_COLORS.new}`}>
                  <option value="new">🔵 New</option>
                  <option value="contacted">🟡 Contacted</option>
                  <option value="quoted">🟣 Quoted</option>
                  <option value="won">🟢 Won</option>
                  <option value="lost">⚫ Lost</option>
                </select>
              </div>

              {/* Contact area */}
              {isFree || !isLoggedIn ? (
                <div className="mx-4 mb-4 bg-gray-50 rounded-xl p-3 border border-dashed border-gray-200 text-center">
                  <p className="text-[11px] text-gray-400 mb-1">🔒 Contact details hidden</p>
                  <p className="text-xs font-mono text-gray-200 mb-2 select-none" style={{ filter: 'blur(3px)' }}>+234 803 XXX XXXX</p>
                  <Link href="/for-installers/apply?plan=featured"
                    className="text-[11px] font-bold text-[#0A5C36] bg-[#0A5C36]/10 px-3 py-1 rounded-full hover:bg-[#0A5C36]/20 transition-colors inline-block">
                    Upgrade to unlock →
                  </Link>
                </div>
              ) : (
                <div className="flex gap-2 px-4 pb-4">
                  <a href={`https://wa.me/${(lead.whatsapp || lead.phone).replace(/\D/g, '')}?text=Hi ${lead.full_name}, I saw your solar inquiry on SolarCheck. I'd love to discuss your needs.`}
                    target="_blank" rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-green-700 transition-colors">
                    💬 WhatsApp
                  </a>
                  <a href={`tel:${lead.phone || lead.whatsapp}`}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-[#0A5C36]/10 text-[#0A5C36] text-xs font-bold py-2.5 rounded-xl hover:bg-[#0A5C36]/20 transition-colors">
                    📞 Call
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SETTINGS TAB
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
    <div className="space-y-4">
      {/* Subscription banner */}
      <div className="bg-[#0A5C36]/5 border border-[#0A5C36]/10 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="font-bold text-sm text-gray-900">
            {installer.subscription_tier === 'pro' ? '🏆 Pro Plan' : installer.subscription_tier === 'featured' ? '⭐ Featured Plan' : '🆓 Free Plan'}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {installer.subscription_expires_at
              ? `Expires ${new Date(installer.subscription_expires_at).toLocaleDateString()}`
              : 'No active subscription'}
          </p>
        </div>
        <Link href="/for-installers/apply?plan=featured"
          className="bg-[#0A5C36] text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-[#0D1B12] transition-colors">
          Upgrade
        </Link>
      </div>

      {/* Settings form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
        {/* Company Info */}
        <section className="space-y-4">
          <h3 className="font-bold text-sm border-b border-gray-100 pb-2">Company Info</h3>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Company Name</label>
            <input type="text" value={form.company_name} onChange={e => setForm({...form, company_name: e.target.value})}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#0A5C36] outline-none" />
          </div>
          <div>
            <div className="flex justify-between mb-1.5">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide">Description</label>
              <span className="text-xs text-gray-300">{form.description.length}/300</span>
            </div>
            <textarea rows={3} maxLength={300} value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#0A5C36] outline-none resize-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Years in Business</label>
            <select value={form.years_in_business} onChange={e => setForm({...form, years_in_business: e.target.value})}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#0A5C36] outline-none bg-white">
              <option value="">Select...</option>
              <option value="0-2">0 – 2 Years</option>
              <option value="3-5">3 – 5 Years</option>
              <option value="6-10">6 – 10 Years</option>
              <option value="10+">10+ Years</option>
            </select>
          </div>
        </section>

        {/* Contact */}
        <section className="space-y-4">
          <h3 className="font-bold text-sm border-b border-gray-100 pb-2">Contact & Lead Delivery</h3>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">WhatsApp (receives leads)</label>
            <input type="tel" value={form.whatsapp} onChange={e => setForm({...form, whatsapp: e.target.value})}
              placeholder="+234 XXX XXXX"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#0A5C36] outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Business Phone</label>
            <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#0A5C36] outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Website URL</label>
            <input type="url" value={form.website} onChange={e => setForm({...form, website: e.target.value})} placeholder="https://"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#0A5C36] outline-none" />
          </div>
        </section>

        {/* Services */}
        <section className="space-y-3">
          <h3 className="font-bold text-sm border-b border-gray-100 pb-2">Services Offered</h3>
          <div className="grid grid-cols-2 gap-2">
            {SERVICES_LIST.map(s => (
              <label key={s} className="flex items-center gap-2 p-2.5 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input type="checkbox" checked={form.services.includes(s)} onChange={() => toggle('services', s)}
                  className="w-3.5 h-3.5 rounded text-[#0A5C36]" />
                <span className="text-xs font-medium text-gray-700">{s}</span>
              </label>
            ))}
          </div>
        </section>

        {/* States */}
        <section className="space-y-3">
          <h3 className="font-bold text-sm border-b border-gray-100 pb-2">Service Areas</h3>
          <div className="h-52 overflow-y-auto border border-gray-100 rounded-xl p-3 grid grid-cols-2 sm:grid-cols-3 gap-2 bg-gray-50">
            {NIGERIAN_STATES.map(s => (
              <label key={s} className="flex items-center gap-2 p-1.5 rounded hover:bg-white transition-colors cursor-pointer text-xs">
                <input type="checkbox" checked={form.states_covered.includes(s)} onChange={() => toggle('states_covered', s)}
                  className="w-3 h-3 rounded text-[#0A5C36]" />
                {s}
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-400">Only receive leads from selected states.</p>
        </section>

        {/* Save */}
        <div className="pt-2">
          <button onClick={save} disabled={saving || !isLoggedIn}
            className="w-full bg-[#0A5C36] text-white font-bold py-3.5 rounded-xl hover:bg-[#0D1B12] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          {saved && <p className="text-center text-xs font-bold text-green-600 mt-3">✓ Profile updated!</p>}
          {!isLoggedIn && <p className="text-center text-xs text-gray-400 mt-2">Sign in to save changes</p>}
        </div>
      </div>
    </div>
  );
}
