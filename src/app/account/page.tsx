import { createServerClient } from '@/lib/supabase/server';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { SocialLoginButtons } from '@/components/auth/social-login-buttons';
import Link from 'next/link';
import { ShieldCheck, Zap } from 'lucide-react';

export const metadata = {
  title: 'My Account | SolarCheck',
};

export default async function AccountPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // ── Not signed in: show the optional sign-in prompt, never a hard gate ──
  if (!user) {
    return (
      <>
        <Navbar />
        <main className="max-w-md mx-auto px-4 py-16">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1A5C38]/10 mb-4">
              <Zap className="w-7 h-7 text-[#1A5C38]" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">My Account</h1>
            <p className="text-sm text-slate-500 mt-2">
              Sign in to see your past quote requests and registered warranties
              in one place.
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <SocialLoginButtons redirectTo="/account" />
          </div>
          <p className="text-center text-xs text-slate-400 mt-6">
            You don&apos;t need an account to use the{' '}
            <Link href="/solar-calculator" className="text-[#1A5C38] font-semibold hover:underline">
              free calculator
            </Link>{' '}
            or get installer quotes.
          </p>
        </main>
        <Footer />
      </>
    );
  }

  // ── Signed in: fetch this user's leads and warranty registrations ──
  const { data: leads } = await supabase
    .from('leads')
    .select('id, created_at, full_name, city, state, system_size, status')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const { data: warranties } = await supabase
    .from('warranty_registrations')
    .select('id, install_date, system_size_kva, battery_kwh, status, installer_name_manual')
    .eq('user_id', user.id)
    .order('install_date', { ascending: false });

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">
            Welcome back{user.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{user.email}</p>
        </div>

        {/* Quote requests */}
        <section className="mb-8">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#1A5C38]" /> Your Quote Requests
          </h2>
          {leads && leads.length > 0 ? (
            <div className="space-y-2">
              {leads.map((lead) => (
                <div key={lead.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      {lead.system_size || 'System sizing pending'} — {lead.city}, {lead.state}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(lead.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 capitalize">
                    {lead.status || 'new'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl p-6 text-center">
              <p className="text-sm text-slate-500">No quote requests yet.</p>
              <Link href="/solar-calculator" className="text-sm text-[#1A5C38] font-semibold hover:underline mt-1 inline-block">
                Run the free calculator →
              </Link>
            </div>
          )}
        </section>

        {/* Warranty registrations */}
        <section>
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#1A5C38]" /> Your Registered Systems
          </h2>
          {warranties && warranties.length > 0 ? (
            <div className="space-y-2">
              {warranties.map((w) => (
                <div key={w.id} className="bg-white rounded-xl border border-gray-100 p-4">
                  <p className="text-sm font-semibold text-slate-700">
                    {w.system_size_kva || 'System'} {w.battery_kwh ? `· ${w.battery_kwh} battery` : ''}
                  </p>
                  <p className="text-xs text-slate-400">
                    Installed {new Date(w.install_date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {w.installer_name_manual ? ` by ${w.installer_name_manual}` : ''}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl p-6 text-center">
              <p className="text-sm text-slate-500">No warranty registrations yet.</p>
              <Link href="/warranty-register" className="text-sm text-[#1A5C38] font-semibold hover:underline mt-1 inline-block">
                Register your system →
              </Link>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
