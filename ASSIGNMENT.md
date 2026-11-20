# Merchant Review Portal

**Document type:** Project definition  
**Owner:** Candidate (Senior Frontend Engineer take-home)  
**Audience:** Hiring reviewers  
**Related:** [README.md](./README.md) (runbook) · [mock-api/README.md](./mock-api/README.md) (service notes)

---

## 1. Purpose

Deliver a **merchant onboarding and risk-review portal** that a sales user, a reviewer, and an admin can use in a demo environment. The work is a **time-boxed frontend evaluation**, not a production payments platform.

Success is a reviewer being able to clone the repo, run it, and judge architecture, forms, reactive flows, security, and tests — not whether a real bank core exists behind it.

---

## 2. Objectives

| ID  | Objective                                                               | How we will know                                                           |
| --- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| O1  | Demonstrate modern Angular (20+, standalone, Signals, `inject()`, RxJS) | App builds; patterns are visible in source and interview                   |
| O2  | Prove a production-shaped auth story                                    | Bearer on requests; one refresh when several calls get 401 together        |
| O3  | Ship the core merchant journey                                          | List → create/edit with drafts → detail → review, with permission-aware UI |
| O4  | Keep the submission safe and explainable                                | No secrets, no real customer/card data; candidate can walk the code        |

---

## 3. Scope

### In scope (must ship)

- Authenticated portal with three personas: sales, reviewer, admin
- Merchant list with server-driven paging and filtering, plus loading / error / retry
- Multi-step merchant form with field validation and debounced draft save
- Merchant detail with risk history; review actions only for users allowed to decide
- Sensitive fields masked by default; controlled reveal
- Unit tests for the high-risk logic (interceptor, guards, validators, auto-save)
- In-repo mock HTTP API so the UI uses real `HttpClient`

### Out of scope (this time-box)

- Real identity provider, real database, or card processing
- Dashboard status counts
- Live updates (WebSocket / Socket.IO)
- Custom production Nginx routing (can be added at deploy time)

---

## 4. Constraints and assumptions

| Type       | Item                                                                                  |
| ---------- | ------------------------------------------------------------------------------------- |
| Time       | 6–8 hours of implementation effort; return in 3–5 calendar days                       |
| Platform   | Angular 21 (LTS), SCSS, Angular Material, Vitest                                      |
| State      | Application services with Signals and RxJS — no global store library                  |
| Data       | Fictional Nepal merchants and demo logins only                                        |
| Runtime    | Local: `npm run start:all`. Optional: `docker compose up --build`                     |
| Assumption | Reviewers will run Node 20+ and/or Docker; they will not receive a hosted environment |

---

## 5. Stakeholders

| Role                                  | Interest                                                            |
| ------------------------------------- | ------------------------------------------------------------------- |
| Hiring reviewers (incl. `@lbaral-vp`) | Quality of engineering judgement under a time-box                   |
| Candidate                             | Ownership of the submission; interview defence of decisions         |
| Demo users (Ram, Hari, Krishna)       | Represent sales, reviewer, and admin in seed data — not real people |

---

## 6. Delivery plan

Work is sequenced by **risk to the score**, not by building every screen first.

| Phase          | Outcome                                               | Status   |
| -------------- | ----------------------------------------------------- | -------- |
| 0 — Foundation | Angular workspace, Material, Vitest, Docker, mock API | Complete |
| 1 — Access     | Login, permission load, interceptor, route guards     | Planned  |
| 2 — Operations | Merchant dashboard and detail                         | Planned  |
| 3 — Capture    | Multi-step form and auto-save                         | Planned  |
| 4 — Assurance  | Masking, CSP note, unit tests, README polish          | Planned  |

Phase 0 exists so Phase 1–4 can spend the remaining hours on the graded frontend.

---

## 7. Solution principles (governance)

These are project rules, not a feature catalogue:

1. **One product, mock integration.** The Express service exists only to stand in for HTTP. It is not a second application to over-engineer.
2. **Authorize by permission code.** The UI does not branch on role names. After login it loads the user’s codes and shows or hides actions from that list. The mock still enforces the same codes on write endpoints.
3. **Own data stays owned.** Sales users only see merchants they created. That is server-side scoping, not a frontend shortcut.
4. **Fail closed.** Missing token, failed refresh, or missing permission means no access — never a silent bypass.
5. **No real PII or secrets in Git.**

Technical endpoint detail lives in [mock-api/README.md](./mock-api/README.md) so this document stays a project view, not an API dump.

---

## 8. Acceptance (evaluation)

Reviewers score on a 1–4 scale. Informal pass bar: core scope works, security is not bypassed, and the candidate can explain the code.

| Theme                                      | Weight |
| ------------------------------------------ | ------ |
| Angular architecture (Signals, standalone) | 15%    |
| Reactive Forms and workflows               | 15%    |
| RxJS, state, auto-save, interceptors       | 20%    |
| Security and permission-aware UI           | 15%    |
| Unit tests (Vitest / TestBed)              | 15%    |
| UX, accessibility, responsive layout       | 10%    |
| API integration                            | 5%     |
| Code quality and documentation             | 5%     |

**Disqualifiers:** committed credentials; permission bypass; real personal or payment-card data; copied work; inability to explain the submission in interview.

---

## 9. Risks

| Risk                   | Mitigation                                                                         |
| ---------------------- | ---------------------------------------------------------------------------------- |
| Time-box overrun       | Mock API frozen; no extra libraries or optional realtime                           |
| Interceptor complexity | Refresh tokens rotate so concurrent 401s are easy to demonstrate                   |
| “Looks generated”      | Decisions recorded here; interview walks interceptor, permissions, and draft merge |
| Accidental real data   | Seed file is fictional; no production dumps                                        |

---

## 10. Tooling disclosure

AI coding assistance (Cursor) was used for scaffolding and mechanical edits.

---
