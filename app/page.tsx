<<<<<<< HEAD
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
=======
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCheck,
  ClipboardList,
  Mic,
  PenLine,
  Sparkles,
  Sprout,
} from "lucide-react";
import { SIMULATOR_PROGRAMS } from "@/lib/data/prompts";
import { UNIVERSITIES } from "@/lib/data/programs";
import TrackedLink from "@/components/tracked-link";
import { Badge } from "@/components/ui";
>>>>>>> pr/8

const STATS = [
  { value: "645", label: "Programs tracked" },
  { value: "6,950", label: "Offers recorded" },
  { value: "92.9%", label: "Average admitted grade" },
];
const JOURNEY = [
  {
    number: "01",
    icon: BookOpen,
    title: "Find your direction.",
    body: "Compare program requirements, then keep your university choices and application checklist in one place.",
    links: [
      { href: "/vault", label: "Explore programs" },
      { href: "/planner", label: "Build your plan" },
    ],
  },
  {
    number: "02",
    icon: PenLine,
    title: "Make practice count.",
    body: "Get comfortable with timed written responses and mock interviews. Then use Nova’s feedback to make your next answer stronger.",
    links: [
      { href: "/simulator", label: "Practise writing" },
      { href: "/interview", label: "Try an interview" },
    ],
  },
  {
    number: "03",
    icon: Sprout,
    title: "See what you bring.",
    body: "Review how you describe your activities. Use your practice history to choose what to work on next.",
    links: [
      { href: "/ec-rater", label: "Review your activities" },
      { href: "/analytics", label: "See your progress" },
    ],
  },
];

