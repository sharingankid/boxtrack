# BoxTrack - Idea Development Documentation

> **Portfolio Project - Team Formation, Brainstorming and MVP (Stage 1 - France)**
> DWWM end-of-year project (RNCP 37674).
> Covers Task 0 (team formation & roles definition), Task 1 (brainstorming & idea evaluation),
> Task 2 (decision & refinement), and Task 3 (this documentation) for the selected MVP: **BoxTrack**.

---

## 1. Team Formation

### 1.1 Initial Meeting & Team Overview

An initial kickoff meeting was held between both members to introduce backgrounds, strengths, and
interests before assigning any role, so that the technical split in section 1.2 reflects actual
affinity rather than an arbitrary split.

| | |
|---|---|
| **Team size** | 2 members |
| **Members** | Kevin Rigal (krigal323@gmail.com), Panaki Gillot (gillotpanaki@gmail.com) |
| **Temporary Project Manager** | Kevin Rigal - coordinates planning and documentation, and keeps the Trello backlog groomed against the 10-week schedule during Stage 1-2. A coordination role, not a hierarchy: technical decisions are still made jointly, and the role can rotate in later stages if the team decides it should. |
| **Client / Sponsor (commanditaire)** | Timothé Garde, owner of CrossFit LAB (Toulouse) |

### 1.2 Technical Roles & Rationale

