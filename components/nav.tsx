'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Menu, X } from 'lucide-react';
import { useAuth } from './auth-provider';

const LINKS = [
  { href: '/vault', label: 'Programs' },
  { href: '/planner', label: 'Planner' },
  { href: '/simulator', label: 'Practice' },
  { href: '/interview', label: 'Interview' },
  { href: '/ec-rater', label: 'ECs' },
  { href: '/analytics', label: 'Progress' },
];

export default function Nav() {
  const pathname = usePathname();
  const { user, loading, openAuth, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const linkClass = (href: string) =>
    `rounded-md px-3.5 py-2 text-[15px] font-medium transition ${
      pathname === href ? 'bg-sage/40 text-deep' : 'text-muted hover:text-deep'
    }`;

  const account = loading ? null : user ? (
    <button
      onClick={signOut}
      className="flex items-center gap-2 rounded-md px-3.5 py-2 text-[15px] font-medium text-muted transition hover:text-deep"
    >
      <LogOut className="h-4 w-4" /> Sign out
    </button>
  ) : (
    <button onClick={openAuth} className="rounded-lg bg-navy px-5 py-2.5 text-[15px] font-semibold text-paper transition hover:bg-deep">
      Sign in
    </button>
  );

  return (
    <header className="sticky top-0 z-40 bg-paper/95 shadow-[0_1px_12px_rgba(7,27,45,0.08)] backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="font-display text-2xl font-semibold tracking-tight text-navy">
          Accepted!
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} aria-current={pathname === l.href ? 'page' : undefined} className={linkClass(l.href)}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">{account}</div>

        <button
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          className="rounded-lg p-2 text-navy lg:hidden"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <nav aria-label="Mobile navigation" className="flex flex-col gap-1 px-4 pb-5 pt-1 lg:hidden">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} aria-current={pathname === l.href ? 'page' : undefined} className={linkClass(l.href)}>
              {l.label}
            </Link>
          ))}
          <div className="pt-3">{account}</div>
        </nav>
      )}
    </header>
  );
}
