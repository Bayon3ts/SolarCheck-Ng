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
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes subtlePulse {
          0% { transform: scale(1); opacity: 0.15; }
          50% { transform: scale(1.05); opacity: 0.25; }
          100% { transform: scale(1); opacity: 0.15; }
        }
        .anim-fade-up {
          animation: fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        @keyframes slideLeft {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .anim-slide-left {
          animation: slideLeft 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
      `}</style>

      <div className="min-h-screen flex flex-col md:flex-row">
        {/* ── LEFT: Branding panel ── */}
        <div className="hidden md:flex flex-col justify-between bg-[#0A5C3A] w-[45%] p-12 overflow-hidden relative">
          {/* Logo */}
          <Link href="/" className="z-10 anim-fade-up">
            <span className="text-[22px] font-medium text-white">
              Solar<span className="text-[#F5A623]">Check</span>
            </span>
          </Link>

          {/* Hero Section */}
          <div className="z-10 mt-16 mb-auto space-y-8">
            <h1 className="text-[36px] font-medium text-white leading-[1.2] tracking-[-0.5px] anim-fade-up delay-100">
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
                  className={`inline-flex items-center gap-2 rounded-full border border-white border-opacity-20 px-[14px] py-[5px] bg-[#ffffff] bg-opacity-10 backdrop-blur-sm anim-fade-up delay-${200 + i * 100}`}
                >
                  <span className="text-sm rounded-full bg-white bg-opacity-0 flex items-center justify-center">{feature.icon}</span>
                  <span className="text-[13px] text-white">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom decorative section */}
          <div className="relative mt-12 z-10 anim-fade-up delay-500">
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
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-[#f8faf9] to-[#e4efeb] p-6 md:p-12 relative overflow-hidden anim-slide-left">
          
          {/* Subtle animated blobs for glassmorphism background */}
          <div 
            className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#34D399] rounded-full mix-blend-multiply filter blur-[120px] pointer-events-none"
            style={{ animation: 'subtlePulse 8s infinite ease-in-out' }}
          />
          <div 
            className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#F5A623] rounded-full mix-blend-multiply filter blur-[120px] pointer-events-none"
            style={{ animation: 'subtlePulse 10s infinite ease-in-out reverse' }}
          />

          {/* Container for form (Glassmorphism card) */}
          <div className="w-full max-w-[440px] bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.06)] rounded-[24px] p-8 sm:p-10 anim-fade-up delay-200 z-10">
            
            {/* Mobile logo */}
            <div className="md:hidden mb-8 text-center text-[22px] font-medium text-[#0A5C3A]">
              Solar<span className="text-[#F5A623]">Check</span>
            </div>

            <h2 className="text-[26px] font-semibold tracking-[-0.3px] text-gray-900 mb-1">
              Installer Login
            </h2>
            <p className="text-[14px] text-gray-500 mb-8">
              Access your leads and dashboard
            </p>

            {/* ── LOGIN METHOD TABS ── */}
            <div className="flex bg-gray-900/5 p-1 rounded-full mb-8">
              {[
                { id: 'email', label: 'Email & Password' },
                { id: 'whatsapp', label: 'WhatsApp OTP' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setLoginMethod(tab.id as 'email' | 'whatsapp')}
                  className={`flex-1 py-2 px-4 rounded-full text-[13px] transition-all ${
                    loginMethod === tab.id
                      ? 'bg-white text-gray-900 shadow-sm font-semibold'
                      : 'text-gray-500 hover:text-gray-900 font-medium'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── EMAIL/PASSWORD FORM ── */}
            {loginMethod === 'email' && (
              <div className="space-y-[18px] anim-fade-up">
                <div className="relative flex items-center">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full h-[48px] px-4 bg-white/60 border border-white/40 shadow-inner rounded-[12px] text-[14px] focus:bg-white focus:border-[#0A5C3A] focus:ring-2 focus:ring-[#0A5C3A]/10 focus:outline-none transition-all pr-10"
                  />
                  <Mail className="absolute right-4 w-[18px] h-[18px] text-gray-400 pointer-events-none" />
                </div>

                <div>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      onKeyDown={(e) => e.key === 'Enter' && handleEmailLogin()}
                      className="w-full h-[48px] px-4 bg-white/60 border border-white/40 shadow-inner rounded-[12px] text-[14px] focus:bg-white focus:border-[#0A5C3A] focus:ring-2 focus:ring-[#0A5C3A]/10 focus:outline-none transition-all pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-4 text-gray-400 hover:text-gray-600"
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
                  <div className={`border rounded-[12px] px-4 py-3 text-[14px] flex items-start gap-2 ${emailError.includes('✓') ? 'bg-[#F0FDF4]/80 backdrop-blur-sm border-[#BBF7D0] text-[#166534]' : 'bg-[#FEF2F2]/80 backdrop-blur-sm border-[#FCA5A5] text-[#B91C1C]'}`}>
                    {!emailError.includes('✓') && <AlertTriangle className="w-[18px] h-[18px] text-[#EF4444] shrink-0 mt-[2px]" />}
                    <span>{emailError}</span>
                  </div>
                )}

                <button
                  onClick={handleEmailLogin}
                  disabled={loading}
                  className="w-full h-[50px] bg-[#0A5C3A] text-white font-semibold rounded-[12px] text-[14px] hover:bg-[#0D6B44] hover:shadow-lg hover:shadow-[#0A5C3A]/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {loading ? 'Signing in...' : 'Sign In'}
                  {!loading && <ArrowRight className="w-4 h-4 ml-1" />}
                </button>
              </div>
            )}

            {/* ── WHATSAPP OTP FORM ── */}
            {loginMethod === 'whatsapp' && (
              <div className="space-y-[18px] anim-fade-up">
                {!otpSent ? (
                  <>
                    <div className="relative flex items-center">
                      <div className="absolute left-0 top-0 bottom-0 flex items-center px-4 bg-gray-900/5 border border-transparent rounded-l-[12px] text-[14px] text-gray-600 font-medium pointer-events-none backdrop-blur-sm">
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
                        className="w-full h-[48px] pl-[92px] pr-4 bg-white/60 border border-white/40 shadow-inner rounded-[12px] text-[14px] focus:bg-white focus:border-[#0A5C3A] focus:ring-2 focus:ring-[#0A5C3A]/10 focus:outline-none transition-all"
                      />
                    </div>

                    {otpError && (
                      <div className="bg-[#FEF2F2]/80 backdrop-blur-sm border border-[#FCA5A5] rounded-[12px] px-4 py-3 text-[14px] text-[#B91C1C] flex items-start gap-2">
                        <AlertTriangle className="w-[18px] h-[18px] text-[#EF4444] shrink-0 mt-[2px]" />
                        <span>{otpError}</span>
                      </div>
                    )}

                    <button
                      onClick={handleSendOtp}
                      disabled={loading || whatsappNumber.length < 10}
                      className="w-full h-[50px] bg-[#0A5C3A] text-white font-semibold rounded-[12px] text-[14px] hover:bg-[#0D6B44] hover:shadow-lg hover:shadow-[#0A5C3A]/20 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      {loading ? 'Sending...' : 'Send WhatsApp Code'}
                      {!loading && <ArrowRight className="w-4 h-4 ml-1" />}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="text-center py-2 anim-fade-up">
                      <p className="font-semibold text-gray-900 mb-1">
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
                      className="w-full h-[56px] bg-white/60 border border-white/40 shadow-inner rounded-[12px] text-[22px] font-mono text-center tracking-[0.4em] focus:bg-white focus:border-[#0A5C3A] focus:ring-2 focus:ring-[#0A5C3A]/10 focus:outline-none transition-all"
                    />

                    {otpError && (
                      <div className="bg-[#FEF2F2]/80 backdrop-blur-sm border border-[#FCA5A5] rounded-[12px] px-4 py-3 text-[14px] text-[#B91C1C] flex items-start gap-2">
                        <AlertTriangle className="w-[18px] h-[18px] text-[#EF4444] shrink-0 mt-[2px]" />
                        <span>{otpError}</span>
                      </div>
                    )}

                    <button
                      onClick={handleVerifyOtp}
                      disabled={loading || otpCode.length < 6}
                      className="w-full h-[50px] bg-[#0A5C3A] text-white font-semibold rounded-[12px] text-[14px] hover:bg-[#0D6B44] hover:shadow-lg hover:shadow-[#0A5C3A]/20 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
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
                      className="w-full text-[13px] font-medium text-gray-500 hover:text-[#0A5C3A] transition-colors py-2"
                    >
                      ← Use a different number
                    </button>
                  </>
                )}
              </div>
            )}

            {/* ── DIVIDER ── */}
            <div className="flex items-center gap-3 my-8">
              <div className="flex-1 h-[1px] bg-gray-900/10" />
              <span className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold">New to SolarCheck?</span>
              <div className="flex-1 h-[1px] bg-gray-900/10" />
            </div>

            {/* ── REGISTER CTA ── */}
            <Link
              href="/installers/apply"
              className="w-full h-[48px] flex items-center justify-center gap-2 border border-gray-900/10 bg-white/40 text-gray-900 font-semibold rounded-[12px] text-[14px] hover:bg-white/80 transition-all shadow-sm"
            >
              Apply for a free listing <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}