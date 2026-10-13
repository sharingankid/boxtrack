# BoxTrack - Project Charter

> **Portfolio Project - Project Planning (Stage 2 - France)**
> DWWM end-of-year project (RNCP 37674).
> Covers Task 0 (develop a high-level plan) and Task 1 (share your project planning - the Project
> Charter). Builds on [01-idea-development.md](01-idea-development.md) (Stage 1, completed), where
> team formation, technical roles, stakeholders, objectives, and scope are defined in full.

---

## 1. Project Charter Summary

Team formation and roles definition (initial meeting, temporary PM, technical roles rationale,
stakeholders) is a **Stage 1** deliverable and is fully detailed in
[01-idea-development.md, section 1](01-idea-development.md#1-team-formation). The table below
consolidates every charter element into one reference point for Stage 2 onward, without duplicating
content that already lives in the Stage 1 document.

| Charter element | Summary | Full detail |
|---|---|---|
| **Team & Technical Roles** | 2-person team, shared full-stack. Kevin Rigal is temporary Project Manager and Back-end/Data lead; Panaki Gillot is Front-end/UX lead (reassigned after Stage 1, confirmed 2026-10-05). | [01-idea-development.md §1](01-idea-development.md#1-team-formation) |
| **Stakeholders** | Timothé Garde (client/sponsor), the project team, DWWM tutor(s), the examination jury, and CrossFit LAB's athletes/members. | [01-idea-development.md §1.4](01-idea-development.md#14-stakeholders) |
| **Problem & Solution** | Centralize the daily session (Warm-Up, Skill/Strength, WOD) and its public/TV display for CrossFit LAB - per the official cahier des charges v1.0. Scores/leaderboard, athlete management, Announcements, and QR Codes are Optional. | [01-idea-development.md §3.1-3.2](01-idea-development.md#31-problem) |
| **Objectives (SMART goals)** | Full session WOD entry, 3 phases/6 formats (wk 5); public WOD display + history (wk 6); broadcast `/screen` (wk 7); secure admin access (wk 8). | [01-idea-development.md §3.6](01-idea-development.md#36-key-features--smart-goals) |
| **Scope** | Core/Optional/Out-of-scope boundaries: web-responsive MVP for one box, no native app, no self-registration, no payments. | [01-idea-development.md §3.7](01-idea-development.md#37-scope) |
| **Risks** | 7 identified risks with mitigations (CSS complexity, WOD data-model complexity, scope-order discipline, tight timeline, deployment, scope creep, coordination). | [01-idea-development.md §3.8](01-idea-development.md#38-risks--mitigation) |

---

## 2. High-Level Plan

### 2.1 Stages

| Stage | Status | Weeks | Key milestones / deliverables |
|---|---|---|---|
| **1. Idea Development** | Completed | Week 1 | `docs/01-idea-development.md`: team formation, brainstorming, MVP decision (BoxTrack), SMART goals, scope, risks. |
| **2. Project Planning** | Current | Week 2 | `docs/02-project-charter.md` (this document): Project Charter consolidating the team/scope/risks with the high-level plan/timeline. Notion backlog structured by MoSCoW, Core tier ordered ahead of Optional. |
| **3. Technical Documentation** | Upcoming | Weeks 2-3 | Figma wireframes + clickable prototype (incl. `/screen`), MCD/MLD, SQL schema + seed script, initial Postman collection skeleton. |
| **4. MVP Development** | Upcoming | Weeks 3-9 | Auth + Core WOD API/phases (wks 3-5); public WOD view + history + `/screen` broadcast (wks 5-7); Optional tier if Core is demoed on time - scores/leaderboard, athletes, Announcements, QR Codes (wks 7-8); hardening, bugfixing, deployment rehearsal (wks 8-9). |
| **5. Project Closure** | Upcoming | Week 10 | Final HTTPS deployment, README finalized, Postman collection exported, defense slides, `/screen` demo rehearsal, oral defense. |

> **Note on the week numbers above:** these Stages are the formation's own checkpoints, so their
> boundaries don't line up exactly with the sprint cadence below (§2.2) - for example, wireframe
> work continues briefly into Stage 4's first days, and deployment work actually starts a few days
> before the formal "Closure" week. The sprint table is the more precise, day-to-day schedule.

### 2.2 Timeline (Gantt-style)

```
Week                 1    2    3    4    5    6    7    8    9   10
Stage 1 Idea Dev     ##
Stage 2 Planning          ##
Stage 3 Tech Docs         ####
Stage 4 MVP Dev                ####################### 
Stage 5 Closure                                          ####  ##
```

This maps onto the detailed sprint-level view:

| Sprint | Focus | Weeks |
|---|---|---|
| S1 | Scoping & design (user stories, MoSCoW, ERD - database diagram - incl. WOD phases/movements, wireframes for all 5 required views incl. `/screen`) | 1-2 |
| S2 | Setup & database (high-fidelity Figma, repo init, SQL schema + seed covering `wods`/warmup/skill-strength/WOD blocks/movements) | 2-3 |
| S3 | Back-end core (auth, Core WOD CRUD API - 3 phases, 6 formats) | 3-5 |
| S4 | Front-end - admin session form (Warm-Up/Skill-Strength/WOD builder), public WOD view + history nav, `/screen` broadcast (Warm-Up -> Skill -> WOD) - all responsive on mobile and desktop | 5-7 |
| S5 | Optional tier, only once Core is demoed end-to-end: score entry + leaderboard, athlete management, Announcements, QR Codes | 7-8 |
| S6 | Deployment & finalization (tests, HTTPS deploy, README, Postman, demo prep) | 9-10 |

### 2.3 Key Milestones

- **End of Week 2:** Project Charter approved, Figma wireframes started for all 5 required views (public WOD, admin WOD form, `/screen`, Announcements, QR Codes), ERD (database diagram) drafted.
- **End of Week 3:** SQL schema + seed script committed; back-end scaffolding (auth) in place.
- **End of Week 5:** Core WOD API complete (3 phases, 6 formats), ready for the admin form to connect to.
- **End of Week 6:** Admin session form live - coach can create/edit/delete a full session (Warm-Up + Skill/Strength + WOD, any of 6 formats) in under 5 minutes (SMART goal 1, see Stage 1 doc); public WOD view live with history navigation, both responsive on mobile and desktop (SMART goal 2).
- **End of Week 7:** `/screen` broadcast view live, fullscreen 16:9, WCAG AAA (strict color-contrast/accessibility standard) (SMART goal 3). **Core V1 demoed end-to-end - gate before any Optional work starts.**
- **End of Week 8:** Admin space fully protected behind authenticated sessions (SMART goal 4); Optional tier (scores/leaderboard, athletes, Announcements, QR Codes) attempted only from here if the schedule allows.
- **End of Week 9:** Application deployed to a public HTTPS URL, feature-complete.
- **End of Week 10:** Final defense - live `/screen` demo, documentation, and Postman collection delivered.

---

## 3. Summary

This Project Charter is the single reference point for Stage 2 onward: it consolidates the team,
roles, stakeholders, problem, objectives, scope, and risks already defined in Stage 1 (section 1
above), and adds what Stage 2 actually produces - a week-by-week high-level plan that turns the
Stage 1 SMART goals and scope into a concrete 10-week schedule ending in the oral defense. It is the
reference point for Stage 3 (Technical Documentation) and Stage 4 (MVP Development), which should be
planned as Notion epics directly against the stages and milestones listed above.
