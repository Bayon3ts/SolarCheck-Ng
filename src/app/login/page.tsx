'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [loginMethod, setLoginMethod] = useState<'email' | 'whatsapp'>('email');

  // Email login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');

  // WhatsApp OTP
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleEmailLogin = async () => {
    if (!email || !password) {
      setEmailError('Please enter your email and password');
      return;
    }
    setLoading(true);
    setEmailError('');

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setEmailError(
        error.message === 'Invalid login credentials'
          ? 'Wrong email or password. Try again.'
          : error.message
      );
      setLoading(false);
      return;
    }

    router.push('/dashboard');
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setEmailError('Enter your email above first');
      return;
    }
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
    });
    setEmailError('✓ Password reset link sent to your email');
  };

  const handleSendOtp = async () => {
    setLoading(true);
    setOtpError('');

    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: whatsappNumber,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setOtpError(data.error || 'Could not send OTP. Check your number.');
    } else {
      setOtpSent(true);
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setOtpError('');

    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: whatsappNumber,
        code: otpCode,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setOtpError(data.error || 'Invalid code. Try again.');
      setLoading(false);
      return;
    }

    if (data.action_link) {
      // The action_link includes redirect params so Supabase will set the cookie and redirect
      window.location.href = data.action_link;
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* ── LEFT: Branding panel ── */}
      <div className="hidden lg:flex flex-col justify-between bg-primary p-12">
        {/* Logo */}
        <Link href="/">
          <span className="text-2xl font-black text-white">
            Solar<span className="text-accent">Check</span>
          </span>
        </Link>

        {/* Value prop */}
        <div>
          <h1 className="text-4xl font-black text-white leading-tight mb-6">
            Your leads.<br />
            Your business.<br />
            Managed.
          </h1>

          {/* 3 benefit bullets */}
          <div className="space-y-4">
            {[
              {
                icon: '📱',
                text: 'Get lead alerts instantly on WhatsApp',
              },
              {
                icon: '📊',
                text: 'Track every lead from contact to close',
              },
              {
                icon: '⭐',
                text: 'Build reviews that win more customers',
              },
            ].map((item) => (
              <div key={item.text} className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{item.icon}</span>
                <p className="text-white/80 text-sm leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div className="mt-8 pt-8 border-t border-white/20">
            <p className="text-white/60 text-sm">
              Trusted by solar installers across Nigeria
            </p>
            <div className="flex gap-4 mt-3">
              {['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan'].map((city) => (
                <span key={city} className="text-xs text-white/50">
                  {city}
                </span>
              ))}
            </div>
          </div>
        </div>

        <p className="text-white/40 text-xs">© 2026 SolarCheck Nigeria</p>
      </div>

      {/* ── RIGHT: Login form ── */}
      <div className="flex items-center justify-center p-6 lg:p-12 bg-gray-50 min-h-screen">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link href="/">
              <span className="text-2xl font-black text-primary-dark">
                Solar<span className="text-primary">Check</span>
              </span>
            </Link>
          </div>

          <h2 className="text-2xl font-black text-text-primary mb-1">
            Installer Login
          </h2>
          <p className="text-text-muted text-sm mb-8">
            Access your leads and dashboard
          </p>

          {/* ── LOGIN METHOD TABS ── */}
          <div className="flex bg-gray-200 rounded-2xl p-1 mb-6">
            {[
              {
                id: 'email',
                label: '✉️ Email & Password',
              },
              {
                id: 'whatsapp',
                label: '💬 WhatsApp OTP',
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setLoginMethod(tab.id as 'email' | 'whatsapp')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all ${
                  loginMethod === tab.id
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── EMAIL/PASSWORD FORM ── */}
          {loginMethod === 'email' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-text-primary block mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full px-4 py-3 border-2 border-border rounded-xl text-sm focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-sm font-semibold text-text-primary">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    onKeyDown={(e) => e.key === 'Enter' && handleEmailLogin()}
                    className="w-full px-4 py-3 border-2 border-border rounded-xl text-sm focus:border-primary focus:outline-none transition-colors pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary text-xs"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {emailError && (
                <div
                  className={`border rounded-xl px-4 py-3 text-sm flex items-center gap-2 ${
                    emailError.includes('✓')
                      ? 'bg-green-50 border-green-200 text-green-700'
                      : 'bg-red-50 border-red-200 text-red-700'
                  }`}
                >
                  {!emailError.includes('✓') && <span>⚠️</span>}
                  {emailError}
                </div>
              )}

              <button
                onClick={handleEmailLogin}
                disabled={loading}
                className="w-full bg-primary text-white font-bold py-4 rounded-2xl text-sm hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? 'Signing in...' : 'Sign In →'}
              </button>
            </div>
          )}

          {/* ── WHATSAPP OTP FORM ── */}
          {loginMethod === 'whatsapp' && (
            <div className="space-y-4">
              {!otpSent ? (
                // Step 1: Enter phone number
                <>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex gap-3 mb-2">
                    <span className="text-xl flex-shrink-0">💬</span>
                    <p className="text-sm text-green-800">
                      We&apos;ll send a 6-digit code to your WhatsApp. Use the same
                      number registered on SolarCheck.
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-text-primary block mb-1.5">
                      WhatsApp Number
                    </label>
                    <div className="flex gap-2">
                      <div className="flex items-center px-3 bg-gray-100 border-2 border-border rounded-xl text-sm font-semibold text-text-muted flex-shrink-0">
                        🇳🇬 +234
                      </div>
                      <input
                        type="tel"
                        value={whatsappNumber}
                        onChange={(e) =>
                          setWhatsappNumber(e.target.value.replace(/\D/g, ''))
                        }
                        placeholder="0803 XXX XXXX"
                        maxLength={11}
                        className="flex-1 px-4 py-3 border-2 border-border rounded-xl text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  {otpError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                      {otpError}
                    </div>
                  )}

                  <button
                    onClick={handleSendOtp}
                    disabled={loading || whatsappNumber.length < 10}
                    className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl text-sm hover:bg-green-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span className="text-xl leading-none">💬</span>
                    )}
                    {loading ? 'Sending...' : 'Send WhatsApp Code'}
                  </button>
                </>
              ) : (
                // Step 2: Enter OTP
                <>
                  <div className="text-center py-4">
                    <div className="text-4xl mb-3">📱</div>
                    <p className="font-bold text-text-primary mb-1">
                      Check your WhatsApp
                    </p>
                    <p className="text-sm text-text-muted">
                      We sent a 6-digit code to +234 {whatsappNumber}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-text-primary block mb-1.5 text-center">
                      Enter 6-digit code
                    </label>
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) =>
                        setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                      }
                      placeholder="000000"
                      maxLength={6}
                      className="w-full px-4 py-4 border-2 border-border rounded-xl text-2xl font-mono text-center tracking-[0.5em] focus:border-primary focus:outline-none"
                    />
                  </div>

                  {otpError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 text-center">
                      {otpError}
                    </div>
                  )}

                  <button
                    onClick={handleVerifyOtp}
                    disabled={loading || otpCode.length < 6}
                    className="w-full bg-primary text-white font-bold py-4 rounded-2xl text-sm hover:bg-primary-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {loading ? 'Verifying...' : 'Verify & Sign In →'}
                  </button>

                  {/* Resend option */}
                  <button
                    onClick={() => {
                      setOtpSent(false);
                      setOtpCode('');
                      setOtpError('');
                    }}
                    className="w-full text-sm text-text-muted hover:text-primary transition-colors py-2"
                  >
                    ← Use a different number
                  </button>

                  {/* Countdown resend */}
                  <p className="text-center text-xs text-text-muted">
                    Code expires in 10 minutes
                  </p>
                </>
              )}
            </div>
          )}

          {/* ── DIVIDER ── */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-text-muted">New to SolarCheck?</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* ── REGISTER CTA ── */}
          <Link
            href="/installers/register?plan=featured"
            className="w-full flex items-center justify-center gap-2 border-2 border-border text-text-primary font-semibold py-3.5 rounded-2xl text-sm hover:border-primary hover:text-primary transition-colors"
          >
            Apply for a free listing →
          </Link>

          <p className="text-center text-xs text-text-muted mt-4">
            Free listing · No monthly fee to start
          </p>
        </div>
      </div>
    </div>
  );
}
