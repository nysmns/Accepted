import RequireAuth from "@/components/require-auth";
import AnalyticsDashboard from "@/components/analytics-dashboard";
import { PageHeader } from "@/components/ui";
export const metadata = {
  title: "Nova Analytics",
  description:
    "Your practice progress: scores by program, weekly trend, and an AI breakdown of where to focus next.",
};
export default function AnalyticsPage() {
  return (
<<<<<<< HEAD
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
=======
    <div className="workspace-page">
      <PageHeader
        eyebrow="Reflect / Nova analytics"
        title="See how far your practice goes."
        description="The responses you’ve written, the strengths you’re building, and a little perspective on what to work on next."
      />
>>>>>>> pr/8
      <RequireAuth what="your progress">
        <AnalyticsDashboard />
      </RequireAuth>
    </div>
  );
}
