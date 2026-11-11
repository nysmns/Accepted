'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Lock } from 'lucide-react';
import { useAuth } from './auth-provider';
import { trackEvent } from '@/lib/track';
import PageSkeleton from './page-skeleton';

type GateProps = {
  children: ReactNode;
  /** What the student gets access to, e.g. "the practice simulator". */
  what: string;
  eyebrow?: string;
  headline?: string;
  body?: string;
  perks?: string[];
};

const DEFAULT_PERKS = [
  'Realistic preparation and response timers',
  'Specific feedback, strengths and next steps',
  'Your scores and progress, saved to your account',
];

/**
 * Pages that need an account render this instead of their content.
 * The API routes enforce the same rule server-side.
 */
export default function RequireAuth({
  children,
  what,
  eyebrow = 'Your practice, kept personal',
  headline = 'Make room for your next chapter.',
  body,
  perks = DEFAULT_PERKS,
}: GateProps) {
  const { user, loading, openAuth } = useAuth();

  if (loading) return <PageSkeleton />;
  if (user) return <>{children}</>;

  return (
    <div className="gate">
      <div className="gate-main">
        <span className="gate-symbol">
          <Lock size={26} strokeWidth={1.8} />
        </span>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="gate-headline">{headline}</h1>
        <p className="gate-body">
          {body ?? `Sign in to use ${what}. Keep your feedback together and build on every practice session.`}
        </p>
        <button
          onClick={() => {
            trackEvent('gate_cta_clicked', { what });
            openAuth();
          }}
          className="btn-primary mt-6"
        >
          Sign up or sign in <ArrowRight size={15} />
        </button>
        <p className="gate-note">Nova feedback is free. An account keeps daily limits fair.</p>
      </div>

      <aside className="gate-aside">
        <p className="eyebrow">A workspace that grows with you</p>
        <ul className="gate-list">
          {perks.map((perk) => (
            <li key={perk}>
              <Check size={16} strokeWidth={2.4} />
              {perk}
            </li>
          ))}
        </ul>
        <div className="gate-link">
          <Link href="/vault" className="text-link">
            Explore programs first <ArrowRight size={15} />
          </Link>
        </div>
      </aside>
    </div>
  );
}
