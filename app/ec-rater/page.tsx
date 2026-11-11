import RequireAuth from '@/components/require-auth';
import EcRater from '@/components/ec-rater';

export const metadata = {
  title: 'EC Rater',
  description:
    'Rank your extracurriculars and get concrete advice on turning them into meaningful, credible activity for supplemental applications.',
};

export default function EcRaterPage() {
  return (
    <div className="workspace-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Prepare / Activity portfolio</p>
          <h1>Rank your activities. Make them count.</h1>
          <p className="page-description">
            List what you do outside class. Nova ranks it by depth, responsibility and impact, then
            tells you how to turn each activity into something you can speak to honestly. Your
            activities also help recommend scholarships.
          </p>
        </div>
      </header>

      <RequireAuth
        what="the activity portfolio"
        eyebrow="Your activities, kept personal"
        body="Sign in to save your activities to your account, edit them later, and use them for scholarship recommendations."
      >
        <EcRater />
      </RequireAuth>
    </div>
  );
}
