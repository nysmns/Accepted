"use client";
import { useAuth } from "./auth-provider";
import AuthForm from "./auth-form";
import Dialog from "./dialog";
import { useHydrated } from "./use-hydrated";

export default function AuthModal() {
  const { authOpen, closeAuth } = useAuth();
  const hydrated = useHydrated();
  return (
<<<<<<< HEAD
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-paper/95 p-4 backdrop-blur-sm"
      onClick={closeAuth}
    >
      <div
        className="panel w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-deep">
            Sign in to Accepted!
          </h2>
          <button
            onClick={closeAuth}
            aria-label="Close"
            className="text-muted transition hover:text-deep"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <AuthForm />
      </div>
    </div>
=======
    <Dialog
      open={hydrated && authOpen}
      onClose={closeAuth}
      title="Welcome to Accepted!"
    >
      <p className="body-copy mb-6">
        A little practice. A clearer plan. Your next chapter starts here.
      </p>
      <AuthForm />
    </Dialog>
>>>>>>> pr/8
  );
}
