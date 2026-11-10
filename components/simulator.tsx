'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SIMULATOR_PROGRAMS, PROGRAM_GROUPS, getSimulatorProgram } from '@/lib/data/prompts';
import { WRITTEN_MAX_WORDS, countWords, limitWords } from '@/lib/limits';
import { authFetch } from '@/lib/supabase/client';
import { useAuth } from './auth-provider';
import ScoreRing from './score-ring';
import { ArrowRight, Check, GraduationCap, Loader2, MessageSquareWarning, RotateCcw, Video } from 'lucide-react';

type Format = 'video' | 'written';
type Phase = 'idle' | 'prep' | 'response' | 'waiting' | 'feedback' | 'done';
type Feedback = { score: number; verdict: string; strengths: string[]; fixes: string[]; rewrite: string };
type StoredDraft = {
  programCode: string;
  format: Format;
  phase: Phase;
  timeLeft: number;
  prompt: string;
  answer: string;
  feedback: Feedback | null;
  jobId: string | null;
};

const DRAFT_KEY = 'accepted-simulator-draft';
const PHASES: Phase[] = ['idle', 'prep', 'response', 'waiting', 'feedback', 'done'];

const FORMATS: Record<Format, { label: string; prep: number; response: number }> = {
  video: { label: 'Spoken, 2 min (practice only)', prep: 30, response: 120 },
  written: { label: `Written, 10 min, ${WRITTEN_MAX_WORDS} words`, prep: 60, response: 600 },
};

/** Old drafts and database rows can hold lists as JSON text; never let that reach .map(). */
function asList(value: unknown): string[] {
  let v = value;
  if (typeof v === 'string') {
    try {
      v = JSON.parse(v);
    } catch {
      return [];
    }
  }
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
}

function asFeedback(value: unknown): Feedback | null {
  const f = value as Partial<Feedback> | null;
  if (!f || typeof f.score !== 'number' || typeof f.verdict !== 'string') return null;
  return { score: f.score, verdict: f.verdict, strengths: asList(f.strengths), fixes: asList(f.fixes), rewrite: String(f.rewrite ?? '') };
}

