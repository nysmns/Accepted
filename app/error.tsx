"use client";
import { useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { trackEvent } from "@/lib/track";
import { Button, EmptyState } from "@/components/ui";
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
    trackEvent("page_error");
  }, [error]);
  return (
<<<<<<< HEAD
    <div className="mx-auto my-14 flex max-w-lg flex-col items-center rounded-xl bg-surface p-8 text-center shadow-sm">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="mt-3 text-2xl font-medium text-deep">The page could not finish loading</h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        This is a problem on our side, not with your work. Try again — your saved practice and
        planner entries stay in this browser.
      </p>
      <button onClick={() => reset()} className="btn-primary mt-6">
        Try again
      </button>
=======
    <div className="workspace-page">
      <div className="panel">
        <EmptyState
          icon={<RefreshCw />}
          title="Let’s give that another try."
          description="This page couldn’t finish loading. Your saved planner and practice drafts stay in this browser."
          action={<Button onClick={reset}>Try again</Button>}
        />
      </div>
>>>>>>> pr/8
    </div>
  );
}
