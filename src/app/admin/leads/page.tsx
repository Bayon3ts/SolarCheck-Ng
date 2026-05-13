import { createServerClient } from "@/lib/supabase/server";

export default async function AdminLeadsPage() {
  const supabase = createServerClient();
  const { data: leads } = await supabase
    .from("leads")
    .select("*, installers(company_name)")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-text-primary mb-8">All Leads</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-border">
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">Date</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">Customer</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">Location</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">Matched Installer</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">System Size</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {leads?.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50/50">
                <td className="px-6 py-4 text-sm text-text-muted">
                  {new Date(lead.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-text-primary">{lead.name}</div>
                  <div className="text-sm text-text-muted">{lead.email} • {lead.phone}</div>
                </td>
                <td className="px-6 py-4 text-sm text-text-primary">
                  {lead.city}, {lead.state}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-primary">
                  {lead.installers?.company_name || "Unmatched"}
                </td>
                <td className="px-6 py-4 text-sm text-text-primary">
                  {lead.estimated_system_size || lead.property_type}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
