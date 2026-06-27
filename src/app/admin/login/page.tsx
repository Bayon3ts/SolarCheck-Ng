"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { Sun, AlertCircle, Loader2, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    // Verify the user has admin role via user_metadata or environment variable
    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];
    const isAdmin = 
      process.env.NODE_ENV === 'development' ||
      data.user?.user_metadata?.role === 'admin' || 
      (data.user?.email && adminEmails.includes(data.user.email.toLowerCase()));

    if (!isAdmin) {
      // Sign them back out — not an admin
      await supabase.auth.signOut();
      setError("Access denied. This portal is for SolarCheck admins only.");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-primary-dark flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-accent via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-accent/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-primary/20 blur-3xl pointer-events-none" />

      {/* Card container */}
      <div className="relative sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <Sun className="h-8 w-8 text-accent" />
            <span className="text-2xl font-bold text-white tracking-tight">
              Solar<span className="text-accent">Check</span>
            </span>
          </div>
        </div>

        {/* Login card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl px-8 py-10 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 mb-4">
              <ShieldCheck className="h-7 w-7 text-accent" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
            <p className="text-white/50 text-sm mt-1">SolarCheck Nigeria · Internal Access</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Admin Email
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 focus:ring-2 focus:ring-accent/50 focus:border-accent/50 outline-none transition-all"
                placeholder="admin@solarcheckng.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 focus:ring-2 focus:ring-accent/50 focus:border-accent/50 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-accent text-primary-dark font-bold text-sm hover:bg-accent/90 transition-all disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Sign In to Admin
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-white/20 mt-8">
            Restricted access · Authorised personnel only
          </p>
        </div>
      </div>
    </div>
  );
}
