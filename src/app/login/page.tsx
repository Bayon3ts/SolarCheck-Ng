'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Mail, Eye, EyeOff, AlertTriangle, ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* ── LEFT: Branding panel ── */}
      <div className="hidden md:flex flex-col justify-between bg-[#0A5C3A] w-[45%] p-12 overflow-hidden relative">
        {/* Logo */}
        <Link href="/" className="z-10">
          <span className="text-[22px] font-medium text-white">
            Solar<span className="text-[#F5A623]">Check</span>
          </span>
        </Link>

        {/* Hero Section */}
        <div className="z-10 mt-16 mb-auto space-y-8">
          <h1 className="text-[36px] font-medium text-white leading-[1.2] tracking-[-0.5px]">
            Your leads.<br />Your business.<br />Managed.
          </h1>

          <div className="flex flex-col items-start gap-3">
            {[
              { icon: '💬', text: 'Instant WhatsApp lead alerts' },
              { icon: '📊', text: 'Track every lead to close' },
              { icon: '⭐', text: 'Reviews that win customers' },
            ].map((feature, i) => (
              <div 
                key={i}
                className="inline-flex items-center gap-2 rounded-full border border-white border-opacity-20 px-[14px] py-[5px] bg-[#ffffff] bg-opacity-10 backdrop-blur-sm"
              >
                <span className="text-sm rounded-full bg-white bg-opacity-0 flex items-center justify-center">{feature.icon}</span>
                <span className="text-[13px] text-white">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom decorative section */}
        <div className="relative mt-12 z-10">
          {/* Concentric Decorative Rings */}
          <div className="absolute -bottom-32 -left-32 w-96 h-96 pointer-events-none">
            <div className="absolute inset-0 rounded-full border border-[#F5A623] opacity-[0.08]" />
            <div className="absolute inset-12 rounded-full border border-[#F5A623] opacity-[0.12]" />
            <div className="absolute inset-24 rounded-full border border-[#F5A623] opacity-[0.35]" />
          </div>

          <div className="relative z-20 space-y-2">
            <p className="text-[12px] text-white text-opacity-40 uppercase tracking-widest font-medium">
              Trusted across Nigeria
            </p>
            <p className="text-[12px] text-white text-opacity-55">
              Lagos · Abuja · Port Harcourt · Ibadan
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Login form ── */}
      <div className="flex-1 flex items-center justify-center bg-white p-12">
        {/* Container for form */}
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="md:hidden mb-8 text-center text-[22px] font-medium text-[#0A5C3A]">
            Solar<span className="text-[#F5A623]">Check</span>
          </div>

          <h2 className="text-[24px] font-medium tracking-[-0.3px] text-gray-900 mb-1">
            Installer Login
          </h2>
          <p className="text-[14px] text-gray-500 mb-8">
            Access your leads and dashboard
          </p>

          {/* ── LOGIN METHOD TABS ── */}
          <div className="flex bg-gray-100 rounded-full p-1 mb-8">
            {[
              { id: 'email', label: 'Email & Password' },
              { id: 'whatsapp', label: 'WhatsApp OTP' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setLoginMethod(tab.id as 'email' | 'whatsapp')}
                className={`flex-1 py-1.5 px-4 rounded-full text-[13px] transition-all ${
                  loginMethod === tab.id
                    ? 'bg-white text-gray-900 border border-gray-200 font-medium'
                    : 'text-gray-500 hover:text-gray-900 font-normal border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── EMAIL/PASSWORD FORM ── */}
          {loginMethod === 'email' && (
            <div className="space-y-[18px]">
              <div className="relative flex items-center">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full h-[44px] px-3 bg-gray-50 border border-transparent rounded-[8px] text-[14px] focus:bg-white focus:border-[#0A5C3A] focus:outline-none transition-colors pr-10"
                />
                <Mail className="absolute right-3 w-[18px] h-[18px] text-gray-400 pointer-events-none" />
              </div>

              <div>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    onKeyDown={(e) => e.key === 'Enter' && handleEmailLogin()}
                    className="w-full h-[44px] px-3 bg-gray-50 border border-transparent rounded-[8px] text-[14px] focus:bg-white focus:border-[#0A5C3A] focus:outline-none transition-colors pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                  </button>
                </div>
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[13px] text-[#0A5C3A] hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              {emailError && (
                <div className={`border rounded-[8px] px-3 py-2.5 text-[14px] flex items-start gap-2 ${emailError.includes('✓') ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]' : 'bg-[#FEF2F2] border-[#FCA5A5] text-[#B91C1C]'}`}>
                  {!emailError.includes('✓') && <AlertTriangle className="w-[18px] h-[18px] text-[#EF4444] shrink-0 mt-[2px]" />}
                  <span>{emailError}</span>
                </div>
              )}

              <button
                onClick={handleEmailLogin}
                disabled={loading}
                className="w-full h-[48px] bg-[#0A5C3A] text-white font-medium rounded-[8px] text-[14px] hover:bg-[#0D6B44] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? 'Signing in...' : 'Sign In'}
                {!loading && <ArrowRight className="w-4 h-4 ml-1" />}
              </button>
            </div>
          )}

          {/* ── WHATSAPP OTP FORM ── */}
          {loginMethod === 'whatsapp' && (
            <div className="space-y-[18px]">
              {!otpSent ? (
                <>
                  <div className="relative flex items-center">
                    <div className="absolute left-0 top-0 bottom-0 flex items-center px-3 bg-gray-100 border border-transparent rounded-l-[8px] text-[14px] text-gray-500 font-medium pointer-events-none">
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
                      className="w-full h-[44px] pl-[84px] pr-3 bg-gray-50 border border-transparent rounded-[8px] text-[14px] focus:bg-white focus:border-[#0A5C3A] focus:outline-none transition-colors"
                    />
                  </div>

                  {otpError && (
                    <div className="bg-[#FEF2F2] border border-[#FCA5A5] rounded-[8px] px-3 py-2.5 text-[14px] text-[#B91C1C] flex items-start gap-2">
                      <AlertTriangle className="w-[18px] h-[18px] text-[#EF4444] shrink-0 mt-[2px]" />
                      <span>{otpError}</span>
                    </div>
                  )}

                  <button
                    onClick={handleSendOtp}
                    disabled={loading || whatsappNumber.length < 10}
                    className="w-full h-[48px] bg-[#0A5C3A] text-white font-medium rounded-[8px] text-[14px] hover:bg-[#0D6B44] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {loading ? 'Sending...' : 'Send WhatsApp Code'}
                    {!loading && <ArrowRight className="w-4 h-4 ml-1" />}
                  </button>
                </>
              ) : (
                <>
                  <div className="text-center py-2">
                    <p className="font-medium text-gray-900 mb-1">
                      Check your WhatsApp
                    </p>
                    <p className="text-[13px] text-gray-500">
                      We sent a 6-digit code to +234 {whatsappNumber}
                    </p>
                  </div>

                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) =>
                      setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                    }
                    placeholder="000 000"
                    maxLength={6}
                    className="w-full h-[48px] bg-gray-50 border border-transparent rounded-[8px] text-[20px] font-mono text-center tracking-[0.4em] focus:bg-white focus:border-[#0A5C3A] focus:outline-none transition-colors"
                  />

                  {otpError && (
                    <div className="bg-[#FEF2F2] border border-[#FCA5A5] rounded-[8px] px-3 py-2.5 text-[14px] text-[#B91C1C] flex items-start gap-2">
                      <AlertTriangle className="w-[18px] h-[18px] text-[#EF4444] shrink-0 mt-[2px]" />
                      <span>{otpError}</span>
                    </div>
                  )}

                  <button
                    onClick={handleVerifyOtp}
                    disabled={loading || otpCode.length < 6}
                    className="w-full h-[48px] bg-[#0A5C3A] text-white font-medium rounded-[8px] text-[14px] hover:bg-[#0D6B44] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {loading ? 'Verifying...' : 'Verify & Sign In'}
                    {!loading && <ArrowRight className="w-4 h-4 ml-1" />}
                  </button>

                  <button
                    onClick={() => {
                      setOtpSent(false);
                      setOtpCode('');
                      setOtpError('');
                    }}
                    className="w-full text-[13px] text-gray-500 hover:text-[#0A5C3A] transition-colors py-2"
                  >
                    ← Use a different number
                  </button>
                </>
              )}
            </div>
          )}

          {/* ── DIVIDER ── */}
          <div className="flex items-center gap-3 my-8">
            <div className="flex-1 h-[1px] bg-gray-200" />
            <span className="text-[12px] text-gray-400 uppercase tracking-widest font-medium">New to SolarCheck?</span>
            <div className="flex-1 h-[1px] bg-gray-200" />
          </div>

          {/* ── REGISTER CTA ── */}
          <Link
            href="/installers/apply"
            className="w-full h-[44px] flex items-center justify-center gap-2 border border-black border-opacity-10 text-gray-900 font-medium rounded-[8px] text-[14px] hover:bg-gray-50 transition-colors"
          >
            Apply for a free listing <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
