import { createAdminClient } from "@/lib/supabase/admin";
import { SponsorsClient } from "./sponsors-client";

/* ═══════════════════════════════════════ */
/* /admin/sponsors — Server Page           */
/* Mirrors leads/page.tsx structure        */
/* ═══════════════════════════════════════ */

export default async function AdminSponsorsPage() {
  const supabase = createAdminClient();

  const { data: banners } = await supabase
    .from("sponsor_banners")
    .select(
      "id, company_name, plan, payment_status, is_active, starts_at, ends_at, impressions, clicks, created_at"
    )
    .order("created_at", { ascending: false });

  const pendingReview =
    banners?.filter((b) => b.payment_status === "paid" && !b.is_active).length ?? 0;
  const live = banners?.filter((b) => b.is_active).length ?? 0;
  const total = banners?.length ?? 0;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Sponsor Banners</h1>
          <p className="text-sm text-text-muted mt-1">
            {live} live · {pendingReview} awaiting review · {total} total
          </p>
        </div>
        <a
          href="/advertise"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline"
        >
          View /advertise page →
        </a>
      </div>

      <SponsorsClient banners={banners || []} />
    </div>
  );
}
