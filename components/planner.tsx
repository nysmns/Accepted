'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, Circle, ExternalLink, Plus } from 'lucide-react';
import { UNIVERSITIES } from '@/lib/data/programs';
import { PLANNER_KEY, readEcLevel, type EcLevel } from '@/lib/position';
import ProgramRow from './program-row';

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
  'Confirm each program and campus on OUAC',
  'Check each university portal and supplemental requirements',
  'Add verified deadlines to your calendar',
  'Submit OUAC choices and review the confirmation',
  'Check portals regularly for updates or new tasks',
];

const PROGRAM_OPTIONS = UNIVERSITIES.flatMap((university) =>
  university.programs.map((program, index) => ({
    id: `${university.key}-${index}-${program.name}`,
    university: university.name,
    ...program,
  }))
);

function isPlannedProgram(value: unknown): value is PlannedProgram {
  if (!value || typeof value !== 'object') return false;
  const program = value as Record<string, unknown>;
  return (
    typeof program.id === 'string' &&
    typeof program.university === 'string' &&
    typeof program.name === 'string' &&
    typeof program.avg === 'string' &&
    typeof program.req === 'string' &&
    typeof program.deadline === 'string' &&
    typeof program.code === 'string'
  );
}

export default function Planner() {
  const [average, setAverage] = useState(85);
  const [selected, setSelected] = useState<PlannedProgram[]>([]);
  const [completed, setCompleted] = useState<string[]>([]);
  const [choice, setChoice] = useState('');
  const [saved, setSaved] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [ecLevel, setEcLevel] = useState<EcLevel | null>(null);

  useEffect(() => setEcLevel(readEcLevel()), []);

  useEffect(() => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (!savedState) return;
      const state = JSON.parse(savedState) as Partial<PlannerState>;
      if (typeof state.average === 'number' && state.average >= 0 && state.average <= 100) {
        setAverage(state.average);
      }
      if (Array.isArray(state.selected)) setSelected(state.selected.filter(isPlannedProgram));
      if (Array.isArray(state.completed)) {
        setCompleted(
          state.completed.filter(
            (task): task is string => typeof task === 'string' && CHECKLIST.includes(task)
          )
        );
      }
    } catch {
      setStorageError('Could not read the saved planner from this browser.');
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        setStorageError('Browser storage is unavailable; your planner may not persist.');
      }
    }
  }, []);

  useEffect(() => {
    if (!saved) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ average, selected, completed } satisfies PlannerState)
      );
      setStorageError(null);
    } catch {
      setStorageError('Browser storage is unavailable; your planner may not persist.');
    }
  }, [average, selected, completed, saved]);

  const remaining = useMemo(
    () => CHECKLIST.length - completed.length,
    [completed]
  );

  function addProgram() {
    const program = PROGRAM_OPTIONS.find((option) => option.id === choice);
    if (!program || selected.some((item) => item.id === program.id)) return;
    setSelected((current) => [...current, program]);
    setSaved(true);
  }

  function toggleTask(task: string) {
    setCompleted((current) =>
      current.includes(task) ? current.filter((item) => item !== task) : [...current, task]
    );
    setSaved(true);
  }

  function updateAverage(value: string) {
    const next = Number(value);
    if (Number.isFinite(next) && next >= 0 && next <= 100) {
      setAverage(next);
      setSaved(true);
    }
  }

  const fieldHeight = 'h-12';

  return (
    <div className="space-y-10">
      <header className="max-w-3xl">
        <h1 className="font-display text-3xl font-medium text-deep sm:text-4xl">Application planner</h1>
        <p className="mt-3 text-base leading-7 text-muted">
          Build your shortlist, see where your average sits against each program, and tick off what you have
          verified. Everything is saved in this browser.
        </p>
      </header>

      <section className="card p-6 sm:p-7">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <label htmlFor="current-average" className="font-display text-xl text-deep">
            Your current average
          </label>
          <span className="font-display text-4xl font-medium text-moss">{average}%</span>
        </div>
        <input
          id="current-average"
          type="range"
          min="50"
          max="100"
          step="1"
          value={average}
          onChange={(event) => updateAverage(event.target.value)}
          className="mt-4 w-full accent-[#4c6a5a]"
        />
        <div className="flex justify-between text-sm text-muted">
          <span>50%</span>
          <span>100%</span>
        </div>
        <p className="mt-3 max-w-prose text-sm leading-6 text-muted">
          This is an academic alignment guide, not an admission probability. Competitive averages are estimates and
          ignore applicant pools, prerequisites and supplemental performance.
        </p>
      </section>

      <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section>
          <h2 className="font-display text-2xl text-deep">Your shortlist</h2>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <label className="sr-only" htmlFor="planner-program">Choose a university program</label>
            <select
              id="planner-program"
              value={choice}
              onChange={(event) => setChoice(event.target.value)}
              className={`${fieldHeight} min-w-0 flex-1 rounded-md  bg-surface px-3 text-sm text-deep outline-none focus:ring-2 focus:ring-moss`}
            >
              <option value="">Choose a program to add</option>
              {UNIVERSITIES.map((university) => (
                <optgroup key={university.key} label={university.name}>
                  {PROGRAM_OPTIONS.filter((program) => program.university === university.name).map((program) => (
                    <option key={program.id} value={program.id}>{program.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            <button
              onClick={addProgram}
              disabled={!choice || selected.some((program) => program.id === choice)}
              className={`${fieldHeight} inline-flex items-center justify-center gap-2 rounded-md bg-navy px-5 text-sm font-semibold text-paper transition hover:bg-deep disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <Plus className="h-4 w-4" /> Add program
            </button>
          </div>

          {selected.length === 0 ? (
            <p className="mt-6 rounded-xl bg-sand px-6 py-12 text-center text-muted">
              Add the programs you are considering. Each one shows its requirements and where your average sits.
            </p>
          ) : (
            <div className="mt-2 divide-y divide-navy/10">
              {selected.map((program) => (
                <ProgramRow
                  key={program.id}
                  {...program}
                  average={average}
                  ecLevel={ecLevel}
                  onRemove={() => {
                    setSelected((current) => current.filter((item) => item.id !== program.id));
                    setSaved(true);
                  }}
                />
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-6 xl:pt-1">
          <section className="card p-6">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-display text-xl text-deep">Checklist</h2>
              <span className="text-sm text-muted">{remaining} left</span>
            </div>
            <div className="mt-4 divide-y divide-navy/10">
              {CHECKLIST.map((task) => {
                const done = completed.includes(task);
                return (
                  <button
                    key={task}
                    onClick={() => toggleTask(task)}
                    aria-pressed={done}
                    className="flex w-full items-start gap-3 py-3 text-left transition hover:text-deep"
                  >
                    {done ? (
                      <Check className="mt-1 h-4 w-4 shrink-0 text-moss" />
                    ) : (
                      <Circle className="mt-1 h-4 w-4 shrink-0 text-muted" />
                    )}
                    <span className={`text-[15px] leading-6 ${done ? 'text-muted line-through' : 'text-deep'}`}>{task}</span>
                  </button>
                );
              })}
            </div>
            <p aria-live="polite" className={`mt-3 text-sm ${storageError ? 'text-brick' : 'text-muted'}`}>
              {storageError ?? (saved ? 'Saved on this device.' : 'Changes save automatically.')}
            </p>
          </section>

          <section className="card p-6">
            <h2 className="font-display text-xl text-deep">Your extracurriculars</h2>
            <p className="mt-2 text-[15px] leading-6 text-muted">
              {ecLevel
                ? `Nova rated your ECs ${ecLevel}. Programs that assess ECs use this.`
                : 'Rate your ECs so programs that assess them can show how you fit.'}
            </p>
            <Link href="/ec-rater" className="mt-3 inline-block text-sm font-medium text-moss hover:underline">
              {ecLevel ? 'Update your EC rating' : 'Rate my ECs'}
            </Link>
          </section>

          <section className="band-dark rounded-xl bg-navy p-6 text-paper">
            <h2 className="font-display text-xl text-paper">Check the official sources</h2>
            <p className="mt-2 text-[15px] leading-6 text-paper/80">
              Requirements change every year. Confirm each program, deadline and prerequisite on OUAC and the
              university portal before you submit.
            </p>
            <a
              href="https://www.ouac.on.ca/"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-sage hover:underline"
            >
              Open OUAC <ExternalLink className="h-4 w-4" />
            </a>
          </section>
        </aside>
      </div>
    </div>
  );
}
