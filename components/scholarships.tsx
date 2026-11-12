'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Check, Loader2, RefreshCw, Search, Sparkles } from 'lucide-react';
import type { ScoredScholarship, StudentProfile } from '@/lib/scholarships';
import { readPlannerAverage } from '@/lib/position';
import { authFetch } from '@/lib/supabase/client';
import { trackEvent } from '@/lib/track';
import { useAuth } from './auth-provider';
import PageSkeleton from './page-skeleton';

type Response = {
  scholarships: ScoredScholarship[];
  recommended: string[];
  profile: StudentProfile | null;
  basis: string | null;
  lastVerified: string;
  remoteCount: number;
  fetchedAt: string;
  count: number;
};

const FIELD_FILTERS = ['All fields', 'STEM', 'Business', 'Healthcare', 'Arts', 'Education', 'Media', 'Trades'];

export default function Scholarships() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<Response | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [field, setField] = useState('All fields');
  const [onlyRecommended, setOnlyRecommended] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [remoteUrls, setRemoteUrls] = useState<string[]>([]);

  useEffect(() => {
    if (authLoading) return;
    const average = readPlannerAverage();
    const url = `/api/scholarships${average != null ? `?average=${average}` : ''}`;
    authFetch(url)
      .then(async (res) => {
        if (!res.ok) throw new Error();
        setData(await res.json());
      })
      .catch(() => setError('Could not load current scholarships. Try again in a moment.'));
  }, [authLoading, user]);

  /** Manual refresh: re-fetch live remote supplement and merge with the curated list. */
  async function handleRefresh() {
    setRefreshing(true);
    try {
      const average = readPlannerAverage();
      const url = `/api/scholarships?refresh=1${average != null ? `&average=${average}` : ''}`;
      const res = await authFetch(url);
      if (!res.ok) throw new Error();
      const fresh = await res.json();
      setData(fresh);
      if (fresh.remoteCount > 0) {
        setRemoteUrls(fresh.scholarships.filter((s: any) => s.source === 'grudged-open-scholarships').map((s: any) => s.url));
      }
    } catch {
      setError('Could not refresh. Try again in a moment.');
    } finally {
      setRefreshing(false);
    }
  }

  const recommendedIds = useMemo(
    () => new Set(data?.recommended ?? []),
    [data]
  );

  const visible = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    return data.scholarships.filter((s) => {
      if (onlyRecommended && !recommendedIds.has(s.id)) return false;
      if (field !== 'All fields' && !s.fields.includes(field) && !s.fields.includes('All')) {
        return false;
      }
      if (!q) return true;
      return `${s.name} ${s.provider} ${s.description} ${s.fields.join(' ')} ${s.ecTags.join(' ')}`
        .toLowerCase()
        .includes(q);
    });
  }, [data, query, field, onlyRecommended, recommendedIds]);

  const recommendedList = visible.filter((s) => recommendedIds.has(s.id));
  const rest = visible.filter((s) => !recommendedIds.has(s.id));

  function card(s: ScoredScholarship) {
    const isRecommended = recommendedIds.has(s.id);
    return (
      <article key={s.id} className="panel panel-pad flex flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-[15px] font-semibold leading-6 text-foreground">{s.name}</h3>
            <p className="mt-0.5 text-xs text-muted">{s.provider}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-display text-xl font-semibold text-accent">{s.amount}</p>
            <p className="mt-0.5 text-[11px] text-muted">{s.deadlineLabel}</p>
          </div>
        </div>

        <p className="mt-3 text-sm leading-6 text-secondary">{s.description}</p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {isRecommended && <span className="badge badge-accent">Recommended</span>}
          {s.fields.includes('All') ? (
            <span className="badge">All fields</span>
          ) : (
            s.fields.map((f) => (
              <span key={f} className="badge">
                {f}
              </span>
            ))
          )}
          {s.ecTags.map((t) => (
            <span key={t} className="badge badge-success">
              {t}
            </span>
          ))}
          <span className="badge">{s.regions.includes('Canada') ? 'National' : s.regions.join(' · ')}</span>
        </div>

        {s.reasons.length > 0 && (
          <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-success">
            <Check size={14} className="mt-0.5 shrink-0" />
            {s.reasons.join(' · ')}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4">
          <span className="fine-print">Checked {s.verified}</span>
          <a href={s.url} target="_blank" rel="noreferrer" className="text-link text-xs">
            Apply <ArrowUpRight size={13} />
          </a>
        </div>
      </article>
    );
  }

  return (
    <div className="space-y-6">
      <div className="notice">
        <Sparkles size={16} />
        <p>
          Showing <strong>{data?.count ?? 0} active awards</strong> only — anything past its deadline
          is hidden. Deadlines last checked{' '}
          <strong>{data ? new Date(`${data.lastVerified}T00:00:00Z`).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</strong>.
          {data && data.remoteCount > 0 ? (
            <span>
              {' '}
              Plus <strong>{data.remoteCount}</strong> live external listing (please note: the free
              public scrape carries US/Nevada awards, so it supplements — never replaces — our
              Canadian nationally matched list).
            </span>
          ) : null}{' '}
          Always confirm the deadline and eligibility on the provider&apos;s site before you apply.
          <div className="mt-2 flex items-center gap-2 text-xs text-muted">
            <span className="inline-flex items-center gap-1">
              <RefreshCw
                className={`size-3 ${refreshing ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
              {refreshing ? 'Refreshing…' : `Last synced ${new Date(data?.fetchedAt ?? 0).toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' })}`}
            </span>
            <button onClick={handleRefresh} className="btn-ghost btn-sm shrink-0" disabled={refreshing}>
              Refresh
            </button>
          </div>
        </p>
      </div>

      {data?.profile && (
        <section className="panel panel-pad">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-foreground">Your recommendation profile</h2>
              <p className="mt-2 text-[13px] leading-6 text-secondary">
                {data.basis ?? 'Scholarships are recommended based on your practice and activities.'}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {data.profile.fields.map((f) => (
                  <span key={f} className="badge badge-accent">
                    {f}
                  </span>
                ))}
                {data.profile.ecCategories.map((c) => (
                  <span key={c} className="badge">
                    {c}
                  </span>
                ))}
                {data.profile.average != null && (
                  <span className="badge">Average {data.profile.average}%</span>
                )}
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Link href="/ec-rater" className="btn-ghost">
                Edit activities
              </Link>
              <Link href="/planner" className="btn-ghost">
                Set average
              </Link>
            </div>
          </div>
        </section>
      )}

      {!data?.profile && !error && (
        <section className="panel panel-pad flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Get recommendations</h2>
            <p className="mt-1 text-[13px] leading-6 text-secondary">
              Sign in and we&apos;ll rank these against your supplemental practice and saved
              activities.
            </p>
          </div>
          <SignInButton />
        </section>
      )}

      <div className="panel panel-pad space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="search-field flex-1">
            <Search size={16} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search scholarships"
              placeholder="Award, provider, field, or activity…"
              className="field"
            />
          </div>
          <label className="sr-only" htmlFor="scholarship-field">
            Filter by field of study
          </label>
          <select
            id="scholarship-field"
            value={field}
            onChange={(e) => setField(e.target.value)}
            className="field sm:w-48"
          >
            {FIELD_FILTERS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        {data?.profile && (
          <label className="flex items-center gap-2 text-sm text-secondary">
            <input
              type="checkbox"
              checked={onlyRecommended}
              onChange={(e) => {
                setOnlyRecommended(e.target.checked);
                trackEvent('scholarship_filter_changed', { recommended: String(e.target.checked) });
              }}
            />
            Show only my recommended awards
          </label>
        )}
      </div>

      {error && (
        <div role="alert" className="notice notice-error">
          <Sparkles size={16} /> {error}
        </div>
      )}

      {!data && !error && <PageSkeleton label="Loading active scholarships" />}

      {data && visible.length === 0 && (
        <div className="panel empty-state">
          <h2>No awards match</h2>
          <p>Try a different search, field, or turn off the recommended-only filter.</p>
        </div>
      )}

      {recommendedList.length > 0 && (
        <section className="space-y-4">
          <h2 className="section-heading text-sm font-semibold text-muted">
            Recommended for you ({recommendedList.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2">{recommendedList.map(card)}</div>
        </section>
      )}

      {rest.length > 0 && (
        <section className="space-y-4">
          <h2 className="section-heading text-sm font-semibold text-muted">
            All active awards ({rest.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2">{rest.map(card)}</div>
        </section>
      )}
    </div>
  );
}

function SignInButton() {
  const { openAuth } = useAuth();
  return (
    <button onClick={openAuth} className="btn-primary shrink-0">
      Sign up or sign in
    </button>
  );
}
