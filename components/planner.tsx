"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ExternalLink,
  LayoutList,
  Plus,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import {
  Badge,
  Button,
  EmptyState,
  PageHeader,
  Panel,
  SectionHeading,
} from "./ui";
import Tabs from "./tabs";
import InfoTip from "./info-tip";
import { UNIVERSITIES } from "@/lib/data/programs";
import {
  PLANNER_KEY,
  academicPosition,
  readEcLevel,
  type EcLevel,
} from "@/lib/position";
import { EcFit, ProgramTags, RangeBar } from "./program-signals";
import HistoryPanel from "./history-panel";
import { trackEvent } from "@/lib/track";

type PlannedProgram = {
  id: string;
  university: string;
  name: string;
  avg: string;
  req: string;
  deadline: string;
  code: string;
};

type PlannerState = {
  average: number;
  selected: PlannedProgram[];
  completed: string[];
};

const STORAGE_KEY = PLANNER_KEY;
const CHECKLIST = [
  "Confirm each program and campus on OUAC",
  "Check each university portal and supplemental requirements",
  "Add verified deadlines to your calendar",
  "Submit OUAC choices and review the confirmation",
  "Check portals regularly for updates or new tasks",
];

const PROGRAM_OPTIONS = UNIVERSITIES.flatMap((university) =>
  university.programs.map((program, index) => ({
    id: `${university.key}-${index}-${program.name}`,
    university: university.name,
    ...program,
  })),
);

type Tab = "plan" | "history";

function isPlannedProgram(value: unknown): value is PlannedProgram {
  if (!value || typeof value !== "object") return false;
  const program = value as Record<string, unknown>;
  return (
    typeof program.id === "string" &&
    typeof program.university === "string" &&
    typeof program.name === "string" &&
    typeof program.avg === "string" &&
    typeof program.req === "string" &&
    typeof program.deadline === "string" &&
    typeof program.code === "string"
  );
}

