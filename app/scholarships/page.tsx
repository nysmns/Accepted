import RequireAuth from '@/components/require-auth';
import Scholarships from '@/components/scholarships';

export const metadata = {
  title: 'Scholarship Finder',
  description:
    'Active Canadian and Ontario student scholarships, filtered to what is open now and ranked against your program focus and extracurriculars.',
};

export default function ScholarshipsPage() {
  return (
    <div className="workspace-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Plan / Scholarships</p>
          <h1>Awards worth your time.</h1>
          <p className="page-description">
            Active Canadian and Ontario student awards, filtered so only what is open now shows up.
            Sign in to rank them against your supplemental practice and saved activities.
          </p>
        </div>
      </header>

      <RequireAuth what="scholarship finder" eyebrow="Your practice, kept personal">
        <Scholarships />
      </RequireAuth>
    </div>
  );
}
