'use client';

import Link from 'next/link';
import { ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="workspace-page">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-deep/10">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="16" cy="16" r="14" />
            <path d="M16 8l-4 4m0 0l4 4m-4-4h8" />
          </svg>
        </span>
        <div>
          <p className="eyebrow text-muted">Page not found</p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground">404</h1>
        </div>
        <p className="max-w-md text-sm leading-6 text-muted">
          The page you were looking for doesn&apos;t exist or has been moved. Check the address bar
          and try again.
        </p>
        <div className="flex gap-3">
          <Link href="/" className="btn-primary">
            <Home size={16} />
            Go to home
          </Link>
          <Link href="/vault" className="btn-ghost">
            <ArrowLeft size={16} />
            Back to programs
          </Link>
        </div>
      </div>
    </div>
  );
}
