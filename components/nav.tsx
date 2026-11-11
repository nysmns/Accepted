"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
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
} from "lucide-react";
import { useAuth } from "./auth-provider";
import { useHydrated } from "./use-hydrated";
import Dialog from "./dialog";

const LINKS = [
<<<<<<< HEAD
  { href: '/vault', label: 'Programs' },
  { href: '/planner', label: 'Planner' },
  { href: '/simulator', label: 'Practice' },
  { href: '/interview', label: 'Interview' },
  { href: '/ec-rater', label: 'ECs' },
  { href: '/analytics', label: 'Progress' },
=======
  {
    href: "/planner",
    label: "Application planner",
    short: "My plan",
    icon: LayoutList,
    group: "Plan",
  },
  {
    href: "/vault",
    label: "Program vault",
    short: "Programs",
    icon: BookOpen,
    group: "Plan",
  },
  {
    href: "/simulator",
    label: "Practice studio",
    short: "Practice",
    icon: PenLine,
    group: "Prepare",
  },
  {
    href: "/interview",
    label: "Mock interview",
    short: "Interview",
    icon: Mic,
    group: "Prepare",
  },
  {
    href: "/ec-rater",
    label: "Activity portfolio",
    short: "Activities",
    icon: Sprout,
    group: "Prepare",
  },
  {
    href: "/analytics",
    label: "Nova analytics",
    short: "Progress",
    icon: ChartNoAxesCombined,
    group: "Reflect",
  },
>>>>>>> pr/8
];

export function Brand() {
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

export default function Nav() {
  const pathname = usePathname();
  const home = pathname === "/";
  const {
    user: sessionUser,
    loading: sessionLoading,
    openAuth,
    signOut,
  } = useAuth();
  const hydrated = useHydrated();
  const user = hydrated ? sessionUser : null;
  const loading = !hydrated || sessionLoading;
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [accountError, setAccountError] = useState("");
  const current = LINKS.find((link) => link.href === pathname);
  useEffect(() => setOpen(false), [pathname]);

<<<<<<< HEAD
  const linkClass = (href: string) =>
    `rounded-md px-3.5 py-2 text-[15px] font-medium transition ${
      pathname === href ? 'bg-sage/40 text-deep' : 'text-muted hover:text-deep'
    }`;

  const account = loading ? null : user ? (
    <button
      onClick={signOut}
      className="flex items-center gap-2 rounded-md px-3.5 py-2 text-[15px] font-medium text-muted transition hover:text-deep"
=======
  async function leave() {
    setSigningOut(true);
    setAccountError("");
    try {
      await signOut();
    } catch {
      setAccountError("Could not sign out. Please try again.");
    } finally {
      setSigningOut(false);
    }
  }
  const account = loading ? (
    <span className="fine-print" role="status">
      Loading account…
    </span>
  ) : user ? (
    <button
      className="btn-quiet"
      onClick={leave}
      disabled={signingOut}
      aria-label="Sign out"
>>>>>>> pr/8
    >
      <LogOut size={15} />
      <span>{signingOut ? "Signing out…" : "Sign out"}</span>
    </button>
  ) : (
<<<<<<< HEAD
    <button onClick={openAuth} className="rounded-lg bg-navy px-5 py-2.5 text-[15px] font-semibold text-paper transition hover:bg-deep">
      Sign in
=======
    <button className="btn-primary" onClick={openAuth}>
      Sign in <ChevronRight size={15} />
>>>>>>> pr/8
    </button>
  );
  const navigation = (mobile = false) => (
    <>
      {["Plan", "Prepare", "Reflect"].map((group) => (
        <div className="nav-section" key={group}>
          <p className="nav-section-label">{group}</p>
          {LINKS.filter((link) => link.group === group).map((link) => (
            <Link
              key={link.href}
              className="workspace-link"
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              onClick={() => mobile && setOpen(false)}
            >
              <link.icon size={17} strokeWidth={1.7} />
              {link.label}
            </Link>
          ))}
        </div>
      ))}
    </>
  );

  return (
<<<<<<< HEAD
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
=======
    <>
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
              <button
                className="icon-button mobile-only"
                onClick={() => setOpen(true)}
                aria-label="Open navigation"
              >
                <Menu size={21} />
              </button>
            </div>
          </div>
        </header>
      ) : (
        <>
          <aside className="workspace-sidebar">
            <Brand />
            <span className="sidebar-caption">
              Your next chapter, in order.
            </span>
            <nav aria-label="Main navigation">{navigation()}</nav>
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
                  <span className="account-avatar">
                    {user.email?.slice(0, 1).toUpperCase() ?? "A"}
                  </span>
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
              <strong>{current?.label ?? "Your account"}</strong>
            </div>
            <div className="mobile-only">
              <Brand />
            </div>
            <div className="flex items-center gap-2">
              <span className="desktop-only fine-print">
                Made for Ontario applicants
              </span>
              {user && account}
              <div className="mobile-only">{!user && account}</div>
              <button
                className="icon-button mobile-only"
                onClick={() => setOpen(true)}
                aria-label="Open navigation"
              >
                <Menu size={21} />
              </button>
            </div>
          </header>
          <nav aria-label="Quick navigation" className="mobile-dock">
            {LINKS.filter((link) =>
              ["/planner", "/vault", "/simulator", "/analytics"].includes(
                link.href,
              ),
            ).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={pathname === link.href ? "page" : undefined}
              >
                <link.icon size={19} strokeWidth={1.7} />
                {link.short}
              </Link>
            ))}
          </nav>
        </>
>>>>>>> pr/8
      )}
      {accountError && (
        <p
          role="alert"
          className="notice notice-error fixed bottom-24 right-4 z-50"
        >
          {accountError}
        </p>
      )}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Your Accepted workspace"
        className="navigation-dialog"
      >
        <nav aria-label="Mobile navigation">{navigation(true)}</nav>
        <div className="mt-6 border-t border-line pt-4">
          <Link className="text-link" href="/" onClick={() => setOpen(false)}>
            Product overview <ArrowUpRight size={15} />
          </Link>
        </div>
      </Dialog>
    </>
  );
}
