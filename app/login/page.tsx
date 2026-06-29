'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import type { ConfirmationResult } from 'firebase/auth';

type Mode = 'email' | 'phone';

export default function LoginPage() {
  const router = useRouter();
  const {
    user,
    loading,
    signInGoogle,
    signInMicrosoft,
    signInEmail,
    registerEmail,
    startPhoneSignIn,
  } = useAuth();

  const [mode, setMode] = useState<Mode>('email');
  const [register, setRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [user, loading, router]);

  async function run(fn: () => Promise<void>) {
    setError(null);
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-drover-bark px-6 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 block text-center text-2xl font-semibold text-drover-bone">
          Drover
        </Link>

        <div className="card">
          <h1 className="text-xl font-semibold">Welcome back</h1>
          <p className="mt-1 text-sm text-drover-sage">
            Log in or create an account to access your dashboard.
          </p>

          {/* Social providers */}
          <div className="mt-6 grid gap-3">
            <button
              className="btn-ghost"
              disabled={busy}
              onClick={() => run(signInGoogle)}
            >
              Continue with Google
            </button>
            <button
              className="btn-ghost"
              disabled={busy}
              onClick={() => run(signInMicrosoft)}
            >
              Continue with Microsoft
            </button>
          </div>

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wide text-drover-sage">
            <span className="h-px flex-1 bg-drover-dust" />
            or
            <span className="h-px flex-1 bg-drover-dust" />
          </div>

          {/* Email / phone toggle */}
          <div className="mb-4 flex rounded-full bg-drover-dust/40 p-1 text-sm">
            <button
              className={`flex-1 rounded-full py-1.5 ${mode === 'email' ? 'bg-white shadow' : ''}`}
              onClick={() => setMode('email')}
            >
              Email
            </button>
            <button
              className={`flex-1 rounded-full py-1.5 ${mode === 'phone' ? 'bg-white shadow' : ''}`}
              onClick={() => setMode('phone')}
            >
              Phone
            </button>
          </div>

          {mode === 'email' ? (
            <div className="grid gap-3">
              <div>
                <label className="label">Email</label>
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@property.com.au"
                />
              </div>
              <div>
                <label className="label">Password</label>
                <input
                  className="input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <button
                className="btn-primary mt-1"
                disabled={busy}
                onClick={() =>
                  run(() => (register ? registerEmail(email, password) : signInEmail(email, password)))
                }
              >
                {register ? 'Create account' : 'Log in'}
              </button>
              <button
                className="text-center text-xs text-drover-sage hover:text-drover-ink"
                onClick={() => setRegister((r) => !r)}
              >
                {register ? 'Have an account? Log in' : 'New here? Create an account'}
              </button>
            </div>
          ) : (
            <div className="grid gap-3">
              {!confirmation ? (
                <>
                  <div>
                    <label className="label">Phone (with country code)</label>
                    <input
                      className="input"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+61 4XX XXX XXX"
                    />
                  </div>
                  <button
                    className="btn-primary"
                    disabled={busy}
                    onClick={() =>
                      run(async () => {
                        const c = await startPhoneSignIn(phone, 'recaptcha-container');
                        setConfirmation(c);
                      })
                    }
                  >
                    Send code
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <label className="label">Verification code</label>
                    <input
                      className="input"
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="123456"
                    />
                  </div>
                  <button
                    className="btn-primary"
                    disabled={busy}
                    onClick={() => run(async () => void (await confirmation.confirm(code)))}
                  >
                    Verify & log in
                  </button>
                </>
              )}
              {/* Invisible reCAPTCHA mount point for phone auth */}
              <div id="recaptcha-container" />
            </div>
          )}

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </div>

        <p className="mt-6 text-center text-xs text-drover-bone/70">
          By continuing you agree to our{' '}
          <Link href="/privacy" className="underline hover:text-drover-bone">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
