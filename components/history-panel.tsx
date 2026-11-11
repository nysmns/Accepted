"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDownUp, Search } from "lucide-react";
import { Badge, Button, LoadingState, Notice, SectionHeading } from "./ui";
import { trackEvent } from "@/lib/track";

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
type SortKey = "university" | "program" | "offers" | "average";

type Payload = {
  totalOffers: number;
  overallAverage: number;
  programCount: number;
  programs: HistoryProgram[];
};

export default function HistoryPanel() {
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [university, setUniversity] = useState("all");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "average",
    dir: "desc",
  });

  useEffect(() => {
    fetch("/history.json")
      .then((res) => {
        if (!res.ok) throw new Error("bad response");
        return res.json();
      })
      .then((json: Payload) => setData(json))
      .catch(() =>
        setError("Could not load the historical averages. Try again later."),
      );
  }, []);

  const universities = useMemo(
    () =>
      data ? [...new Set(data.programs.map((p) => p.university))].sort() : [],
    [data],
  );

  function toggleSort(key: SortKey) {
    const next: { key: SortKey; dir: "asc" | "desc" } = {
      key,
      dir:
        sort.key === key
          ? sort.dir === "asc"
            ? "desc"
            : "asc"
          : key === "university" || key === "program"
            ? "asc"
            : "desc",
    };
    trackEvent("history_sort_changed", { key, dir: next.dir });
    setSort(next);
  }

  const sortHeader = (key: SortKey, label: string, className = "") => (
    <th
<<<<<<< HEAD
      onClick={() => toggleSort(key)}
      aria-sort={sort.key === key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}
      title={`Sort by ${label.toLowerCase()}`}
      className={`cursor-pointer select-none whitespace-nowrap px-4 py-3 font-semibold transition hover:text-deep ${className}`}
    >
      {label}
      <span className="ml-1 inline-block w-3 text-moss">
        {sort.key === key ? (sort.dir === 'asc' ? '↑' : '↓') : ''}
      </span>
=======
      className={className}
      aria-sort={
        sort.key === key
          ? sort.dir === "asc"
            ? "ascending"
            : "descending"
          : undefined
      }
    >
      <button className="table-sort" onClick={() => toggleSort(key)}>
        {label}
        <span aria-hidden="true" className="text-accent">
          {sort.key === key ? (
            sort.dir === "asc" ? (
              "↑"
            ) : (
              "↓"
            )
          ) : (
            <ArrowDownUp size={11} />
          )}
        </span>
      </button>
>>>>>>> pr/8
    </th>
  );

  const rows = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    const filtered = data.programs.filter(
      (p) =>
        (university === "all" || p.university === university) &&
        (!q ||
          p.program.toLowerCase().includes(q) ||
          p.university.toLowerCase().includes(q)),
    );
    const dir = sort.dir === "asc" ? 1 : -1;
    return filtered.sort((a, b) => {
      if (sort.key === "university") {
        return (
          a.university.localeCompare(b.university) * dir ||
          a.program.localeCompare(b.program)
        );
      }
      if (sort.key === "program")
        return a.program.localeCompare(b.program) * dir;
      if (sort.key === "offers")
        return (a.offers - b.offers) * dir || b.average - a.average;
      return (a.average - b.average) * dir || b.offers - a.offers;
    });
  }, [data, query, university, sort]);

  if (error) return <Notice tone="error">{error}</Notice>;
  if (!data)
    return (
<<<<<<< HEAD
      <div className="panel p-10 text-center text-sm text-brick" role="alert">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="panel flex items-center justify-center gap-3 p-16 text-sm text-muted" role="status">
        <Loader2 className="h-5 w-5 animate-spin text-moss" />
        Loading historical averages…
      </div>
    );
  }

=======
      <div className="panel">
        <LoadingState
          title="Looking back at the data…"
          description="Loading self-reported historical admission averages."
        />
      </div>
    );
