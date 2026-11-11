import Link from 'next/link';
import { ArrowRight, CalendarCheck, LibraryBig, Medal, Mic, PenLine } from 'lucide-react';
import { SIMULATOR_PROGRAMS } from '@/lib/data/prompts';
import TrackedLink from '@/components/tracked-link';

const PATHWAYS = [
  { icon: CalendarCheck, title: 'Plan your applications', body: 'Keep OUAC choices, deadlines, historical grades and next steps in one practical workspace.', href: '/planner' },
  { icon: LibraryBig, title: 'Know what each program asks', body: 'Compare Ontario programs, their supplemental formats and the details to verify.', href: '/vault' },
  { icon: PenLine, title: 'Build a stronger written response', body: 'Work from a focused prompt, then get specific feedback you can apply to your next draft.', href: '/simulator' },
  { icon: Mic, title: 'Practise speaking out loud', body: 'Run a voice-based mock interview with timed questions and a structured review.', href: '/interview' },
  { icon: Medal, title: 'Rate your extracurriculars', body: 'Rank your activities and learn how to make each one count.', href: '/ec-rater' },
];

const STATS = [
  { value: '645', label: 'Programs tracked' },
  { value: '6,950', label: 'Offers recorded' },
  { value: '92.9%', label: 'Average admitted grade' },
];

export default function Home() {
  const sample = SIMULATOR_PROGRAMS.find((p) => p.code === 'queens_comm') ?? SIMULATOR_PROGRAMS[0];

  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-14 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <h1 className="text-5xl leading-[1.08] tracking-tight text-navy sm:text-6xl">
            Practise the part of the application that counts.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-muted">
            A calm workspace for Ontario applicants: organise your choices, understand supplemental applications and
            practise the parts that take more than one try.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <TrackedLink href="/planner" event="hero_cta" properties={{ cta: 'plan' }} className="btn-primary">
              Build my plan <ArrowRight className="h-4 w-4" />
            </TrackedLink>
            <TrackedLink href="/vault" event="hero_cta" properties={{ cta: 'programs' }} className="btn-quiet">
              Browse programs
            </TrackedLink>
          </div>
          <dl className="mt-14 grid max-w-md grid-cols-3 gap-6">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd className="font-display text-3xl text-moss">{stat.value}</dd>
                <p aria-hidden="true" className="mt-1 text-sm leading-5 text-muted">{stat.label}</p>
              </div>
            ))}
          </dl>
        </div>

        <div className="band-dark rounded-2xl bg-navy p-8 text-paper shadow-[0_24px_48px_-20px_rgba(7,27,45,0.55)] sm:p-10">
          <p className="text-[15px] text-paper/70">Sample prompt, {sample.label}</p>
          <p className="mt-4 font-display text-2xl leading-snug text-paper">{sample.prompts[0]}</p>
          <p className="mt-5 text-[15px] text-paper/75">30 seconds to prepare, 2 minutes to respond, scored out of 100.</p>
          <TrackedLink href="/simulator" event="sample_prompt_started" className="btn-light mt-7 w-full">
            Start practising
          </TrackedLink>
          <p className="mt-4 text-center text-sm leading-5 text-paper/60">
            A representative practice prompt, not an official question.
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
              Start anywhere. Your average and your EC rating carry across, so the Planner and Programs stay personal
              to you.
            </p>
          </div>
          <ul className="space-y-3">
            {PATHWAYS.map(({ icon: Icon, title, body, href }) => (
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
            <h2 className="text-3xl text-paper sm:text-4xl">Start with one program.</h2>
            <p className="mt-3 text-base leading-7 text-paper/75">
              Make one useful improvement. Feedback is a practice aid, not an admissions decision, and your strongest
              answers still come from your own experience.
            </p>
          </div>
          <TrackedLink href="/simulator" event="bottom_cta" properties={{ cta: 'practice' }} className="btn-light shrink-0">
            Choose a practice prompt <ArrowRight className="h-4 w-4" />
          </TrackedLink>
        </div>
      </section>
    </>
  );
}
