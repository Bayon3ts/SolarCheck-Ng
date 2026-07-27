import { createAdminClient } from "@/lib/supabase/admin";
import { InstallersClient } from "./installers-client";

export default async function AdminInstallersPage() {
  const supabase = createAdminClient();
  const { data: installers } = await supabase
    .from("installers")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-text-primary mb-8">Manage Installers</h1>

      <InstallersClient installers={installers || []} />
    </div>
  );
}