>>>>>>> pr/8
  const stats = [
    { label: "Programs tracked", value: String(data.programCount) },
    { label: "Offers recorded", value: data.totalOffers.toLocaleString() },
    { label: "Overall admitted average", value: `${data.overallAverage}%` },
    { label: "Universities represented", value: String(universities.length) },
  ];
  return (
    <div className="space-y-6">
<<<<<<< HEAD
      <div className="grid grid-cols-2 gap-px bg-sand lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface p-5">
            <p className="eyebrow">{s.label}</p>
            <p className="mt-2 font-display text-2xl font-semibold text-deep">{s.value}</p>
=======
      <div className="metric-band">
        {stats.map((stat) => (
          <div className="metric" key={stat.label}>
            <p>{stat.label}</p>
            <strong>{stat.value}</strong>
>>>>>>> pr/8
          </div>
        ))}
      </div>
      <div className="panel overflow-hidden">
        <div className="panel-pad">
          <SectionHeading
            title="An honest look back."
            description="Self-reported outcomes give context to the choices ahead."
            action={<Badge>{rows.length} programs</Badge>}
          />
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <div className="search-field flex-1">
              <Search size={16} />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onBlur={(event) =>
                  trackEvent("history_searched", {
                    query: event.target.value,
                    results: String(rows.length),
                  })
                }
                aria-label="Search programs and universities"
                placeholder="Find a program or university…"
                className="field"
              />
            </div>
            <select
              value={university}
              onChange={(event) => {
                setUniversity(event.target.value);
                trackEvent("history_filter_changed", {
                  university: event.target.value,
                });
              }}
              aria-label="Filter by university"
              className="field sm:w-56"
            >
              <option value="all">All universities</option>
              {universities.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <p className="fine-print mt-4">
            Reported Top 6 averages of admitted applicants. A planning
            reference, not an admission guarantee. Dotted averages indicate
            fewer than five reported offers.
          </p>
        </div>
<<<<<<< HEAD

        <p className="mt-3 text-xs leading-5 text-muted">
          {rows.length} program{rows.length === 1 ? '' : 's'} shown. Averages are the reported Top 6
          average of admitted applicants, from self-reported outcomes. They are a planning reference,
          not an admission guarantee.
        </p>

        <div className="mt-4 rounded-lg">
          <table className="w-full text-sm">
            <thead className="sticky top-16 z-10 bg-sand">
              <tr className="text-left text-xs text-muted">
                {sortHeader('university', 'University', 'hidden sm:table-cell')}
                {sortHeader('program', 'Program')}
                {sortHeader('offers', 'Offers', 'text-right')}
                {sortHeader('average', 'Average', 'text-right')}
                <th className="hidden whitespace-nowrap px-4 py-3 text-right font-semibold md:table-cell">
                  Range
                </th>
                <th className="hidden whitespace-nowrap px-4 py-3 text-center font-semibold lg:table-cell">
                  Recent years
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/10">
              {rows.map((p) => (
                <tr key={`${p.university}-${p.program}`} className="transition hover:bg-sand/50">
                  <td className="hidden whitespace-nowrap px-4 py-3 text-xs text-muted sm:table-cell">{p.university}</td>
                  <td className="px-4 py-3 font-medium text-deep">{p.program}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-xs text-muted">{p.offers}</td>
                  <td
                    className={`px-4 py-3 text-right tabular-nums text-base font-semibold ${
                      p.offers < 5
                        ? 'text-muted underline decoration-dotted decoration-muted/60 underline-offset-4'
                        : 'text-moss'
                    }`}
                    title={
                      p.offers < 5
                        ? `Based on ${p.offers} reported offer${p.offers === 1 ? '' : 's'} — a small sample`
                        : `Based on ${p.offers} reported offers`
                    }
=======
        <div className="table-wrap">
          <table className="data-table">
            <caption className="sr-only">
              Historical self-reported admission outcomes; select a column
              heading to sort
            </caption>
            <thead>
              <tr>
                {sortHeader("university", "University", "hidden md:table-cell")}
                {sortHeader("program", "Program")}
                {sortHeader("offers", "Offers", "text-right")}
                {sortHeader("average", "Average", "text-right")}
                <th className="hidden text-right lg:table-cell">Range</th>
                <th className="hidden xl:table-cell">Recent years</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((program) => (
                <tr key={`${program.university}-${program.program}`}>
                  <td className="hidden text-xs text-muted md:table-cell">
                    {program.university}
                  </td>
                  <td>
                    <p className="mb-1 text-[10px] text-muted md:hidden">
                      {program.university}
                    </p>
                    <p className="font-medium leading-6">{program.program}</p>
                  </td>
                  <td className="text-right font-mono text-xs text-muted">
                    {program.offers}
                  </td>
                  <td
                    className={`text-right font-mono text-sm ${program.offers < 5 ? "text-muted underline decoration-dotted underline-offset-4" : "text-accent"}`}
                    title={`Based on ${program.offers} reported offers${program.offers < 5 ? " — a small sample" : ""}`}
>>>>>>> pr/8
                  >
                    {program.average.toFixed(1)}%
                  </td>
<<<<<<< HEAD
                  <td className="hidden whitespace-nowrap px-4 py-3 text-right tabular-nums text-xs text-muted md:table-cell">
                    {p.low.toFixed(1)}%–{p.high.toFixed(1)}%
                  </td>
                  <td className="hidden whitespace-nowrap px-4 py-3 text-center tabular-nums text-xs text-muted lg:table-cell">
                    {p.byYear
=======
                  <td className="hidden text-right font-mono text-[10px] text-muted lg:table-cell">
                    {program.low.toFixed(1)}–{program.high.toFixed(1)}%
                  </td>
                  <td className="hidden text-[10px] text-muted xl:table-cell">
                    {program.byYear
>>>>>>> pr/8
                      .slice(-3)
                      .map(
                        (year) => `${year.year} / ${year.average.toFixed(1)}`,
                      )
                      .join(" · ") || "—"}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="py-8 text-center">
                      <p className="body-copy">No programs match “{query}”.</p>
                      <Button
                        variant="quiet"
                        className="mt-3"
                        onClick={() => {
                          setQuery("");
                          setUniversity("all");
                        }}
                      >
                        Clear filters
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <p className="fine-print">
        Historical outcomes are self-reported and affected by sample size. They
        do not describe every applicant or predict a future decision.
      </p>
    </div>
  );
}
