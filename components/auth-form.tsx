'use client';

import { useState } from 'react';
import { getSupabase } from '@/lib/supabase/client';

export default function AuthForm() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (mode === 'signin') {
        const { error } = await getSupabase().auth.signInWithPassword({ email, password });
        if (error) setError(error.message);
      } else {
        const { data, error } = await getSupabase().auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) setError(error.message);
        else if (!data.session) {
          setInfo('Account created — check your inbox for a confirmation link.');
        }
      }
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  async function forgotPassword() {
    setError(null);
    setInfo(null);
    if (!email.trim()) {
      setError('Enter your email first, then click Forgot password?.');
      return;
    }
    const { error } = await getSupabase().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin,
    });
    if (error) setError(error.message);
    else setInfo('If that account exists, a reset link is on its way.');
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-sand p-1 text-sm">
        <button
          type="button"
          onClick={() => setMode('signin')}
          className={`rounded-md py-2 transition ${
            mode === 'signin' ? 'bg-sand font-semibold text-deep' : 'text-muted'
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setMode('signup')}
          className={`rounded-md py-2 transition ${
            mode === 'signup' ? 'bg-sand font-semibold text-deep' : 'text-muted'
          }`}
        >
          Create account
        </button>
      </div>

      <form onSubmit={submit} className="space-y-3">
        <div>
          <label htmlFor="auth-email" className="mb-1 block text-xs font-medium text-muted">
            Email
          </label>
          <input
            id="auth-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@school.ca"
            className="w-full rounded-lg bg-sand px-3 py-2.5 text-sm text-deep outline-none focus:ring-2 focus:ring-moss"
          />
        </div>
        <div>
          <label htmlFor="auth-password" className="mb-1 block text-xs font-medium text-muted">
            Password
          </label>
          <input
            id="auth-password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            className="w-full rounded-lg bg-sand px-3 py-2.5 text-sm text-deep outline-none focus:ring-2 focus:ring-moss"
          />
        </div>

        {mode === 'signin' && (
          <div className="text-right">
            <button
              type="button"
              onClick={forgotPassword}
              className="text-xs text-muted transition hover:text-moss"
            >
              Forgot password?
            </button>
          </div>
        )}

        {error && (
          <p className="border-l-4 border-brick bg-brick-soft px-3 py-2 text-sm text-brick">
            {error}
          </p>
        )}
        {info && (
          <p className="border-l-2 border-moss bg-sage/30 px-3 py-2 text-sm text-moss">
            {info}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-navy py-2.5 text-sm font-medium text-paper transition hover:bg-deep disabled:opacity-60"
        >
          {loading
            ? 'Please wait…'
            : mode === 'signin'
              ? 'Sign in'
              : 'Create account'}
        </button>
      </form>
    </div>
  );
}
