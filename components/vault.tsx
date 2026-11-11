"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Search, SlidersHorizontal } from "lucide-react";
import { UNIVERSITIES } from "@/lib/data/programs";
import {
  readPlannerAverage,
  readEcLevel,
  suppSignals,
  type EcLevel,
} from "@/lib/position";
import { EcFit, ProgramTags, RangeBar } from "./program-signals";
import { trackEvent } from "@/lib/track";
import { Badge, Button, EmptyState, PageHeader } from "./ui";

const PROGRAMS = UNIVERSITIES.flatMap((university) =>
  university.programs.map((program) => ({
    ...program,
    university: university.name,
    universityKey: university.key,
    universityShort: university.short,
  })),
);
export default function Vault() {
  const [uniKey, setUniKey] = useState("all");
  const [query, setQuery] = useState("");
  const [requirement, setRequirement] = useState("all");
  const [average, setAverage] = useState<number | null>(null);
  const [ecLevel, setEcLevel] = useState<EcLevel | null>(null);
  useEffect(() => {
    setAverage(readPlannerAverage());
    setEcLevel(readEcLevel());
  }, []);
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PROGRAMS.filter((program) => {
      const signals = suppSignals(program.req);
      return (
        (uniKey === "all" || program.universityKey === uniKey) &&
        (!q ||
          `${program.name} ${program.university} ${program.req} ${program.deadline}`
            .toLowerCase()
            .includes(q)) &&
        (requirement === "all" ||
          (requirement === "written" && signals.longAnswer) ||
          (requirement === "profile" && signals.background) ||
          (requirement === "interview" && /video|interview/i.test(program.req)))
      );
    });
  }, [uniKey, query, requirement]);
  const practice = (program: (typeof PROGRAMS)[number]) => (
    <Link
      href={`/simulator?program=${program.code}`}
      onClick={() =>
        trackEvent("practice_clicked", {
          code: program.code,
          program: program.name,
        })
      }
      className="text-link text-xs!"
      aria-label={`Practise ${program.name}`}
    >
      Practise <ArrowRight size={14} />
    </Link>
  );
  return (
<<<<<<< HEAD
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
=======
    <div className="reveal">
      <PageHeader
        eyebrow="Plan / Program vault"
        title="Find a program. See the possibilities."
        description="Compare supplemental requirements by university and program. Find out which applications need writing, an interview, or an activity profile."
        action={
          <Badge>
            <BookOpen size={13} />
            {UNIVERSITIES.length} universities
          </Badge>
        }
      />
      <div className="panel panel-pad">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="search-field flex-1">
            <Search size={17} />
>>>>>>> pr/8
            <input
              type="search"
              aria-label="Search programs and requirements"
<<<<<<< HEAD
              placeholder="Search program name..."
              className="w-full rounded-lg bg-sand py-2.5 pl-9 pr-3 text-sm text-deep outline-none focus:ring-2 focus:ring-moss"
=======
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Program, university, or requirement…"
              className="field"
>>>>>>> pr/8
            />
          </div>
          <div className="relative sm:w-56">
            <label className="sr-only" htmlFor="vault-requirement">
              Filter by requirement
            </label>
            <select
              id="vault-requirement"
              className="field"
              value={requirement}
              onChange={(event) => setRequirement(event.target.value)}
            >
              <option value="all">All requirements</option>
              <option value="written">Long answer / written</option>
              <option value="profile">Background &amp; ECs</option>
              <option value="interview">Interview / video</option>
            </select>
          </div>
        </div>
<<<<<<< HEAD
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
=======
        <div
          className="university-filter"
          role="group"
          aria-label="Choose a university"
        >
          <button
            aria-pressed={uniKey === "all"}
            onClick={() => setUniKey("all")}
>>>>>>> pr/8
          >
            All universities
          </button>
<<<<<<< HEAD
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
=======
          {UNIVERSITIES.map((university) => (
            <button
              key={university.key}
              onClick={() => setUniKey(university.key)}
              aria-pressed={uniKey === university.key}
            >
              {university.short}
            </button>
>>>>>>> pr/8
          ))}
        </div>
<<<<<<< HEAD

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
=======
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <p className="fine-print" aria-live="polite">
            <strong className="font-semibold text-foreground">
              {rows.length} programs
            </strong>{" "}
            match your selection
          </p>
          <p className="fine-print">
            {average == null ? (
              <Link href="/planner" className="text-link text-xs!">
                Set your average to compare ranges <ArrowRight size={13} />
              </Link>
            ) : (
              <>
                Your saved average{" "}
                <strong className="font-mono font-medium text-accent">
                  {average}%
                </strong>{" "}
                is marked on each range.
              </>
            )}
          </p>
>>>>>>> pr/8
        </div>
      </div>
      <div className="mt-6 panel overflow-hidden">
        {rows.length === 0 ? (
          <EmptyState
            icon={<SlidersHorizontal />}
            title="No programs match these filters."
            description={
              <>
                No programs match “{query || "your selected filters"}”. Try a
                broader search or another university.
              </>
            }
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setQuery("");
                  setUniKey("all");
                  setRequirement("all");
                }}
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <>
            <div className="hidden xl:block table-wrap">
              <table className="data-table">
                <caption className="sr-only">
                  Ontario supplemental program requirements and competitive
                  reference ranges
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
                  {rows.map((program) => (
                    <tr key={`${program.universityKey}-${program.name}`}>
                      <td>
                        <p className="mb-2 text-[10px] text-muted">
                          {program.university}
                        </p>
                        <h2 className="text-[13px] font-semibold leading-6 tracking-normal">
                          {program.name}
                        </h2>
                      </td>
                      <td>
                        <span className="text-sm font-semibold">
                          {program.avg}
                        </span>
                        <div className="mt-4">
                          <RangeBar label={program.avg} average={average} />
                        </div>
                      </td>
                      <td>
                        <p className="mb-3 text-[11px] leading-6 text-secondary">
                          {program.req}
                        </p>
                        <ProgramTags req={program.req} />
                        <div className="mt-3">
                          <EcFit req={program.req} level={ecLevel} />
                        </div>
                      </td>
                      <td className="text-xs text-secondary">
                        {program.deadline}
                      </td>
                      <td>{practice(program)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid md:grid-cols-2 xl:hidden">
              {rows.map((program, index) => (
                <article
                  key={`${program.universityKey}-${program.name}`}
                  className="border-b border-line p-5 md:odd:border-r"
                >
                  <div className="flex items-start gap-3">
                    <span className="folio-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="text-[10px] text-muted">
                        {program.university}
                      </p>
                      <h2 className="mt-1 text-base font-semibold leading-6 tracking-tight">
                        {program.name}
                      </h2>
                    </div>
                  </div>
                  <div className="mt-5 flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold">{program.avg}</span>
                    <div className="w-40">
                      <RangeBar label={program.avg} average={average} />
                    </div>
                  </div>
                  <p className="body-copy mt-4 text-xs!">{program.req}</p>
                  <div className="mt-3">
                    <ProgramTags req={program.req} />
                  </div>
                  <div className="mt-3">
                    <EcFit req={program.req} level={ecLevel} />
                  </div>
                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
                    <div>
                      <p className="text-[10px] text-muted">
                        Deadline reference
                      </p>
                      <p className="mt-1 text-xs">{program.deadline}</p>
                    </div>
                    {practice(program)}
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
      <p className="fine-print mt-5 flex items-start gap-2">
        <BookOpen size={14} className="mt-1" />
        Planning references, not admission guarantees. Verify requirements and
        deadlines directly. Practice prompts are representative, never official
        admissions questions.
      </p>
    </div>
  );
}