export default function Home() {
  const sample =
    SIMULATOR_PROGRAMS.find((program) => program.code === "queens_comm") ??
    SIMULATOR_PROGRAMS[0];
  const previewUniversity =
    UNIVERSITIES.find((university) => university.key === "waterloo") ??
    UNIVERSITIES[0];
  const previewProgram = previewUniversity.programs[0];
  return (
<<<<<<< HEAD
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
=======
    <div className="home-container">
      <section className="home-hero">
        <div className="hero-layout">
          <div>
            <p className="eyebrow flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" /> For
              Ontario university applicants
            </p>
            <h1 className="hero-headline">
              Your future is
              <br />
              taking shape.
              <br />
              <em>Let’s give it a plan.</em>
            </h1>
            <p className="hero-description">
              Compare Ontario programs, build your shortlist, and practise
              supplemental answers with feedback from Nova.
            </p>
            <div className="hero-cta">
              <TrackedLink
                href="/planner"
                event="hero_cta"
                properties={{ cta: "plan" }}
                className="btn-primary"
              >
                Build my shortlist <ArrowRight size={16} />
              </TrackedLink>
              <TrackedLink
                href="/vault"
                event="hero_cta"
                properties={{ cta: "programs" }}
                className="btn-secondary"
              >
                Explore programs
              </TrackedLink>
            </div>
            <p className="hero-note">
              Start your shortlist without an account. Your plan stays in
              this browser.
            </p>
          </div>
          <div className="product-preview">
            <div className="preview-window">
              <div className="preview-toolbar">
                <span className="preview-dot" />
                <span className="preview-dot" />
                <span className="preview-dot" />
                <span className="ml-auto text-muted">
                  accepted! / your workspace
                </span>
              </div>
              <div className="preview-content">
                <div className="flex items-center justify-between">
                  <p className="preview-route">Your application folio</p>
                  <Badge>Example workspace</Badge>
                </div>
                <h2>
                  Your shortlist.
                  <br />Your next steps.
                </h2>
                <div className="preview-program">
                  <span className="folio-number">01</span>
                  <div className="flex-1">
                    <p className="text-[10px] text-muted">
                      {previewUniversity.name}
                    </p>
                    <h3 className="mt-1 text-sm font-semibold">
                      {previewProgram.name}
                    </h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge tone="accent">
                        {previewProgram.avg} reference
                      </Badge>
                      <Badge>Supplemental required</Badge>
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  {[
                    "Research the programs that fit you",
                    "Check requirements and verified deadlines",
                    "Make time for a focused practice session",
                  ].map((task, index) => (
                    <div
                      className="flex items-center gap-3 text-[11px] text-secondary"
                      key={task}
                    >
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded border ${index === 0 ? "border-accent bg-accent text-white" : "border-line"}`}
                      >
                        {index === 0 && <Check size={11} />}
                      </span>
                      {task}
                    </div>
                  ))}
                </div>
                <div className="preview-note">
                  <Sparkles size={16} className="mt-0.5 text-accent" />
                  <div>
                    <p className="font-semibold text-accent!">
                      Meet Nova, your practice coach.
                    </p>
                    <p>
                      Get a score, feedback, and a model rewrite for your
                      written practice.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between px-1 text-[9px] text-secondary">
              <span>PLAN. PREPARE. REFLECT.</span>
              <ArrowDown size={13} />
            </div>
>>>>>>> pr/8
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
<<<<<<< HEAD

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
=======
        <div className="hero-stats">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
          <p className="fine-print self-center">
            Historical, self-reported admission outcomes. Useful context, never
            a prediction of your result.
          </p>
        </div>
      </section>
      <section className="home-section" aria-labelledby="journey-heading">
        <div className="home-section-title">
          <div>
            <p className="eyebrow">A little less scattered</p>
            <h2 id="journey-heading">
              Make your shortlist.
              <br />
              Prepare for what comes next.
            </h2>
          </div>
          <p>
            Check what each program asks for, then choose the practice
            that fits your application.
          </p>
        </div>
        <div>
          {JOURNEY.map((item) => (
            <div key={item.number} className="journey-row">
              <span className="journey-icon">
                <item.icon size={21} strokeWidth={1.6} />
              </span>
              <div>
                <p className="eyebrow mb-1">
                  {item.number} /{" "}
                  {item.number === "01"
                    ? "Plan"
                    : item.number === "02"
                      ? "Prepare"
                      : "Reflect"}
                </p>
                <h3>{item.title}</h3>
              </div>
              <p>{item.body}</p>
              <div className="journey-links">
                {item.links.map((link) => (
                  <Link
                    href={link.href}
                    className="text-link text-xs!"
                    key={link.href}
                  >
                    {link.label}
                    <ArrowUpRight size={14} />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="home-section">
        <div className="practice-intro">
          <div>
            <p className="eyebrow">Practice with intention</p>
            <h2>
              Practise the answer
              <br />
              before you submit it.
            </h2>
            <p className="body-copy mt-4">
              Choose a program and answer a representative prompt against
              the clock. Nova gives your written response a score, specific
              feedback, and a model rewrite to learn from.
            </p>
            <div className="mt-5 flex flex-wrap gap-4 text-xs text-secondary">
              <span className="flex items-center gap-2">
                <PenLine size={15} className="text-accent" />
                Timed writing
              </span>
              <span className="flex items-center gap-2">
                <Mic size={15} className="text-accent" />
                Voice or keyboard interviews
              </span>
            </div>
            <TrackedLink
              className="text-link mt-6"
              href="/simulator"
              event="sample_prompt_started"
            >
              Choose a practice prompt <ArrowRight size={15} />
            </TrackedLink>
          </div>
          <div className="sample-question">
            <p className="eyebrow">Sample prompt · {sample.label}</p>
            <blockquote>{sample.prompts[0]}</blockquote>
            <div className="flex flex-wrap gap-2">
              <Badge>60s preparation</Badge>
              <Badge>10 min written response</Badge>
              <Badge tone="accent">Feedback / 100</Badge>
            </div>
            <p className="fine-print mt-4">
              Representative practice, not a current or official admissions
              question.
            </p>
          </div>
        </div>
      </section>
      <section className="home-section">
        <div className="grid gap-7 sm:grid-cols-3">
          {[
            {
              icon: BookOpen,
              title: "References, with context.",
              text: "Program details and historical averages help you plan. University portals and OUAC remain the source of truth.",
            },
            {
              icon: CheckCheck,
              title: "Your own experiences matter.",
              text: "Nova helps you reflect and communicate. Feedback is a practice aid, not an admissions decision.",
            },
            {
              icon: ClipboardList,
              title: "A plan you can return to.",
              text: "Your planner stays in this browser. Sign in to keep your scored practice and progress together.",
            },
          ].map((item) => (
            <div key={item.title}>
              <item.icon
                size={21}
                className="mb-4 text-accent"
                strokeWidth={1.6}
              />
              <h3 className="text-sm font-semibold">{item.title}</h3>
              <p className="fine-print mt-2">{item.text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="home-closing border-t border-line">
        <div>
          <p className="eyebrow mb-3">Start where you are</p>
          <h2>
            Give your next answer
            <br />
            a practice run.
          </h2>
        </div>
        <TrackedLink
          href="/simulator"
          event="bottom_cta"
          properties={{ cta: "practice" }}
          className="btn-primary shrink-0"
        >
          Choose a practice prompt <ArrowRight size={16} />
        </TrackedLink>
      </section>
    </div>
>>>>>>> pr/8
  );
}
