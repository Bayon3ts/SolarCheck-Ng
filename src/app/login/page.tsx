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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: whatsappNumber }),
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: whatsappNumber, code: otpCode }),
    });

    const data = await res.json();

    if (!res.ok) {
      setOtpError(data.error || 'Invalid code. Try again.');
      setLoading(false);
      return;
    }

    if (data.action_link) {
      window.location.href = data.action_link;
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <>
      <style>{`
        /* ── Keyframes ── */
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(0.9);  opacity: 0.7; }
          70%  { transform: scale(1.15); opacity: 0;   }
          100% { transform: scale(0.9);  opacity: 0;   }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px);  }
          50%       { transform: translateY(-6px); }
        }
        @keyframes orbit {
          from { transform: rotate(0deg)   translateX(52px) rotate(0deg);   }
          to   { transform: rotate(360deg) translateX(52px) rotate(-360deg); }
        }
        @keyframes orbit2 {
          from { transform: rotate(120deg) translateX(72px) rotate(-120deg); }
          to   { transform: rotate(480deg) translateX(72px) rotate(-480deg); }
        }
        @keyframes orbit3 {
          from { transform: rotate(240deg) translateX(38px) rotate(-240deg); }
          to   { transform: rotate(600deg) translateX(38px) rotate(-600deg); }
        }
        @keyframes bgPan {
          0%   { background-position: 50% 45%; }
          50%  { background-position: 50% 55%; }
          100% { background-position: 50% 45%; }
        }
        @keyframes spin {
          from { transform: rotate(0deg);   }
          to   { transform: rotate(360deg); }
        }

        /* ── Utility classes ── */
        .anim-up         { animation: fadeSlideUp 0.6s cubic-bezier(0.22,1,0.36,1) both; }
        .anim-fade       { animation: fadeIn      0.5s ease both; }
        .delay-100       { animation-delay: 0.10s; }
        .delay-200       { animation-delay: 0.20s; }
        .delay-300       { animation-delay: 0.30s; }
        .delay-400       { animation-delay: 0.40s; }
        .delay-500       { animation-delay: 0.50s; }

        /* ── Full-bleed background ── */
        .login-bg {
          position: fixed;
          inset: 0;
          background-image: url('/images/login-bg.png');
          background-size: cover;
          background-position: 50% 45%;
          animation: bgPan 18s ease-in-out infinite;
          z-index: 0;
        }
        /* Green duotone overlay */
        .login-bg::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            160deg,
            rgba(4,32,18,0.82) 0%,
            rgba(8,68,40,0.72) 50%,
            rgba(4,32,18,0.88) 100%
          );
        }
        /* Vignette */
        .login-bg::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(
            ellipse at center,
            transparent 40%,
            rgba(0,0,0,0.55) 100%
          );
          z-index: 1;
        }

        /* ── Animated solar orb (top-left) ── */
        .orb-wrap {
          position: fixed;
          top: 48px;
          left: 48px;
          width: 200px;
          height: 200px;
          z-index: 1;
          pointer-events: none;
          display: none;
        }
        @media (min-width: 900px) { .orb-wrap { display: block; } }

        .orb-sun {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%,-50%);
          width: 48px; height: 48px;
          border-radius: 50%;
          background: radial-gradient(circle,#F5A623 0%,#F59E0B 55%,rgba(245,166,35,0.15) 100%);
          animation: float 3.5s ease-in-out infinite;
          box-shadow: 0 0 30px rgba(245,166,35,0.55), 0 0 70px rgba(245,166,35,0.20);
        }
        .orb-pulse {
          position: absolute; inset: -6px;
          border-radius: 50%;
          border: 2px solid rgba(245,166,35,0.45);
          animation: pulse-ring 2.2s ease-out infinite;
        }
        .orb-ring {
          position: absolute;
          top: 50%; left: 50%;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.08);
          transform: translate(-50%,-50%);
        }
        .orb-dot {
          position: absolute;
          top: 50%; left: 50%;
          border-radius: 50%;
          margin-top: -4px; margin-left: -4px;
        }

        /* ── Logo watermark (top-center always) ── */
        .login-logo {
          position: fixed;
          top: 32px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          font-size: 22px;
          font-weight: 700;
          letter-spacing: -0.3px;
          color: white;
          text-decoration: none;
          white-space: nowrap;
        }

        /* ── Card ── */
        .login-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 420px;
          background: rgba(255,255,255,0.97);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 40px;
          box-shadow:
            0 8px 32px rgba(0,0,0,0.28),
            0 2px  8px rgba(0,0,0,0.12),
            0 0   0 1px rgba(255,255,255,0.12);
        }

        /* ── Inputs ── */
        .inp {
          width: 100%;
          height: 48px;
          padding: 0 44px 0 14px;
          background: #F4F7F5;
          border: 1.5px solid #DDE8E2;
          border-radius: 12px;
          font-size: 14px;
          color: #111;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }
        .inp:focus {
          background: #fff;
          border-color: #0A5C3A;
          box-shadow: 0 0 0 3px rgba(10,92,58,0.10);
        }
        .inp::placeholder { color: #9CA8A3; }

        /* ── Primary button ── */
        .btn-p {
          width: 100%; height: 50px;
          background: #0A5C3A;
          color: #fff;
          font-weight: 700;
          font-size: 15px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
          letter-spacing: 0.01em;
        }
        .btn-p::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.10) 50%,transparent 100%);
          background-size: 200% 100%;
          animation: shimmer 2.5s infinite;
        }
        .btn-p:hover:not(:disabled) {
          background: #0D6B44;
          transform: translateY(-1px);
          box-shadow: 0 6px 22px rgba(10,92,58,0.30);
        }
        .btn-p:active:not(:disabled) { transform: translateY(0); }
        .btn-p:disabled { opacity: 0.52; cursor: not-allowed; }

        /* ── Tabs ── */
        .tab { flex: 1; padding: 8px 10px; border-radius: 10px; font-size: 13px; border: none; cursor: pointer; transition: all 0.2s; font-weight: 500; }
        .tab.on  { background: #fff; color: #0A5C3A; font-weight: 700; box-shadow: 0 1px 4px rgba(0,0,0,0.10); }
        .tab.off { background: transparent; color: #6B7280; }
        .tab.off:hover { color: #111; }
      `}</style>

      {/* ── Full-bleed background ── */}
      <div className="login-bg" />

      {/* ── Animated solar orb (desktop only, top-left) ── */}
      <div className="orb-wrap anim-fade delay-300">
        {/* Sun */}
        <div className="orb-sun">
          <div className="orb-pulse" />
        </div>
        {/* Ring 1 — r=104px */}
        <div className="orb-ring" style={{ width: '104px', height: '104px', marginLeft: '-52px', marginTop: '-52px' }}>
          <div className="orb-dot" style={{ width: '8px', height: '8px', background: '#60A5FA', boxShadow: '0 0 8px #60A5FA', animation: 'orbit 5s linear infinite' }} />
        </div>
        {/* Ring 2 — r=144px */}
        <div className="orb-ring" style={{ width: '144px', height: '144px', marginLeft: '-72px', marginTop: '-72px' }}>
          <div className="orb-dot" style={{ width: '10px', height: '10px', background: '#34D399', boxShadow: '0 0 10px #34D399', animation: 'orbit2 9s linear infinite' }} />
        </div>
        {/* Ring 3 — r=76px */}
        <div className="orb-ring" style={{ width: '76px', height: '76px', marginLeft: '-38px', marginTop: '-38px' }}>
          <div className="orb-dot" style={{ width: '6px', height: '6px', background: '#FBBF24', boxShadow: '0 0 6px #FBBF24', animation: 'orbit3 12s linear infinite' }} />
        </div>
      </div>

      {/* ── Logo (always top-center) ── */}
      <Link href="/" className="login-logo anim-fade">
        Solar<span style={{ color: '#F5A623' }}>Check</span>
      </Link>

      {/* ── Page scroll container ── */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '96px 20px 48px',
        fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
      }}>
        {/* ── Card ── */}
        <div className="login-card anim-up">

          {/* ☀️ Icon + heading */}
          <div className="anim-up delay-100" style={{ marginBottom: '24px' }}>
            <div style={{
              width: '40px', height: '40px',
              borderRadius: '11px',
              background: 'linear-gradient(135deg,#0A5C3A,#0D7248)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', marginBottom: '16px',
            }}>
              ☀️
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0D1F17', letterSpacing: '-0.4px', marginBottom: '6px' }}>
              Welcome back
            </h2>
            <p style={{ fontSize: '14px', color: '#6B8278' }}>
              Sign in to access your leads and installer dashboard
            </p>
          </div>

          {/* ── Tab switcher ── */}
          <div className="anim-up delay-200" style={{
            display: 'flex', background: '#EDF2EF', borderRadius: '14px',
            padding: '4px', marginBottom: '24px', gap: '4px',
          }}>
            {([
              { id: 'email', label: '✉️  Email & Password' },
              { id: 'whatsapp', label: '💬  WhatsApp OTP' },
            ] as const).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setLoginMethod(tab.id)}
                className={`tab ${loginMethod === tab.id ? 'on' : 'off'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── EMAIL FORM ── */}
          {loginMethod === 'email' && (
            <div className="anim-fade" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {/* Email */}
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="inp"
                />
                <Mail style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#9CA8A3', pointerEvents: 'none' }} />
              </div>

              {/* Password */}
              <div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    onKeyDown={(e) => e.key === 'Enter' && handleEmailLogin()}
                    className="inp"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA8A3', display: 'flex', alignItems: 'center' }}>
                    {showPassword ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    style={{ fontSize: '13px', color: '#0A5C3A', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Forgot password?
                  </button>
                </div>
              </div>

              {/* Error */}
              {emailError && (
                <div className="anim-up" style={{
                  borderRadius: '10px', padding: '10px 14px', fontSize: '13px',
                  display: 'flex', alignItems: 'flex-start', gap: '8px',
                  background: emailError.includes('✓') ? '#F0FDF4' : '#FEF2F2',
                  border: `1px solid ${emailError.includes('✓') ? '#BBF7D0' : '#FCA5A5'}`,
                  color: emailError.includes('✓') ? '#166534' : '#B91C1C',
                }}>
                  {!emailError.includes('✓') && <AlertTriangle style={{ width: '15px', height: '15px', flexShrink: 0, marginTop: '1px' }} />}
                  <span>{emailError}</span>
                </div>
              )}

              <button onClick={handleEmailLogin} disabled={loading} className="btn-p" style={{ marginTop: '4px' }}>
                {loading && <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />}
                {loading ? 'Signing in…' : 'Sign In'}
                {!loading && <ArrowRight style={{ width: '16px', height: '16px' }} />}
              </button>
            </div>
          )}

          {/* ── WHATSAPP FORM ── */}
          {loginMethod === 'whatsapp' && (
            <div className="anim-fade" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {!otpSent ? (
                <>
                  {/* Info banner */}
                  <div style={{
                    background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px',
                    padding: '11px 14px', fontSize: '13px', color: '#166534',
                    display: 'flex', alignItems: 'flex-start', gap: '8px',
                  }}>
                    <span>💬</span>
                    <span>We&apos;ll send a 6-digit code to your WhatsApp. Use the same number registered on SolarCheck.</span>
                  </div>

                  {/* Phone */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{
                      height: '48px', padding: '0 14px',
                      background: '#EDF2EF', border: '1.5px solid #DDE8E2', borderRadius: '12px',
                      display: 'flex', alignItems: 'center',
                      fontSize: '14px', color: '#374151', fontWeight: '600',
                      whiteSpace: 'nowrap', flexShrink: 0,
                    }}>
                      🇳🇬 +234
                    </div>
                    <input
                      type="tel"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="0803 XXX XXXX"
                      maxLength={11}
                      className="inp"
                      style={{ paddingLeft: '14px' }}
                    />
                  </div>

                  {otpError && (
                    <div className="anim-up" style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#B91C1C', display: 'flex', gap: '8px' }}>
                      <AlertTriangle style={{ width: '15px', height: '15px', flexShrink: 0 }} />
                      <span>{otpError}</span>
                    </div>
                  )}

                  <button onClick={handleSendOtp} disabled={loading || whatsappNumber.length < 10} className="btn-p">
                    {loading && <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />}
                    {loading ? 'Sending…' : 'Send WhatsApp Code'}
                    {!loading && <ArrowRight style={{ width: '16px', height: '16px' }} />}
                  </button>
                </>
              ) : (
                <>
                  <div style={{ textAlign: 'center', padding: '8px 0' }}>
                    <div style={{ fontSize: '38px', marginBottom: '10px' }}>📱</div>
                    <p style={{ fontWeight: '700', color: '#0D1F17', fontSize: '16px', marginBottom: '6px' }}>Check your WhatsApp</p>
                    <p style={{ fontSize: '13px', color: '#6B8278' }}>We sent a 6-digit code to +234 {whatsappNumber}</p>
                  </div>

                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="0  0  0  0  0  0"
                    maxLength={6}
                    style={{
                      width: '100%', height: '64px',
                      background: '#F4F7F5',
                      border: `1.5px solid ${otpCode.length === 6 ? '#0A5C3A' : '#DDE8E2'}`,
                      borderRadius: '16px', fontSize: '28px', fontFamily: 'monospace',
                      textAlign: 'center', letterSpacing: '0.3em', outline: 'none',
                      transition: 'all 0.2s ease', color: '#0D1F17', fontWeight: '700',
                      boxShadow: otpCode.length === 6 ? '0 0 0 3px rgba(10,92,58,0.10)' : 'none',
                      boxSizing: 'border-box',
                    }}
                  />

                  {otpError && (
                    <div className="anim-up" style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#B91C1C', display: 'flex', gap: '8px' }}>
                      <AlertTriangle style={{ width: '15px', height: '15px', flexShrink: 0 }} />
                      <span>{otpError}</span>
                    </div>
                  )}

                  <button onClick={handleVerifyOtp} disabled={loading || otpCode.length < 6} className="btn-p">
                    {loading && <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />}
                    {loading ? 'Verifying…' : 'Verify & Sign In'}
                    {!loading && <ArrowRight style={{ width: '16px', height: '16px' }} />}
                  </button>

                  <button
                    onClick={() => { setOtpSent(false); setOtpCode(''); setOtpError(''); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#6B8278', padding: '8px', textAlign: 'center', width: '100%' }}>
                    ← Use a different number
                  </button>
                </>
              )}
            </div>
          )}

          {/* ── Divider ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#E0E8E4' }} />
            <span style={{ fontSize: '11px', color: '#9CAB9E', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              New to SolarCheck?
            </span>
            <div style={{ flex: 1, height: '1px', background: '#E0E8E4' }} />
          </div>

          {/* ── Register CTA ── */}
          <Link
            href="/installers/apply"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              height: '48px', border: '1.5px solid #0A5C3A', borderRadius: '12px',
              fontSize: '14px', fontWeight: '600', color: '#0A5C3A',
              textDecoration: 'none', transition: 'all 0.2s ease', background: 'transparent',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#0A5C3A'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#0A5C3A'; }}>
            Apply for a free listing
            <ArrowRight style={{ width: '15px', height: '15px' }} />
          </Link>

          {/* Trust line */}
          <p style={{ textAlign: 'center', fontSize: '12px', color: '#9CAB9E', marginTop: '18px' }}>
            🔒 Your data is encrypted and secure
          </p>
        </div>
      </div>
    </>
  );
}