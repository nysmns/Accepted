import RequireAuth from '@/components/require-auth';
import AnalyticsDashboard from '@/components/analytics-dashboard';

export const metadata = {
  title: 'Nova Analytics',
  description:
    'Your practice progress: scores by program, weekly trend, and an AI breakdown of where to focus next.',
};

export default function AnalyticsPage() {
  return (
    <div className="workspace-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Reflect / Nova analytics</p>
          <h1>Your progress</h1>
          <p className="page-description">
            Scores by program, your weekly trend, and an AI breakdown of where to focus next —
            saved to your account.
          </p>
        </div>
      </header>

      <RequireAuth
        what="Nova analytics"
        eyebrow="Your record, kept personal"
        body="Sign in to see your scores, progress and Nova's breakdowns. They are saved to your account."
      >
        <AnalyticsDashboard />
      </RequireAuth>
    </div>
  );
}
