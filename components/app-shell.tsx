'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ChartNoAxesCombined,
  Check,
  ChevronRight,
  ClipboardList,
  LayoutList,
  LogOut,
  Menu,
  Mic,
  PenLine,
  Sprout,
} from 'lucide-react';
import { useAuth } from './auth-provider';
import Dialog from './dialog';
import InstagramIcon from './instagram-icon';
import { SITE } from '@/lib/site';

const LINKS = [
  { href: '/planner', label: 'Application planner', short: 'My plan', icon: LayoutList, group: 'Plan' },
  { href: '/vault', label: 'Program vault', short: 'Programs', icon: BookOpen, group: 'Plan' },
  { href: '/simulator', label: 'Practice studio', short: 'Practice', icon: PenLine, group: 'Prepare' },
  { href: '/interview', label: 'Mock interview', short: 'Interview', icon: Mic, group: 'Prepare' },
  { href: '/ec-rater', label: 'Activity portfolio', short: 'Activities', icon: Sprout, group: 'Prepare' },
  { href: '/analytics', label: 'Nova analytics', short: 'Progress', icon: ChartNoAxesCombined, group: 'Reflect' },
];
const DOCK = ['/planner', '/vault', '/simulator', '/analytics'];
const GROUPS = ['Plan', 'Prepare', 'Reflect'];

function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Accepted! home">
      <span className="brand-mark">
        <Check size={19} strokeWidth={2.5} />
      </span>
      <span>
        Accepted<span className="text-accent">!</span>
      </span>
    </Link>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const home = pathname === '/';
  const { user, loading, openAuth, signOut } = useAuth();
  const [navOpen, setNavOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState('');
  const current = LINKS.find((l) => l.href === pathname);

  useEffect(() => setNavOpen(false), [pathname]);

  async function handleSignOut() {
    setSigningOut(true);
    setError('');
    try {
      await signOut();
    } catch {
      setError('Could not sign out. Please try again.');
    } finally {
      setSigningOut(false);
    }
  }

  const account = loading ? (
    <span className="fine-print" role="status">
      Loading account…
    </span>
  ) : user ? (
    <button className="btn-quiet" onClick={handleSignOut} disabled={signingOut} aria-label="Sign out">
      <LogOut size={15} />
      <span>{signingOut ? 'Signing out…' : 'Sign out'}</span>
    </button>
  ) : (
    <button className="btn-primary" onClick={openAuth}>
      Sign in <ChevronRight size={15} />
    </button>
  );

  const navLinks = (closeOnClick = false) =>
    GROUPS.map((group) => (
      <div className="nav-section" key={group}>
        <p className="nav-section-label">{group}</p>
        {LINKS.filter((l) => l.group === group).map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="workspace-link"
            aria-current={pathname === l.href ? 'page' : undefined}
            onClick={() => closeOnClick && setNavOpen(false)}
          >
            <l.icon size={17} strokeWidth={1.7} />
            {l.label}
          </Link>
        ))}
      </div>
    ));

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      {home ? (
        <header className="marketing-nav">
          <div className="marketing-nav-inner">
            <Brand />
            <nav aria-label="Main navigation" className="top-links">
              <Link href="/vault">Explore programs</Link>
              <Link href="/planner">Plan your applications</Link>
              <Link href="/simulator">Meet your practice studio</Link>
            </nav>
            <div className="flex items-center gap-2">
              {account}
              <button className="icon-button mobile-only" onClick={() => setNavOpen(true)} aria-label="Open navigation">
                <Menu size={21} />
              </button>
            </div>
          </div>
        </header>
      ) : (
        <>
          <aside className="workspace-sidebar">
            <Brand />
            <span className="sidebar-caption">Your next chapter, in order.</span>
            <nav aria-label="Main navigation">{navLinks()}</nav>
            <div className="sidebar-bottom">
              <div className="sidebar-note">
                <ClipboardList size={17} className="mb-2 text-accent" />
                <p>
                  A little progress,
                  <br />
                  one application at a time.
                </p>
              </div>
              {user ? (
                <div className="account-button">
                  <span className="account-avatar">{user.email?.slice(0, 1).toUpperCase() ?? 'A'}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">{user.email}</p>
                    <p className="text-[10px] text-muted">Your workspace</p>
                  </div>
                </div>
              ) : (
                <div className="px-3">{account}</div>
              )}
            </div>
          </aside>

          <header className="workspace-topbar">
            <div className="desktop-only breadcrumb">
              <span>Workspace</span>
              <ChevronRight size={12} />
              <strong>{current?.label ?? 'Your account'}</strong>
            </div>
            <div className="mobile-only">
              <Brand />
            </div>
            <div className="flex items-center gap-2">
              <span className="desktop-only fine-print">Made for Ontario applicants</span>
              {user && account}
              <div className="mobile-only">{!user && account}</div>
              <button className="icon-button mobile-only" onClick={() => setNavOpen(true)} aria-label="Open navigation">
                <Menu size={21} />
              </button>
            </div>
          </header>

          <nav aria-label="Quick navigation" className="mobile-dock">
            {LINKS.filter((l) => DOCK.includes(l.href)).map((l) => (
              <Link key={l.href} href={l.href} aria-current={pathname === l.href ? 'page' : undefined}>
                <l.icon size={19} strokeWidth={1.7} />
                {l.short}
              </Link>
            ))}
          </nav>
        </>
      )}

      {error && (
        <p role="alert" className="notice notice-error fixed bottom-24 right-4 z-50">
          {error}
        </p>
      )}

      <Dialog open={navOpen} onClose={() => setNavOpen(false)} title="Your Accepted workspace" className="navigation-dialog">
        <nav aria-label="Mobile navigation">{navLinks(true)}</nav>
        <div className="mt-6 border-t border-line pt-4">
          <Link className="text-link" href="/" onClick={() => setNavOpen(false)}>
            Product overview <ArrowRight size={15} />
          </Link>
        </div>
      </Dialog>

      <div className="shell-content">
        <main id="main-content" className="main-content">
          {children}
        </main>
        <footer className="site-footer">
          <div className="footer-inner">
            <p>
              © {new Date().getFullYear()} Accepted! <span className="mx-1">·</span> An independent Ontario admissions
              resource.
            </p>
            <div className="footer-links">
              <a href={SITE.instagram} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5">
                <InstagramIcon className="h-3 w-3" />
                {SITE.instagramHandle}
              </a>
              <a href={SITE.feedbackForm} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1">
                Share feedback <ArrowUpRight size={12} />
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
