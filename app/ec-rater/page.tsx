import RequireAuth from "@/components/require-auth";
import EcRater from "@/components/ec-rater";
import { PageHeader } from "@/components/ui";
export const metadata = {
  title: "EC Rater",
  description:
    "Rank your extracurriculars and get concrete advice on turning them into meaningful, credible activity for supplemental applications.",
};
export default function EcRaterPage() {
  return (
<<<<<<< HEAD
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
=======
    <div className="workspace-page">
      <PageHeader
        eyebrow="Prepare / Activity portfolio"
        title="There’s a story in what you do."
        description="Bring your extracurriculars into focus. Nova helps you understand their depth and impact, then carries that perspective into your application plan."
      />
>>>>>>> pr/8
      <RequireAuth what="the EC rater">
        <EcRater />
      </RequireAuth>
    </div>
  );
}
