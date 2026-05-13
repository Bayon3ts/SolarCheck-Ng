import { createServerClient } from "@/lib/supabase/server";

export default async function AdminWebhooksPage() {
  const supabase = createServerClient();
  const { data: logs } = await supabase
    .from("webhook_logs")
    .select("*, installers(company_name)")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-text-primary mb-8">Paystack Webhook Logs</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-border">
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">Date</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">Event</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">Reference</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">Installer</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">Amount</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {logs?.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50/50">
                <td className="px-6 py-4 text-sm text-text-muted">
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-text-primary">
                  {log.event_type}
                </td>
                <td className="px-6 py-4 text-sm font-mono text-text-muted">
                  {log.paystack_reference}
                </td>
                <td className="px-6 py-4 text-sm text-primary">
                  {log.installers?.company_name || log.installer_id}
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  ₦{(log.amount / 100).toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  {log.status === "success" ? (
                    <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">Success</span>
                  ) : (
                    <span className="text-xs font-medium text-red-700 bg-red-100 px-2 py-1 rounded-full">{log.status}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
