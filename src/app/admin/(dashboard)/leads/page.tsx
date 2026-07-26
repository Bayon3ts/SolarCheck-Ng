import { createAdminClient } from "@/lib/supabase/admin";
import { RematchButton } from "./rematch-button-ui";

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

      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-border">
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">Date</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">Customer</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">Location</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">Matched Installer</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">Intent</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">Type</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {leads?.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50/50">
                <td className="px-6 py-4 text-sm text-text-muted">
                  {new Date(lead.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-text-primary">{lead.full_name}</div>
                  <div className="text-sm text-text-muted">
                    {lead.email} · {lead.phone}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-text-primary">
                  {lead.city}, {lead.state}
                </td>
                <td className="px-6 py-4 text-sm">
                  {lead.installers?.company_name ? (
                    <span className="font-medium text-primary">
                      {lead.installers.company_name}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                      Unmatched
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`inline-flex items-center gap-1 whitespace-nowrap text-xs font-bold px-2.5 py-1 rounded-full ${
                      (lead.intent_score || 0) >= 80
                        ? "text-red-700 bg-red-100" // Hot
                        : (lead.intent_score || 0) >= 50
                        ? "text-orange-700 bg-orange-100" // Warm
                        : "text-blue-700 bg-blue-100" // Cold
                    }`}
                  >
                    <span>🔥</span>
                    <span>{lead.intent_score || 0}</span>
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full ${
                      lead.lead_type === "exclusive"
                        ? "text-purple-700 bg-purple-100"
                        : "text-blue-700 bg-blue-100"
                    }`}
                  >
                    {lead.lead_type === "exclusive" ? "Exclusive" : "Shared"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full ${
                      lead.status === "converted"
                        ? "text-green-700 bg-green-100"
                        : lead.status === "quoted"
                        ? "text-blue-700 bg-blue-100"
                        : lead.status === "contacted"
                        ? "text-indigo-700 bg-indigo-100"
                        : "text-gray-700 bg-gray-100"
                    }`}
                  >
                    {lead.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
