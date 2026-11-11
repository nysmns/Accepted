'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, CloudUpload, Loader2, MessageSquareWarning, Plus, Trash2 } from 'lucide-react';
import { UNIVERSITIES } from '@/lib/data/programs';
import { EC_KEY, type EcLevel } from '@/lib/position';
import { categoriesForEc, type EcCategory } from '@/lib/ec-tags';
import { authFetch } from '@/lib/supabase/client';
import { trackEvent } from '@/lib/track';
import { useAuth } from './auth-provider';

type Ec = { id: string; name: string; role: string; duration: string; hours: string; detail: string };
type Result = {
  summary: string;
  overallLevel: EcLevel;
  ranked: { name: string; tier: EcLevel; why: string; leverage: string }[];
  gaps: string[];
};

const DRAFT_KEY = 'accepted-ecs-draft-v1';
const MAX_ECS = 8;
const blank = (): Ec => ({ id: crypto.randomUUID(), name: '', role: '', duration: '', hours: '', detail: '' });

const TIER: Record<EcLevel, string> = {
  standout: 'bg-accent text-on-accent',
  strong: 'bg-success-tint text-success',
  solid: 'bg-inset text-secondary',
  light: 'bg-inset text-muted',
};

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export default function EcRater() {
  const { user, loading: authLoading } = useAuth();
  const [ecs, setEcs] = useState<Ec[]>([blank()]);
  const [target, setTarget] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [ready, setReady] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const dirty = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load: the account list when signed in, the browser draft otherwise.
  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;

    if (user) {
      authFetch('/api/ecs')
        .then(async (res) => {
          if (!res.ok) throw new Error();
          const data = await res.json();
          if (cancelled) return;
          const list = Array.isArray(data.ecs) ? data.ecs : [];
          if (list.length) {
            setEcs(
              list.map((e: Omit<Ec, 'hours'> & { hours: number }) => ({ ...e, hours: String(e.hours) }))
            );
          }
          setReady(true);
        })
        .catch(() => {
          if (cancelled) return;
          setError('Could not load your saved activities. You can still edit them here.');
          setReady(true);
        });
    } else {
      try {
        const d = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? 'null');
        if (Array.isArray(d?.ecs) && d.ecs.length) setEcs(d.ecs.slice(0, MAX_ECS));
        if (typeof d?.target === 'string') setTarget(d.target);
      } catch {
        // a bad draft just starts fresh
      }
      setReady(true);
    }

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  // Browser draft for signed-out students.
  useEffect(() => {
    if (!ready || user) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ ecs, target }));
    } catch {
      // storage unavailable: drafts just won't persist
    }
  }, [ecs, target, ready, user]);

  // Debounced save to the account.
  useEffect(() => {
    if (!ready || !user || !dirty.current) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const list = ecs
        .filter((e) => e.name.trim())
        .map((e) => ({ ...e, hours: Number(e.hours) || 0 }));
      if (!list.length) return;
      setSaveState('saving');
      try {
        const res = await authFetch('/api/ecs', { method: 'PUT', body: JSON.stringify({ ecs: list }) });
        setSaveState(res.ok ? 'saved' : 'error');
      } catch {
        setSaveState('error');
      }
    }, 800);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [ecs, ready, user]);

  const update = useCallback((id: string, patch: Partial<Ec>) => {
    dirty.current = true;
    setSaveState('idle');
    setEcs((list) => list.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }, []);

  const remove = useCallback((id: string) => {
    dirty.current = true;
    setSaveState('idle');
    setEcs((list) => (list.length > 1 ? list.filter((e) => e.id !== id) : list));
  }, []);

  async function rate() {
    if (ecs.some((e) => !e.name.trim())) {
      setError('Give every activity a name, or remove the empty ones.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await authFetch('/api/ec', {
        method: 'POST',
        body: JSON.stringify({
          target,
          ecs: ecs.map((e) => ({ ...e, hours: Number(e.hours) || 0 })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Could not rate your ECs.');
        return;
      }
      setResult(data);
      trackEvent('ec_rated', { count: String(ecs.length), level: data.overallLevel });
      try {
        localStorage.setItem(EC_KEY, JSON.stringify({ level: data.overallLevel }));
      } catch {
        // the planner just won't see the level
      }
    } catch {
      setError('Network error. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  const tagsFor = (ec: Ec): EcCategory[] =>
    categoriesForEc(`${ec.name} ${ec.role} ${ec.detail}`).slice(0, 4);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="panel panel-pad space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Your activities</h2>
            <p className="mt-1 text-[12px] leading-6 text-muted">
              {user
                ? 'Saved to your account. Edit anything and it updates automatically.'
                : 'Saved in this browser. Sign in to keep them on your account.'}
            </p>
          </div>
          {user && (
            <span
              className="badge"
              role="status"
              aria-live="polite"
              data-state={saveState}
            >
              {saveState === 'saving' && <Loader2 size={12} className="animate-spin" />}
              {saveState === 'saved' && <Check size={12} />}
              {saveState === 'error' && <MessageSquareWarning size={12} />}
              {saveState === 'saving'
                ? 'Saving…'
                : saveState === 'saved'
                  ? 'Saved'
                  : saveState === 'error'
                    ? 'Could not save'
                    : 'On your account'}
            </span>
          )}
        </div>

        <div>
          <label htmlFor="ec-target" className="field-label">
            Target program (optional)
          </label>
          <select
            id="ec-target"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="field"
          >
            <option value="">No specific program</option>
            {UNIVERSITIES.map((u) => (
              <optgroup key={u.key} label={u.name}>
                {u.programs.map((p) => (
                  <option key={p.code} value={`${u.name}: ${p.name}`}>
                    {p.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {ecs.map((ec, i) => (
          <fieldset key={ec.id} className="space-y-3 rounded-xl border border-line bg-canvas p-4">
            <div className="flex items-center justify-between gap-2">
              <legend className="text-xs font-semibold text-accent">Activity {i + 1}</legend>
              {ecs.length > 1 && (
                <button
                  onClick={() => remove(ec.id)}
                  aria-label={`Remove activity ${i + 1}`}
                  className="icon-button -mr-2 -mt-1"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
            <input
              aria-label="Activity name"
              value={ec.name}
              maxLength={80}
              placeholder="Activity (e.g. Robotics Club)"
              onChange={(e) => update(ec.id, { name: e.target.value })}
              className="field"
            />
            <div className="grid gap-3 sm:grid-cols-3">
              <input
                aria-label="Your role"
                value={ec.role}
                maxLength={80}
                placeholder="Your role"
                onChange={(e) => update(ec.id, { role: e.target.value })}
                className="field"
              />
              <input
                aria-label="How long"
                value={ec.duration}
                maxLength={40}
                placeholder="How long (2 yrs)"
                onChange={(e) => update(ec.id, { duration: e.target.value })}
                className="field"
              />
              <input
                aria-label="Hours per week"
                value={ec.hours}
                inputMode="numeric"
                placeholder="Hrs / week"
                onChange={(e) => update(ec.id, { hours: e.target.value.replace(/\D/g, '').slice(0, 2) })}
                className="field"
              />
            </div>
            <textarea
              aria-label="What you did and what changed"
              value={ec.detail}
              maxLength={600}
              rows={3}
              placeholder="What did you actually do, and what changed because of it? Numbers help."
              onChange={(e) => update(ec.id, { detail: e.target.value })}
              className="field resize-y"
            />
            {tagsFor(ec).length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tagsFor(ec).map((tag) => (
                  <span key={tag} className="badge badge-accent">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </fieldset>
        ))}

        {ecs.length < MAX_ECS && (
          <button
            onClick={() => {
              dirty.current = true;
              setEcs((l) => [...l, blank()]);
            }}
            className="text-link"
          >
            <Plus size={15} /> Add activity
          </button>
        )}

        {error && (
          <div role="alert" className="notice notice-error">
            <MessageSquareWarning size={16} /> {error}
          </div>
        )}

        <button onClick={rate} disabled={loading} className="btn-primary w-full">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Ranking…
            </>
          ) : (
            <>
              <CloudUpload size={16} /> Rank my ECs
            </>
          )}
        </button>
      </section>

      <section className="panel panel-pad min-h-[320px]" aria-live="polite">
        {!result ? (
          <div className="empty-state my-16">
            <h2>Your ranking appears here</h2>
            <p>Nova ranks each activity by depth, responsibility and impact, then tells you how to make it count.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <span className={`badge ${TIER[result.overallLevel]} capitalize`}>
                Overall: {result.overallLevel}
              </span>
              <p className="mt-3 text-[15px] leading-relaxed text-secondary">{result.summary}</p>
            </div>

            <ol className="space-y-4">
              {result.ranked.map((r, i) => (
                <li key={`${r.name}-${i}`} className="rounded-xl border border-line bg-canvas p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-base font-medium text-foreground">
                      {i + 1}. {r.name}
                    </h3>
                    <span
                      className={`badge shrink-0 capitalize ${TIER[r.tier]}`}
                    >
                      {r.tier}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted">{r.why}</p>
                  <p className="mt-2 text-sm leading-6 text-secondary">
                    <span className="font-semibold text-accent">Make it count: </span>
                    {r.leverage}
                  </p>
                </li>
              ))}
            </ol>

            {result.gaps.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground">Gaps to close</h3>
                <ul className="feedback-list mt-2">
                  {result.gaps.map((g, i) => (
                    <li key={i}>{g}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
