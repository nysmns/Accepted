import RequireAuth from '@/components/require-auth';
import AnalyticsDashboard from '@/components/analytics-dashboard';

export const metadata = {
  title: 'Nova Analytics',
  description:
    'Your practice progress: scores by program, weekly trend, and an AI breakdown of where to focus next.',
};

export default function AnalyticsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <RequireAuth what="your progress">
        <AnalyticsDashboard />
      </RequireAuth>
    </div>
  );
}
