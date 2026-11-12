'use client';

import { useEffect, useMemo, useState } from 'react';
import { CustomSelect, type Option } from './custom-select';
import { Loader2, Search } from 'lucide-react';
import { trackEvent } from '@/lib/track';

type HistoryYear = { year: number; average: number; offers: number };
type HistoryProgram = {
  university: string;
  program: string;
  offers: number;
  average: number;
  median: number;
  low: number;
  high: number;
  byYear: HistoryYear[];
};
type SortKey = 'university' | 'program' | 'offers' | 'average';

type Payload = {
  totalOffers: number;
  overallAverage: number;
  programCount: number;
  programs: HistoryProgram[];
};

export default function HistoryPanel() {
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [university, setUniversity] = useState('all');
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({
    key: 'average',
    dir: 'desc',
  });

  useEffect(() => {
    fetch('/history.json')
      .then((res) => {
        if (!res.ok) throw new Error('bad response');
        return res.json();
      })
      .then((json: Payload) => setData(json))
      .catch(() => setError('Could not load the historical averages. Try again later.'));
  }, []);

  const universities = useMemo(
    () => (data ? [...new Set(data.programs.map((p) => p.university))].sort() : []),
    [data]
  );

  function toggleSort(key: SortKey) {
    const next: { key: SortKey; dir: 'asc' | 'desc' } = {
      key,
      dir:
        sort.key === key
          ? sort.dir === 'asc'
            ? 'desc'
            : 'asc'
          : key === 'university' || key === 'program'
            ? 'asc'
            : 'desc',
    };
    trackEvent('history_sort_changed', { key, dir: next.dir });
    setSort(next);
  }

  const sortHeader = (key: SortKey, label: string, className = '') => (
    <th
      className={className}
      aria-sort={sort.key === key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}
    >
      <button className="table-sort" onClick={() => toggleSort(key)} title={`Sort by ${label.toLowerCase()}`}>
        {label}
        <span className="text-accent">
          {sort.key === key ? (sort.dir === 'asc' ? '↑' : '↓') : ''}
        </span>
      </button>
    </th>
  );

  const rows = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    const filtered = data.programs.filter(
      (p) =>
        (university === 'all' || p.university === university) &&
        (!q || p.program.toLowerCase().includes(q) || p.university.toLowerCase().includes(q))
    );
    const dir = sort.dir === 'asc' ? 1 : -1;
    return filtered.sort((a, b) => {
      if (sort.key === 'university') {
        return a.university.localeCompare(b.university) * dir || a.program.localeCompare(b.program);
      }
      if (sort.key === 'program') return a.program.localeCompare(b.program) * dir;
      if (sort.key === 'offers') return (a.offers - b.offers) * dir || b.average - a.average;
      return (a.average - b.average) * dir || b.offers - a.offers;
    });
  }, [data, query, university, sort]);

  if (error) {
    return (
      <div className="panel empty-state" role="alert">
        <h2>Could not load historical averages</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="loading-state" role="status">
        <Loader2 className="h-5 w-5 animate-spin text-accent" />
        <p>Loading historical averages…</p>
      </div>
    );
  }

  const stats = [
    { label: 'Programs tracked', value: String(data.programCount) },
    { label: 'Offers recorded', value: data.totalOffers.toLocaleString() },
    { label: 'Overall admitted average', value: `${data.overallAverage}%` },
    { label: 'Universities', value: String(universities.length) },
  ];

  return (
    <div className="space-y-6">
      <div className="stat-band">
        {stats.map((s) => (
          <div key={s.label} className="stat-cell">
            <p>{s.label}</p>
            <strong>{s.value}</strong>
          </div>
        ))}
      </div>

      <div className="panel panel-pad">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="search-field flex-1">
            <Search size={16} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onBlur={(e) =>
                trackEvent('history_searched', {
                  query: e.target.value,
                  results: String(rows.length),
                })
              }
              aria-label="Search programs and universities"
              placeholder="Search a program or university…"
              className="field"
            />
          </div>
          <CustomSelect
            value={university}
            onChange={setUniversity}
            options={
              [
                { value: 'all', label: 'All universities' },
                ...universities.map((u) => ({ value: u, label: u })),
              ] as Option[]
            }
            placeholder="Filter by university…"
            listClassName="max-h-48"
          />
        </div>

        <p className="mt-3 text-xs leading-5 text-muted">
          {rows.length} program{rows.length === 1 ? '' : 's'} shown. Averages are the reported Top 6
          average of admitted applicants, from self-reported outcomes. They are a planning reference,
          not an admission guarantee.
        </p>
      </div>

      <div className="panel overflow-hidden">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                {sortHeader('university', 'University', 'hidden sm:table-cell')}
                {sortHeader('program', 'Program')}
                {sortHeader('offers', 'Offers', 'text-right')}
                {sortHeader('average', 'Average', 'text-right')}
                <th className="hidden text-right md:table-cell">Range</th>
                <th className="hidden text-center lg:table-cell">Recent years</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={`${p.university}-${p.program}`}>
                  <td className="hidden whitespace-nowrap text-muted sm:table-cell">{p.university}</td>
                  <td className="font-medium text-foreground">{p.program}</td>
                  <td className="text-right tabular-nums text-muted">{p.offers}</td>
                  <td
                    className={`text-right tabular-nums font-semibold ${
                      p.offers < 5
                        ? 'text-muted underline decoration-dotted underline-offset-4'
                        : 'text-success'
                    }`}
                    title={
                      p.offers < 5
                        ? `Based on ${p.offers} reported offer${p.offers === 1 ? '' : 's'} — a small sample`
                        : `Based on ${p.offers} reported offers`
                    }
                  >
                    {p.average.toFixed(1)}%
                  </td>
                  <td className="hidden whitespace-nowrap text-right tabular-nums text-muted md:table-cell">
                    {p.low.toFixed(1)}%–{p.high.toFixed(1)}%
                  </td>
                  <td className="hidden whitespace-nowrap text-center tabular-nums text-muted lg:table-cell">
                    {p.byYear
                      .slice(-3)
                      .map((y) => `${y.year} ${y.average.toFixed(1)}`)
                      .join('  ·  ') || '—'}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-muted">
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