export default function Planner() {
  const [tab, setTab] = useState<Tab>("plan");
  const [average, setAverage] = useState(85);
  const [selected, setSelected] = useState<PlannedProgram[]>([]);
  const [completed, setCompleted] = useState<string[]>([]);
  const [choice, setChoice] = useState("");
  const [saved, setSaved] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [ecLevel, setEcLevel] = useState<EcLevel | null>(null);
  const lastTrackedAverage = useRef<number | null>(null);

  useEffect(() => setEcLevel(readEcLevel()), []);

  useEffect(() => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (!savedState) return;
      const state = JSON.parse(savedState) as Partial<PlannerState>;
      if (
        typeof state.average === "number" &&
        state.average >= 0 &&
        state.average <= 100
      ) {
        setAverage(state.average);
      }
      if (Array.isArray(state.selected))
        setSelected(state.selected.filter(isPlannedProgram));
      if (Array.isArray(state.completed)) {
        setCompleted(
          state.completed.filter(
            (task): task is string =>
              typeof task === "string" && CHECKLIST.includes(task),
          ),
        );
      }
    } catch {
      setStorageError("Could not read the saved planner from this browser.");
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        setStorageError(
          "Browser storage is unavailable; your planner may not persist.",
        );
      }
    }
  }, []);

  useEffect(() => {
    if (!saved) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ average, selected, completed } satisfies PlannerState),
      );
      setStorageError(null);
    } catch {
      setStorageError(
        "Browser storage is unavailable; your planner may not persist.",
      );
    }
  }, [average, selected, completed, saved]);

  const remaining = useMemo(
    () => CHECKLIST.length - completed.length,
    [completed],
  );

  function addProgram() {
    const program = PROGRAM_OPTIONS.find((option) => option.id === choice);
    if (!program || selected.some((item) => item.id === program.id)) return;
    setSelected((current) => [...current, program]);
    setSaved(true);
    trackEvent("program_added", { code: program.code });
  }

  function toggleTask(task: string) {
    setCompleted((current) =>
      current.includes(task)
        ? current.filter((item) => item !== task)
        : [...current, task],
    );
    setSaved(true);
  }

  function updateAverage(value: string) {
    const next = Number(value);
    if (Number.isFinite(next) && next >= 0 && next <= 100) {
      setAverage(next);
      setSaved(true);
      if (
        lastTrackedAverage.current === null ||
        Math.abs(next - lastTrackedAverage.current) >= 5
      ) {
        lastTrackedAverage.current = next;
        trackEvent("average_set", { average: String(next) });
      }
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "plan", label: "My plan" },
    { id: "history", label: "Historical averages" },
  ];

  return (
<<<<<<< HEAD
    <div className="space-y-7">
      <header className="max-w-3xl">
        <h1 className="mt-3 text-3xl font-medium leading-tight text-deep sm:text-4xl">
          Keep the moving parts in one place.
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted">
          Organise program choices, compare your current average with broad reference ranges, and
          check historical admission grades for past applicants.
        </p>
      </header>

      <div role="tablist" aria-label="Planner sections" className="flex gap-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => {
              setTab(t.id);
              if (t.id === 'history') trackEvent('history_tab_viewed');
            }}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition ${
              tab === t.id
                ? 'border-moss text-deep'
                : 'border-transparent text-muted hover:text-deep'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'history' ? (
        <HistoryPanel />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.7fr)]">
          <section className="panel p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="mt-2 text-lg font-medium text-deep">Build your list</h2>
              </div>
              <span className="chip">{selected.length} program{selected.length === 1 ? '' : 's'}</span>
            </div>

            <div className="mt-6 flex max-w-2xl items-stretch gap-3">
              <label className="sr-only" htmlFor="planner-program">
                Choose a university program
              </label>
              <select
                id="planner-program"
                value={choice}
                onChange={(event) => setChoice(event.target.value)}
                className="input min-h-11 min-w-0 flex-1"
              >
                <option value="">Choose a program to add…</option>
                {UNIVERSITIES.map((university) => (
                  <optgroup key={university.key} label={university.name}>
                    {PROGRAM_OPTIONS.filter((program) => program.university === university.name).map(
                      (program) => (
                        <option key={program.id} value={program.id}>
                          {program.name}
                        </option>
                      )
                    )}
                  </optgroup>
                ))}
              </select>
              <button
                onClick={addProgram}
                disabled={!choice || selected.some((program) => program.id === choice)}
                className="btn-primary shrink-0"
              >
                <Plus className="h-4 w-4" /> Add program
              </button>
            </div>

            <div className="mt-6">
              {selected.length === 0 ? (
                <div className="rounded-xl bg-sand px-5 py-10 text-center">
                  <p className="text-sm font-medium text-deep">Your shortlist is ready to start</p>
                  <p className="mt-1 text-sm text-muted">
                    Add the programs you are considering. Your list stays private in this browser.
                  </p>
=======
    <div className="reveal">
      <PageHeader
        eyebrow="Plan / Your application folio"
        title="Your next chapter, in order."
        description="Shortlist your programs, compare academic reference ranges, and track the application steps you still need to complete."
        action={
          <Badge>
            <ShieldCheck size={13} />
            Private to this browser
          </Badge>
        }
      />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Tabs
          label="Planner sections"
          items={tabs}
          value={tab}
          onChange={(value) => {
            setTab(value);
            if (value === "history") trackEvent("history_tab_viewed");
          }}
          panelId="planner-content"
        />
        <p className="fine-print">
          OUAC &amp; chance planner{" "}
          <InfoTip text="Academic alignment uses broad reference ranges, not admission probabilities. Always verify program details with the university." />
        </p>
      </div>
      <div
        id="planner-content"
        role="tabpanel"
        aria-label={tab === "plan" ? "My plan" : "Historical averages"}
      >
        {tab === "history" ? (
          <HistoryPanel />
        ) : (
          <div className="planner-grid">
            <Panel className="panel-pad h-fit">
              <SectionHeading
                title="Your program shortlist"
                description="Choose a university and program below to add it to your plan."
                action={<Badge tone="accent">{selected.length} selected</Badge>}
              />
              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <div className="min-w-0 flex-1">
                  <label htmlFor="planner-program" className="sr-only">
                    Choose a university program
                  </label>
                  <select
                    id="planner-program"
                    className="field"
                    value={choice}
                    onChange={(event) => setChoice(event.target.value)}
                  >
                    <option value="">Find a program to add…</option>
                    {UNIVERSITIES.map((university) => (
                      <optgroup key={university.key} label={university.name}>
                        {PROGRAM_OPTIONS.filter(
                          (program) => program.university === university.name,
                        ).map((program) => (
                          <option key={program.id} value={program.id}>
                            {program.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
>>>>>>> pr/8
                </div>
                <Button
                  disabled={
                    !choice || selected.some((program) => program.id === choice)
                  }
                  onClick={addProgram}
                >
                  <Plus size={15} />
                  Add program
                </Button>
              </div>
              {selected.length === 0 ? (
                <EmptyState
                  icon={<LayoutList />}
                  title="A shortlist starts with one choice."
                  description="Add a program you’re considering. Compare its requirements, see your academic alignment, and practise its supplemental application."
                />
              ) : (
                <div className="mt-2">
                  {selected.map((program, index) => {
                    const position = academicPosition(average, program.avg);
                    return (
<<<<<<< HEAD
                      <article
                        key={program.id}
                        className="rounded-lg bg-paper/95 p-5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-muted">{program.university}</p>
                            <h3 className="mt-1 text-lg font-medium text-deep">{program.name}</h3>
=======
                      <article key={program.id} className="program-slip">
                        <div className="flex items-start gap-3">
                          <span className="folio-number">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="mb-1 text-[11px] text-muted">
                              {program.university}
                            </p>
                            <h3>{program.name}</h3>
>>>>>>> pr/8
                          </div>
                          <button
                            className="icon-button -mt-1"
                            aria-label={`Remove ${program.name}`}
                            onClick={() => {
                              setSelected((current) =>
                                current.filter(
                                  (item) => item.id !== program.id,
                                ),
                              );
                              setSaved(true);
                              trackEvent("program_removed", {
                                code: program.code,
                              });
                            }}
<<<<<<< HEAD
                            aria-label={`Remove ${program.name}`}
                            className="shrink-0 rounded-lg p-2 text-muted transition hover:bg-surface hover:text-brick"
=======
>>>>>>> pr/8
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="mt-5 grid grid-cols-2 gap-5">
                          <div>
<<<<<<< HEAD
                            <p className="text-xs text-muted">Listed average</p>
                            <p className="mt-1 text-sm font-semibold text-deep">{program.avg}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted">Deadline reference</p>
                            <p className="mt-1 text-sm font-semibold text-deep">{program.deadline}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted">Academic position</p>
                            <p className={`mt-1 text-sm font-semibold ${position?.tone ?? 'text-muted'}`}>
                              {position?.title ?? 'Check current requirements'}
=======
                            <p className="field-label">Competitive reference</p>
                            <p className="text-sm font-semibold">
                              {program.avg}
                            </p>
                            <div className="mt-3">
                              <RangeBar label={program.avg} average={average} />
                            </div>
                          </div>
                          <div>
                            <p className="field-label">Deadline reference</p>
                            <p className="text-sm font-medium">
                              {program.deadline}
                            </p>
                            <p className="mt-2 text-[11px] text-muted">
                              Confirm with the university
>>>>>>> pr/8
                            </p>
                          </div>
                        </div>
                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                          <ProgramTags req={program.req} />
                          <p
                            className={`text-[11px] font-medium ${position?.tone ?? "text-muted"}`}
                          >
                            {position?.title ?? "Check current requirements"}
                          </p>
                        </div>
                        <details className="mt-4 text-xs">
                          <summary className="min-h-8 cursor-pointer text-secondary">
                            Supplemental requirements
                          </summary>
                          <p className="body-copy mt-2">{program.req}</p>
                          {position && (
                            <p className="fine-print mt-2">
                              {position.description}
                            </p>
                          )}
                        </details>
                        <div className="mt-2">
                          <EcFit req={program.req} level={ecLevel} />
                        </div>
                        <Link
                          className="text-link mt-4"
                          href={`/simulator?program=${program.code}`}
<<<<<<< HEAD
                          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-moss hover:underline"
=======
>>>>>>> pr/8
                        >
                          Practise this application <ArrowRight size={14} />
                        </Link>
                      </article>
                    );
                  })}
                </div>
              )}
<<<<<<< HEAD
            </div>

            <div className="mt-6 pt-5">
              <label
                htmlFor="current-average"
                className="flex flex-wrap items-center justify-between gap-2 text-sm font-semibold text-deep"
              >
                Current admission average
                <span className="tabular-nums text-xl text-moss">{average}%</span>
              </label>
              <input
                id="current-average"
                type="range"
                min="50"
                max="100"
                step="1"
                value={average}
                onChange={(event) => updateAverage(event.target.value)}
                className="mt-3 w-full accent-[#4c6a5a]"
              />
              <div className="flex justify-between text-xs text-muted">
                <span>50%</span>
                <span>100%</span>
              </div>
              <p className="mt-3 text-xs leading-5 text-muted">
                This is an academic alignment guide, not an admission probability. Competitive
                averages are estimates and do not account for applicant pools, prerequisites,
                contextual review or supplemental performance.
              </p>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="panel p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="mt-2 text-xl font-medium text-deep">Your next steps</h2>
                </div>
                <span className="chip">{remaining} left</span>
              </div>
              <div className="mt-5 space-y-1">
                {CHECKLIST.map((task, taskIndex) => {
                  const done = completed.includes(task);
                  return (
                    <button
                      key={task}
                      onClick={() => {
                        trackEvent('checklist_toggled', {
                          task_index: String(taskIndex),
                          done: String(!done),
                        });
                        toggleTask(task);
                      }}
                      aria-pressed={done}
                      className="flex w-full items-start gap-3 rounded-lg px-2 py-3 text-left transition hover:bg-sand"
                    >
                      {done ? (
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-moss" />
                      ) : (
                        <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                      )}
                      <span
                        className={`text-sm leading-5 ${done ? 'text-muted line-through' : 'text-deep'}`}
=======
            </Panel>
            <aside className="space-y-5">
              <Panel className="panel-pad">
                <SectionHeading
                  title="Your academic context"
                  action={
                    <InfoTip text="This is an academic alignment guide, not an admission probability. The estimate does not account for prerequisites, applicant pools, contextual review or supplemental performance." />
                  }
                />
                <div className="mt-5 flex items-baseline justify-between gap-3">
                  <label
                    htmlFor="current-average"
                    className="text-xs text-muted"
                  >
                    Current admission average
                  </label>
                  <span className="font-mono text-2xl tracking-tight text-accent">
                    {average}%
                  </span>
                </div>
                <input
                  id="current-average"
                  aria-label="Current admission average"
                  type="range"
                  min="50"
                  max="100"
                  step="1"
                  value={average}
                  onChange={(event) => updateAverage(event.target.value)}
                  className="mt-2 w-full"
                />
                <div className="flex justify-between text-[10px] text-muted">
                  <span>50%</span>
                  <span>100%</span>
                </div>
                <p className="fine-print mt-4">
                  A reference point, not a prediction. Requirements and
                  competitive averages can change.
                </p>
              </Panel>
              <Panel className="panel-pad">
                <SectionHeading
                  title="Your next steps"
                  description="Check off each step as you complete it."
                  action={<Badge>{remaining} left</Badge>}
                />
                <progress
                  value={completed.length}
                  max={CHECKLIST.length}
                  aria-label="Application checklist completion"
                  className="mt-5 h-1.5 w-full overflow-hidden rounded-full"
                />
                <div className="mt-3">
                  {CHECKLIST.map((task, taskIndex) => {
                    const done = completed.includes(task);
                    return (
                      <button
                        className="checklist-item"
                        key={task}
                        aria-pressed={done}
                        onClick={() => {
                          trackEvent("checklist_toggled", {
                            task_index: String(taskIndex),
                            done: String(!done),
                          });
                          toggleTask(task);
                        }}
>>>>>>> pr/8
                      >
                        <span className="check-box">
                          {done && <Check size={13} />}
                        </span>
                        <span className="check-text">{task}</span>
                      </button>
                    );
                  })}
                </div>
                <p
                  aria-live="polite"
                  className={`fine-print mt-4 ${storageError ? "text-danger!" : ""}`}
                >
                  {storageError ??
                    (saved
                      ? "All changes saved on this device."
                      : "Your changes save automatically on this device.")}
                </p>
              </Panel>
              <div className="px-2">
                <p className="text-xs font-medium">
                  The official details come first.
                </p>
                <p className="fine-print mt-2">
                  Check your university portals for current requirements,
                  prerequisites and deadlines before submitting.
                </p>
                <a
                  href="https://www.ouac.on.ca/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-link mt-3"
                >
                  Visit OUAC <ExternalLink size={13} />
                </a>
              </div>
<<<<<<< HEAD
              <p
                aria-live="polite"
                className={`mt-3 text-xs ${storageError ? 'text-brick' : 'text-muted'}`}
              >
                {storageError ?? (saved ? 'Your updates are saved on this device.' : 'Changes save automatically.')}
              </p>
            </section>

            <section className="band-dark rounded-2xl bg-navy p-5 text-paper shadow-sm sm:p-6">
              <h2 className="text-xl font-medium text-paper">Double-check every detail.</h2>
              <p className="mt-2 text-[15px] leading-6 text-paper/80">
                Program requirements can change from year to year. Confirm your selection, deadline
                and prerequisites in the official portals before submitting.
              </p>
              <a
                href="https://www.ouac.on.ca/"
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-sage hover:underline"
              >
                Visit OUAC <ExternalLink className="h-4 w-4" />
              </a>
            </section>
          </aside>
        </div>
      )}
=======
            </aside>
          </div>
        )}
      </div>
>>>>>>> pr/8
    </div>
  );
}
