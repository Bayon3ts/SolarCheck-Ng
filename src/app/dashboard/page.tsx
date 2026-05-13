import { Metadata } from "next";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Users, 
  Star, 
  Settings, 
  CreditCard,
  LogOut,
  TrendingUp,
  Eye,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Installer Dashboard | SolarCheck",
};

export default async function DashboardPage() {
  const supabase = createServerClient();
  
  // NOTE: For Phase 4/5 demonstration, we are simulating a logged-in installer.
  // In a production environment with @supabase/ssr, this would be:
  // const { data: { session } } = await supabase.auth.getSession();
  // if (!session) redirect('/login');
  
  // Fetching a mock installer for the demo
  const { data: installer } = await supabase
    .from("installers")
    .select("*")
    .limit(1)
    .single();

  if (!installer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="card p-8 text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No Installers Found</h2>
          <p className="text-text-muted mb-6">Run the database seed script to populate demo data.</p>
          <Button asChild><Link href="/">Return Home</Link></Button>
        </div>
      </div>
    );
  }

  // Fetch leads for this installer
  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .eq("installer_id", installer.id)
    .order("created_at", { ascending: false });

  // Stats calculations
  const totalLeads = leads?.length || 0;
  const newLeads = leads?.filter(l => l.status === "new").length || 0;
  const convertedLeads = leads?.filter(l => l.status === "converted").length || 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-border md:min-h-screen flex flex-col">
        <div className="p-6 border-b border-border">
          <Link href="/" className="text-2xl font-bold text-primary-dark">
            Solar<span className="text-primary">Check</span>
          </Link>
          <div className="mt-6 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
              {installer.company_name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary truncate max-w-[140px]">{installer.company_name}</p>
              <p className="text-xs text-text-muted capitalize">{installer.subscription_tier} Plan</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/5 text-primary font-medium">
            <LayoutDashboard className="h-5 w-5" /> Overview
          </Link>
          <Link href="/dashboard/leads" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-muted hover:bg-gray-50 hover:text-text-primary transition-colors">
            <Users className="h-5 w-5" /> Leads Management
          </Link>
          <Link href="/dashboard/reviews" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-muted hover:bg-gray-50 hover:text-text-primary transition-colors">
            <Star className="h-5 w-5" /> Reviews
          </Link>
          <Link href="/dashboard/billing" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-muted hover:bg-gray-50 hover:text-text-primary transition-colors">
            <CreditCard className="h-5 w-5" /> Subscription
          </Link>
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-muted hover:bg-gray-50 hover:text-text-primary transition-colors">
            <Settings className="h-5 w-5" /> Profile & Settings
          </Link>
        </nav>

        <div className="p-4 border-t border-border">
          <button className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-text-muted hover:bg-red-50 hover:text-red-600 transition-colors">
            <LogOut className="h-5 w-5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Welcome back, {installer.company_name}</h1>
            <p className="text-text-muted mt-1">Here's what's happening with your SolarCheck profile today.</p>
          </div>
          <Button variant="outline" asChild>
            <Link href={`/installers/${installer.slug}`} target="_blank">View Public Profile</Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="card p-6">
            <div className="flex items-center gap-3 text-text-muted mb-4">
              <Users className="h-5 w-5 text-primary" /> Total Leads
            </div>
            <div className="text-3xl font-bold text-text-primary">{totalLeads}</div>
            <div className="text-xs text-green-600 mt-2 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +12% from last month
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center gap-3 text-text-muted mb-4">
              <AlertCircle className="h-5 w-5 text-accent" /> New Leads
            </div>
            <div className="text-3xl font-bold text-text-primary">{newLeads}</div>
            <div className="text-xs text-text-muted mt-2">Requires immediate contact</div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-3 text-text-muted mb-4">
              <CheckCircle2 className="h-5 w-5 text-green-600" /> Converted
            </div>
            <div className="text-3xl font-bold text-text-primary">{convertedLeads}</div>
            <div className="text-xs text-text-muted mt-2">{(convertedLeads / (totalLeads || 1) * 100).toFixed(1)}% conversion rate</div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-3 text-text-muted mb-4">
              <Eye className="h-5 w-5 text-blue-500" /> Profile Views
            </div>
            <div className="text-3xl font-bold text-text-primary">1,248</div>
            <div className="text-xs text-text-muted mt-2">Last 30 days</div>
          </div>
        </div>

        {/* Recent Leads Table */}
        <div className="card overflow-hidden">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <h2 className="text-lg font-bold text-text-primary">Recent Leads</h2>
            <Button variant="ghost" size="sm" asChild><Link href="/dashboard/leads">View All</Link></Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-border text-xs uppercase tracking-wider text-text-muted">
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Customer Name</th>
                  <th className="p-4 font-medium">Location</th>
                  <th className="p-4 font-medium">Needs</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leads && leads.length > 0 ? (
                  leads.slice(0, 5).map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 text-sm text-text-muted whitespace-nowrap">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-sm font-medium text-text-primary">
                        {lead.full_name}
                      </td>
                      <td className="p-4 text-sm text-text-muted">
                        {lead.city}, {lead.state}
                      </td>
                      <td className="p-4 text-sm text-text-muted">
                        {lead.monthly_bill_range}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize
                          ${lead.status === 'new' ? 'bg-amber-100 text-amber-800' : 
                            lead.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                            lead.status === 'converted' ? 'bg-green-100 text-green-800' : 
                            'bg-gray-100 text-gray-800'}`}
                        >
                          {lead.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <Button variant="outline" size="sm">View Details</Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-text-muted">
                      No leads received yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
