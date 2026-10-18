# BoxTrack - Testing evidence (backend)

Test strategy from [03-technical-documentation.md §5.2](../03-technical-documentation.md), and the
results of the latest full run. The raw outputs are committed next to this file so they can be
checked line by line.

| Layer | Tool | What it proves | Result | Raw output |
|---|---|---|---|---|
| Unit | Jest | Pure logic with no database: session assembly, schedule rules, TV "now/next" selection (Europe/Paris, DST), leaderboard ranking and ties, score-entry rules, input validators, auth middleware, error format | **56 / 56 passed** | [unit-tests.txt](unit-tests.txt) |
| Integration | Jest + Supertest + real PostgreSQL 16 | The real Express app against a real database: protected routes (401 without/with a bad token, token revoked on logout), every validation rule, the `(session_date, start_time)` conflict, full session round-trip (create/read/update/duplicate/delete), optional tier end to end | **58 / 58 passed** | [integration-tests.txt](integration-tests.txt) |
| API contract | Postman collection run with Newman | 42 requests in a realistic order (login → security checks → public views → coach CRUD → optional tier → cleanup → logout), 60 assertions on status codes, error codes and response shapes | **60 / 60 assertions passed** | [postman-run.txt](postman-run.txt) |
| Lint / format | ESLint, Prettier | Zero lint errors, every file formatted | Clean | CI |

## Security checks covered (cahier des charges §8 "Sécurité basique")

- Every admin route rejects a missing, malformed, forged or revoked token with `401` - Postman
  folder "2 - Security" and "6 - Logout", `wodProtection.test.js`, `optionalFeatures.test.js`.
- Wrong password and unknown email get the same `401 INVALID_CREDENTIALS` (no account
  enumeration) - Postman "1 - Auth", `auth.test.js`.
- `javascript:` URLs refused for QR codes and athlete photos - Postman "5 - Optional tier",
  `optionalFeatures.test.js`, `validators.test.js`.
- Malformed input (non-numeric ids, impossible dates, unknown WOD format, `end_time` before
  `start_time`) returns `400`, never `500` - `wodValidation.test.js`, Postman "3" and "4".

## Re-running it

From `backend/`, with a disposable database in `.env.test` (see `backend/README.md` § Tests):

```bash
npm test                    # unit
npm run test:integration    # integration (wipes the test database)
```

The Postman collection needs an API running on a database seeded with
`npm run db:setup -- --seed` (it logs in as the demo coach and cleans up after itself, so it can be
re-run any number of times):

```bash
npx newman run docs/postman/BoxTrack.postman_collection.json --env-var host=http://localhost:3000
```

The same unit + integration suites run automatically on every push and pull request touching
`backend/` (GitHub Actions, `.github/workflows/backend.yml`).
