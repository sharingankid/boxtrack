# boxtrack

Web app for CrossFit LAB (Toulouse): structured daily WOD authoring, public WOD history, protected coach administration, and a broadcast `/screen` view for the gym's TV. Athlete scores and leaderboards are planned as Phase 2 features after the core MVP is reliable.

## Documentation

- [Idea Development - Team, Roles, Stakeholders, Brainstorming, MVP Decision](docs/01-idea-development.md)
- [Project Charter - High-Level Plan & Timeline](docs/02-project-charter.md)
- [Technical Documentation - Architecture, Data Model, API, SCM/QA](docs/03-technical-documentation.md)

## Front-end

The single React/Vite application lives in `frontend/` and implements the Core V1 flow:

- public WOD of the day, session history and session detail;
- dedicated zero-navigation `/screen` TV view;
- coach login UI and complete create/edit form;
- AMRAP, For Time, EMOM, Tabata, Chipper and Strength formats;
- loading, empty and error states.

The default `demo` mode uses isolated sample sessions from `frontend/src/data/demoSessions.js`. It is visibly
labelled and must not be treated as authentication or persistent administration. To connect the
Core V1 API in `backend/`, copy `frontend/.env.example` to `frontend/.env`, set `VITE_DATA_MODE=api`, and configure
`VITE_API_BASE_URL`.

```bash
cd frontend
npm install
npm run dev
```

Quality checks:

```bash
cd frontend
npm run lint
npm run build
```

The dark/orange interface is a working visual proposal. It is not presented as a visual direction
approved by CrossFit LAB; sponsor review is still required before it becomes the final design.

## Backend

See [backend/README.md](backend/README.md) for PostgreSQL setup, coach login and API tests,
and [API contract](backend/API_CONTRACT.md) for request/response shapes.

Warm-Up uses the existing general/specific columns in `wods`. Both fields can be
created, edited or cleared in the coach form and are displayed publicly and on `/screen`.
The TV view refreshes automatically every 30 seconds in API mode.

## Git workflow

Work on `panaki`, then an approved Pull Request to `dev`, then to `main`.
Never push directly to `main`; obtain approval before opening any Pull Request.
