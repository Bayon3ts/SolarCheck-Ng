'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

interface SocialLoginButtonsProps {
  /** Where to send the user after successful login. Defaults to /account */
  redirectTo?: string;
}

/**
 * Optional Google/Facebook sign-in for HOMEOWNERS.
 * This is deliberately never used to gate any page — it's an optional
 * convenience so a returning homeowner can see their leads and warranty
 * registrations in one place. Anonymous use of the calculator, fraud
 * checkers, and lead form continues to work with zero login required.
 */
export function SocialLoginButtons({ redirectTo = '/account' }: SocialLoginButtonsProps) {
  const [loading, setLoading] = useState<'google' | 'facebook' | null>(null);
  const [error, setError] = useState('');

  async function handleLogin(provider: 'google' | 'facebook') {
    setLoading(provider);
    setError('');
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
        },
      });
      if (oauthError) {
        setError(`Could not start sign-in: ${oauthError.message}`);
        setLoading(null);
      }
      // On success, Supabase redirects the browser away — no further action needed here.
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(null);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => handleLogin('google')}
        disabled={loading !== null}
        className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 px-4 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors disabled:opacity-60"
      >
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z" />
          <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18z" />
          <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.03l2.99-2.33z" />
          <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.97l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58z" />
        </svg>
        {loading === 'google' ? 'Redirecting...' : 'Continue with Google'}
      </button>

      <button
        type="button"
        onClick={() => handleLogin('facebook')}
        disabled={loading !== null}
        className="w-full flex items-center justify-center gap-3 bg-[#1877F2] rounded-xl py-3 px-4 text-sm font-semibold text-white hover:bg-[#1565D8] transition-colors disabled:opacity-60"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="white">
          <path d="M18 9a9 9 0 1 0-10.4 8.9v-6.3H5.3V9h2.3V7c0-2.3 1.4-3.5 3.4-3.5.97 0 1.98.17 1.98.17v2.2h-1.1c-1.1 0-1.45.68-1.45 1.38V9h2.46l-.4 2.6h-2.06v6.3A9 9 0 0 0 18 9z" />
        </svg>
        {loading === 'facebook' ? 'Redirecting...' : 'Continue with Facebook'}
      </button>

      {error && <p className="text-xs text-red-600 text-center">{error}</p>}

      <p className="text-[11px] text-slate-400 text-center leading-relaxed">
        Optional — you can use SolarCheck&apos;s calculator and get installer quotes
        without signing in. Sign in only if you&apos;d like to track your requests
        in one place.
      </p>
    </div>
  );
}