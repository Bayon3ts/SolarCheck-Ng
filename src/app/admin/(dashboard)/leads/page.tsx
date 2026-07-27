import { createAdminClient } from "@/lib/supabase/admin";
import { RematchButton } from "./rematch-button-ui";
import { LeadsClient } from "./leads-client";

export default async function AdminLeadsPage() {
  const supabase = createAdminClient();
  const { data: leads } = await supabase
    .from("leads")
    .select("*, installers(company_name)")
    .order("created_at", { ascending: false });

  const unmatchedCount = leads?.filter((l) => !l.installer_id).length ?? 0;
  const matchedCount = leads?.filter((l) => l.installer_id).length ?? 0;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">All Leads</h1>
          <p className="text-sm text-text-muted mt-1">
            {matchedCount} matched · {unmatchedCount} unmatched · {leads?.length ?? 0} total
          </p>
        </div>
        {unmatchedCount > 0 && <RematchButton unmatchedCount={unmatchedCount} />}
      </div>

      <LeadsClient leads={leads || []} />
    </div>
  );
}
