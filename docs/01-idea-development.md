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
| **Temporary Project Manager** | Kevin Rigal - coordinates planning and documentation, and keeps the Notion backlog groomed against the 10-week schedule during Stage 1-2. A coordination role, not a hierarchy: technical decisions are still made jointly, and the role can rotate in later stages if the team decides it should. |
| **Client / Sponsor (commanditaire)** | Timothé Garde, owner of CrossFit LAB (Toulouse) |

### 1.2 Technical Roles & Rationale

Both members are trained and evaluated as full-stack developers (RNCP 37674 requires each person to
individually cover all 7 competency blocks), so neither is restricted to a single layer for the whole
project. To avoid two people redundantly re-deciding the same UI or data questions, each carries a
**lead** role on the side they showed stronger affinity for during the Stage 1 brainstorming (see
[section 2.5](#25-front-end--back-end-split-during-this-phase) below):

| Member | Technical role | Why this split |
|---|---|---|
| **Kevin Rigal** | Fullstack developer - **Back-end / Data lead** | Leads the database schema, the REST API, and authentication. Reassigned after Stage 1 (confirmed 2026-10-05) - during brainstorming Kevin had owned the front-end/UX read (see [§2.5](#25-front-end--back-end-split-during-this-phase)), but technical leads were swapped once implementation started. |
| **Panaki Gillot** | Fullstack developer - **Front-end / UX lead** | Leads the Figma prototype, the responsive CSS work, and the `/screen` broadcast view - the project's most demanding UI requirement. Reassigned after Stage 1 (confirmed 2026-10-05) - during brainstorming Panaki had owned the data-model read (see [§2.5](#25-front-end--back-end-split-during-this-phase)). |

Both members still implement across the stack on every sprint; when a decision needs a single owner
to move fast, it defaults to the lead above.

### 1.3 Communication, Collaboration & Working Norms

| | |
|---|---|
| **Communication tool** | Discord (main channel with the team **and the sponsor**, Timothé Garde - daily check-ins, quick decisions, questions, and out-of-meeting validations) |
| **Task tracking tool** | Notion (backlog, meeting notes, progress tracking, internal team documentation) |
| **Shared resources** | Google Drive (exported mockups, reference documents, screenshots, materials shared with the sponsor) |
| **Version control** | Git + GitHub (feature branches, pull requests reviewed by the other member before merge into `dev`; validated sprint releases are then merged into `main`) |
| **Documentation** | Markdown files in the repository (`/docs`), Figma for wireframes/prototype |
| **Weekly sync** | Fixed day: Friday afternoon, indicative time ~14:30 (adjustable by agreement). Agenda: progress · blockers · validations · next step. Timothé Garde is available on Discord for feedback/validation outside formal meetings. |
| **Working norms** | Short daily async update on Discord (what was done / blockers / next), Notion backlog groomed at the Friday sync against the 10-week schedule, PR review required before merge, commit messages in English following Conventional Commits style |

### 1.4 Stakeholders

| Stakeholder | Role | Impact on the project |
|---|---|---|
| **Timothé Garde** | Client / sponsor (commanditaire) - owner & coach, CrossFit LAB | High - defines the real-world requirements, validates the Core V1 WOD workflow and `/screen` TV view, prioritizes optional features, and is the intended long-term user after the defense. |
| **Kevin Rigal & Panaki Gillot** | Project team - developers | High - responsible for design, development, testing, and delivery of the MVP within the 10-week timeline. |
| **DWWM formation tutor(s)** *(Thomas Jondeau, Sofian Messaoui)* | Pedagogical supervisor | Medium - reviews progress against the RNCP 37674 blocks, gives technical guidance and unblocks methodology questions during the formation. |
| **Examination jury (soutenance)** | External evaluator | High at defense time - certifies competency validation based on the live demo (especially the `/screen` view), the documentation, and the Q&A. |
| **CrossFit LAB athletes/members** | Indirect end users | Medium - consume the public WOD and TV view; their usability feedback (clarity on mobile and readability from 5-8m) validates whether the MVP solves the stated problem. |

---

## 2. Brainstorming & Idea Evaluation

### 2.1 Method

Research was divided between individual investigation and a joint comparison session. The team also
used the sponsor meeting notes and the supplied CrossFit LAB functional specification as primary
evidence rather than inventing requirements for the selected project.

| Research activity | Owner | Result used in the decision |
|---|---|---|
| User and operational research | Both | Reviewed the sponsor's description of the current WhatsApp, whiteboard, and spreadsheet workflow and identified the need for one reliable source of truth. |
| Front-end and UX feasibility research | Kevin | Compared the principal screens required by each idea and assessed responsive, form, and large-screen constraints. For BoxTrack, the 16:9 `/screen` route was identified as the main UI challenge and differentiator. |
| Back-end and data feasibility research | Panaki | Sketched the main entities, relationships, access rules, and authentication needs for every idea. This exposed marketplace risk for LocalLoop and stronger relational depth for BoxTrack. |
| Group evaluation session | Both | Agreed on shared criteria, scored every idea, challenged each other's estimates, and selected BoxTrack only after comparing totals and risks. |
| External stakeholder input | Timothé Garde | Confirmed the CrossFit LAB context, the need for simple coach usage, public WOD display, and a TV-ready view; optional features remain secondary to a reliable Core V1. |

We combined three techniques to generate and stress-test ideas:

- **Mind Mapping** - starting from "tools that centralize daily life for a small local business," branching into verticals (sports coaching, retail, community lending, education).
- **"How Might We" questions** - e.g. *"How might we help a small business owner replace scattered spreadsheets/WhatsApp with one real-time source of truth?"*, *"How might we make a shared physical space (a gym, a shop, a classroom) feel alive through a shared screen?"*
- **SCAMPER** - applied to the "leaderboard on a screen" concept: *Put to another use* (a gym scoreboard → a retail queue display → a classroom quiz board), *Combine* (scheduling + scoring + leaderboard in one tool), *Adapt* (broadcast-style TV UI adapted from esports/game-show leaderboards).

### 2.2 Ideas Considered

| # | Idea | Short description |
|---|------|--------------------|
| 1 | **BoxTrack** | Web app for a CrossFit box: daily multi-phase WOD publishing (Warm-Up, Skill/Strength, WOD) with a dedicated broadcast-style `/screen` route for the gym's TV, plus optional score entry (RX/Scaled/Modified) and an auto-ranked leaderboard if time allows. |
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

### 2.6 Challenges and Opportunities Identified During Evaluation

| Idea | Main challenge / risk | Opportunity | Decision |
|---|---|---|---|
| **BoxTrack** | Learning the CrossFit vocabulary, modelling three session phases across six WOD formats, keeping the coach form under five minutes, and guaranteeing a zero-scroll TV layout. | Real sponsor, immediate daily value, strong full-stack coverage, and an unusual live demonstration. | **Selected**, with a prioritized Core V1 and optional features deferred. |
| **ShiftEase** | Scheduling conflicts, labour-rule edge cases, and permissions can expand quickly. | Clear operational value for small teams. | Rejected because the use case was less differentiated and had no confirmed sponsor. |
| **StudyDeck** | Easy to build a basic version but difficult to distinguish it from many existing flashcard products. | Low delivery risk and good mobile potential. | Rejected because it offered less relational and UX depth for the final defence. |
| **LocalLoop** | Trust, liability, availability conflicts, moderation, and geolocation create marketplace-level scope. | Strong community impact if operated at scale. | Rejected because it was too risky for two learners in the available time. |

---

## 3. Decision & Refinement - Selected MVP: BoxTrack

### 3.1 Problem

CrossFit LAB currently manages its daily operations without any dedicated tool: the WOD (Workout Of the Day) is posted on WhatsApp, scores are noted on a whiteboard or a Google Sheet, and box announcements go out ad hoc on social media. This is slow to update, error-prone, not visible in real time during class, gives the coach no structured history, and scatters the box's communication across tools that were never built for it.

### 3.2 Solution

Per the official cahier des charges (v1.0, signed off by Timothé Garde), BoxTrack's V1 scope is deliberately narrow and prioritized:

**Core (must ship):**
1. The coach publishes each session's full structure - Warm-Up, Skill/Strength, and the WOD itself (format, movements, charges, notes) - from one admin form, in under 5 minutes, with no training required.
2. The session is displayed publicly (mobile + desktop, no login), each phase shown distinctly, with simple navigation to past sessions.
3. A dedicated `/screen` broadcast route projects the current session (Warm-Up -> Skill -> WOD) fullscreen on the gym's TV, readable from 5-8m, with zero interaction required.
4. The admin space is authentication-protected, cleanly separated from the public read-only views.

**Optional (if time permits):** score entry per athlete (RX/Scaled/Modified) with an auto-ranked leaderboard, athlete roster management, a box Announcements screen, and a QR Codes screen for the community's key links (Google reviews, Instagram, WhatsApp group, sign-ups).

### 3.3 Target Audience / Users

- **Primary sponsor / admin (Coach):** Timothé Garde, owner of CrossFit LAB - creates, edits, and publishes structured WODs.
- **Other coaches (admin users):** use the same simple workflow from a phone without technical training.
- **Visitors (public, no account):** members and prospects checking today's or a previous WOD from a phone or computer.
- **Gym audience:** athletes viewing the autonomous `/screen` display during a class.
- **Athletes with personal data (optional):** may be managed for scores and leaderboards after Core V1; self-service accounts remain out of scope.

### 3.4 Type of Application

A **responsive web application** (mobile-first for the public/admin views), including one **non-standard broadcast-style view** (`/screen`) explicitly designed for large-format TV/projector display (16:9, 1080p→4K), not just a scaled-up mobile page. No native mobile or desktop app is in scope.

### 3.5 Why This Idea Over the Others

- It is the only idea backed by a **real external sponsor** with a described, concrete need - we validate against an actual person's daily use case, not an assumed persona.
- It naturally covers **all 7 RNCP blocks** with genuine depth rather than a superficial checkbox: a real relational data model even before any optional feature is built (C4/C5: `users`, `wods` with their Warm-Up/Skill-Strength/WOD phases and per-phase movements across 6 supported formats), real-time-ish front-end behavior on `/screen` (C3), and authentication with role separation (C6: coach vs. public).
- The `/screen` requirement forces genuinely advanced, non-trivial CSS (C1/C2: `clamp()`, viewport units, strict WCAG AAA contrast, zero-scroll 16:9 layout, structured Warm-Up/Skill/WOD broadcast typography) which is a stronger technical demonstration than a standard responsive dashboard, and gives us a high-impact live demo at the oral defense.
- Its scope is naturally boundable (see 3.7) without feeling artificially cut down, which matters for a fixed 10-week timeline with 2 people.

### 3.6 Key Features & SMART Goals

These map directly onto the 4 CORE·V1 features from the official cahier des charges. Optional features (scores/leaderboard, athlete management, Announcements, QR Codes) are deliberately excluded from the SMART goals below - see [3.7 Scope](#37-scope) - and only get their own goals once all four are done and demoed.

1. **Full session WOD entry (Warm-Up + Skill/Strength + WOD)**
   *By the end of Sprint 3 (week 5), the coach can create, edit, and delete a full session - Warm-Up, Skill/Strength, and the WOD in any of the 6 supported formats (AMRAP, For Time, EMOM, Tabata, Chipper, Strength) - through one authenticated form, completing the entire flow in under 5 minutes without assistance, validated with at least 10 seeded realistic sessions covering every format.*

2. **Public WOD display with history navigation**
   *By the end of Sprint 4 (week 6), the public WOD view (mobile + desktop, no login) displays each phase distinctly with the format highlighted, movements/charges/instructions legible, and lets a visitor navigate to at least 4 weeks of past sessions.*

3. **Broadcast `/screen` view**
   *By the end of Sprint 4 (week 7), the `/screen` route displays the current session's Warm-Up -> Skill -> WOD structure fullscreen in a 16:9 layout with zero scrolling from 1080p to 4K, passes a WCAG AAA contrast check, and requires no interaction to function.*

4. **Secure admin access**
   *By the end of Sprint 5 (week 8), every admin route is protected behind authenticated sessions, verified by at least 3 Postman tests confirming unauthenticated requests are rejected (401/403), with a persistent session across reloads and an explicit logout, while public GET endpoints (WOD, history) remain accessible without a login.*

### 3.7 Scope

Per the official cahier des charges, V1 scope is split into a **Core** tier that must ship, and an **Optional** tier built only if time remains once Core is fully done and demoed.

**Core (must ship):**
- WOD entry (coach only): Warm-Up (general + specific), Skill/Strength (skill or strength, movements, charges/series, instructions), WOD (format - AMRAP/For Time/EMOM/Tabata/Chipper/Strength -, movements/reps, duration or objective, coach remarks), date and time slot. One session per date.
- Public, no-login WOD view: each phase shown distinctly, format highlighted, movements/charges/instructions legible, simple navigation to past sessions.
- Dedicated `/screen` broadcast route (Warm-Up -> Skill -> WOD, fullscreen, 16:9, no interaction, no scroll).
- Coach authentication (email + password), persistent session, explicit logout, protected admin routes.
- Deployment to a public HTTPS URL, usable by Timothé Garde without technical assistance.

**Optional (if time permits, after Core is done):**
- Score entry per athlete per WOD, RX/Scaled/Modified categorization, editable by the coach.
- Auto-computed leaderboard per WOD, optionally filterable by category.
- Athlete roster management (add/edit/deactivate) by the coach - no self-registration.
- Announcements screen (owner publishes box news/events, public + TV-ready display).
- QR Codes screen (owner manages labeled QR codes to community links, public + TV-ready display).
- Coach dashboard (today's session, quick actions) - supports the <5-minute creation goal but isn't itself a CDC line item.

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
| The Core WOD data model (3 phases x 6 formats) is more relationally complex than a flat WOD record, and could take longer than expected to design and build correctly | Lock the ERD in writing at the end of Sprint 2, reviewed jointly before any endpoint is built; reuse one generic `movements` table across the Skill/Strength and WOD phases instead of duplicating structures. |
| Team starts building the Optional tier (scores/leaderboard, Announcements, QR Codes) before the Core tier from the official CDC is fully done and demoed | Core V1 (WOD entry/display/`/screen`/auth) must be demoed end-to-end before any Optional feature starts; enforced as an explicit rule on the Notion board. |
| Tight 10-week timeline shared across 2 people with overlapping full-stack roles | Maintain a strict MoSCoW-prioritized Notion backlog, weekly re-planning at the Friday sync, and split feature ownership per sprint to avoid duplicated or blocked work. |
| Deployment/HTTPS/environment configuration issues discovered too late | Deploy a minimal skeleton to Railway/Render as early as Sprint 2, not only at the end, so infrastructure issues surface early. |
| Scope creep (e.g. adding the optional athlete portal or analytics mid-project) | Explicitly track "nice-to-have" ideas in a separate Notion "Icebox" list, reviewed only after all Core V1 features are done. |
| Coordination gaps between two members both working full-stack | Daily async Discord updates + mandatory PR review before merge to `dev`, so both members stay aware of the current state of the codebase. |

### 3.9 Opportunities and Validation Strategy

- **Immediate operational value:** one publication replaces several manual channels and can be reused daily.
- **Strong demonstration value:** the same WOD can be created in admin and shown immediately on the public and TV views during the defence.
- **Progressive delivery:** scores, athlete management, announcements, and QR codes can be added independently after Core V1 without redesigning the product.
- **Real stakeholder feedback:** weekly Friday reviews with Timothé Garde allow vocabulary, form speed, readability, and optional-feature priorities to be validated early.
- **Potential life after school:** a reliable single-box release can remain in real use and later become the basis for a broader product, without making multi-box support part of the current MVP.

---

## 4. Stage 1 Requirements Traceability

| Holberton task | Required evidence | Where it is documented |
|---|---|---|
| **Task 0 - Team formation & roles** | Members, initial and technical roles, rationale, collaboration norms, tools, stakeholders | Sections 1.1-1.4 |
| **Task 1 - Brainstorming & idea evaluation** | Individual and group research, methods, ideas, criteria, ranking, challenges and risks | Sections 2.1-2.6 |
| **Task 2 - Decision & refinement** | Selected MVP, problem, solution, users, application type, rationale, SMART goals, scope, risks and mitigations | Sections 3.1-3.9 |
| **Task 3 - Documentation** | One structured report summarizing the complete idea-development process | This document, sections 1-5 |

Before requesting manual review, the team verifies that the submitted GitHub URL points to this file
on `main`, all tables render correctly, and the scope matches the sponsor specification.

---

## 5. Summary

**BoxTrack** is a web application built for CrossFit LAB (Toulouse) that replaces WhatsApp/whiteboard/Google-Sheet chaos with a single source of truth for the daily session. Per the official cahier des charges (v1.0), the coach, Timothé Garde, gets a protected admin space to publish each session's full structure - Warm-Up, Skill/Strength, and the WOD itself, across 6 supported formats - in under 5 minutes without training; members and visitors get free public access to that session, with simple navigation to past ones, plus a broadcast-style `/screen` route purpose-built for the gym's TV. Score entry, an auto-ranked leaderboard, athlete management, an Announcements screen, and a QR Codes screen are explicitly Optional: valuable, but only built once the Core tier is fully done and demoed.

We selected this idea over three alternatives (ShiftEase, StudyDeck, LocalLoop) because it is the only one grounded in a real sponsor and a real, described daily-life problem, it maps naturally onto all seven RNCP competency blocks with genuine depth even on the Core tier alone (a relational WOD/phase/movement data model, real-time-ish `/screen` behavior, authenticated API), and its `/screen` requirement gives us a demanding, high-impact technical challenge - advanced responsive CSS at broadcast scale - that will be the standout moment of our oral defense.

Beyond the school evaluation, the project has a direct real-world impact: if the deployed MVP genuinely fits CrossFit LAB's daily routine, Timothé Garde can keep using it after the defense, making this a project with a life beyond the classroom rather than a throwaway exercise.
