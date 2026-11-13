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

## 2. Competitive landscape (researched 13 Nov 2026)

> **Method.** AcceptMe, Uniscope, Myls and Stellar Advisers were read directly
> from their own sites (homepage, pricing, terms, sample pages) on 13 Nov 2026.
> OUInfo and Product Hunt (Uni Prep) blocked automated access, so those rows
> rely on search results and **are not verified**. Everything here is what
> vendors say about themselves; re-check before quoting it externally.

### 2.1 Who else students use

| Competitor | Model & price | What they actually offer (verified unless noted) |
|---|---|---|
| **AcceptMe** (acceptme.io) — *the main threat* | Free tier; **C$49/month** or **C$79 season pass** (to 31 Mar 2027); free 15-min calls with the solo founder | **Chance me** built from **33,000+ publicly posted results (Fall 2024–26)**: per-program distributions *including rejections and waitlists*, filters by province/year, "when offers came" timing, the university's official published average with a "checked on" date. **Application planner**: every deadline for every Canadian university, "from more than 1,000 official university pages… checked every day", linked to the source, **no account needed**, a **parent mode**, plans sent by email. **Essay Coach** with **sentence-by-sentence notes** (works / tighten / fix) that **never rewrites your essay**. **On-camera timed interview practice** with transcript + notes. **Story Bank**: a *voice* coach interviews you about a moment and writes it up in STAR form (12 topics, 3 free). A large SEO library: program/deadline guides per university, scholarship-interview guides (Schulich, Loran, Queen's Chancellor's), reviews of local consultancies with "a C$49-a-month alternative". National (BC, AB, ON, QC…). |
| **Uniscope** (uniscope.ca) | 100% free, anonymous | **1,844 programs, 27+ universities, 8,100+ student reports**, official **CUDO** data, **acceptance rates**, grade distributions, a live feed of recent reports, curated **head-to-head program comparisons**, program reviews. |
| **Myls AI** (myls.ai) | Free 1-question trial; **US$55/month** (10 interviews) or **US$135/month** unlimited | On-camera mock interviews for **250+ programs, 24,000+ questions** (incl. McMaster Health Sci, U of T Eng, Rotman); scores per skill, "exact lines to rewrite", a STAR "better answer", progress on the same question, CASPer/MMI. Voice-only option; camera adds eye-contact feedback. |
| **Stellar Advisers** (stellaradvisers.com) | Free; **C$5** or **C$20/month** | Dated, sourced supp guides ("Reviewed Oct 10, 2026"), university & college directories, **timed interview practice (unlimited, free)**, **2 AI essay reviews/day free** (10/30 paid), **application tracker**, an **AI Adviser** chat, monthly live group sessions, weekly human review of interview answers, forum. |
| **OUInfo** (ouinfo.ca) *(not verified)* | Official, free | Every Ontario university program: prerequisites, grade ranges, OUAC codes, advanced search, "My Comparisons". The trusted source of record. |
| **myBlueprint / Xello** *(search only)* | Licensed by school boards | Ontario course selection with prerequisites, graduation tracking, Individual Pathway Plans. Students have accounts from Grade 7; counsellors use it. |
| **Uni Prep** *(Product Hunt, not verified)* | Free indie project | "Best 6" tracking vs. cutoffs, 56 Canadian ECs, OUAC snapshot, Waterloo AIF résumé, Gr 7–12. |
| **r/OntarioGrade12s spreadsheets** | Community | Raw offers, rejections, deferrals each cycle. The source both AcceptMe and Accepted! draw on. |
| **Consultancies** (BeMo, MedApplications, USCA, local firms) | C$100–225/hour or C$575–1,295 packages (prices quoted by AcceptMe's reviews) | Human strategy and review. |

### 2.2 Honest read: what this changes

The first version of this roadmap assumed **"no competitor connects planning and
practice"**. That is **false**. AcceptMe already ships, polished and with a
large SEO footprint, much of what §5 planned: chances with rejections, a
sourced deadline planner, a parent mode, line-by-line essay notes, camera
interview practice, and a story bank. Building those features and simply
matching AcceptMe won't win students. Accepted! needs to be **clearly better
on depth for Ontario and on the parts nobody does**.

### 2.3 Where Accepted! is ahead

1. **Course & prerequisite intelligence (planned) is uncontested among practice tools.** AcceptMe, Myls and Stellar have no course model; AcceptMe only mentions top 6 in guides. myBlueprint has courses but no admissions intelligence. *Why it matters:* "you're missing MCV4U for 9 of your 12 programs" is something no admissions app tells a student today.
2. **Personal scholarship matching.** AcceptMe covers scholarships only as articles; Accepted! already syncs awards and matches them to the student's activities and practice.
3. **Progress analytics across all practice** (scores per program, 8-week trend, "what to focus on next"). Myls tracks progress per question; AcceptMe's site doesn't show a trend view.
4. **Activity portfolio scored against target programs** (EC Rater) and fed into program fit. AcceptMe's Story Bank turns stories into interview material but doesn't assess the activity list itself.
5. **Ontario-only focus.** AcceptMe, Uniscope and Myls are national or global. Accepted! can go deeper on OUAC 101 rules, top-6 calculations, conditional-offer conditions, Ontario residence and OSAP than a national tool will bother to.
6. **Microphone audio never leaves the device** in interview practice. That reassures minors and parents (AcceptMe and Myls record on camera to their servers for feedback).
7. **Generous free use.** About 10 free scored evaluations a day, vs. AcceptMe's 2 interviews + 2 essays, Myls's 1 question, Stellar's 2 essay reviews a day.

### 2.4 Where Accepted! falls short, and why

| Gap | Who does it better (evidence) | Why Accepted! is behind |
|---|---|---|
| **Outcome data size and honesty** | AcceptMe 33,000+ results with rejections & offer timing; Uniscope 8,100+ reports + CUDO + acceptance rates | Accepted! has 6,950 *offers only*, so its averages are biased upward and it can't show rejections, acceptance rates or when offers arrive. |
| **Deadline coverage & freshness** | AcceptMe: 1,000+ official pages checked daily, every date sourced | 47 hand-typed programs, `'Feb 15'` with no year or source, some wrong codes. |
| **Essay feedback quality & integrity** | AcceptMe: sentence-anchored notes, *never rewrites*; Myls: "exact lines to rewrite" | Nova returns summary lists **plus a full model rewrite**. That is weaker feedback, and the rewrite is risky given the OUAC declaration ("authored solely and entirely by me") and Waterloo's AI warning. AcceptMe uses "we never write your words" as a selling point against us. |
| **Video interview practice** | AcceptMe, Myls (on camera, per-skill scores, 24,000+ questions) | Accepted! uses a speech-to-text transcript only, with a small prompt set (31 programs × ~2 prompts). |
| **Story building** | AcceptMe Story Bank (voice coach, STAR) | Activities are a list to be rated, not a source of reusable stories. |
| **No-account first use & parents** | AcceptMe: planner and chances need no account; parent mode; plan emailed | Most Accepted! value is behind sign-in; there is no parent role. |
| **SEO & content** | AcceptMe (hundreds of dated guides, "vs. consultant" pages), Stellar (resource library) | Accepted! pages are client-rendered app screens with no public guides. Students find competitors on Google first. |
| **Program comparison** | Uniscope, OUInfo | No compare view. |
| **Human help** | AcceptMe (founder calls), Stellar (weekly adviser reviews, C$5) | AI only. |
| **Course planning presence in schools** | myBlueprint / Xello | Direct-to-student only. |
| **Cross-device plan** | All of the above with accounts | The planner is browser-only `localStorage`. |

### 2.5 Changes added because of this comparison

Added to §5 and §7 (marked **[C]**). The ones marked **⚑** are urgent, because a direct competitor already does it better:

- **C1 ⚑ — Drop the full model rewrite.** Replace it with **sentence-anchored notes** (`{quote, verdict: works|tighten|fix, why}` highlighted in the draft) and at most one example rewrite of a *single* weak sentence. Add an "your words stay yours" integrity statement and a per-program AI-policy panel (help allowed / not allowed, source link, date). Integrity mode for McMaster Health Sci and other programs that forbid outside help.
- **C2 ⚑ — Rebuild the outcomes dataset.** Import offers **and rejections, waitlists, deferrals** from every public cycle spreadsheet (with credit to r/OntarioGrade12s), record offer dates, add official published averages and CUDO numbers with "checked on" dates. Add in-app outcome reporting. Show distributions, a "reported acceptance rate" with sample size, and "when offers came". Target: ≥ 30,000 Ontario results before Feb 2027.
- **C3 ⚑ — Sourced deadline catalog.** Cover every Ontario program with supp/AIF/interview/scholarship dates, each with `source_url` + `checked_at`. Run an automated daily **link and change check** that flags a page for human review when it changes (don't scrape blindly).
- **C4 ⚑ — Public, no-account entry points.** Chances and the planner usable without signing in, a "save my plan" email to keep it, and an optional account later. Server-render them as SEO pages (`/chances/waterloo/computer-science`).
- **C5 — Win on courses.** Make the top-6 + prerequisite checker (Phase 2 item 7) the **headline feature** and move it to Phase 1. Combine it with chances: "with your top 6 of 92.3 (prereqs included), you are in the middle half of reported offers; drop MCV4U and you lose 9 programs."
- **C6 — Story bank built on the activity portfolio.** Stories generated by talking or typing through STAR prompts, linked to each activity, then suggested for each supp/interview prompt. AcceptMe's story bank is generic; Accepted!'s is tied to activities, programs and scholarships.
- **C7 — Camera practice with on-device recording** (MediaRecorder, local playback, no upload by default), Kira-style timers per program, delivery stats (pace, filler words, pauses) from the transcript. Optional, consented upload for visual feedback later.
- **C8 — Question bank to 500+ Ontario prompts** tagged by program, theme and format, plus moderated "asked in my interview" reports. Don't try to match Myls's 24,000 global questions; go deep on Ontario.
- **C9 — Parent / guardian mode**, with a read-only share link (moved up from Phase 4).
- **C10 — Program compare** (up to 4): prerequisites, your top 6 vs. distribution, acceptance rate, supp type, deadlines, cost, co-op.
- **C11 — Ontario money tools nobody else has:** entrance-scholarship grids by average for every Ontario university, offer comparison with cost after scholarships, conditional-offer risk warnings, residence deadlines, links to the OSAP estimator.
- **C12 — Content engine.** Dated, sourced guides per Ontario program generated from the program catalog (one source of truth for app and guides), a yearly "every Ontario supp compared" page, and honest "Accepted! vs. X" pages.
- **C13 — Pricing.** Keep a generous free tier (it's an advantage). If a paid tier comes, price it under AcceptMe (C$49/month, C$79 season) — e.g. a C$39–59 season pass — and consider Stellar-style low-cost **human review** by vetted university students.
- **C14 — Course import** from a pasted report card/transcript or myBlueprint export, and an **EC/opportunity catalogue** (Shad, DECA, CEMC contests, FIRST, HOSA…) with deadlines so Grade 9–11 students have a reason to start early.
- **C15 — Positioning:** *"The Ontario application app that knows your courses."* Lead with the course/prereq + chances combination, scholarships and Ontario depth, not with the practice tools that competitors already do well.

---

## 3. Product vision

**Positioning:** "The Ontario application app that knows your courses", taking a
student from course selection to their acceptance (see §2.5, C15).

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

## 4. Foundations (do these first; everything else depends on them)

### 4.1 Canonical data model (Supabase)

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

### 4.2 Program catalog as a real dataset

- Move `programs.ts`, `prompts.ts` and `history.json` into the DB with one stable `program_id`, and fix the mis-mapped codes (CFM, AFM, Aviation, …).
- Every fact gets `source_url` + `verified_at` + `cycle`, shown in the UI ("Verified Oct 2026 · source").
- A small internal **admin page** (Supabase role `admin`) to edit programs, deadlines and prompts without a deploy.
- A yearly "new cycle" script that copies programs forward and flags every deadline as *unverified* until someone checks it.
- Target coverage: every OUAC-listed program at all Ontario universities (start with the ~150 programs that have supplementals, then do the rest).

### 4.3 Engineering quality

- **Validation:** Zod schemas on every API route body and AI JSON response (`lib/ai.ts` currently trusts the parse).
- **Types:** generate Supabase types (`supabase gen types`) and use a typed client.
- **Tests:** Vitest for pure logic (top-6 calculator, prereq checker, chances, deadline engine, scholarship matching); Playwright for core flows (onboarding → shortlist → task → practice).
- **CI:** GitHub Actions running `tsc --noEmit`, lint, unit tests and a Playwright smoke test on every PR; Vercel previews stay as they are.
- **Observability:** Sentry (or Vercel's equivalent) for client and server errors; structured logs on AI calls (latency, model, fallback used, token cost).
- **Lint/format:** ESLint (`next/core-web-vitals`) + Prettier, plus a pre-commit hook.
- **State/data fetching:** one data layer (TanStack Query or server actions) instead of each component doing its own `fetch` + `localStorage` handling.
- **AI layer:** one `lib/ai` module with typed tasks (`scoreAnswer`, `reviewInterview`, `rateActivities`, `suggestNext`), prompt versioning, an eval set of ~50 graded sample answers so prompt changes can be checked against it, and per-feature cost caps.

---

## 5. Product roadmap

Items marked **[C#]** come from the competitor comparison (§2.5). **⚑** = a direct competitor already does this better today.

### Phase 1: Make it one app, and fix what competitors beat us on (≈ 6–8 weeks)

1. **Onboarding (about 2 minutes).** Grade and grad year → **courses and marks** (typed, or pasted from a report card / myBlueprint export, **[C14]**) → fields of interest → 3–5 programs you're considering. The result is a usable dashboard from the first session.
2. **Course & prerequisite checker, the headline feature [C5].** For each program: ✔/✖ for each prerequisite, your **top 6 including prerequisites**, and which missing course would unlock the most programs. Supports Grade 11 students choosing Grade 12 courses. No admissions-practice competitor has this.
3. **Signed-in home = "Today" dashboard.**
   - Next 3 deadlines across all applications, with countdowns.
   - Progress ring per application (OUAC ✔, supp 60%, interview booked…).
   - "Best next action" card (e.g. "Your Rotman supp opens in 4 days — do a timed practice now").
   - Top-6 average and prerequisite warnings.
4. **New navigation by stage:** *Home · My Applications · Programs · Prepare (Writing / Interview / Stories) · Money (Scholarships / Costs) · Offers*. Tools move inside the application they belong to.
5. **Application detail page** (`/applications/[id]`): requirements, prereq check, timeline, supp drafts, practice history for this program's prompts, interview prep, and related scholarships, all on one page.
6. **Cross-device sync** of everything (via the data model in 4.1).
7. **⚑ Integrity-first Nova feedback [C1].** Remove the full model rewrite. Return sentence-anchored notes (works / tighten / fix + why) highlighted in the answer, and at most one example rewrite of a single sentence. Add a per-program AI-policy panel and an integrity mode for programs that forbid outside help.
8. **⚑ No-account chances & planner [C4]**, with "email me my plan" and an optional account later; server-rendered for SEO.
9. **Design-system pass:** one set of tokens, empty states, skeletons and toasts; consistent page headers; mobile-first layout of the dock and application cards; WCAG 2.2 AA audit.

### Phase 2: Ontario-specific depth (≈ 6–8 weeks)

10. **⚑ Admission chances from a rebuilt dataset [C2].** Offers **and** rejections, waitlists and deferrals from every public cycle, plus official averages and CUDO data with "checked on" dates. Show the full distribution, where the student's top 6 falls, a reported acceptance rate with sample size, and "when offers came". Always labelled self-reported, not a prediction. Mark supp-heavy programs where grades matter less.
11. **⚑ Sourced deadline catalog + engine [C3].** Every Ontario program's OUAC, supp, AIF, interview and scholarship dates, each with source and checked date; daily change detection on source pages with human review. Tasks are generated from it; ICS feed / "Add to Google Calendar"; email reminders 7 / 2 / 0 days before (cron + Resend).
12. **OUAC builder.** Build the OUAC 101 choice list: rules check (choice limits per university), base-plus-extra-choice fee estimate (fee values configurable per cycle), and a printable "OUAC entry sheet" with program codes so the real submission takes minutes.
13. **Program compare [C10]** (up to 4): prerequisites, your top 6 vs. distribution, acceptance rate, supp type, deadlines, cost, co-op.
14. **Supplemental workspace.** For each program: the real prompt list for the cycle, the word/character limits, a drafting editor with autosave and version history, Nova notes on drafts (not only timed answers), and a "reuse a story" picker. Covers Waterloo AIF, U of T Engineering, Queen's, Ivey AEO, Schulich, Rotman, McMaster Health Sci, and others.
15. **⚑ Story bank built on the activity portfolio [C6].** Talk or type through STAR prompts for each activity; stories tagged by theme (leadership, failure, teamwork, initiative) and suggested for each supp/interview prompt and scholarship essay.
16. **⚑ Interview studio upgrade [C7, C8].** Optional webcam recording that **stays on the device** (MediaRecorder → local playback), Kira-style prep/answer timers per program, pace / filler-word / pause stats from the transcript, and a 500+ Ontario question bank with moderated "asked in my interview" reports.
17. **EC & opportunity catalogue [C14]** (Shad, DECA, CEMC contests, FIRST, HOSA, Model UN…) with deadlines, so Grade 9–11 students start early.

### Phase 3: Money & decisions (≈ 4 weeks, ready before offers arrive in Feb–May)

18. **Scholarships linked to the plan [C11].** Match on the real profile (top 6, ECs, fields, shortlisted universities). Show **automatic entrance scholarships per university by average band** next to each application. Saved scholarships get their own deadlines in the task engine.
19. **Offer tracker.** Log each offer (conditional/unconditional/early, conditions, scholarship, residence guarantee, response deadline). Warn if a condition is at risk given current marks.
20. **Offer comparison [C11].** Side by side: estimated first-year cost (tuition + residence + meal plan − scholarships), co-op, distance from home, entrance scholarship, residence deadline. Link to the official OSAP estimator (don't re-implement it).
21. **Outcome reporting [C2].** After each decision (offer, rejection, waitlist), ask the student to share it anonymously. Grows the dataset every cycle. Needs moderation, bounds checks and deduplication. AcceptMe has 33,000+ results and Uniscope 8,100+, so the in-app flow has to be easy enough that most users report.

### Phase 4: Growth, trust & distribution

22. **Parent / guardian mode [C9]** with a read-only share link (opt-in by the student). Do this early in Phase 4 at the latest; AcceptMe already has one.
23. **Counsellor/school dashboard** (a possible B2B revenue line): a class overview of who is on track and who is missing prerequisites. Requires separate privacy terms.
24. **Content engine [C12].** Public, server-rendered program pages and guides generated from the catalog (requirements, deadlines, distribution, "Practise this supp"), a yearly "every Ontario supp compared" page, a month-by-month Ontario timeline, and honest comparison pages.
25. **Pricing & human help [C13].** Keep the generous free tier; any paid tier priced under AcceptMe (e.g. a C$39–59 season pass); optional low-cost human review by vetted university students.
26. **Notifications:** email first; web push later (PWA).
27. **PWA / installable app** with offline access to the plan and drafts.
28. **French (fr-CA)** for Franco-Ontarian students and the uOttawa / Laurentian / Glendon audience.

---

## 6. Trust, safety & compliance (do alongside every phase)

- **Most users are minors.** Write a clear privacy policy (PIPEDA / Ontario expectations), use minimal data collection, offer account deletion and data export (one click), never sell data, and send no PII to analytics (currently an anonymous visitor id, which is good; keep it that way).
- **AI guardrails:** keep the "do not invent facts" persona rules; add an "AI feedback is practice, not an admissions decision" notice on every result; add an academic-integrity stance (Nova coaches and does not write the supp for you; the rewrite is a model example, and the UI should say so).
- **Data honesty:** every average and deadline shows its source, cycle and verified date; outcome stats always state "self-reported offers".
- **Security:** keep server-only inserts (migration 004 is good). Add rate limits on all AI routes (some exist), CSP headers, and a dependency audit in CI.
- **Accessibility:** keyboard-complete flows, screen-reader labels on the timers, reduced-motion support (motion was recently added), and colour-contrast checks on the navy/moss palette.

---

## 7. Suggested build order (first PRs)

| # | PR | Why first |
|---|---|---|
| 1 | **Fix program data bugs:** unique `code` per program, correct CFM/AFM/Aviation prompt mapping, unique React keys. | Students are sent to the wrong prompts today. |
| 2 | **Remove Nova's full rewrite; add sentence-anchored notes [C1].** | Integrity risk for students and the main point AcceptMe uses against us. Small change to `lib/ai.ts`, the persona and the simulator UI. |
| 3 | **Tooling:** ESLint, Prettier, Vitest, GitHub Actions CI, Zod on API routes. | Safety net before the larger refactors below. |
| 4 | **Data model migration** (`profiles`, `courses`, `applications`, `tasks`) + localStorage import. | Unblocks sync, the dashboard and everything after. |
| 5 | **Program catalog in DB** with `program_id`, sourced deadlines with cycle/`checked_at`; outcomes table with offers **and rejections** [C2, C3]. | One source of truth for programs, and closes the biggest data gap. |
| 6 | **Top-6 + prerequisite checker [C5].** | The feature competitors don't have; leads the positioning. |
| 7 | **Onboarding + Today dashboard + new nav.** | This is the change students will see: it starts working as one app. |
| 8 | **Public no-account chances page per program [C4, C12].** | SEO acquisition; competitors already rank for these searches. |
| 9 | **Application detail page** pulling in practice, supp, scholarships. | Connects the existing tools under each application. |
| 10 | **Deadline engine + ICS + email reminders.** | Brings students back during the months that matter. |

Then Phase 2 → 3 in order, timed so the **offer tracker and comparison launch before
February**, when early offers start arriving.

---

## 8. Open questions for the founders

1. **Scope:** universities only, or Ontario colleges (OCAS) too? Colleges roughly double the audience but need a second application model.
2. **Business model:** free with a paid tier (more Nova evaluations, draft reviews), school licences, or both? This affects how much to invest in the counsellor dashboard.
3. **Data partnerships:** is the outcome spreadsheet community willing to move to in-app reporting? That is the most valuable long-term asset.
4. **Who maintains the program catalog** each cycle (founders, paid student ambassadors, or community edits with review)?
5. **Out-of-province / international students** (OUAC 105): support them now, or later?
6. **Ontario-only vs. national:** AcceptMe, Uniscope and Myls are national. Staying Ontario-only is the differentiator, but it caps the market. Decide deliberately.
7. **Compete or partner?** Uniscope is free and community-run, and could be a data partner rather than a rival. AcceptMe is a solo founder; the speed of shipping matters more than the feature list.

---

*Program facts, deadlines, fee amounts and policy dates (e.g. the June 1 response
date and OUAC choice rules) must be re-verified with OUAC and each university each
cycle before being shown to students.*
