'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { UNIVERSITIES } from '@/lib/data/programs';
import { readEcLevel, readPlannerAverage, type EcLevel } from '@/lib/position';
import ProgramRow from './program-row';

export default function Vault() {
  const [uniKey, setUniKey] = useState<string>('waterloo');
  const [query, setQuery] = useState('');
  const [average, setAverage] = useState<number | null>(null);
  const [ecLevel, setEcLevel] = useState<EcLevel | null>(null);

  useEffect(() => {
    setAverage(readPlannerAverage());
    setEcLevel(readEcLevel());
  }, []);

  const university = UNIVERSITIES.find((u) => u.key === uniKey) ?? UNIVERSITIES[0];

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return university.programs;
    return university.programs.filter(
      (p) => p.name.toLowerCase().includes(q) || p.req.toLowerCase().includes(q) || p.deadline.toLowerCase().includes(q)
    );
  }, [university, query]);

  return (
    <div>
      <header className="max-w-3xl">
        <h1 className="font-display text-3xl font-medium text-deep sm:text-4xl">Ontario supplemental programs</h1>
        <p className="mt-3 text-base leading-7 text-muted">
          What each program asks for, the average it usually takes, and where you sit. These are planning
          references, not official data. Confirm every detail with the university.
        </p>
        <p className="mt-3 text-sm text-muted">
          {average == null ? (
            <>
              <Link href="/planner" className="font-medium text-moss hover:underline">Set your average in the Planner</Link>{' '}
              to see where you sit on each range.
            </>
          ) : (
            <>Your saved average is {average}%. The dark marker on each bar shows where you sit.</>
          )}
        </p>
      </header>

      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div role="tablist" aria-label="University" className="flex flex-wrap gap-2">
          {UNIVERSITIES.map((u) => (
            <button
              key={u.key}
              role="tab"
              aria-selected={uniKey === u.key}
              onClick={() => setUniKey(u.key)}
              className={`rounded-md px-3.5 py-2 text-sm font-medium transition ${
                uniKey === u.key ? 'bg-navy text-paper' : 'bg-surface text-muted hover:text-deep'
              }`}
            >
              {u.short}
            </button>
          ))}
        </div>
        <div className="relative w-full lg:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search programs and requirements"
            placeholder="Search programs"
            className="h-11 w-full rounded-md bg-surface pl-9 pr-3 text-sm text-deep outline-none placeholder:text-muted focus:ring-2 focus:ring-moss"
          />
        </div>
      </div>

      <section className="mt-6">
        <h2 className="pb-3 font-display text-xl text-deep">
          {university.name}
          <span className="ml-3 text-sm font-normal text-muted">
            {rows.length} program{rows.length === 1 ? '' : 's'}
          </span>
        </h2>
        <div className="divide-y divide-navy/10">
          {rows.map((p) => (
            <ProgramRow key={p.name} {...p} average={average} ecLevel={ecLevel} />
          ))}
          {rows.length === 0 && <p className="py-12 text-center text-muted">No programs match “{query}”.</p>}
        </div>
      </section>
    </div>
  );
}
