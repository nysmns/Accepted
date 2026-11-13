# Accepted! — Product & Engineering Roadmap

> Goal: turn Accepted! from a set of separate tools into **the one place an Ontario
> student runs their whole university application**: from choosing Grade 12
> courses, through OUAC, supplementals and interviews, to comparing offers and
> accepting one by the June 1 response date.

---

## 1. Diagnosis: why it feels like a random set of tools

The individual tools are well made: the simulator timers, the Nova persona, and
the scholarship sync are solid. The problem is that **nothing connects them**.
Each tool has its own data, its own idea of who the student is, and no reason to
send the student to the next one.

| Symptom | Evidence in the code |
|---|---|
| **No single student profile.** Each tool asks for the same things again. | The planner keeps one `average` number in `localStorage` (`lib/position.ts`, `components/planner.tsx`). The EC level is in `localStorage` (`EC_KEY`) and the EC list is in Supabase (`student_ecs`). Attempts are in `feedback_jobs`. Three stores, no shared profile. |
| **The plan isn't saved to the account.** | `PLANNER_KEY = 'accepted-application-planner-v1'` is browser-only, even though the user signs in. Switch from laptop to phone and the plan is gone. |
| **There are three program lists and they don't line up.** | `lib/data/programs.ts` (47 programs), `lib/data/prompts.ts` (31 practice sets), `public/history.json` (645 programs / 6,950 offers). They are joined by loose strings or not joined at all. |
| **Data bugs that send students to the wrong place.** | Waterloo CFM uses `code: 'waterloo_cs'`, Waterloo AFM uses `'queens_comm'`, and Aviation uses `'waterloo_eng'`. So "Practise" for AFM opens **Queen's Commerce** prompts. Codes repeat (`waterloo_cs` 4×, `waterloo_eng` 4×, `queens_health` 4×), and `vault.tsx` uses `key={p.code}`, which gives React duplicate keys. |
| **One average doesn't reflect how Ontario admissions work.** | Admission is based on your **top 6 4U/M courses, including the program's prerequisites**. One slider number can't tell a student "you're missing MCV4U". |
| **Deadlines are text with no year.** | `deadline: 'Feb 15'` has no cycle, no source, no "verified on" date. You can't build reminders, a calendar, or a "what's due this week" view from it. |
| **No home screen after sign-in.** | `/` is a marketing page for everyone. A signed-in student has no dashboard showing what to do next. |
| **Navigation is a list of tools, not steps in the process.** | `app-shell.tsx` LINKS is "Plan / Prepare / Reflect" × 7 tools. Students think in terms of "what do I do in October / January / May", not tool names. |
| **The core data asset is barely used.** | 6,950 self-reported offers sit in a static JSON shown in one tab. That data should drive the chances view, the program pages and the home stats. |
| **No engineering safety net.** | No tests, no CI, no lint config, no schema validation on API inputs, no error monitoring, no typed Supabase client. |

**The main change:** one **Student Profile** and one **Program Catalog**, with
every feature reading from and writing to those two, plus a **timeline** that
tells the student what to do next.

---

## 2. Product vision

**Positioning:** "Your Ontario university application, from course selection to
your acceptance."

**North-star metric:** *students who submit OUAC with a complete plan*.
Supporting metrics: weekly active students during Oct–Feb, supp drafts finished
per student, and the share of students who log an outcome (this grows the dataset).

### The student journey Accepted! should own

```
Gr 11 (spring)      Gr 12 Sep–Oct       Nov–Jan              Jan–Mar               Feb–May            May–Jun
Course selection →  Shortlist &      →  OUAC submission   →  Supps, AIFs,       →  Offers roll in  →  Compare &
& prereq check      chances             & fees               interviews, portals    & conditions       accept by June 1
```

Every screen should answer three questions: **where am I, what's due next,
what's my best next action.**

---

## 3. Foundations (do these first; everything else depends on them)

