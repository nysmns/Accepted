import Link from 'next/link';
import { ArrowRight, CalendarCheck, LibraryBig, Medal, Mic, PenLine } from 'lucide-react';
import { RangeBar } from '@/components/program-signals';

const TOOLS = [
  { href: '/planner', Icon: CalendarCheck, title: 'Plan your applications', body: 'Shortlist programs, enter your average and see where you sit against each one.' },
  { href: '/vault', Icon: LibraryBig, title: 'Compare programs', body: 'Typical averages, deadlines and what each supplemental application asks for.' },
  { href: '/simulator', Icon: PenLine, title: 'Practise a written answer', body: 'Write to a real prompt under a time limit and get scored by a strict reader.' },
  { href: '/interview', Icon: Mic, title: 'Rehearse out loud', body: 'Speak your answers, then see how they read as a transcript.' },
  { href: '/ec-rater', Icon: Medal, title: 'Rate your extracurriculars', body: 'Rank your activities and learn how to make each one count.' },
];

export default function Home() {
  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-14 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <h1 className="text-5xl leading-[1.08] tracking-tight text-navy sm:text-6xl">
            Know where you stand before you apply.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-muted">
            Compare Ontario programs, practise your supplemental applications and get honest feedback on your
            writing, interviews and extracurriculars.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/planner" className="btn-primary">
              Build my plan <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/vault" className="btn-quiet">
              Browse programs
            </Link>
          </div>
        </div>

        <div className="band-dark rounded-2xl bg-navy p-8 text-paper shadow-[0_24px_48px_-20px_rgba(7,27,45,0.55)] sm:p-10">
          <p className="text-[15px] text-paper/70">A 91% average, against Rotman Commerce</p>
          <div className="mt-7 text-paper [&_.text-muted]:text-paper/70 [&_.text-deep]:text-paper">
            <RangeBar label="88% - 92%" average={91} tone="dark" />
          </div>
          <p className="mt-6 text-[15px] leading-7 text-paper/80">
            The green band is the average the program usually takes. The marker is you. Every program on your list
            gets one.
          </p>
        </div>
      </section>

      <section aria-labelledby="tools" className="bg-sand">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <h2 id="tools" className="text-3xl text-navy sm:text-4xl">
              Five tools for one application season
            </h2>
            <p className="mt-4 max-w-sm text-base leading-7 text-muted">
              Start anywhere. Your average and your EC rating carry across, so the Planner and Programs stay
              personal to you.
            </p>
          </div>
          <ul className="space-y-3">
            {TOOLS.map(({ href, Icon, title, body }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="group flex items-center gap-5 rounded-xl bg-surface p-5 shadow-[0_1px_2px_rgba(7,27,45,0.06),0_8px_20px_-12px_rgba(7,27,45,0.2)] transition hover:-translate-y-0.5"
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-sage/45 text-moss">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-xl text-navy">{title}</span>
                    <span className="mt-0.5 block text-[15px] leading-6 text-muted">{body}</span>
                  </span>
                  <ArrowRight className="h-5 w-5 shrink-0 text-moss transition group-hover:translate-x-1" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="band-dark bg-navy text-paper">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-4 py-16 sm:px-6 md:flex-row md:items-center">
          <div className="max-w-xl">
            <h2 className="text-3xl text-paper sm:text-4xl">Start with your average.</h2>
            <p className="mt-3 text-base leading-7 text-paper/75">
              Enter it once in the Planner. Every program then shows where you sit, and what it asks beyond grades.
            </p>
          </div>
          <Link href="/planner" className="btn-light shrink-0">
            Open the planner <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