export default function Simulator() {
  const params = useSearchParams();
  const { user, loading: authLoading, openAuth } = useAuth();

  const [programCode, setProgramCode] = useState<string>('queens_comm');
  const [format, setFormat] = useState<Format>('written');
  const [phase, setPhase] = useState<Phase>('idle');
  const [timeLeft, setTimeLeft] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [draftOwner, setDraftOwner] = useState<string | null>(null);

  const program = getSimulatorProgram(programCode) ?? SIMULATOR_PROGRAMS[0];

  useEffect(() => {
    const p = params.get('program');
    if (p && getSimulatorProgram(p)) setProgramCode(p);
  }, [params]);

  useEffect(() => {
    if (authLoading) return;
    const owner = user?.id ?? 'guest';
    try {
      const stored = localStorage.getItem(`${DRAFT_KEY}:${owner}`) ?? (user ? localStorage.getItem(`${DRAFT_KEY}:guest`) : null);
      if (stored) {
        const draft = JSON.parse(stored) as Partial<StoredDraft>;
        if (
          typeof draft.programCode === 'string' &&
          getSimulatorProgram(draft.programCode) &&
          (draft.format === 'written' || draft.format === 'video') &&
          typeof draft.prompt === 'string' &&
          typeof draft.answer === 'string' &&
          typeof draft.timeLeft === 'number' &&
          PHASES.includes(draft.phase as Phase)
        ) {
          setProgramCode(draft.programCode);
          setFormat(draft.format);
          const restored = draft.phase as Phase;
          setPhase(restored === 'waiting' && !draft.jobId ? 'response' : restored);
          setTimeLeft(Math.max(0, Math.floor(draft.timeLeft)));
          setPrompt(draft.prompt);
          setAnswer(limitWords(draft.answer, WRITTEN_MAX_WORDS));
          setFeedback(asFeedback(draft.feedback));
          setJobId(typeof draft.jobId === 'string' ? draft.jobId : null);
        }
      }
    } catch {
      // a corrupt draft is ignored; the student starts fresh
      try {
        localStorage.removeItem(`${DRAFT_KEY}:${owner}`);
      } catch {}
    }
    setDraftOwner(owner);
  }, [authLoading, user]);

  useEffect(() => {
    if (!draftOwner || authLoading || draftOwner !== (user?.id ?? 'guest')) return;
    try {
      const draft: StoredDraft = { programCode, format, phase, timeLeft, prompt, answer, feedback, jobId };
      localStorage.setItem(`${DRAFT_KEY}:${draftOwner}`, JSON.stringify(draft));
    } catch {
      // storage unavailable: the draft just will not persist
    }
  }, [draftOwner, authLoading, user, programCode, format, phase, timeLeft, prompt, answer, feedback, jobId]);

  useEffect(() => {
    if (phase !== 'prep' && phase !== 'response') return;
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (timeLeft > 0) return;
    if (phase === 'prep') {
      setPhase('response');
      setTimeLeft(FORMATS[format].response);
    } else if (phase === 'response') {
      handleTimeUp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, phase, format]);

  // The job is scored before POST /api/jobs returns, so the first poll normally has the result.
  useEffect(() => {
    if (!jobId) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let misses = 0;

    const tick = async () => {
      try {
        const res = await authFetch(`/api/jobs/${jobId}`);
        if (stopped) return;
        if (!res.ok) {
          if (res.status === 401) setError('Your sign-in expired. Sign in again to see your result.');
          else if (++misses >= 5) {
            setError('Could not load your result. Your answer is saved. Try again in a minute.');
            setPhase('response');
            setJobId(null);
            return;
          }
        } else {
          const data = await res.json();
          if (stopped) return;
          setError(null);
          if (data.status === 'done') {
            const f = asFeedback(data);
            if (f) {
              setFeedback(f);
              setPhase('feedback');
            } else {
              setError('Nova returned a result we could not read. Try again.');
              setPhase('response');
            }
            setJobId(null);
            return;
          }
          if (data.status === 'failed') {
            setError(data.error ?? 'Scoring failed. Try again.');
            setPhase('response');
            setJobId(null);
            return;
          }
        }
      } catch {
        if (!stopped && ++misses >= 5) {
          setError('Connection lost. Your answer is saved on this device.');
          setPhase('response');
          setJobId(null);
          return;
        }
      }
      if (!stopped) timer = setTimeout(tick, 1_500);
    };

    void tick();
    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
    };
  }, [jobId]);

  function startSimulation() {
    setPrompt(program.prompts[Math.floor(Math.random() * program.prompts.length)]);
    setAnswer('');
    setFeedback(null);
    setError(null);
    setJobId(null);
    setPhase('prep');
    setTimeLeft(FORMATS[format].prep);
  }

  function progressSimulation() {
    if (phase === 'prep') {
      setPhase('response');
      setTimeLeft(FORMATS[format].response);
    } else if (phase === 'response') {
      if (format === 'video') setPhase('done');
      else void submit();
    }
  }

  function handleTimeUp() {
    if (format === 'written') {
      if (answer.trim().length >= 20) void submit();
      else setError('Time is up. Write at least a sentence or two, then submit.');
    } else {
      setPhase('done');
    }
  }

  async function submit() {
    if (answer.trim().length < 20) {
      setError('Write at least a sentence or two before asking for a score.');
      return;
    }
    if (authLoading) return;
    if (!user) {
      openAuth();
      return;
    }
    setError(null);
    setPhase('waiting');
    try {
      const res = await authFetch('/api/jobs', {
        method: 'POST',
        body: JSON.stringify({
          question: prompt,
          answer: limitWords(answer, WRITTEN_MAX_WORDS),
          program: program.label,
          university: program.university,
          programCode: program.code,
          format,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? 'Could not score your answer. Try again.');
        setPhase('response');
        return;
      }
      setJobId(data.id);
    } catch {
      setError('Network error. Check your connection and try again.');
      setPhase('response');
    }
  }

  function reset() {
    setPhase('idle');
    setPrompt('');
    setAnswer('');
    setFeedback(null);
    setError(null);
    setJobId(null);
    setTimeLeft(0);
  }

  const mins = String(Math.floor(Math.max(timeLeft, 0) / 60)).padStart(2, '0');
  const secs = String(Math.max(timeLeft, 0) % 60).padStart(2, '0');
  const words = countWords(answer);
  const nearLimit = words >= WRITTEN_MAX_WORDS * 0.9;

  return (
    <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="card h-fit space-y-5 p-6">
        <h2 className="text-xl text-navy">Set up your round</h2>
        <div>
          <label htmlFor="sim-program" className="mb-1.5 block text-sm font-medium text-deep">Program</label>
          <select id="sim-program" value={programCode} onChange={(e) => setProgramCode(e.target.value)} className="field">
            {PROGRAM_GROUPS.map((group) => (
              <optgroup key={group} label={group}>
                {SIMULATOR_PROGRAMS.filter((p) => p.group === group).map((p) => (
                  <option key={p.code} value={p.code}>{p.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="sim-type" className="mb-1.5 block text-sm font-medium text-deep">Format</label>
          <select id="sim-type" value={format} onChange={(e) => setFormat(e.target.value as Format)} className="field">
            {(Object.keys(FORMATS) as Format[]).map((f) => (
              <option key={f} value={f}>{FORMATS[f].label}</option>
            ))}
          </select>
        </div>
        <button onClick={startSimulation} className="btn-primary w-full">Start timed round</button>
        <p className="text-sm leading-6 text-muted">
          {user
            ? 'Your draft is saved on this device. Scored answers are saved to your account.'
            : 'Sign in to submit for scoring. Your draft is saved on this device.'}
        </p>
      </aside>

      <section className="card flex min-h-[480px] flex-col p-6 sm:p-8">
        {phase === 'idle' && (
          <div className="my-auto space-y-3 text-center">
            <GraduationCap className="mx-auto h-10 w-10 text-moss" />
            <h3 className="text-2xl text-navy">Choose a program and a format</h3>
            <p className="mx-auto max-w-md text-[15px] leading-7 text-muted">
              You get a real-style prompt, a prep timer and a response timer. Written answers are scored by Nova,
              a strict admissions reader.
            </p>
          </div>
        )}

        {(phase === 'prep' || phase === 'response') && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className={`rounded-md px-3 py-1.5 text-sm font-medium ${phase === 'prep' ? 'bg-sage/40 text-deep' : 'bg-navy text-paper'}`}>
                {phase === 'prep' ? 'Prep time' : format === 'written' ? 'Writing time' : 'Speaking time'}
              </span>
              <div className="font-display text-3xl tabular-nums text-navy" aria-label={`${mins} minutes ${secs} seconds left`}>
                {mins}:{secs}
              </div>
            </div>

            <div>
              <h3 className="text-2xl leading-snug text-navy">{prompt}</h3>
              <p className="mt-2 text-sm text-muted">{program.label}, {program.university}</p>
            </div>

            {format === 'written' ? (
              <div>
                <label htmlFor="sim-answer" className="sr-only">Your response</label>
                <textarea
                  id="sim-answer"
                  value={answer}
                  onChange={(e) => setAnswer(countWords(e.target.value) > WRITTEN_MAX_WORDS ? limitWords(e.target.value, WRITTEN_MAX_WORDS) : e.target.value)}
                  rows={9}
                  placeholder="Write your response here. Use specific examples."
                  className="field resize-y leading-7"
                />
                <p className={`mt-2 text-sm ${nearLimit ? 'font-medium text-brick' : 'text-muted'}`} aria-live="polite">
                  {words} of {WRITTEN_MAX_WORDS} words
                </p>
              </div>
            ) : (
              <div className="rounded-xl bg-sand p-8 text-center">
                <Video className="mx-auto h-8 w-8 text-moss" />
                <p className="mx-auto mt-3 max-w-md text-[15px] leading-7 text-muted">
                  Practise aloud during this window. Nothing is recorded. Use Interview for voice transcription and
                  feedback.
                </p>
              </div>
            )}

            {error && (
              <div role="alert" className="notice">
                <MessageSquareWarning className="mt-0.5 h-5 w-5 shrink-0" /> {error}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button onClick={reset} className="btn-quiet">Stop</button>
              <button onClick={progressSimulation} className="btn-primary">
                {phase === 'prep' ? 'Start now' : format === 'written' ? 'Submit for scoring' : 'Finish'}
              </button>
            </div>
          </div>
        )}

        {phase === 'waiting' && (
          <div className="my-auto space-y-4 text-center" role="status">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-moss" />
            <h3 className="text-2xl text-navy">Nova is reading your answer</h3>
            <p className="mx-auto max-w-md text-[15px] leading-7 text-muted">This usually takes a few seconds.</p>
          </div>
        )}

        {phase === 'feedback' && feedback && (
          <div className="space-y-8">
            <div className="flex flex-wrap items-center gap-6">
              <ScoreRing score={feedback.score} />
              <div className="min-w-0 flex-1">
                <h3 className="text-2xl text-navy">Nova&apos;s verdict</h3>
                <p className="mt-2 max-w-prose text-[15px] leading-7 text-deep">{feedback.verdict}</p>
              </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h4 className="flex items-center gap-2 font-display text-lg text-navy">
                  <Check className="h-5 w-5 text-moss" /> What works
                </h4>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-7 text-deep">
                  {feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
              <div>
                <h4 className="flex items-center gap-2 font-display text-lg text-navy">
                  <ArrowRight className="h-5 w-5 text-brick" /> What to fix
                </h4>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-7 text-deep">
                  {feedback.fixes.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            </div>

            <div>
              <h4 className="font-display text-lg text-navy">A tighter version</h4>
              <p className="mt-3 whitespace-pre-wrap rounded-xl bg-sand p-5 text-[15px] leading-7 text-deep">{feedback.rewrite}</p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link href="/analytics" className="inline-flex items-center gap-2 text-[15px] font-semibold text-moss hover:underline">
                See it in your progress <ArrowRight className="h-4 w-4" />
              </Link>
              <button onClick={reset} className="btn-quiet"><RotateCcw className="h-4 w-4" /> Try another</button>
            </div>
          </div>
        )}

        {phase === 'done' && (
          <div className="my-auto space-y-4 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-sage/45 text-moss">
              <Check className="h-7 w-7" />
            </span>
            <h3 className="text-2xl text-navy">Round complete</h3>
            <p className="mx-auto max-w-md text-[15px] leading-7 text-muted">
              Spoken rounds are not scored here. Use Interview to get a transcript reviewed.
            </p>
            <button onClick={reset} className="btn-quiet"><RotateCcw className="h-4 w-4" /> Try another</button>
          </div>
        )}
      </section>
    </div>
  );
}