### 3.1 Canonical data model (Supabase)

Replace the scattered stores with these tables (all with RLS on `user_id`):

- `profiles` — grade, school board, graduation year, intended fields, Ontario/OSSD vs. out-of-province, onboarding state.
- `courses` — `course_code` (e.g. `MHF4U`), level (`4U`/`4M`/`3U`…), mark, status (`planned` / `in_progress` / `midterm` / `final`), term. **This replaces the single "average".**
- `programs` (public, admin-managed) — stable `id`, university, name, OUAC code, campus, `prerequisites[]` (course codes), `supp_type[]`, `cycle` (e.g. `2026-27`), `deadlines[]` (typed: OUAC equal consideration, supp, AIF, interview window, scholarship), `source_url`, `verified_at`.
- `program_outcomes` — the 6,950 offers moved from `history.json` into a table, linked by `program_id`, with year and the offer-type tag. This becomes the basis for the chances view and grows as students report outcomes.
- `applications` — one row per student × program: status (`considering` → `shortlisted` → `submitted_ouac` → `supp_in_progress` → `supp_submitted` → `interview` → `offer` / `waitlist` / `refused` → `accepted`), OUAC choice rank, notes.
- `tasks` — generated from program deadlines plus custom ones; due date, done flag, linked application.
- `documents` — supp/AIF drafts with versions, linked to an application and to the specific prompt.
- `activities` — evolve `student_ecs` (add category tags, impact metrics, dates, "story" text that can be reused).
- `attempts` — keep `feedback_jobs`, but add `program_id` / `prompt_id` foreign keys.
- `offers` — offer type (conditional / unconditional / early), conditions (e.g. "maintain 85% in top 6"), scholarship amount, response deadline.

**Migration path:** on first sign-in, read the old `localStorage` planner/EC keys,
upsert them into the account, then delete the keys, so nobody loses work.

### 3.2 Program catalog as a real dataset

- Move `programs.ts`, `prompts.ts` and `history.json` into the DB with one stable `program_id`, and fix the mis-mapped codes (CFM, AFM, Aviation, …).
- Every fact gets `source_url` + `verified_at` + `cycle`, shown in the UI ("Verified Oct 2026 · source").
- A small internal **admin page** (Supabase role `admin`) to edit programs, deadlines and prompts without a deploy.
- A yearly "new cycle" script that copies programs forward and flags every deadline as *unverified* until someone checks it.
- Target coverage: every OUAC-listed program at all Ontario universities (start with the ~150 programs that have supplementals, then do the rest).

### 3.3 Engineering quality

