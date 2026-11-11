import { Suspense } from 'react';
import PageSkeleton from '@/components/page-skeleton';
import RequireAuth from '@/components/require-auth';
import Simulator from '@/components/simulator';

export const metadata = {
  title: 'Supp App Simulator',
  description:
    'Practise representative Ontario supplemental application prompts under strict timers and get specific written feedback.',
};

export default function SimulatorPage() {
  return (
    <div className="workspace-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Prepare / Practice studio</p>
          <h1>Find your words. Build your confidence.</h1>
          <p className="page-description">
            Realistic timers. Representative prompts. Specific feedback from Nova. A focused place to
            prepare for your supplemental applications.
          </p>
        </div>
      </header>

      <RequireAuth what="the practice simulator">
        <Suspense fallback={<PageSkeleton label="Loading the simulator" />}>
          <Simulator />
        </Suspense>
      </RequireAuth>
    </div>
  );
}
