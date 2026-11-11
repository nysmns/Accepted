import { ArrowRight, ArrowUpRight, BookOpen, CheckCheck, ClipboardList, Mic, PenLine, Sprout } from 'lucide-react';
import { UNIVERSITIES } from '@/lib/data/programs';
import { SIMULATOR_PROGRAMS } from '@/lib/data/prompts';
import TrackedLink from '@/components/tracked-link';
import HomePreview from '@/components/home-preview';

const STATS = [
  { value: '645', label: 'Programs tracked' },
  { value: '6,950', label: 'Offers recorded' },
  { value: '92.9%', label: 'Average admitted grade' },
];

const JOURNEY = [
  {
    icon: BookOpen,
    step: '01 / Plan',
    title: 'Find your direction.',
    body: 'Compare program requirements, then keep your university choices and application checklist in one place.',
    links: [
      { href: '/vault', label: 'Explore programs' },
      { href: '/planner', label: 'Build your plan' },
    ],
  },
  {
    icon: PenLine,
    step: '02 / Prepare',
    title: 'Make practice count.',
    body: 'Get comfortable with timed written responses and mock interviews. Then use Nova’s feedback to make your next answer stronger.',
    links: [
      { href: '/simulator', label: 'Practise writing' },
      { href: '/interview', label: 'Try an interview' },
    ],
  },
  {
    icon: Sprout,
    step: '03 / Reflect',
    title: 'See what you bring.',
    body: 'Review how you describe your activities. Use your practice history to choose what to work on next.',
    links: [
      { href: '/ec-rater', label: 'Review your activities' },
      { href: '/analytics', label: 'See your progress' },
    ],
  },
];

const POINTS = [
  {
    icon: BookOpen,
    title: 'References, with context.',
    body: 'Program details and historical averages help you plan. University portals and OUAC remain the source of truth.',
  },
  {
    icon: CheckCheck,
    title: 'Your own experiences matter.',
    body: 'Nova helps you reflect and communicate. Feedback is a practice aid, not an admissions decision.',
  },
  {
    icon: ClipboardList,
    title: 'A plan you can return to.',
    body: 'Your planner stays in this browser. Sign in to keep your scored practice and progress together.',
  },
];

export default function Home() {
  const sample = SIMULATOR_PROGRAMS.find((p) => p.code === 'queens_comm') ?? SIMULATOR_PROGRAMS[0];
  const featured = UNIVERSITIES[0];
  const featuredProgram = featured.programs[0];

  return (
    <div className="home-container">
      <section className="home-hero">
        <div className="hero-layout">
          <div>
            <p className="eyebrow inline-flex items-center gap-2">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
              For Ontario university applicants
            </p>
            <h1 className="hero-headline">
              Your future is
              <br />
              taking shape.
              <br />
              <em>Let’s give it a plan.</em>
            </h1>
            <p className="hero-description">
              Compare Ontario programs, build your shortlist, and practise supplemental answers with feedback from Nova.
            </p>
            <div className="hero-cta">
              <TrackedLink href="/planner" event="hero_cta" properties={{ cta: 'plan' }} className="btn-primary">
                Build my shortlist <ArrowRight size={16} />
              </TrackedLink>
              <TrackedLink href="/vault" event="hero_cta" properties={{ cta: 'programs' }} className="btn-secondary">
                Explore programs
              </TrackedLink>
            </div>
            <p className="hero-note">Start your shortlist without an account. Your plan stays in this browser.</p>
          </div>

          <HomePreview university={featured.name} program={featuredProgram.name} avg={featuredProgram.avg} />
        </div>

        <div className="hero-stats">
          {STATS.map((s) => (
            <div key={s.label}>
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
          <p className="fine-print">
            Historical, self-reported admission outcomes. Useful context, never a prediction of your result.
          </p>
        </div>
      </section>

      <section className="home-section">
        <div className="home-section-title">
          <div>
            <p className="eyebrow">A little less scattered</p>
            <h2>
              Make your shortlist.
              <br />
              Prepare for what comes next.
            </h2>
          </div>
          <p>Check what each program asks for, then choose the practice that fits your application.</p>
        </div>
        <div>
          {JOURNEY.map(({ icon: Icon, step, title, body, links }) => (
            <div className="journey-row" key={step}>
              <span className="journey-icon">
                <Icon size={21} strokeWidth={1.6} />
              </span>
              <div>
                <p className="eyebrow text-muted!">{step}</p>
                <h3 className="mt-1">{title}</h3>
              </div>
              <p>{body}</p>
              <div className="journey-links">
                {links.map((l) => (
                  <TrackedLink key={l.href} href={l.href} event="journey_link" properties={{ to: l.href }} className="text-link">
                    {l.label} <ArrowUpRight size={13} />
                  </TrackedLink>
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
              Choose a program and answer a representative prompt against the clock. Nova gives your written response a
              score, specific feedback, and a model rewrite to learn from.
            </p>
            <div className="fine-print mt-5 flex flex-wrap gap-x-5 gap-y-2">
              <span className="inline-flex items-center gap-2">
                <PenLine size={15} className="text-accent" /> Timed writing
              </span>
              <span className="inline-flex items-center gap-2">
                <Mic size={15} className="text-accent" /> Voice or keyboard interviews
              </span>
            </div>
            <TrackedLink href="/simulator" event="sample_prompt_started" className="text-link mt-6">
              Choose a practice prompt <ArrowRight size={15} />
            </TrackedLink>
          </div>
          <div className="sample-question">
            <p className="eyebrow">Sample prompt · {sample.label}</p>
            <blockquote>{sample.prompts[0]}</blockquote>
            <div className="flex flex-wrap gap-1.5">
              <span className="badge badge-neutral">60s preparation</span>
              <span className="badge badge-neutral">10 min written response</span>
              <span className="badge badge-accent">Feedback / 100</span>
            </div>
            <p className="fine-print mt-5">Representative practice, not a current or official admissions question.</p>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="grid gap-8 md:grid-cols-3">
          {POINTS.map(({ icon: Icon, title, body }) => (
            <div key={title}>
              <Icon size={20} strokeWidth={1.6} className="text-accent" />
              <h3 className="mt-4 text-sm font-semibold">{title}</h3>
              <p className="mt-2 text-[13px] leading-7 text-muted">{body}</p>
            </div>
          ))}
        </div>
        <div className="home-closing mt-14 border-t border-line">
          <div>
            <p className="eyebrow">Start where you are</p>
            <h2 className="mt-3">
              Give your next answer
              <br />a practice run.
            </h2>
          </div>
          <TrackedLink href="/simulator" event="bottom_cta" properties={{ cta: 'practice' }} className="btn-primary shrink-0">
            Choose a practice prompt <ArrowRight size={16} />
          </TrackedLink>
        </div>
      </section>
    </div>
  );
}