- **Validation:** Zod schemas on every API route body and AI JSON response (`lib/ai.ts` currently trusts the parse).
- **Types:** generate Supabase types (`supabase gen types`) and use a typed client.
- **Tests:** Vitest for pure logic (top-6 calculator, prereq checker, chances, deadline engine, scholarship matching); Playwright for core flows (onboarding → shortlist → task → practice).
- **CI:** GitHub Actions running `tsc --noEmit`, lint, unit tests and a Playwright smoke test on every PR; Vercel previews stay as they are.
- **Observability:** Sentry (or Vercel's equivalent) for client and server errors; structured logs on AI calls (latency, model, fallback used, token cost).
- **Lint/format:** ESLint (`next/core-web-vitals`) + Prettier, plus a pre-commit hook.
- **State/data fetching:** one data layer (TanStack Query or server actions) instead of each component doing its own `fetch` + `localStorage` handling.
- **AI layer:** one `lib/ai` module with typed tasks (`scoreAnswer`, `reviewInterview`, `rateActivities`, `suggestNext`), prompt versioning, an eval set of ~50 graded sample answers so prompt changes can be checked against it, and per-feature cost caps.

---

## 4. Product roadmap

### Phase 1: Make it one app (≈ 4–6 weeks)

1. **Onboarding (about 2 minutes).** Grade and grad year → courses and marks (or "I'll add later") → fields of interest → 3–5 programs you're considering. The result is a usable dashboard from the first session.
2. **Signed-in home = "Today" dashboard.**
   - Next 3 deadlines across all applications, with countdowns.
   - Progress ring per application (OUAC ✔, supp 60%, interview booked…).
   - "Best next action" card (e.g. "Your Rotman supp opens in 4 days — do a timed practice now").
   - Top-6 average and prerequisite warnings.
3. **New navigation by stage:** *Home · My Applications · Programs · Prepare (Writing / Interview / Activities) · Money (Scholarships / Costs) · Offers*. Tools move inside the application they belong to.
4. **Application detail page** (`/applications/[id]`): requirements, prereq check, timeline, supp drafts, practice history for this program's prompts, interview prep, and related scholarships, all on one page.
5. **Cross-device sync** of everything (via the data model in 3.1).
6. **Design-system pass:** one set of tokens, empty states, skeletons and toasts; consistent page headers; mobile-first layout of the dock and application cards; WCAG 2.2 AA audit.

### Phase 2: Ontario-specific depth (≈ 6–8 weeks)

7. **Course & prerequisite checker.** Enter courses; for each program, see ✔/✖ for each prerequisite, your computed **top-6 including prerequisites**, and which missing course would unlock the most programs. Supports Grade 11 students planning Grade 12 course selection, which is a feature other tools rarely offer.
8. **Admission chances from real data.** Use `program_outcomes` to show where the student's top 6 falls in the distribution of admitted averages (e.g. "Your 91 is above ~40% of reported offers for this program"). Label it clearly: self-reported, offers only, no rejection data, not a prediction. Mark supp-heavy programs where grades matter less.
9. **OUAC builder.** Build the OUAC 101 choice list: rules check (choice limits per university), base-plus-extra-choice fee estimate (fee values configurable per cycle), and a printable "OUAC entry sheet" with program codes so the real submission takes minutes.
10. **Deadline engine + calendar.** Generate tasks from each program's typed deadlines; ICS feed / "Add to Google Calendar"; email reminders 7 / 2 / 0 days before (Supabase cron or Vercel cron + Resend).
11. **Supplemental workspace.** For each program: the real prompt list for the cycle, the word/character limits, a drafting editor with autosave and version history, Nova feedback on drafts (not only timed answers), and a "reuse a story" picker drawing from the activity bank. Covers Waterloo AIF, U of T Engineering OSP, Queen's PSE, Ivey AEO, Schulich, Rotman, McMaster Health Sci, and others.
12. **Interview studio upgrade.** Optional webcam recording that **stays on the device** (MediaRecorder → local playback), Kira/video-response style timers (prep/answer), filler-word and pacing stats from the transcript, and question banks per program.
13. **Activity bank → stories.** Turn each EC into reusable STAR-format stories tagged by theme (leadership, failure, teamwork, initiative). Supp and interview practice suggest the best-matching story for each prompt, so ECs become a source of material for every application.

### Phase 3: Money & decisions (≈ 4 weeks, ready before offers arrive in Feb–May)

14. **Scholarships linked to the plan.** Match on the real profile (top 6, ECs, fields, shortlisted universities). Show **automatic entrance scholarships per university by average band** next to each application. Add saved scholarships with their own deadlines in the task engine.
15. **Offer tracker.** Log each offer (conditional/unconditional/early, conditions, scholarship, residence guarantee, response deadline). Warn if a condition is at risk given current marks.
16. **Offer comparison.** Side by side: estimated first-year cost (tuition + residence + meal plan − scholarships), co-op, distance from home, entrance scholarship, residence deadline. Link to official OSAP estimator (don't re-implement it).
17. **Outcome reporting.** After a decision, ask "Got an offer? Share your average (anonymously)". This grows `program_outcomes` every cycle; it is the long-term advantage over competitors. Needs moderation, bounds checks, and deduplication.

### Phase 4: Growth, trust & distribution

18. **Parent / counsellor view.** A read-only share link, so a parent or guidance counsellor can see deadlines and progress (opt-in by the student).
19. **Counsellor/school dashboard** (a possible B2B revenue line): a class overview of who is on track and who is missing prerequisites. Requires separate privacy terms.
20. **Notifications:** email first; web push later (PWA).
21. **PWA / installable app** with offline access to the plan and drafts.
22. **French (fr-CA)** for Franco-Ontarian students and the uOttawa / Laurentian / Glendon audience.
23. **SEO program pages** (`/programs/waterloo-computer-science`): public, server-rendered, with requirements, deadlines, the outcome distribution and a "Practise this supp" button. This is the main organic acquisition channel.
24. **Content:** a month-by-month Ontario application guide, built from the same deadline data.

---

## 5. Trust, safety & compliance (do alongside every phase)

- **Most users are minors.** Write a clear privacy policy (PIPEDA / Ontario expectations), use minimal data collection, offer account deletion and data export (one click), never sell data, and send no PII to analytics (currently an anonymous visitor id, which is good; keep it that way).
- **AI guardrails:** keep the "do not invent facts" persona rules; add an "AI feedback is practice, not an admissions decision" notice on every result; add an academic-integrity stance (Nova coaches and does not write the supp for you; the rewrite is a model example, and the UI should say so).
- **Data honesty:** every average and deadline shows its source, cycle and verified date; outcome stats always state "self-reported offers".
- **Security:** keep server-only inserts (migration 004 is good). Add rate limits on all AI routes (some exist), CSP headers, and a dependency audit in CI.
- **Accessibility:** keyboard-complete flows, screen-reader labels on the timers, reduced-motion support (motion was recently added), and colour-contrast checks on the navy/moss palette.

---

## 6. Suggested build order (first PRs)

| # | PR | Why first |
|---|---|---|
| 1 | **Fix program data bugs:** unique `code` per program, correct CFM/AFM/Aviation prompt mapping, unique React keys. | Students are sent to the wrong prompts today. |
| 2 | **Tooling:** ESLint, Prettier, Vitest, GitHub Actions CI, Zod on API routes. | Safety net before the larger refactors below. |
| 3 | **Data model migration** (`profiles`, `courses`, `applications`, `tasks`) + localStorage import. | Unblocks sync, the dashboard and everything after. |
| 4 | **Program catalog in DB** with `program_id`, deadlines with cycle/source/verified; history joined to programs. | One source of truth for programs. |
| 5 | **Onboarding + Today dashboard + new nav.** | This is the change students will see: it starts working as one app. |
| 6 | **Application detail page** pulling in practice, supp, scholarships. | Connects the existing tools under each application. |
| 7 | **Top-6 + prerequisite checker.** | Ontario-specific value students can't easily get elsewhere. |
| 8 | **Deadline engine + ICS + email reminders.** | Brings students back during the months that matter. |

Then Phase 2 → 3 in order, timed so the **offer tracker and comparison launch before
February**, when early offers start arriving.

---

## 7. Open questions for the founders

1. **Scope:** universities only, or Ontario colleges (OCAS) too? Colleges roughly double the audience but need a second application model.
2. **Business model:** free with a paid tier (more Nova evaluations, draft reviews), school licences, or both? This affects how much to invest in the counsellor dashboard.
3. **Data partnerships:** is the outcome spreadsheet community willing to move to in-app reporting? That is the most valuable long-term asset.
4. **Who maintains the program catalog** each cycle (founders, paid student ambassadors, or community edits with review)?
5. **Out-of-province / international students** (OUAC 105): support them now, or later?

---

*Program facts, deadlines, fee amounts and policy dates (e.g. the June 1 response
date and OUAC choice rules) must be re-verified with OUAC and each university each
cycle before being shown to students.*
