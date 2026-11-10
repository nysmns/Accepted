'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { UNIVERSITIES } from '@/lib/data/programs';
import { readPlannerAverage } from '@/lib/position';
import { ProgramTags, RangeBar } from './program-signals';
import { ArrowRight, Search } from 'lucide-react';
import { trackEvent } from '@/lib/track';

export default function Vault() {
  const [uniKey, setUniKey] = useState<string>('waterloo');
  const [query, setQuery] = useState('');
  const [average, setAverage] = useState<number | null>(null);

  useEffect(() => setAverage(readPlannerAverage()), []);

  const university = UNIVERSITIES.find((u) => u.key === uniKey) ?? UNIVERSITIES[0];

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return university.programs;
    return university.programs.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.req.toLowerCase().includes(q) ||
        p.deadline.toLowerCase().includes(q)
    );
  }, [university, query]);

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="mt-2 font-display text-2xl font-semibold text-deep md:text-3xl">
            Ontario Supplemental Program Guide
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Select a university below to browse all programs requiring supplemental
            applications, competitive averages, and deadlines. These are planning
            references, not official admission guarantees; verify each detail with the university.
          </p>
        </div>
        <div className="w-full md:w-72">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search programs and requirements"
              placeholder="Search program name..."
              className="w-full rounded-lg bg-sand py-2.5 pl-9 pr-3 text-sm text-deep outline-none focus:ring-2 focus:ring-moss"
            />
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-muted">
        {average == null ? (
          <>
            <Link href="/planner" className="font-semibold text-moss hover:underline">
              Set your average in the Planner
            </Link>{' '}
            to see where you sit on each range.
          </>
        ) : (
          <>Your saved average is {average}%. The marker on each bar shows where you sit.</>
        )}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
        {UNIVERSITIES.map((u) => (
          <button
            key={u.key}
            onClick={() => setUniKey(u.key)}
            aria-pressed={uniKey === u.key}
            className={`rounded-xl px-3 py-3 text-xs font-medium transition ${
              uniKey === u.key
                ? 'bg-navy text-paper shadow'
                : ' bg-surface text-muted hover:text-deep'
            }`}
          >
            {u.short}
          </button>
        ))}
      </div>

      <div className="panel mt-4 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-paper/95 p-4 sm:p-5">
          <h2 className="text-lg font-bold text-deep">
            {university.name} — Programs with Supplemental Requirements
          </h2>
          <span className="rounded-full bg-sage/40 px-3 py-1 text-sm font-medium text-deep">
            {rows.length} Program{rows.length === 1 ? '' : 's'} Listed
          </span>
        </div>

        <div className="space-y-3 p-3 md:hidden">
          {rows.map((program) => (
            <article key={program.name} className="rounded-xl bg-paper/95 p-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold text-deep">{program.name}</h3>
                <span className="shrink-0 rounded-md bg-sage/40 px-2 py-1 text-sm font-semibold text-deep">
                  {program.avg}
                </span>
              </div>
              <p className="mt-3 text-sm leading-5 text-muted">{program.req}</p>
              <div className="mt-3 space-y-3">
                <RangeBar label={program.avg} average={average} />
                <ProgramTags req={program.req} />
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-medium text-brick">Deadline: {program.deadline}</span>
                <Link
                  href={`/simulator?program=${program.code}`}
                  onClick={() =>
                    trackEvent('practice_clicked', { code: program.code, program: program.name })
                  }
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-surface px-3 text-xs font-semibold text-moss transition hover:"
                >
                  Practice prompt <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </article>
          ))}
          {rows.length === 0 && (
            <p className="p-8 text-center text-sm text-muted">No programs match “{query}”.</p>
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs text-muted">
                <th className="whitespace-nowrap p-4 font-semibold">Program Name</th>
                <th className="whitespace-nowrap p-4 font-semibold">Est. Competitive Average</th>
                <th className="p-4 font-semibold">Supp App Requirements &amp; Format</th>
                <th className="whitespace-nowrap p-4 font-semibold">Deadline</th>
                <th className="whitespace-nowrap p-4 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/10">
              {rows.map((p) => (
                <tr key={p.name} className="text-deep/90 transition hover:bg-sand/60">
                  <td className="p-4 font-medium text-deep">{p.name}</td>
                  <td className="p-4">
                    <span className="rounded-md bg-sage/40 px-2.5 py-1 font-semibold text-deep">
                      {p.avg}
                    </span>
                    <div className="mt-3">
                      <RangeBar label={p.avg} average={average} />
                    </div>
                  </td>
                  <td className="max-w-md space-y-2 p-4 text-xs text-muted">
                    <p>{p.req}</p>
                    <ProgramTags req={p.req} />
                  </td>
                  <td className="whitespace-nowrap p-4 tabular-nums text-xs text-brick">
                    {p.deadline}
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/simulator?program=${p.code}`}
                      onClick={() => trackEvent('practice_clicked', { code: p.code, program: p.name })}
                      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-sand px-3 py-1.5 text-xs font-medium text-moss transition hover:"
                    >
                      Practice Prompt <ArrowRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-sm text-muted">
                    No programs match “{query}”.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
