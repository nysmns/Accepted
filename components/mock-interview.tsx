"use client";
import { useStageFocus } from "./use-stage-focus";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Mic, MicOff, RotateCcw } from "lucide-react";
import { SIMULATOR_PROGRAMS } from "@/lib/data/prompts";
import { authFetch } from "@/lib/supabase/client";
import { trackEvent } from "@/lib/track";
import { useAuth } from "@/components/auth-provider";
import { Badge, Button, LoadingState, Notice, SectionHeading } from "./ui";
import ScoreRing from "./score-ring";

type Phase = "ready" | "loading" | "answering" | "analyzing" | "results";

type InterviewReview = {
  overallScore: number;
  overallAssessment: string;
  dimensions: {
    name: string;
    score: number;
    evidence: string;
    coaching: string;
  }[];
  nextSteps: string[];
};

type InterviewAnswer = {
  question: string;
  answer: string;
};

type RecognitionResult = { transcript: string };
type RecognitionItem = { isFinal: boolean; 0: RecognitionResult };
type RecognitionEvent = {
  resultIndex: number;
  results: ArrayLike<RecognitionItem>;
};
type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

declare global {
  interface Window {
    SpeechRecognition?: new () => Recognition;
    webkitSpeechRecognition?: new () => Recognition;
  }
}

const MAX_WORDS = 500;
const MAX_CHARS = 4000;

