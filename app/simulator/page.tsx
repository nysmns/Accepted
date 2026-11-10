import { Suspense } from 'react';
import RequireAuth from '@/components/require-auth';
import Simulator from '@/components/simulator';

export const metadata = {
  title: 'Supp App Simulator',
  description:
    'Practise representative Ontario supplemental application prompts under strict timers and get specific written feedback.',
};

export default function SimulatorPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="mb-10 max-w-3xl">
        <h1 className="text-4xl text-navy sm:text-5xl">Practise a supplemental answer</h1>
        <p className="mt-4 text-lg leading-8 text-muted">
          Real-style prompts from Ontario programs, a prep timer, a response timer and a strict score. Prompts are for
          practice and are not current or official admissions questions.
        </p>
      </header>

      <RequireAuth what="the practice simulator">
        <Suspense fallback={<p className="text-muted">Loading…</p>}>
          <Simulator />
        </Suspense>
      </RequireAuth>
    </div>
  );
}
