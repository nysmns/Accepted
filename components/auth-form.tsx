'use client';

import { useId, useState, type FormEvent, type KeyboardEvent } from 'react';
import { ArrowRight, Check, CircleAlert, LoaderCircle } from 'lucide-react';
import { getSupabase } from '@/lib/supabase/client';
import { trackEvent } from '@/lib/track';

type Mode = 'signin' | 'signup';

const TABS: { id: Mode; label: string }[] = [
  { id: 'signin', label: 'Sign in' },
  { id: 'signup', label: 'Create account' },
];

export default function AuthForm() {
  const uid = useId();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setInfo(null);
  }

  function onTabKey(e: KeyboardEvent, i: number) {
    const next =
      e.key === 'ArrowRight' ? (i + 1) % TABS.length : e.key === 'ArrowLeft' ? (i - 1 + TABS.length) % TABS.length : null;
    if (next === null) return;
    e.preventDefault();
    switchMode(TABS[next].id);
    document.getElementById(`${uid}-${TABS[next].id}`)?.focus();
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (mode === 'signin') {
        const { error } = await getSupabase().auth.signInWithPassword({ email, password });
        if (error) setError(error.message);
        else trackEvent('sign_in');
      } else {
        const { data, error } = await getSupabase().auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) setError(error.message);
        else {
          trackEvent('sign_up');
          if (!data.session) setInfo('Account created. Check your inbox for a confirmation link.');
        }
      }
    } catch {
      setError('We couldn’t connect to sign-in. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  }

  async function forgotPassword() {
    setError(null);
    setInfo(null);
    if (!email.trim()) {
      setError('Enter your email first, then select Forgot password.');
      return;
    }
    try {
      const { error } = await getSupabase().auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin,
      });
      if (error) setError(error.message);
      else setInfo('If that account exists, a reset link is on its way.');
    } catch {
      setError('We couldn’t send the reset link. Please try again in a moment.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="tabs" role="tablist" aria-label="Account access">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            id={`${uid}-${t.id}`}
            type="button"
            role="tab"
            aria-selected={mode === t.id}
            aria-controls={`${uid}-form`}
            tabIndex={mode === t.id ? 0 : -1}
            onClick={() => switchMode(t.id)}
            onKeyDown={(e) => onTabKey(e, i)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form
        id={`${uid}-form`}
        role="tabpanel"
        aria-label={mode === 'signin' ? 'Sign in' : 'Create account'}
        onSubmit={submit}
        className="space-y-4"
      >
        <div>
          <label htmlFor={`${uid}-email`} className="field-label">
            Email address
          </label>
          <input
            id={`${uid}-email`}
            className="field"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@school.ca"
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor={`${uid}-password`} className="field-label">
              Password
            </label>
            {mode === 'signin' && (
              <button type="button" onClick={forgotPassword} className="min-h-11 text-xs text-accent hover:underline">
                Forgot password?
              </button>
            )}
          </div>
          <input
            id={`${uid}-password`}
            className="field"
            type="password"
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
          />
        </div>

        {error && (
          <div role="alert" className="notice notice-error">
            <CircleAlert size={17} aria-hidden="true" />
            <div>{error}</div>
          </div>
        )}
        {info && (
          <div role="status" className="notice notice-success">
            <Check size={17} aria-hidden="true" />
            <div>{info}</div>
          </div>
        )}

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? (
            <>
              <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> Please wait…
            </>
          ) : (
            <>
              {mode === 'signin' ? 'Sign in' : 'Create account'} <ArrowRight size={16} aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      <p className="fine-print text-center">Your planning. Your practice. Your own pace.</p>
    </div>
  );
}
