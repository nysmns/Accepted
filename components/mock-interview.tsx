'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Loader2, Mic, RotateCcw, Square } from 'lucide-react';
import { SIMULATOR_PROGRAMS } from '@/lib/data/prompts';
import { SPOKEN_MAX_SECONDS, SPOKEN_MAX_WORDS, countWords, limitWords } from '@/lib/limits';
import { authFetch } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth-provider';

type Phase = 'ready' | 'loading' | 'answering' | 'analyzing' | 'results';
type MicState = 'idle' | 'asking' | 'recording' | 'transcribing';
type Review = {
  overallScore: number;
  overallAssessment: string;
  dimensions: { name: string; score: number; evidence: string; coaching: string }[];
  nextSteps: string[];
};

/** Picks a recording format this browser can produce (Safari makes mp4, Chrome and Firefox make webm or ogg). */
function pickMime(): string | undefined {
  return ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'].find((t) => MediaRecorder.isTypeSupported(t));
}

export default function MockInterview() {
  const { user, loading: authLoading, openAuth } = useAuth();
  const [phase, setPhase] = useState<Phase>('ready');
  const [programCode, setProgramCode] = useState(SIMULATOR_PROGRAMS[0].code);
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<{ question: string; answer: string }[]>([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [mic, setMic] = useState<MicState>('idle');
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [review, setReview] = useState<Review | null>(null);

  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const releaseMic = () => {
    if (timer.current) clearInterval(timer.current);
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
  };
  useEffect(() => () => {
    recorder.current?.state === 'recording' && recorder.current.stop();
    releaseMic();
  }, []);

  const question = questions[index];
  const words = countWords(answer);

  async function begin() {
    if (authLoading) return;
    if (!user) return openAuth();
    setPhase('loading');
    setError(null);
    try {
      const res = await authFetch('/api/interview', { method: 'POST', body: JSON.stringify({ action: 'start', programCode }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Could not prepare your interview.');
      setQuestions(data.questions);
      setAnswers([]);
      setIndex(0);
      setAnswer('');
      setPhase('answering');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not prepare your interview.');
      setPhase('ready');
    }
  }

  // Asks for the microphone (the browser shows its permission prompt), records, then sends the audio for transcription.
  async function startRecording() {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('This browser cannot record audio. Type your answer instead.');
      return;
    }
    setMic('asking');
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    } catch (e) {
      setMic('idle');
      const denied = e instanceof DOMException && (e.name === 'NotAllowedError' || e.name === 'SecurityError');
      setError(
        denied
          ? 'Microphone blocked. Click the lock icon in the address bar, allow the microphone, then try again. Or type your answer.'
          : 'No microphone found. Plug one in, or type your answer.'
      );
      return;
    }
    const mimeType = pickMime();
    const rec = new MediaRecorder(stream.current, mimeType ? { mimeType } : undefined);
    chunks.current = [];
    rec.ondataavailable = (ev) => ev.data.size && chunks.current.push(ev.data);
    rec.onstop = () => void transcribe(new Blob(chunks.current, { type: rec.mimeType || mimeType || 'audio/webm' }));
    recorder.current = rec;
    rec.start(1000);
    setSeconds(0);
    setMic('recording');
    timer.current = setInterval(() => {
      setSeconds((s) => {
        if (s + 1 >= SPOKEN_MAX_SECONDS) stopRecording();
        return s + 1;
      });
    }, 1000);
  }

  function stopRecording() {
    if (recorder.current?.state === 'recording') recorder.current.stop();
    releaseMic();
  }

  async function transcribe(blob: Blob) {
    releaseMic();
    setMic('transcribing');
    try {
      const form = new FormData();
      form.append('audio', blob, 'answer');
      const res = await authFetch('/api/transcribe', { method: 'POST', body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? 'Could not transcribe that recording.');
      setAnswer((prev) => limitWords(`${prev.trim()} ${data.text}`, SPOKEN_MAX_WORDS));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not transcribe that recording.');
    } finally {
      setMic('idle');
    }
  }

  async function next() {
    if (words < 5) return setError('Add a fuller response before moving on.');
    const updated = [...answers];
    updated[index] = { question, answer: answer.trim() };
    setAnswers(updated);
    setError(null);
    if (index < questions.length - 1) {
      setIndex(index + 1);
      setAnswer('');
      return;
    }
    setPhase('analyzing');
    try {
      const res = await authFetch('/api/interview', { method: 'POST', body: JSON.stringify({ action: 'analyze', answers: updated }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Could not review this interview.');
      setReview(data as Review);
      setPhase('results');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not review this interview.');
      setPhase('answering');
    }
  }

  function reset() {
    stopRecording();
    setQuestions([]);
    setAnswers([]);
    setIndex(0);
    setAnswer('');
    setReview(null);
    setError(null);
    setMic('idle');
    setPhase('ready');
  }

  const busy = mic === 'asking' || mic === 'transcribing';

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <h1 className="text-4xl text-navy sm:text-5xl">Rehearse out loud</h1>
        <p className="mt-4 text-lg leading-8 text-muted">
          Three questions. Speak or type, up to {SPOKEN_MAX_WORDS} words each. Your words are reviewed by Nova, a strict
          admissions reader.
        </p>
      </header>

      <section className="card p-6 sm:p-8">
        {phase === 'ready' && (
          <div className="max-w-xl">
            <label htmlFor="interview-program" className="block text-[15px] font-medium text-deep">Program area</label>
            <select id="interview-program" value={programCode} onChange={(e) => setProgramCode(e.target.value)} className="field mt-2">
              {SIMULATOR_PROGRAMS.map((p) => <option key={p.code} value={p.code}>{p.label}</option>)}
            </select>
            <button onClick={begin} disabled={authLoading} className="btn-primary mt-6">
              Start the interview <ArrowRight className="h-4 w-4" />
            </button>
            <p className="mt-4 text-sm leading-6 text-muted">
              Voice is optional. If you use it, your browser asks for the microphone, and the audio is sent to be
              transcribed, then discarded. Practice questions are not real admissions questions.
            </p>
          </div>
        )}

        {phase === 'loading' && <p role="status" className="py-12 text-center text-muted">Preparing your questions…</p>}

        {phase === 'answering' && question && (
          <div>
            <p className="text-sm font-medium text-moss">Question {index + 1} of {questions.length}</p>
            <h2 className="mt-2 text-2xl leading-snug text-navy sm:text-3xl">{question}</h2>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              {mic === 'recording' ? (
                <button onClick={stopRecording} className="btn bg-brick text-paper hover:opacity-90">
                  <Square className="h-4 w-4 fill-current" /> Stop ({seconds}s of {SPOKEN_MAX_SECONDS}s)
                </button>
              ) : (
                <button onClick={startRecording} disabled={busy} className="btn-quiet">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
                  {mic === 'asking' ? 'Waiting for permission…' : mic === 'transcribing' ? 'Turning speech into text…' : 'Answer by voice'}
                </button>
              )}
              {mic === 'recording' && <span className="flex items-center gap-2 text-sm text-brick"><span className="h-2.5 w-2.5 animate-pulse rounded-full bg-brick" />Listening</span>}
            </div>

            <label htmlFor="interview-answer" className="mt-6 block text-[15px] font-medium text-deep">Your answer</label>
            <textarea
              id="interview-answer"
              value={answer}
              onChange={(e) => setAnswer(countWords(e.target.value) > SPOKEN_MAX_WORDS ? limitWords(e.target.value, SPOKEN_MAX_WORDS) : e.target.value)}
              rows={7}
              placeholder="Speak, then edit the transcript here. Or type. Use one specific example."
              className="field mt-2 resize-y leading-7"
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className={`text-sm ${words >= SPOKEN_MAX_WORDS * 0.9 ? 'font-medium text-brick' : 'text-muted'}`} aria-live="polite">
                {words} of {SPOKEN_MAX_WORDS} words
              </p>
              <button onClick={next} disabled={mic === 'recording' || busy} className="btn-primary">
                {index === questions.length - 1 ? 'Finish and review' : 'Next question'} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {phase === 'analyzing' && (
          <div className="py-12 text-center" role="status">
            <Loader2 className="mx-auto h-9 w-9 animate-spin text-moss" />
            <p className="mt-4 text-xl text-navy">Nova is reviewing your answers</p>
          </div>
        )}

        {phase === 'results' && review && (
          <div className="space-y-8">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="max-w-xl">
                <h2 className="text-3xl text-navy">Your review</h2>
                <p className="mt-3 text-[15px] leading-7 text-deep">{review.overallAssessment}</p>
              </div>
              <div className="rounded-2xl bg-navy px-7 py-4 text-center text-paper">
                <p className="font-display text-4xl">{review.overallScore}</p>
                <p className="text-sm text-paper/75">out of 100</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {review.dimensions.map((d) => (
                <article key={d.name} className="rounded-xl bg-sand p-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-lg text-navy">{d.name}</h3>
                    <span className="font-display text-xl text-moss">{d.score}</span>
                  </div>
                  <p className="mt-3 text-[15px] leading-6 text-muted">{d.evidence}</p>
                  <p className="mt-2 text-[15px] leading-6 text-deep">{d.coaching}</p>
                </article>
              ))}
            </div>
            <div>
              <h3 className="text-xl text-navy">For your next attempt</h3>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-[15px] leading-7 text-deep">
                {review.nextSteps.map((s, i) => <li key={i}>{s}</li>)}
              </ol>
            </div>
            <button onClick={reset} className="btn-quiet"><RotateCcw className="h-4 w-4" /> Start another round</button>
          </div>
        )}

        {error && <div role="alert" className="notice mt-6">{error}</div>}
      </section>
    </div>
  );
}
