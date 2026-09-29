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
| **Version control** | Git + GitHub (feature branches, pull requests reviewed by the other member before merge into `dev`; tested sprint releases are then merged into `main`) |
| **Documentation** | Markdown files in the repository (`/docs`), Figma for wireframes/prototype |
| **Working norms** | Short daily async update on Discord (what was done / blockers / next), weekly planning session to groom the Trello backlog against the 10-week schedule, PR review required before merge, commit messages in English following Conventional Commits style |

### 1.4 Stakeholders

| Stakeholder | Role | Impact on the project |
|---|---|---|
| **Timothé Garde** | Client / sponsor (commanditaire) - owner & coach, CrossFit LAB | High - defines the real-world requirements, validates the core WOD publishing workflow and the `/screen` TV view, prioritizes optional features, and is the intended long-term user after the defense. |
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
| External stakeholder input | Timothé Garde | Confirmed the CrossFit LAB context, the need for simple coach usage, public WOD display, and a TV-ready view; optional features remain secondary to a reliable core. |

We then combined three brainstorming techniques to generate and stress-test ideas:

- **Mind Mapping** - starting from "tools that centralize daily life for a small local business," branching into verticals (sports coaching, retail, community lending, education).
- **"How Might We" questions** - e.g. *"How might we help a small business owner replace scattered spreadsheets/WhatsApp with one real-time source of truth?"*, *"How might we make a shared physical space (a gym, a shop, a classroom) feel alive through a shared screen?"*
- **SCAMPER** - applied to the "leaderboard on a screen" concept: *Put to another use* (a gym scoreboard → a retail queue display → a classroom quiz board), *Combine* (scheduling + scoring + leaderboard in one tool), *Adapt* (broadcast-style TV UI adapted from esports/game-show leaderboards).

### 2.2 Ideas Considered

| # | Idea | Short description |
|---|------|--------------------|
| 1 | **BoxTrack** | Web app for a CrossFit box: structured daily WOD authoring, a public no-login view, protected coach administration, WOD history, and a dedicated broadcast-style `/screen` route for the gym's TV. Athlete scores and leaderboards are possible second-phase extensions. |
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
- *BoxTrack* has the same underlying pattern as ShiftEase/StudyDeck (admin CRUD → public read-only view → shared screen) but wraps it around a **real client with a real, described need** (Timothé Garde, CrossFit LAB) and a **genuinely demanding UI constraint** (the `/screen` broadcast view, readable at 5–8m on a gym TV), which pushes the CSS/UX work (C1, C2) well beyond a standard responsive layout.

### 2.5 Front-end / Back-end Split During This Phase

