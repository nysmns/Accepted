'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { computeStats, type Stats } from '@/lib/analytics';
import type { Attempt } from '@/lib/storage';
import { authFetch } from '@/lib/supabase/client';
import { trackEvent } from '@/lib/track';
import { useAuth } from './auth-provider';
import PageSkeleton from './page-skeleton';
import { ArrowRight, Loader2, Sparkles, Trash2 } from 'lucide-react';

type Summary = {
  summary: string;
  strengths: string[];
  focusAreas: string[];
  actions: string[];
};

type JobRow = {
  id: string;
  program: string;
  program_code: string;
  university: string;
  question: string;
  answer: string;
  status: string;
  score: number | null;
  verdict: string | null;
  strengths: string[] | null;
  fixes: string[] | null;
  rewrite: string | null;
  created_at: string;
};

function toAttempt(j: JobRow): Attempt {
  return {
    id: j.id,
    programCode: j.program_code,
    program: j.program,
    university: j.university,
    question: j.question,
    answer: j.answer,
    feedback: {
      score: j.score ?? 0,
      verdict: j.verdict ?? '',
      strengths: j.strengths ?? [],
      fixes: j.fixes ?? [],
      rewrite: j.rewrite ?? '',
    },
    createdAt: new Date(j.created_at).getTime(),
  };
}

export default function AnalyticsDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [attempts, setAttempts] = useState<Attempt[] | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!user) {
      setAttempts([]);
      return;
    }
    try {
      const res = await authFetch('/api/analytics');
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Could not load your history.');
        return;
      }
      const jobs = (data.jobs ?? []).filter((j: JobRow) => j.status === 'done');
      setAttempts(jobs.map(toAttempt));
    } catch {
      setError('Network error. Try again.');
    }
  }

  useEffect(() => {
    if (!authLoading) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const stats: Stats | null = useMemo(
    () => (attempts ? computeStats(attempts) : null),
    [attempts]
  );

  async function askNova() {
    if (!stats) return;
    trackEvent('breakdown_requested', { attempts: String(stats.total) });
    setLoadingSummary(true);
    setError(null);
    setSummary(null);
    try {
      const res = await authFetch('/api/summary', {
        method: 'POST',
        body: JSON.stringify({ stats }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Could not reach Nova.');
        return;
      }
      setSummary(data as Summary);
    } catch {
      setError('Network error. Try again.');
    } finally {
      setLoadingSummary(false);
    }
  }

  async function clearHistory() {
    try {
      const res = await authFetch('/api/analytics', { method: 'DELETE' });
      if (res.ok) {
        setAttempts([]);
        setSummary(null);
      }
    } catch {
      setError('Could not clear history.');
    }
  }

  if (authLoading) {
    return <PageSkeleton />;
  }

  if (!user) {
    return (
      <div className="panel empty-state">
        <h2>Sign in to see your analytics</h2>
        <p>Your scores, progress, and Nova&apos;s breakdowns are saved to your account.</p>
        <Link href="/simulator" className="btn-primary mt-6">
          Start practicing <ArrowRight size={15} />
        </Link>
      </div>
    );
  }

  if (attempts === null) {
    return <PageSkeleton label="Loading your progress" />;
  }

  if (!stats || stats.total === 0) {
    return (
      <div className="panel empty-state">
        <h2>No attempts yet</h2>
        <p>Answer one supplemental question and Nova will start building your breakdown.</p>
        <Link href="/simulator" className="btn-primary mt-6">
          Start practicing <ArrowRight size={15} />
        </Link>
      </div>
    );
  }

  const maxAvg = Math.max(...stats.perProgram.map((p) => p.avg), 1);

  return (
    <div className="space-y-6">
      <div className="section-heading">
        <p className="fine-print" aria-live="polite">
          <strong className="font-semibold text-foreground">{stats.total}</strong> answer
          {stats.total === 1 ? '' : 's'} scored · average{' '}
          <strong className="font-semibold text-foreground">{stats.avgScore}</strong>
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={askNova}
            disabled={loadingSummary}
            className="btn-primary"
          >
            {loadingSummary ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {loadingSummary ? 'Reading your record…' : 'Ask Nova for a breakdown'}
          </button>
          <button onClick={clearHistory} className="btn-ghost">
            <Trash2 className="h-4 w-4" />
            Clear
          </button>
        </div>
      </div>

      <div className="stat-band">
        {[
          { label: 'Answers scored', value: String(stats.total) },
          { label: 'Average score', value: String(stats.avgScore) },
          { label: 'Best score', value: String(stats.bestScore) },
          {
            label: 'Weakest program',
            value: stats.weakest ? stats.weakest.program : '—',
            long: Boolean(stats.weakest && stats.weakest.program.length > 16),
          },
        ].map((s) => (
          <div key={s.label} className="stat-cell">
            <p>{s.label}</p>
            <strong className={s.long ? '!text-[19px] !leading-snug' : undefined}>{s.value}</strong>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section className="panel panel-pad">
          <h2 className="section-heading text-sm font-semibold text-muted">Score by program</h2>
          <div className="mt-5 space-y-4">
            {stats.perProgram.map((p) => (
              <div key={p.program}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="font-medium text-foreground">{p.program}</span>
                  <span className="shrink-0 font-mono text-[11px] text-muted">
                    {p.count} · avg {p.avg}
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-inset">
                  <div
                    className={`h-full rounded-full ${
                      p.avg >= 75 ? 'bg-accent' : p.avg >= 55 ? 'bg-success' : 'bg-danger'
                    }`}
                    style={{ width: `${(p.avg / maxAvg) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel panel-pad">
          <h2 className="section-heading text-sm font-semibold text-muted">Last 8 weeks</h2>
          <div className="mt-5 flex h-32 items-end gap-2">
            {stats.trend.map((w, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="flex h-24 w-full items-end rounded bg-inset">
                  {w.avg !== null ? (
                    <div
                      className="w-full rounded bg-success"
                      style={{ height: `${Math.max(w.avg, 4)}%` }}
                      title={`${w.label}: ${w.avg}`}
                    />
                  ) : null}
                </div>
                <span className="text-[9px] text-muted">{w.label}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {error && (
        <div role="alert" className="notice notice-error">
          <Sparkles className="h-4 w-4" />
          {error}
        </div>
      )}

      {summary && (
        <section className="panel">
          <div className="panel-pad">
            <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-foreground">
              <Sparkles className="h-5 w-5 text-success" /> Nova&apos;s breakdown
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-secondary">{summary.summary}</p>
          </div>
          <div className="grid gap-6 border-t border-line p-6 md:grid-cols-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Where you are strong</h3>
              <ul className="feedback-list mt-3">
                {summary.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Where you are losing marks</h3>
              <ul className="feedback-list mt-3">
                {summary.focusAreas.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Do next</h3>
              <ul className="feedback-list mt-3">
                {summary.actions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      <section className="panel overflow-hidden">
        <h2 className="panel-pad pb-0 text-sm font-semibold text-muted">Recent attempts</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Question</th>
                <th>Program</th>
                <th className="text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent.map((a, i) => (
                <tr key={a.id} className="reveal-row" style={{ '--i': i } as CSSProperties}>
                  <td className="whitespace-nowrap text-muted">
                    {new Date(a.createdAt).toLocaleDateString('en-CA', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="max-w-md">
                    <span className="line-clamp-1 text-secondary">{a.question}</span>
                  </td>
                  <td className="whitespace-nowrap text-muted">{a.program}</td>
                  <td className="text-right font-semibold text-foreground">{a.feedback.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
