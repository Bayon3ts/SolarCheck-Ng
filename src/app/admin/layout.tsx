import Link from "next/link";
import { Sun, LayoutDashboard, Users, MessageSquare, BookOpen, Activity, LogOut, Settings } from "lucide-react";
import { createServerClient as createSSRClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use getSession() not getUser() — getUser() makes a network call and fails
  // when cookies are read-only (Server Component context). getSession() reads
  // the JWT directly from cookies, which always works. The middleware already
  // validates these tokens, so this is secure.
  const cookieStore = cookies();
  const supabase = createSSRClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        set(_name: string, _value: string, _options: CookieOptions) { /* read-only in layout */ },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        remove(_name: string, _options: CookieOptions) { /* read-only in layout */ },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  // No session → render children only (covers the /admin/login page)
  if (!user) {
    return <>{children}</>;
  }

  // Use admin client for internal DB queries (bypasses RLS, no cookie needed)
  const adminDb = createAdminClient();
  const { count: pendingCount } = await adminDb
    .from("installer_applications")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-primary-dark text-white flex flex-col hidden md:flex">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2">
            <Sun className="h-6 w-6 text-accent" />
            <span className="text-xl font-bold tracking-tight">
              Solar<span className="text-accent">Check</span>
            </span>
          </Link>
          <div className="mt-1 text-xs text-white/50 uppercase tracking-wider font-semibold">
            Admin Portal
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors">
            <LayoutDashboard className="h-5 w-5 text-white/70" />
            <span>Dashboard</span>
          </Link>
          <Link href="/admin/installers" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors">
            <Users className="h-5 w-5 text-white/70" />
            <span>Installers</span>
          </Link>
          <Link href="/admin/applications" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors">
            <Users className="h-5 w-5 text-white/70" /> {/* Reused icon or FileText etc. Users is fine */}
            <span>Applications</span>
            {pendingCount !== null && pendingCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-semibold">
                {pendingCount}
              </span>
            )}
          </Link>
          <Link href="/admin/leads" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors">
            <Activity className="h-5 w-5 text-white/70" />
            <span>Leads</span>
          </Link>
          <Link href="/admin/reviews" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors">
            <MessageSquare className="h-5 w-5 text-white/70" />
            <span>Reviews</span>
          </Link>
          <Link href="/admin/blog" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors">
            <BookOpen className="h-5 w-5 text-white/70" />
            <span>Blog</span>
          </Link>
          <Link href="/admin/webhooks" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors">
            <Activity className="h-5 w-5 text-white/70" />
            <span>Webhooks</span>
          </Link>
          <Link href="/admin/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors">
            <Settings className="h-5 w-5 text-white/70" />
            <span>Settings</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2 text-sm text-white/70">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center font-bold">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 truncate">{user.email}</div>
          </div>
          <form action="/auth/signout" method="post" className="mt-2">
            <button type="submit" className="flex w-full items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-left text-sm text-red-400">
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
