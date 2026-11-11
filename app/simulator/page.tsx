import { Suspense } from "react";
import RequireAuth from "@/components/require-auth";
import Simulator from "@/components/simulator";
import { PageHeader, LoadingState } from "@/components/ui";
export const metadata = {
  title: "Supplemental Application Practice",
  description:
    "Practise representative Ontario supplemental application prompts under strict timers and get specific written feedback.",
};
export default function SimulatorPage() {
  return (
<<<<<<< HEAD
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="mb-6">
        <h1 className="text-2xl font-medium text-deep sm:text-3xl">
          Supplemental Application Practice
        </h1>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">
          Practise representative supplemental prompts from Ontario program areas under strict
          timers, with direct coaching on written answers. Prompts are for preparation and are not
          represented as current or official admissions questions.
        </p>
      </header>

=======
    <div className="workspace-page">
      <PageHeader
        eyebrow="Prepare / Practice studio"
        title="Find your words. Build your confidence."
        description="Realistic timers. Representative prompts. Specific feedback from Nova. A focused place to prepare for your supplemental applications."
      />
>>>>>>> pr/8
      <RequireAuth what="the practice simulator">
        <Suspense
          fallback={<LoadingState title="Opening the practice studio…" />}
        >
          <Simulator />
        </Suspense>
      </RequireAuth>
    </div>
  );
}
