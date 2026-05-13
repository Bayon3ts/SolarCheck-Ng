import { createServerClient } from "@/lib/supabase/server";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AdminInstallersPage() {
  const supabase = createServerClient();
  const { data: installers } = await supabase
    .from("installers")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-text-primary mb-8">Manage Installers</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-border">
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">Company</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">Location</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-muted">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-text-muted text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {installers?.map((installer) => (
              <tr key={installer.id} className="hover:bg-gray-50/50">
                <td className="px-6 py-4">
                  <div className="font-medium text-text-primary">{installer.company_name}</div>
                  <div className="text-sm text-text-muted">{installer.email}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-text-primary">{installer.city}, {installer.state}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {installer.is_verified ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                        <CheckCircle2 className="h-3 w-3" /> Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
                        <AlertTriangle className="h-3 w-3" /> Pending
                      </span>
                    )}
                    {installer.is_active ? (
                      <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-full">Active</span>
                    ) : (
                      <span className="text-xs font-medium text-red-700 bg-red-100 px-2 py-1 rounded-full">Suspended</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <form action={`/api/admin/installers/${installer.id}/verify`} method="POST">
                      <Button type="submit" variant="outline" size="sm">
                        {installer.is_verified ? "Unverify" : "Verify"}
                      </Button>
                    </form>
                    <form action={`/api/admin/installers/${installer.id}/toggle-active`} method="POST">
                      <Button type="submit" variant="secondary" size="sm" className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200">
                        {installer.is_active ? "Suspend" : "Activate"}
                      </Button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