Even though both members share full-stack ownership over the project as a whole (see [1. Team Formation](#1-team-formation)), the brainstorming and evaluation work itself was split by concern so each idea got looked at from both a UI-feasibility and a data/API-feasibility angle before scoring it:

| Concern | Owner | Focus during brainstorming & evaluation |
|---|---|---|
| **Front-end / UX feasibility** | Kevin Rigal | Sketched what each idea's key screens would look like (public views, admin forms, and - decisive for BoxTrack - the `/screen` broadcast view), and judged the *Feasibility* and *Differentiation* scores from a UI-complexity standpoint (e.g. flagging that BoxTrack's TV view is harder than a standard dashboard, but also more impressive). |
| **Back-end / data feasibility** | Panaki Gillot | For each idea, sketched a rough data model (entities, relations) and judged how naturally it would cover C4/C5/C6 (database design, data access, authentication/API), which pushed *RNCP alignment* down for ShiftEase/StudyDeck and up for BoxTrack (coach users, structured WODs and session phases, with athletes/scores available as a later relational extension). |
| **Risk assessment** | Both (joint session) | Scored *Risk* together on a call, cross-checking each other's front-end and back-end read to avoid one side underestimating the other's workload. |

This split carried into the ranking discussion: BoxTrack was the idea both members independently rated highest on their respective side (UI ambition on the front-end side, data-model depth on the back-end side), which reinforced the final decision.

### 2.6 Challenges and Opportunities Identified During Evaluation

| Idea | Main challenge / risk | Opportunity | Decision |
|---|---|---|---|
| **BoxTrack** | Learning the CrossFit vocabulary, designing a complete WOD form that remains quick to use, and guaranteeing a zero-scroll TV layout. | Real sponsor, immediate daily value, strong full-stack coverage, and an unusual live demonstration. | **Selected**, with a deliberately reduced core and optional features deferred. |
| **ShiftEase** | Scheduling conflicts, labour-rule edge cases, and permissions can expand quickly. | Clear operational value for small teams. | Rejected because the use case was less differentiated and had no confirmed sponsor. |
| **StudyDeck** | Easy to build a basic version but difficult to distinguish it from many existing flashcard products. | Low delivery risk and good mobile potential. | Rejected because it offered less relational and UX depth for the final defence. |
| **LocalLoop** | Trust, liability, availability conflicts, moderation, and geolocation create marketplace-level scope. | Strong community impact if operated at scale. | Rejected because it was too risky for two learners in the available time. |

---

## 3. Decision & Refinement - Selected MVP: BoxTrack

### 3.1 Problem

CrossFit LAB currently publishes and presents its sessions through scattered, manual tools such as
WhatsApp, a whiteboard, and spreadsheets. The coach has no dedicated interface for creating a
complete CrossFit session, athletes do not have one clear public source for the WOD, and the gym TV
does not have an autonomous, readable display. The fragmented workflow is slow to update and can
produce inconsistent information before or during a class.

### 3.2 Solution

BoxTrack centralizes the core session workflow in one web application:

1. An authenticated coach creates and edits a complete CrossFit session in less than five minutes:
   date/time, warm-up, skill or strength work, WOD format, movements, repetitions, duration or
   objective, and coach notes.
2. Athletes and visitors access the WOD of the day without logging in and can navigate to previous
   WODs.
3. A dedicated `/screen` route presents the same session on a gym TV with a high-contrast, 16:9,
   zero-scroll layout requiring no interaction.

Athlete management, score entry, RX/Scaled/Modified categories, and an automatic leaderboard remain
valuable **Phase 2** features, but the sponsor specification does not make them prerequisites for the
first reliable release.

### 3.3 Target Audience / Users

- **Primary sponsor / admin (Coach):** Timothé Garde, owner of CrossFit LAB - creates, edits, and publishes structured WODs.
- **Other coaches (admin users):** use the same simple workflow from a phone without technical training.
- **Visitors (public, no account):** members and prospects checking today's or a previous WOD from a phone or computer.
- **Gym audience:** athletes viewing the autonomous `/screen` display during a class.
- **Athletes with personal data (optional, out of the core MVP):** may be managed for scores and leaderboards in Phase 2; self-service accounts remain out of scope.

### 3.4 Type of Application

A **responsive web application** (mobile-first for the public/admin views), including one **non-standard broadcast-style view** (`/screen`) explicitly designed for large-format TV/projector display (16:9, 1080p→4K), not just a scaled-up mobile page. No native mobile or desktop app is in scope.

### 3.5 Why This Idea Over the Others

- It is the only idea backed by a **real external sponsor** with a described, concrete need - we validate against an actual person's daily use case, not an assumed persona.
- It naturally covers **all 7 RNCP blocks** with genuine depth rather than a superficial checkbox: a structured relational WOD model (C4/C5), responsive public/admin interfaces and an autonomous TV view (C1/C2/C3), and authentication with role separation (C6: coach vs. public). Optional athlete/score entities can extend this model after the core is reliable.
- The `/screen` requirement forces genuinely advanced, non-trivial CSS (C1/C2: `clamp()`, viewport units, strict WCAG AAA contrast, zero-scroll 16:9 layout) which is a stronger technical demonstration than a standard responsive dashboard, and gives us a high-impact live demo at the oral defense.
- Its scope is naturally boundable (see 3.7) without feeling artificially cut down, which matters for a fixed 10-week timeline with 2 people.

### 3.6 Key Features & SMART Goals

1. **Fast, complete WOD authoring**
   *By the end of Sprint 3 (week 5), an authenticated coach can create and edit a complete session - warm-up, skill/strength, WOD details, date and class time - in under five minutes, validated through a timed usability test and at least five realistic seeded WODs.*

2. **Public WOD and broadcast `/screen` view**
   *By the end of Sprint 4 (week 7), the published WOD is accessible without login on mobile and desktop, previous WODs are reachable through simple navigation, and `/screen` displays the current session with zero scrolling at 1920x1080, readable from 5-8 metres and passing a high-contrast accessibility check.*

3. **Secure, reliable administration**
   *By the end of Sprint 5 (week 8), all create/update admin routes are protected by authenticated coach access with hashed passwords, while public WOD endpoints remain readable without login; automated tests verify successful login, invalid credentials, and rejection of unauthenticated admin requests.*

### 3.7 Scope

**In-scope (MVP):**
- Structured WOD create/read/update workflow for authenticated coaches.
- Warm-up description/objective; skill or strength type, movements, sets/loads, and instructions;
  WOD format, movements/reps, duration or objective, and coach notes.
- Session date and class time.
- Public, no-login views for today's WOD and previous WODs.
- Dedicated autonomous `/screen` route: 16:9, high contrast, no navigation, and no scrolling.
- Email/password coach authentication, persistent session, explicit logout, and protected admin routes.
- Responsive public and admin views on smartphone and desktop.
- Deployment to a public HTTPS URL.
- Realistic demonstration data, database creation script, README, and `.env.example` without secrets.

**Phase 2 (only after the core MVP is reliable):**
- Athlete management (add/edit/deactivate) by the coach.
- Score entry per athlete and WOD with RX/Scaled/Modified categorization.
- Automatic leaderboard and optional polling on `/screen`.
- Coach-managed announcements.
- Configurable QR-code screen.

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
| The WOD form becomes too long or technical for daily coach use | Prototype the form before implementation, use the sponsor's CrossFit vocabulary, test the complete flow on a phone, and require completion in under five minutes. |
| The team implements optional scores/leaderboards before the core is reliable | Keep optional items in a separate Phase 2 backlog and start them only after the core acceptance criteria pass. |
| Tight 10-week timeline shared across 2 people with overlapping full-stack roles | Maintain a strict MoSCoW-prioritized Trello backlog, weekly re-planning, and split feature ownership per sprint to avoid duplicated or blocked work. |
| Deployment/HTTPS/environment configuration issues discovered too late | Deploy a minimal skeleton to Railway/Render as early as Sprint 2, not only at the end, so infrastructure issues surface early. |
| Scope creep (e.g. adding the optional athlete portal or analytics mid-project) | Explicitly track "nice-to-have" ideas in a separate Trello "Icebox" list, reviewed only after all in-scope MVP features are done. |
| Coordination gaps between two members both working full-stack | Daily async Discord updates + mandatory PR review before merge to `dev`, so both members stay aware of the full codebase. |

### 3.9 Opportunities and Validation Strategy

- **Immediate operational value:** one publication replaces several manual channels and can be reused daily.
- **Strong demonstration value:** the same WOD can be created in admin and shown immediately on the public and TV views during the defence.
- **Progressive delivery:** athlete scores, announcements, and QR codes can be added independently after the core without redesigning the product.
- **Real stakeholder feedback:** weekly Friday reviews with Timothé Garde allow vocabulary, form speed, readability, and optional-feature priority to be validated early.
- **Potential life after school:** a reliable single-box release can remain in real use and later become the basis for a broader product, without making multi-box support part of the current MVP.

---

## 4. Stage 1 Requirements Traceability

| Holberton task | Required evidence | Where it is documented |
|---|---|---|
| **Task 0 - Team formation & roles** | Members, initial/technical roles, rationale, collaboration norms, tools, stakeholders | Sections 1.1-1.4 |
| **Task 1 - Brainstorming & idea evaluation** | Individual/group research, methods, ideas, criteria, ranking, challenges and risks | Sections 2.1-2.6 |
| **Task 2 - Decision & refinement** | Selected MVP, problem, solution, users, application type, rationale, 2-3 SMART goals, scope, risks/mitigations | Sections 3.1-3.9 |
| **Task 3 - Documentation** | One structured report summarizing the complete idea-development process | This document, sections 1-5 |

Before requesting manual review, the team verifies that the GitHub URL points to this file on the
submitted branch, all tables render correctly, and the scope matches the sponsor specification.

---

## 5. Summary

**BoxTrack** is a web application built for CrossFit LAB (Toulouse) that replaces a fragmented
WhatsApp, whiteboard, and spreadsheet workflow with one reliable source for structured daily WODs.
The coach gets a protected, mobile-friendly admin space; members and visitors get public access to
today's and previous WODs; and the gym gets a broadcast-style `/screen` route designed for its TV.
Athlete management, scores, leaderboards, announcements, and QR codes remain extensions after the
core workflow is reliable.

We selected this idea over three alternatives (ShiftEase, StudyDeck, LocalLoop) because it is the
only one grounded in a real sponsor and a described daily problem, it maps naturally onto all seven
RNCP competency blocks with genuine depth, and its `/screen` requirement creates a demanding,
high-impact UX challenge that will be a strong demonstration during the oral defence.

Beyond the school evaluation, the project has a direct real-world impact: if the deployed MVP genuinely fits CrossFit LAB's daily routine, Timothé Garde can keep using it after the defense, making this a project with a life beyond the classroom rather than a throwaway exercise.
