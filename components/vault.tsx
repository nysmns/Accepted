'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { CustomSelect, type Option } from './custom-select';
import Link from 'next/link';
import { ArrowRight, BookOpen, Search } from 'lucide-react';
import { UNIVERSITIES } from '@/lib/data/programs';
import { readEcLevel, readPlannerAverage, suppSignals, type EcLevel } from '@/lib/position';
import { EcFit, ProgramTags, RangeBar } from './program-signals';
import TrackedLink from './tracked-link';

type Requirement = 'all' | 'written' | 'profile' | 'interview';

const REQUIREMENTS: { value: Requirement; label: string }[] = [
  { value: 'all', label: 'All requirements' },
  { value: 'written', label: 'Long answer / written' },
  { value: 'profile', label: 'Background & ECs' },
  { value: 'interview', label: 'Interview / video' },
];

const matchesRequirement: Record<Requirement, (req: string) => boolean> = {
  all: () => true,
  written: (req) => suppSignals(req).longAnswer,
  profile: (req) => suppSignals(req).background,
  interview: (req) => /interview|video/i.test(req),
};

export default function Vault() {
  const [query, setQuery] = useState('');
  const [requirement, setRequirement] = useState<Requirement>('all');
  const [uniKey, setUniKey] = useState('all');
  const [average, setAverage] = useState<number | null>(null);
  const [ecLevel, setEcLevel] = useState<EcLevel | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setAverage(readPlannerAverage());
    setEcLevel(readEcLevel());
    setReady(true);
  }, []);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return UNIVERSITIES.filter((u) => uniKey === 'all' || u.key === uniKey)
      .flatMap((u) => u.programs.map((p) => ({ ...p, university: u.name })))
      .filter(
        (p) =>
          matchesRequirement[requirement](p.req) &&
          (!q || `${p.name} ${p.university} ${p.req} ${p.deadline}`.toLowerCase().includes(q))
      );
  }, [query, requirement, uniKey]);

  const practice = (p: (typeof rows)[number]) => ({
    href: `/simulator?program=${p.code}`,
    event: 'practice_clicked',
    properties: { code: p.code, program: p.name },
    'aria-label': `Practise ${p.name}`,
    className: 'text-link text-xs!',
  });

  return (
    <div className="workspace-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Plan / Program vault</p>
          <h1>Find a program. See the possibilities.</h1>
          <p className="page-description">
            Compare supplemental requirements by university and program. Find out which applications need writing, an
            interview, or an activity profile.
          </p>
        </div>
        <div className="page-actions">
          <span className="badge badge-neutral">
            <BookOpen size={13} />
            {UNIVERSITIES.length} universities
          </span>
        </div>
      </header>

      <div className="panel panel-pad">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="search-field flex-1">
            <Search size={16} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search programs and requirements"
              placeholder="Program, university, or requirement…"
              className="field"
            />
          </div>
          <div className="relative sm:w-56">
            <CustomSelect
              value={requirement}
              onChange={(v) => setRequirement(v as Requirement)}
              options={
                REQUIREMENTS.map((r) => ({ value: r.value, label: r.label })) as Option[]
              }
              placeholder="Filter by requirement…"
              listClassName="max-h-48"
            />
          </div>
        </div>

        <div className="university-filter" role="group" aria-label="Choose a university">
          {[{ key: 'all', short: 'All universities' }, ...UNIVERSITIES].map((u) => (
            <button key={u.key} onClick={() => setUniKey(u.key)} aria-pressed={uniKey === u.key}>
              {u.short}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <p className="fine-print" aria-live="polite">
            <strong className="font-semibold text-foreground">
              {rows.length} program{rows.length === 1 ? '' : 's'}
            </strong>{' '}
            match your selection
          </p>
          <p className="fine-print">
            {!ready ? (
              <span className="skeleton h-4 w-64" role="status" aria-label="Loading your saved average" />
            ) : average == null ? (
              <>
                <Link href="/planner" className="text-accent underline underline-offset-4">
                  Set your average in the Planner
                </Link>{' '}
                to see where you sit on each range.
              </>
            ) : (
              <>
                Your saved average <strong className="font-mono font-medium text-accent">{average}%</strong> is marked on
                each range.
              </>
            )}
          </p>
        </div>
      </div>

      <div className="panel mt-6 overflow-hidden">
        {rows.length === 0 ? (
          <div className="empty-state">
            <h2>No programs match</h2>
            <p>Try a different search, university, or requirement.</p>
          </div>
        ) : (
          <>
            <div className="table-wrap hidden xl:block">
              <table className="data-table">
                <caption className="sr-only">
                  Ontario supplemental program requirements and competitive reference ranges
                </caption>
                <thead>
                  <tr>
                    <th className="w-[24%]">University &amp; program</th>
                    <th className="w-[20%]">Competitive reference</th>
                    <th className="w-[30%]">Supplemental requirements</th>
                    <th>Deadline</th>
                    <th>
                      <span className="sr-only">Practice</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((p, i) => (
                    <tr key={p.code} className="reveal-row" style={{ '--i': i } as CSSProperties}>
                      <td>
                        <p className="mb-2 text-[10px] text-muted">{p.university}</p>
                        <h2 className="text-[13px] font-semibold leading-6 tracking-normal">{p.name}</h2>
                      </td>
                      <td>
                        <span className="text-sm font-semibold">{p.avg}</span>
                        <div className="mt-4">
                          <RangeBar label={p.avg} average={average} />
                        </div>
                      </td>
                      <td>
                        <p className="mb-3 text-[11px] leading-6 text-secondary">{p.req}</p>
                        <ProgramTags req={p.req} />
                        <div className="mt-3">
                          <EcFit req={p.req} level={ecLevel} />
                        </div>
                      </td>
                      <td className="text-xs text-secondary">{p.deadline}</td>
                      <td>
                        <TrackedLink {...practice(p)}>
                          Practise <ArrowRight size={14} />
                        </TrackedLink>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid md:grid-cols-2 xl:hidden">
              {rows.map((p, i) => (
                <article
                  key={p.code}
                  className="reveal-row border-b border-line p-5 md:odd:border-r"
                  style={{ '--i': i } as CSSProperties}
                >
                  <div className="flex items-start gap-3">
                    <span className="folio-number">{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <p className="text-[10px] text-muted">{p.university}</p>
                      <h2 className="mt-1 text-base font-semibold leading-6 tracking-tight">{p.name}</h2>
                    </div>
                  </div>
                  <div className="mt-5 flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold">{p.avg}</span>
                    <div className="w-40">
                      <RangeBar label={p.avg} average={average} />
                    </div>
                  </div>
                  <p className="body-copy mt-4 text-xs!">{p.req}</p>
                  <div className="mt-3">
                    <ProgramTags req={p.req} />
                  </div>
                  <div className="mt-3">
                    <EcFit req={p.req} level={ecLevel} />
                  </div>
                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
                    <div>
                      <p className="text-[10px] text-muted">Deadline reference</p>
                      <p className="mt-1 text-xs">{p.deadline}</p>
                    </div>
                    <TrackedLink {...practice(p)}>
                      Practise <ArrowRight size={14} />
                    </TrackedLink>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
