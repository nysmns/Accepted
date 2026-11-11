"use client";
import Link from "next/link";
import { useAuth } from "./auth-provider";
import AuthForm from "./auth-form";
import { useHydrated } from "./use-hydrated";
import { LoadingState, Notice } from "./ui";

export default function LoginCard() {
  const { user, loading } = useAuth();
  const hydrated = useHydrated();
  if (!hydrated || loading)
    return <LoadingState title="Checking your account…" />;
  if (user)
    return (
<<<<<<< HEAD
      <div className="space-y-4 text-center">
        <p className="text-sm text-muted">
          You&apos;re signed in as{' '}
          <span className="font-medium text-deep">{user.email}</span>.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg bg-navy px-5 py-2.5 text-sm font-medium text-paper transition hover:bg-deep"
        >
          Back to home
=======
      <div className="space-y-6">
        <Notice tone="success">You’re signed in as {user.email}.</Notice>
        <Link href="/planner" className="btn-primary w-full">
          Go to your planner
>>>>>>> pr/8
        </Link>
      </div>
    );
  return <AuthForm />;
}