Both members are trained and evaluated as full-stack developers (RNCP 37674 requires each person to
individually cover all 7 competency blocks), so neither is restricted to a single layer for the whole
project. To avoid two people redundantly re-deciding the same UI or data questions, each carries a
**lead** role on the side they showed stronger affinity for during the Stage 1 brainstorming (see
[section 2.5](#25-front-end--back-end-split-during-this-phase) below):

| Member | Technical role | Why this split |
|---|---|---|
| **Kevin Rigal** | Fullstack developer - **Front-end / UX lead** | Owned the UI-feasibility read on every candidate idea during brainstorming (screen sketches, `/screen` broadcast-view complexity). Leads the Figma prototype, the responsive CSS work, and the `/screen` broadcast view - the project's most demanding UI requirement. |
| **Panaki Gillot** | Fullstack developer - **Back-end / Data lead** | Owned the data-model read on every candidate idea during brainstorming (entities, relations, RNCP C4/C5/C6 alignment). Leads the database schema, the REST API, and authentication (JWT/bcrypt). |

Both members still implement across the stack on every sprint; when a decision needs a single owner
to move fast, it defaults to the lead above.

### 1.3 Communication, Collaboration & Working Norms

| | |
|---|---|
| **Communication tool** | Discord (daily check-ins, constant communication, quick decisions, pair-programming voice calls) |
| **Task tracking tool** | Trello (Kanban board: Backlog / To Do / In Progress / Review / Done, one card per user story) |
| **Version control** | Git + GitHub (feature branches, pull requests reviewed by the other member before merge into `main`) |
| **Documentation** | Markdown files in the repository (`/docs`), Figma for wireframes/prototype |
| **Working norms** | Short daily async update on Discord (what was done / blockers / next), weekly planning session to groom the Trello backlog against the 10-week schedule, PR review required before merge, commit messages in English following Conventional Commits style |

### 1.4 Stakeholders

| Stakeholder | Role | Impact on the project |
|---|---|---|
| **Timothé Garde** | Client / sponsor (commanditaire) - owner & coach, CrossFit LAB | High - defines the real-world requirements, validates the MVP against actual daily use (WOD publishing, scoring, the `/screen` TV view), and is the intended long-term user after the defense. |
| **Kevin Rigal & Panaki Gillot** | Project team - developers | High - responsible for design, development, testing, and delivery of the MVP within the 10-week timeline. |
| **DWWM formation tutor(s)** *(Thomas Jondeau, Sofian Messaoui)* | Pedagogical supervisor | Medium - reviews progress against the RNCP 37674 blocks, gives technical guidance and unblocks methodology questions during the formation. |
| **Examination jury (soutenance)** | External evaluator | High at defense time - certifies competency validation based on the live demo (especially the `/screen` view), the documentation, and the Q&A. |
| **CrossFit LAB athletes/members** | Indirect end users | Medium - consume the public leaderboard, WOD, and TV view daily; their usability feedback (readability from 5-8m, clarity of the leaderboard) validates whether the MVP solves the stated problem. |

---

## 2. Brainstorming & Idea Evaluation

### 2.1 Method

We combined three techniques to generate and stress-test ideas:

- **Mind Mapping** - starting from "tools that centralize daily life for a small local business," branching into verticals (sports coaching, retail, community lending, education).
- **"How Might We" questions** - e.g. *"How might we help a small business owner replace scattered spreadsheets/WhatsApp with one real-time source of truth?"*, *"How might we make a shared physical space (a gym, a shop, a classroom) feel alive through a shared screen?"*
- **SCAMPER** - applied to the "leaderboard on a screen" concept: *Put to another use* (a gym scoreboard → a retail queue display → a classroom quiz board), *Combine* (scheduling + scoring + leaderboard in one tool), *Adapt* (broadcast-style TV UI adapted from esports/game-show leaderboards).

### 2.2 Ideas Considered

| # | Idea | Short description |
|---|------|--------------------|
| 1 | **BoxTrack** | Web app for a CrossFit box: daily WOD publishing, score entry by category (RX/Scaled/Modified), auto-ranked leaderboard, and a dedicated broadcast-style `/screen` route for the gym's TV. |
| 2 | **ShiftEase** | Shift-scheduling and swap-request tool for small retail/hospitality teams, with a manager dashboard and a public "today's shift" screen for the break room. |
| 3 | **LocalLoop** | Neighborhood tool/object lending platform - members list items they own, browse what's available nearby, and reserve a loan slot. |
| 4 | **StudyDeck** | Spaced-repetition flashcard app for students, with shared decks per class and a leaderboard of review streaks. |

### 2.3 Evaluation Criteria

Each idea was scored 1 (low) to 5 (high) on:

- **Feasibility** - realistic to build and deploy in 10 weeks with 2 people at our current skill level.
- **RNCP alignment** - how naturally the idea covers all 7 blocks (C1–C7), especially C2/C3 (rich, non-trivial UI) and C4/C5 (a data model with real relational complexity).
- **Impact / real-world value** - is there a genuine user/problem behind it, ideally a real sponsor who will actually use it.
- **Differentiation** - does it stand out at the oral defense compared to "yet another CRUD app"?
- **Risk** - technical or scope risks that could derail the timeline (lower score = higher risk).

### 2.4 Ranking

| Idea | Feasibility | RNCP alignment | Impact | Differentiation | Risk (low=risky) | **Total /25** |
|------|:---:|:---:|:---:|:---:|:---:|:---:|
| **BoxTrack** | 4 | 5 | 5 | 5 | 4 | **23** |
| ShiftEase | 4 | 3 | 3 | 2 | 4 | 16 |
| StudyDeck | 5 | 3 | 3 | 2 | 5 | 18 |
| LocalLoop | 3 | 3 | 3 | 2 | 2 | 13 |

**Notes on ranking:**
- *LocalLoop* scored lowest: trust/liability concerns around real lending, geolocation complexity, and a two-sided marketplace is a lot of scope risk for a 10-week solo-pair project.
- *ShiftEase* and *StudyDeck* are both feasible and safe, but generic - a scheduling tool or a flashcard app is a well-worn student-project pattern with little to differentiate it at the defense, and neither has a real external sponsor.
- *BoxTrack* has the same underlying pattern as ShiftEase/StudyDeck (admin CRUD → public read-only view → real-time shared screen) but wraps it around a **real client with a real, described need** (Timothé Garde, CrossFit LAB) and a **genuinely demanding UI constraint** (the `/screen` broadcast view, readable at 5–8m on a gym TV), which pushes the CSS/UX work (C1, C2) well beyond a standard responsive layout.

### 2.5 Front-end / Back-end Split During This Phase

Even though both members share full-stack ownership over the project as a whole (see [1. Team Formation](#1-team-formation)), the brainstorming and evaluation work itself was split by concern so each idea got looked at from both a UI-feasibility and a data/API-feasibility angle before scoring it:

| Concern | Owner | Focus during brainstorming & evaluation |
|---|---|---|
| **Front-end / UX feasibility** | Kevin Rigal | Sketched what each idea's key screens would look like (public views, admin forms, and - decisive for BoxTrack - the `/screen` broadcast view), and judged the *Feasibility* and *Differentiation* scores from a UI-complexity standpoint (e.g. flagging that BoxTrack's TV view is harder than a standard dashboard, but also more impressive). |
| **Back-end / data feasibility** | Panaki Gillot | For each idea, sketched a rough data model (entities, relations) and judged how naturally it would cover C4/C5/C6 (database design, data access, authentication/API), which is what pushed *RNCP alignment* down for ShiftEase/StudyDeck (thinner relational model) and up for BoxTrack (`users`/`athletes`/`wods`/`scores` with real constraints). |
| **Risk assessment** | Both (joint session) | Scored *Risk* together on a call, cross-checking each other's front-end and back-end read to avoid one side underestimating the other's workload. |

This split carried into the ranking discussion: BoxTrack was the idea both members independently rated highest on their respective side (UI ambition on the front-end side, data-model depth on the back-end side), which reinforced the final decision.

---

## 3. Decision & Refinement - Selected MVP: BoxTrack

### 3.1 Problem

CrossFit LAB currently manages its daily life - the Workout Of the Day (WOD), athlete scores, and the leaderboard shown on the gym's TV - through scattered, manual tools (spreadsheets, whiteboards, WhatsApp). This is slow to update, error-prone, not visible in real time during class, and gives the coach no structured history of athlete performance over time.

### 3.2 Solution

BoxTrack centralizes these three needs in one web application:
1. The coach publishes and edits the daily WOD (type, description, target time).
2. Athletes' scores are recorded by the coach right after class, categorized RX/Scaled/Modified.
3. A leaderboard is computed automatically and displayed publicly - including on a dedicated `/screen` route designed for the gym's TV, refreshing itself via polling with no manual reload.

### 3.3 Target Audience / Users

- **Primary sponsor / admin (Coach):** Timothé Garde, owner of CrossFit LAB - manages WODs, scores, and athletes.
- **Visitors (public, no account):** members and prospects checking the WOD of the day, the leaderboard, or the historical results, from a phone or the gym's screen.
- **Athletes (optional, out-of-MVP-scope stretch):** could eventually get a personal login to see their own history.

### 3.4 Type of Application

A **responsive web application** (mobile-first for the public/admin views), including one **non-standard broadcast-style view** (`/screen`) explicitly designed for large-format TV/projector display (16:9, 1080p→4K), not just a scaled-up mobile page. No native mobile or desktop app is in scope.

### 3.5 Why This Idea Over the Others

- It is the only idea backed by a **real external sponsor** with a described, concrete need - we validate against an actual person's daily use case, not an assumed persona.
- It naturally covers **all 7 RNCP blocks** with genuine depth rather than a superficial checkbox: a real relational data model (C4/C5: `users`, `athletes`, `wods`, `scores`, with a `UNIQUE(wod_id, athlete_id)` constraint and a ranking index), real-time front-end behavior (C3: polling leaderboard), and authentication with role separation (C6: coach vs. public).
- The `/screen` requirement forces genuinely advanced, non-trivial CSS (C1/C2: `clamp()`, viewport units, strict WCAG AAA contrast, zero-scroll 16:9 layout) which is a stronger technical demonstration than a standard responsive dashboard, and gives us a high-impact live demo at the oral defense.
- Its scope is naturally boundable (see 3.7) without feeling artificially cut down, which matters for a fixed 10-week timeline with 2 people.

### 3.6 Key Features & SMART Goals

1. **Coach WOD & score management**
   *By the end of Sprint 3 (week 5), the coach can create, edit, and delete a WOD and record athlete scores through authenticated CRUD forms, with the leaderboard for that WOD re-ranking automatically on every save - validated with at least 5 seeded WODs and 10 seeded athletes.*

2. **Public leaderboard & broadcast `/screen` view**
   *By the end of Sprint 4 (week 7), the `/screen` route displays the current WOD and a leaderboard that refreshes via polling every 30 seconds without a manual reload, remains fully readable within a 16:9 viewport with zero scrolling from 1080p to 4K, and passes a WCAG AAA contrast check.*

3. **Secure, role-based access**
   *By the end of Sprint 5 (week 8), all admin routes (WOD, score, athlete management) are protected behind JWT-based authentication with bcrypt-hashed passwords, verified by at least 3 Postman tests confirming that unauthenticated requests to admin endpoints are rejected (401/403), while public GET endpoints (WOD, leaderboard, history) remain accessible without a login.*

### 3.7 Scope

**In-scope (MVP):**
- WOD CRUD (coach only), one active WOD per date.
- Score entry per athlete per WOD, with RX/Scaled/Modified categorization, editable by the coach.
- Auto-computed leaderboard per WOD.
- Public, no-login views: WOD of the day, leaderboard, historical WODs/scores.
- Dedicated `/screen` broadcast route with auto-polling leaderboard.
- Athlete management (add/edit/deactivate) by the coach - no self-registration.
- Coach authentication (JWT) and protected admin routes.
- Coach dashboard (today's WOD, latest scores, active athletes, quick actions).
- Deployment to a public HTTPS URL.

**Out-of-scope (MVP):**
- Native mobile app (iOS/Android) - web-responsive only.
- Athlete self-service accounts / self-registration.
- Payments, class booking, or membership/subscription management.
- Advanced analytics (progress charts beyond simple history, PR tracking algorithms, coaching insights/AI recommendations).
- Push notifications or email/SMS alerts.
- Multi-box / multi-tenant support (the app targets one box: CrossFit LAB).

### 3.8 Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Limited prior experience with advanced/broadcast-scale CSS (`clamp()`, strict 16:9 no-scroll layout) | Prototype the `/screen` view early in Figma (Sprint 1–2) and timebox a dedicated learning/spike session before implementation starts in Sprint 4. |
| Real-time polling and leaderboard re-ranking logic adds front-end/back-end complexity | Start with the simplest possible polling implementation (fixed interval `fetch`) before considering optimizations; keep ranking computed server-side via one indexed SQL query. |
| Tight 10-week timeline shared across 2 people with overlapping full-stack roles | Maintain a strict MoSCoW-prioritized Trello backlog, weekly re-planning, and split feature ownership per sprint to avoid duplicated or blocked work. |
| Deployment/HTTPS/environment configuration issues discovered too late | Deploy a minimal skeleton to Railway/Render as early as Sprint 2, not only at the end, so infrastructure issues surface early. |
| Scope creep (e.g. adding the optional athlete portal or analytics mid-project) | Explicitly track "nice-to-have" ideas in a separate Trello "Icebox" list, reviewed only after all in-scope MVP features are done. |
| Coordination gaps between two members both working full-stack | Daily async Discord updates + mandatory PR review before merge to `main`, so both members stay aware of the current state of the codebase. |

---

## 4. Summary

**BoxTrack** is a web application built for CrossFit LAB (Toulouse) that replaces the box's scattered spreadsheets and messaging-app workflow with a single real-time source of truth for the daily WOD, athlete scores, and the leaderboard. The coach, Timothé Garde, gets a protected admin space to publish workouts, record scores, and manage athletes; members and visitors get free public access to the WOD, the leaderboard, and historical results, including a broadcast-style `/screen` route purpose-built for the gym's TV.

We selected this idea over three alternatives (ShiftEase, StudyDeck, LocalLoop) because it is the only one grounded in a real sponsor and a real, described daily-life problem, it maps naturally onto all seven RNCP competency blocks with genuine depth (relational data model, real-time UI, authenticated API), and its `/screen` requirement gives us a demanding, high-impact technical challenge - advanced responsive CSS at broadcast scale - that will be the standout moment of our oral defense.

Beyond the school evaluation, the project has a direct real-world impact: if the deployed MVP genuinely fits CrossFit LAB's daily routine, Timothé Garde can keep using it after the defense, making this a project with a life beyond the classroom rather than a throwaway exercise.
