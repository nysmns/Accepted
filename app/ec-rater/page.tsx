import RequireAuth from '@/components/require-auth';
import EcRater from '@/components/ec-rater';

export const metadata = {
  title: 'EC Rater',
  description:
    'Rank your extracurriculars and get concrete advice on turning them into meaningful, credible activity for supplemental applications.',
};

export default function EcRaterPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <RequireAuth what="the EC rater">
        <EcRater />
      </RequireAuth>
    </div>
  );
}
