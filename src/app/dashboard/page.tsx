import { Metadata } from 'next';
import { createServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import DashboardClient from './dashboard-client';

export const metadata: Metadata = {
  title: 'Installer Dashboard | SolarCheck',
};

export default async function DashboardPage() {
  const supabase = createServerClient();
  const adminDb = createAdminClient();

  // ── 1. Check authentication ────────────────────────
  const { data: { user } } = await supabase.auth.getUser();

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

  let installer = null;
  let leads: Lead[] = [];
  let reviews: unknown[] = [];

  if (user) {
    // ── 2a. Try matching by user_id ────────────────
    const { data: byUserId } = await adminDb
      .from('installers')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_approved', true)
      .single();

    installer = byUserId;

    // ── 2b. Fallback: match by email (for installers approved
    //        before the auth account was linked) ────
    if (!installer && user.email) {
      const { data: byEmail } = await adminDb
        .from('installers')
        .select('*')
        .eq('email', user.email)
        .eq('is_approved', true)
        .single();

      installer = byEmail;

      // Auto-link user_id so future logins match instantly
      if (installer) {
        await adminDb
          .from('installers')
          .update({ user_id: user.id })
          .eq('id', installer.id);
      }
    }

    // ── 3. Load real leads & reviews if installer found ──
    if (installer) {
      const { data: leadsData } = await adminDb
        .from('leads')
        .select('*')
        .eq('installer_id', installer.id)
        .order('created_at', { ascending: false });
      leads = leadsData || [];

      const { data: reviewsData } = await adminDb
        .from('reviews')
        .select('*')
        .eq('installer_id', installer.id)
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      reviews = reviewsData || [];
    }
  } else {
    // ── 4. Not logged in → load first approved installer
    //       for the preview behind the login overlay ──
    const { data: previewInstaller } = await adminDb
      .from('installers')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    installer = previewInstaller;

    if (installer) {
      // Load their real leads too for the preview
      const { data: leadsData } = await adminDb
        .from('leads')
        .select('*')
        .eq('installer_id', installer.id)
        .order('created_at', { ascending: false })
        .limit(5);
      leads = leadsData || [];
    }
  }

  // ── 5. No approved installer exists at all ─────────
  if (!installer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-sm mx-auto p-8">
          <div className="text-6xl mb-4">🌞</div>
          <h2 className="text-xl font-black text-gray-900 mb-2">No Installer Profile Found</h2>
          <p className="text-sm text-gray-500 mb-6">
            {user
              ? `No approved installer account is linked to ${user.email}. Please contact support or apply for a listing.`
              : 'No approved installers are in the directory yet.'}
          </p>
          <a href="/for-installers/apply"
            className="inline-block bg-[#0A5C36] text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-[#0D1B12] transition-colors">
            Apply for Free Listing →
          </a>
        </div>
      </div>
    );
  }

  return (
    <DashboardClient
      installer={installer}
      leads={leads}
      reviews={reviews}
      isLoggedIn={!!user}
    />
  );
}
