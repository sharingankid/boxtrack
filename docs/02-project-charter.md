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
| **Team & Technical Roles** | 2-person team, shared full-stack. Kevin Rigal is temporary Project Manager and Front-end/UX lead; Panaki Gillot is Back-end/Data lead. | [01-idea-development.md §1](01-idea-development.md#1-team-formation) |
| **Stakeholders** | Timothé Garde (client/sponsor), the project team, DWWM tutor(s), the examination jury, and CrossFit LAB's athletes/members. | [01-idea-development.md §1.4](01-idea-development.md#14-stakeholders) |
| **Problem & Solution** | Centralize WOD publishing, score entry, and a real-time leaderboard - including a `/screen` broadcast view - for CrossFit LAB. | [01-idea-development.md §3.1-3.2](01-idea-development.md#31-problem) |
| **Objectives (SMART goals)** | Coach WOD/score management (wk 5); public leaderboard + `/screen` (wk 7); secure role-based access (wk 8). | [01-idea-development.md §3.6](01-idea-development.md#36-key-features--smart-goals) |
| **Scope** | In/out-of-scope boundaries: web-responsive MVP for one box, no native app, no self-registration, no payments. | [01-idea-development.md §3.7](01-idea-development.md#37-scope) |
| **Risks** | 6 identified risks with mitigations (CSS complexity, polling complexity, tight timeline, deployment, scope creep, coordination). | [01-idea-development.md §3.8](01-idea-development.md#38-risks--mitigation) |

---

## 2. High-Level Plan

### 2.1 Stages

| Stage | Status | Weeks | Key milestones / deliverables |
|---|---|---|---|
| **1. Idea Development** | Completed | Week 1 | `docs/01-idea-development.md`: team formation, brainstorming, MVP decision (BoxTrack), SMART goals, scope, risks. |
| **2. Project Planning** | Current | Week 2 | `docs/02-project-charter.md` (this document): Project Charter consolidating the team/scope/risks with the high-level plan/timeline. Trello backlog structured by MoSCoW. |
| **3. Technical Documentation** | Upcoming | Weeks 2-3 | Figma wireframes + clickable prototype (incl. `/screen`), MCD/MLD, SQL schema + seed script, initial Postman collection skeleton. |
| **4. MVP Development** | Upcoming | Weeks 3-9 | Auth + WOD/athlete CRUD + scoring API (wks 3-5); public views + `/screen` broadcast leaderboard (wks 5-7); admin dashboard + forms (wks 7-8); hardening, bugfixing, deployment rehearsal (wks 8-9). |
| **5. Project Closure** | Upcoming | Week 10 | Final HTTPS deployment, README finalized, Postman collection exported, defense slides, `/screen` demo rehearsal, oral defense. |

### 2.2 Timeline (Gantt-style)

```
Week                 1    2    3    4    5    6    7    8    9   10
Stage 1 Idea Dev     ##
Stage 2 Planning          ##
Stage 3 Tech Docs         ####
Stage 4 MVP Dev                ####################### 
Stage 5 Closure                                          ####  ##
```

This maps onto the more detailed sprint breakdown from the original project brief:

| Sprint | Focus | Weeks |
|---|---|---|
| S1 | Scoping & design (user stories, MoSCoW, MCD/MLD, wireframes incl. `/screen`) | 1-2 |
| S2 | Setup & database (high-fidelity Figma, repo init, SQL schema + seed) | 2-3 |
| S3 | Back-end core (auth, WOD/athlete CRUD, scores endpoint, ranked leaderboard) | 3-5 |
| S4 | Front-end - public views & `/screen` (WOD home, public leaderboard, broadcast polling) | 5-7 |
| S5 | Front-end - admin space (coach dashboard, WOD form, score entry, athlete management) | 7-8 |
| S6 | Deployment & finalization (tests, HTTPS deploy, README, Postman, demo prep) | 9-10 |

### 2.3 Key Milestones

- **End of Week 2:** Project Charter approved, Figma wireframes started, MCD/MLD drafted.
- **End of Week 3:** SQL schema + seed script committed; back-end scaffolding (auth) in place.
- **End of Week 5:** Coach can create a WOD and record scores end-to-end (SMART goal 1, see Stage 1 doc).
- **End of Week 7:** `/screen` broadcast view live with 30s polling (SMART goal 2).
- **End of Week 8:** Admin space fully protected behind JWT auth (SMART goal 3).
- **End of Week 9:** Application deployed to a public HTTPS URL, feature-complete.
- **End of Week 10:** Final defense - live `/screen` demo, documentation, and Postman collection delivered.

---

## 3. Summary

This Project Charter is the single reference point for Stage 2 onward: it consolidates the team,
roles, stakeholders, problem, objectives, scope, and risks already defined in Stage 1 (section 1
above), and adds what Stage 2 actually produces - a week-by-week high-level plan that turns the
Stage 1 SMART goals and scope into a concrete 10-week schedule ending in the oral defense. It is the
reference point for Stage 3 (Technical Documentation) and Stage 4 (MVP Development), which should be
planned as Trello epics directly against the stages and milestones listed above.
