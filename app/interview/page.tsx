import RequireAuth from "@/components/require-auth";
import MockInterview from "@/components/mock-interview";
import { PageHeader } from "@/components/ui";
export const metadata = {
  title: "Mock Interview",
  description:
    "Practise program-focused university interview questions by voice or keyboard and receive a structured transcript review.",
};
export default function InterviewPage() {
  return (
<<<<<<< HEAD
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
=======
    <div className="workspace-page">
      <PageHeader
        eyebrow="Prepare / Mock interview"
        title="Your story. In your own words."
        description="A quiet place to rehearse out loud, find your point, and reflect. Answer by voice or keyboard; only your transcript is sent for feedback."
      />
>>>>>>> pr/8
      <RequireAuth what="mock interviews">
        <MockInterview />
      </RequireAuth>
    </div>
  );
}
