import RequireAuth from '@/components/require-auth';
import MockInterview from '@/components/mock-interview';

export const metadata = {
  title: 'Mock Interview',
  description:
    'Practise program-focused university interview questions by voice or keyboard and receive a structured transcript review.',
};

export default function InterviewPage() {
  return (
    <div className="workspace-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Prepare / Mock interview</p>
          <h1>Rehearse out loud. Reflect with purpose.</h1>
          <p className="page-description">
            Answer three program-focused questions using your voice or keyboard. Your transcript is
            reviewed for substance and clarity. Microphone audio is never uploaded to Accepted.
          </p>
        </div>
      </header>

      <RequireAuth what="mock interviews" eyebrow="Your practice, kept personal">
        <MockInterview />
      </RequireAuth>
    </div>
  );
}