export default function MockInterview() {
  const { user, loading: authLoading, openAuth } = useAuth();
  const [phase, setPhase] = useState<Phase>("ready");
  const [programCode, setProgramCode] = useState(SIMULATOR_PROGRAMS[0].code);
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<InterviewAnswer[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [review, setReview] = useState<InterviewReview | null>(null);
  const stageRef = useStageFocus<HTMLElement>(
    `${phase}:${questionIndex}`,
    phase === "answering" || phase === "results",
  );
  const recognitionRef = useRef<Recognition | null>(null);
  const finalTranscriptRef = useRef("");
  const shouldRecordRef = useRef(false);
  const permissionStreamRef = useRef<MediaStream | null>(null);
  const watchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      shouldRecordRef.current = false;
      if (watchdogRef.current) clearTimeout(watchdogRef.current);
      permissionStreamRef.current?.getTracks().forEach((track) => track.stop());
      recognitionRef.current?.stop();
    };
  }, []);

  const currentQuestion = questions[questionIndex];
  const words = answer.trim() ? answer.trim().split(/\s+/).length : 0;
  const overLimit = words > MAX_WORDS || answer.length > MAX_CHARS;

  async function beginInterview() {
    if (authLoading) return;
    if (!user) {
      openAuth();
      return;
    }
    setPhase("loading");
    setError(null);
    setReview(null);
    try {
      const response = await authFetch("/api/interview", {
        method: "POST",
        body: JSON.stringify({ action: "start", programCode }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error ?? "Could not prepare your interview.");
      setQuestions(data.questions);
      setAnswers([]);
      setQuestionIndex(0);
      setAnswer("");
      setPhase("answering");
      trackEvent("interview_started", { program: programCode });
    } catch (issue) {
      setError(
        issue instanceof Error
          ? issue.message
          : "Could not prepare your interview.",
      );
      setPhase("ready");
    }
  }

  function startRecording() {
    const SpeechRecognition =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError(
        "Speech-to-text is not available in this browser. You can type your answer instead.",
      );
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setError(
        "This browser cannot request microphone access. Type your answer instead.",
      );
      return;
    }

    setError(null);
    shouldRecordRef.current = true;
    finalTranscriptRef.current = answer.trim();

    // Ask for the microphone explicitly. Some browsers never prompt
    // SpeechRecognition on their own, and a denied permission fails silently.
    // The stream stays open while recognition runs: releasing it immediately
    // can cut the audio source on some browsers, leaving a silent session.
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        permissionStreamRef.current = stream;
        trackEvent("voice_started");
        beginRecognition(new SpeechRecognition());
      })
      .catch(() => {
        shouldRecordRef.current = false;
        setRecording(false);
        setError(
          "Microphone access was blocked. Allow microphone access in your browser, or type your answer.",
        );
      });
  }

  function beginRecognition(recognition: Recognition) {
    recognition.lang = "en-CA";
    recognition.continuous = true;
    recognition.interimResults = true;

    const stopStream = () => {
      permissionStreamRef.current?.getTracks().forEach((track) => track.stop());
      permissionStreamRef.current = null;
    };
    const clearWatchdog = () => {
      if (watchdogRef.current) {
        clearTimeout(watchdogRef.current);
        watchdogRef.current = null;
      }
    };
    // Some browsers report "listening" while the speech service returns nothing.
    const armWatchdog = () => {
      clearWatchdog();
      watchdogRef.current = setTimeout(() => {
        setError(
          "No speech is coming through yet. Check the microphone is selected and not muted, or type your answer.",
        );
      }, 8000);
    };
    const stopRecognition = (message: string) => {
      shouldRecordRef.current = false;
      clearWatchdog();
      stopStream();
      setRecording(false);
      setError(message);
    };

    recognition.onresult = (event) => {
      armWatchdog();
      let interim = "";
      let finalized = "";
      for (
        let index = event.resultIndex;
        index < event.results.length;
        index += 1
      ) {
        const result = event.results[index];
        const transcript = result?.[0]?.transcript;
        if (typeof transcript !== "string") continue;
        if (result.isFinal) finalized += transcript;
        else interim += transcript;
      }
      if (finalized) {
        finalTranscriptRef.current =
          `${finalTranscriptRef.current} ${finalized}`.trim();
      }
      setAnswer(
        `${finalTranscriptRef.current}${interim ? ` ${interim}` : ""}`.trim(),
      );
    };

    recognition.onerror = (event) => {
      trackEvent("voice_error", { error: event.error });
      if (
        event.error === "not-allowed" ||
        event.error === "service-not-allowed"
      ) {
        stopRecognition(
          "Microphone access was blocked. Allow microphone access or type your answer.",
        );
      } else if (event.error === "audio-capture") {
        stopRecognition(
          "No microphone was found. Check your device or type your answer.",
        );
      } else if (event.error === "network") {
        stopRecognition(
          "The speech recognition service is unreachable. Check your connection or type your answer.",
        );
      } else if (event.error === "no-speech") {
        setError(
          "No speech detected. Speak a little louder, or type your answer.",
        );
      }
      // 'aborted' is transient; onend restarts the session.
    };

    recognition.onend = () => {
      if (!shouldRecordRef.current) {
        clearWatchdog();
        stopStream();
        setRecording(false);
        recognitionRef.current = null;
        return;
      }
      // Chrome ends the session after a short pause. Restart while the user is
      // still answering; a brief delay avoids an InvalidStateError.
      setTimeout(() => {
        if (!shouldRecordRef.current) {
          clearWatchdog();
          stopStream();
          setRecording(false);
          recognitionRef.current = null;
          return;
        }
        try {
          setError(null);
          recognition.start();
        } catch {
          stopRecognition(
            "Speech recognition stopped. Press the microphone to continue, or type your answer.",
          );
        }
      }, 120);
    };

    recognitionRef.current = recognition;
    armWatchdog();
    try {
      recognition.start();
      setRecording(true);
    } catch {
      recognitionRef.current = null;
      clearWatchdog();
      stopStream();
      shouldRecordRef.current = false;
      setError(
        "Could not start speech recognition. Check microphone permissions or type your answer.",
      );
    }
  }

  function stopRecording() {
    shouldRecordRef.current = false;
    if (watchdogRef.current) clearTimeout(watchdogRef.current);
    permissionStreamRef.current?.getTracks().forEach((track) => track.stop());
    permissionStreamRef.current = null;
    recognitionRef.current?.stop();
    setRecording(false);
    setAnswer(finalTranscriptRef.current.trim());
    trackEvent("voice_stopped", {
      words: String(
        finalTranscriptRef.current.trim().split(/\s+/).filter(Boolean).length,
      ),
    });
  }

  async function advance() {
    if (answer.trim().length < 20) {
      setError("Add a complete response before moving to the next question.");
      return;
    }
    if (overLimit) {
      setError(
        `Keep each answer under ${MAX_WORDS} words so it fits the real format.`,
      );
      return;
    }

    const updatedAnswers = [...answers];
    updatedAnswers[questionIndex] = {
      question: currentQuestion,
      answer: answer.trim(),
    };
    setAnswers(updatedAnswers);
    setError(null);

    if (questionIndex < questions.length - 1) {
      const nextIndex = questionIndex + 1;
      setQuestionIndex(nextIndex);
      setAnswer("");
      finalTranscriptRef.current = "";
      return;
    }

    setPhase("analyzing");
    try {
      const response = await authFetch("/api/interview", {
        method: "POST",
        body: JSON.stringify({ action: "analyze", answers: updatedAnswers }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error ?? "Could not review this interview.");
      setReview(data as InterviewReview);
      setPhase("results");
      trackEvent("interview_completed", { score: String(data.overallScore) });
    } catch (issue) {
      setError(
        issue instanceof Error
          ? issue.message
          : "Could not review this interview.",
      );
      setPhase("answering");
    }
  }

  function reset() {
    stopRecording();
    setQuestions([]);
    setAnswers([]);
    setQuestionIndex(0);
    setAnswer("");
    setReview(null);
    setError(null);
    setPhase("ready");
  }

  return (
<<<<<<< HEAD
    <div className="space-y-6">
      <header className="max-w-3xl">
        <h1 className="mt-3 text-3xl font-medium leading-tight text-deep sm:text-4xl">
          Rehearse out loud. Reflect with purpose.
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted">
          Answer three program-focused questions using your voice or keyboard. Your transcript is
          reviewed for substance and clarity. Microphone audio is never uploaded to Accepted.
        </p>
      </header>

      <section className="panel mx-auto max-w-4xl p-5 sm:p-8">
        {phase === 'ready' && (
          <div className="mx-auto max-w-xl py-4">
            <h2 className="mt-3 text-2xl font-medium text-deep">Set up a short practice round</h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              Questions are generated for practice and are not represented as official or leaked
              admissions questions. Use a quiet space and answer from your own experience.
            </p>
            <label htmlFor="interview-program" className="label mt-6">
              Choose a program area
            </label>
            <select
              id="interview-program"
              value={programCode}
              onChange={(event) => setProgramCode(event.target.value)}
              className="input"
            >
              {SIMULATOR_PROGRAMS.map((program) => (
                <option key={program.code} value={program.code}>
                  {program.label}
                </option>
              ))}
            </select>
            <button onClick={beginInterview} disabled={authLoading} className="btn-primary mt-5 w-full">
              {authLoading ? 'Checking your account…' : 'Start mock interview'}
              {!authLoading && <ArrowRight className="h-4 w-4" />}
            </button>
            <p className="mt-3 text-xs leading-5 text-muted">
              The microphone is optional. Speech recognition runs in your browser and may send
              audio to its own recognition service.
            </p>
          </div>
        )}

        {phase === 'loading' && (
          <div className="py-16 text-center" role="status">
            <p className="text-base font-medium text-deep">Preparing your questions…</p>
            <p className="mt-2 text-sm text-muted">This can take a few seconds.</p>
          </div>
=======
    <div className="reveal space-y-5">
      <section
        ref={stageRef}
        tabIndex={-1}
        aria-label="Mock interview session"
        className="panel panel-pad mx-auto max-w-4xl stage-focus"
      >
        {phase === "ready" && (
          <div className="grid gap-7 py-2 md:grid-cols-[1.1fr_1fr]">
            <div className="md:pr-5">
              <p className="eyebrow">A short, focused rehearsal</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                A chance to hear
                <br />
                yourself think.
              </h2>
              <p className="body-copy mt-4">
                Three program-focused questions. Your own experiences. A
                structured review from Nova to help you find your next
                improvement.
              </p>
              <label htmlFor="interview-program" className="field-label mt-6">
                Choose a program area
              </label>
              <select
                id="interview-program"
                className="field"
                value={programCode}
                onChange={(event) => setProgramCode(event.target.value)}
              >
                {SIMULATOR_PROGRAMS.map((program) => (
                  <option key={program.code} value={program.code}>
                    {program.label}
                  </option>
                ))}
              </select>
              <Button
                onClick={beginInterview}
                disabled={authLoading}
                className="mt-4 w-full"
              >
                {authLoading
                  ? "Checking your account…"
                  : "Start mock interview"}
                <ArrowRight size={15} />
              </Button>
            </div>
            <div className="panel-inset p-6">
              <div className="waveform" aria-hidden="true">
                {Array.from({ length: 13 }, (_, index) => (
                  <i key={index} />
                ))}
              </div>
              <h3 className="mt-4 text-sm font-semibold">
                Speak, type, or a little of both.
              </h3>
              <ul className="feedback-list mt-2">
                <li>
                  Use a quiet space and a specific example from your experience.
                </li>
                <li>
                  Microphone access is requested only when you choose voice
                  input.
                </li>
                <li>
                  Review the transcript before moving on. Audio is never
                  uploaded to Accepted.
                </li>
              </ul>
              <p className="fine-print mt-3">
                Questions are generated for practice, not official or leaked
                admissions questions.
              </p>
            </div>
          </div>
        )}
        {phase === "loading" && (
          <LoadingState
            title="Finding your first question…"
            description="Preparing three questions for your chosen program area."
          />
>>>>>>> pr/8
        )}
        {phase === "answering" && currentQuestion && (
          <div>
<<<<<<< HEAD
            <p className="eyebrow">
              Question {questionIndex + 1} of {questions.length}
            </p>
            <h2 className="mt-4 text-2xl font-medium leading-snug text-deep sm:text-3xl">
              {currentQuestion}
            </h2>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={recording ? stopRecording : startRecording}
                className={recording ? 'btn-ghost  text-brick' : 'btn-primary'}
              >
                {recording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {recording ? 'Stop speaking' : 'Answer by voice'}
              </button>
              <span className="text-xs leading-5 text-muted">
                {recording
                  ? 'Listening… select stop when you are finished.'
                  : 'Optional. Your browser may send speech to its own recognition service.'}
              </span>
=======
            <div className="flex items-center justify-between gap-3 border-b border-line pb-5">
              <p className="eyebrow">
                Question {questionIndex + 1} of {questions.length}
              </p>
              <div className="flex gap-1.5" aria-hidden="true">
                {questions.map((_, index) => (
                  <span
                    key={index}
                    className={`h-1.5 w-7 rounded-full ${index <= questionIndex ? "bg-accent" : "bg-line"}`}
                  />
                ))}
              </div>
            </div>
            <h2 className="my-7 text-2xl font-medium leading-[1.5] tracking-tight sm:text-[28px]">
              {currentQuestion}
            </h2>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line px-4 py-3">
              <div className="flex items-center gap-3">
                <Button
                  variant={recording ? "secondary" : "primary"}
                  onClick={recording ? stopRecording : startRecording}
                  className={recording ? "text-danger!" : ""}
                >
                  {recording ? <MicOff size={15} /> : <Mic size={15} />}
                  {recording ? "Stop speaking" : "Answer by voice"}
                </Button>
                <span role="status" className="text-xs text-muted">
                  {recording ? "Listening…" : "Microphone optional"}
                </span>
              </div>
              {recording && (
                <div className="waveform is-listening h-9!" aria-hidden="true">
                  {Array.from({ length: 9 }, (_, index) => (
                    <i key={index} />
                  ))}
                </div>
              )}
>>>>>>> pr/8
            </div>
            <p className="fine-print mt-3">
              Speech recognition is provided by your browser and may use its own
              recognition service. Only your transcript is sent to Accepted.
            </p>
            <label htmlFor="interview-answer" className="field-label mt-6">
              Your response / editable transcript
            </label>
            <textarea
              id="interview-answer"
              className="field response-editor"
              value={answer}
              onChange={(event) => {
                setAnswer(event.target.value);
                finalTranscriptRef.current = event.target.value;
              }}
              maxLength={MAX_CHARS}
              rows={7}
              placeholder="A specific moment is a good place to start. What happened? What did you do? What did it teach you?"
              aria-describedby="interview-word-count"
            />
<<<<<<< HEAD
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className={overLimit ? 'font-medium text-brick' : 'text-muted'}>
                {words} / {MAX_WORDS} words
              </span>
              {overLimit && <span className="text-brick">Over the limit — trim before continuing.</span>}
=======
            <div
              id="interview-word-count"
              className={`mt-3 flex flex-wrap justify-between gap-2 text-[11px] ${overLimit ? "text-danger" : "text-muted"}`}
            >
              <span>
                {words} / {MAX_WORDS} words
              </span>
              <span>
                {overLimit
                  ? "Over the limit — trim before continuing."
                  : "Review your words before moving on."}
              </span>
>>>>>>> pr/8
            </div>
            <div className="mt-6 flex justify-end border-t border-line pt-5">
              <Button onClick={advance} disabled={recording}>
                {questionIndex === questions.length - 1
                  ? "Finish and review"
                  : "Next question"}
                <ArrowRight size={15} />
              </Button>
            </div>
          </div>
        )}
<<<<<<< HEAD

        {phase === 'analyzing' && (
          <div className="py-16 text-center" role="status">
            <p className="text-base font-medium text-deep">Reviewing your responses…</p>
            <p className="mt-2 text-sm text-muted">Your transcript is being assessed against clear practice criteria.</p>
          </div>
        )}

        {phase === 'results' && review && (
          <div>
            <div className="flex flex-wrap items-start justify-between gap-4 pb-6">
              <div>
                <h2 className="mt-2 text-2xl font-medium text-deep">A clear next step</h2>
              </div>
              <div className="rounded-xl bg-navy px-5 py-3 text-center">
                <p className="font-display text-2xl font-semibold text-moss">{review.overallScore}</p>
                <p className="text-xs text-muted">Practice score</p>
              </div>
            </div>
            <p className="mt-5 text-base leading-7 text-deep">{review.overallAssessment}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {review.dimensions.map((dimension) => (
                <article key={dimension.name} className="rounded-lg bg-paper/95 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-deep">{dimension.name}</h3>
                    <span className="tabular-nums text-sm font-semibold text-moss">{dimension.score}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted">{dimension.evidence}</p>
                  <p className="mt-2 text-sm leading-6 text-deep">{dimension.coaching}</p>
                </article>
              ))}
            </div>
            <div className="mt-6 rounded-lg bg-sand p-5">
              <h3 className="text-sm font-semibold text-deep">For your next attempt</h3>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-muted">
=======
        {phase === "analyzing" && (
          <LoadingState
            title="Reflecting on your responses…"
            description="Nova is looking at substance, clarity, and where you can go next."
          />
        )}
        {phase === "results" && review && (
          <div className="space-y-6">
            <SectionHeading
              title="Your interview, with perspective."
              action={<Badge tone="accent">Nova’s review</Badge>}
            />
            <div className="flex flex-col items-start gap-5 border-b border-line pb-6 sm:flex-row sm:items-center">
              <ScoreRing score={review.overallScore} size={106} />
              <div>
                <p className="eyebrow">Overall assessment</p>
                <p className="body-copy mt-2 text-foreground!">
                  {review.overallAssessment}
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {review.dimensions.map((dimension) => (
                <article className="panel-inset p-5" key={dimension.name}>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold">{dimension.name}</h3>
                    <Badge tone="accent">{dimension.score}</Badge>
                  </div>
                  <p className="fine-print mt-3">{dimension.evidence}</p>
                  <p className="body-copy mt-3 text-xs!">
                    {dimension.coaching}
                  </p>
                </article>
              ))}
            </div>
            <div className="coaching-sheet">
              <p className="eyebrow mb-2">A clear next step</p>
              <h3>For your next conversation</h3>
              <ol className="feedback-list mt-3">
>>>>>>> pr/8
                {review.nextSteps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
            <details className="border-y border-line py-4">
              <summary className="cursor-pointer text-xs font-medium">
                Read your interview transcript
              </summary>
              <div className="mt-4 space-y-4">
                {answers.map((item, index) => (
                  <div key={index}>
                    <h3 className="text-xs font-semibold">
                      {index + 1}. {item.question}
                    </h3>
                    <p className="body-copy mt-2 whitespace-pre-wrap">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </details>
            <Button variant="secondary" onClick={reset}>
              <RotateCcw size={14} />
              Start another round
            </Button>
          </div>
        )}
        {error && (
<<<<<<< HEAD
          <div
            role="alert"
            className="mt-5 rounded-lg bg-brick-soft px-4 py-3 text-sm text-brick"
          >
=======
          <Notice tone="error" className="mt-5">
>>>>>>> pr/8
            {error}
          </Notice>
        )}
      </section>
<<<<<<< HEAD

      <p className="mx-auto flex max-w-4xl items-start gap-2 text-xs leading-5 text-muted">
        <Check className="mt-0.5 h-4 w-4 shrink-0 text-moss" />
        Feedback is a practice aid, not an admissions decision. Speech recognition is provided by
        your browser platform and may use its own service; only your transcript is sent to Accepted
        for review.
=======
      <p className="fine-print mx-auto flex max-w-4xl items-start gap-2 px-2">
        <Check size={14} className="mt-1 text-accent" />
        Feedback is a practice aid, not an admissions decision. Typed input is
        always available. Microphone audio is never uploaded to Accepted.
>>>>>>> pr/8
      </p>
    </div>
  );
}
