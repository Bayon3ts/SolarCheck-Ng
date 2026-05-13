import { createServerClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = createServerClient();

  // Fetch some stats
  const [
    { count: installersCount },
    { count: leadsCount },
    { count: reviewsCount },
  ] = await Promise.all([
    supabase.from("installers").select("*", { count: "exact", head: true }),
    supabase.from("leads").select("*", { count: "exact", head: true }),
    supabase.from("reviews").select("*", { count: "exact", head: true }),
  ]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-text-primary mb-8">Platform Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border">
          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider">Total Installers</h3>
          <p className="mt-2 text-4xl font-bold text-text-primary">{installersCount || 0}</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border">
          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider">Total Leads</h3>
          <p className="mt-2 text-4xl font-bold text-text-primary">{leadsCount || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border">
          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider">Total Reviews</h3>
          <p className="mt-2 text-4xl font-bold text-text-primary">{reviewsCount || 0}</p>
        </div>
      </div>
    </div>
  );
}
