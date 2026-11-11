'use client';

import Link from 'next/link';
import { useAuth } from './auth-provider';
import AuthForm from './auth-form';

export default function LoginCard() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="skeleton h-40 w-full" role="status" aria-label="Loading" />;
  }

  if (user) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-muted">
          You&apos;re signed in as <span className="font-medium text-foreground">{user.email}</span>.
        </p>
        <Link href="/" className="btn-primary">
          Back to home
        </Link>
      </div>
    );
  }

  return <AuthForm />;
}
