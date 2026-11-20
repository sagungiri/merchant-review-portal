# Mock API

In-memory Express stand-in so the Angular app talks to a real HTTP backend. Data lives in process memory and **resets on restart**. Not a production service.

Default URL: **http://localhost:3000**  
CORS is open for `GET`, `POST`, `PUT`, `PATCH`, `OPTIONS` with `Content-Type` and `Authorization`.

How to start it from the repo root: [README.md](../README.md).

```bash
npm run mock-api
# or
MOCK_API_PORT=3000 node mock-api/server.js
```

JSON bodies are capped at 100kb.

---

## Auth

All merchant and permission routes need:

```
Authorization: Bearer <accessToken>
```

Tokens are base64url JSON (not signed JWTs). Access tokens expire in **90 seconds** so concurrent 401s and refresh are easy to demo. Refresh tokens last **1 day** and **rotate** — using one invalidates it.

| Method | Path | Body | Notes |
| --- | --- | --- | --- |
| `POST` | `/api/auth/login` | `{ email, password }` | Returns tokens + public user |
| `POST` | `/api/auth/refresh` | `{ refreshToken }` | One-time; fails if already rotated/expired |

Login / refresh response:

```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "expiresInMs": 90000,
  "user": { "id": "...", "email": "...", "name": "...", "role": "SALES" }
}
```

### Demo accounts

| Email | Password | Role | Name |
| --- | --- | --- | --- |
| `sales@demo.local` | `Sales@2468` | `SALES` | Ram |
| `reviewer@demo.local` | `Reviewer@2468` | `REVIEWER` | Hari |
| `admin@demo.local` | `Admin@2468` | `ADMIN` | Krishna |

---

## Permissions

`GET /api/permissions` (auth required) returns the codes for the **current user**. The UI should gate on these codes, not role names. Write endpoints still check the same codes.

```json
{
  "permissions": [
    { "code": "MERCHANT_VIEW", "label": "View merchants" }
  ]
}
```

| Code | SALES | REVIEWER | ADMIN |
| --- | :---: | :---: | :---: |
| `MERCHANT_VIEW` | ✓ | ✓ | ✓ |
| `MERCHANT_CREATE` | ✓ | | ✓ |
| `MERCHANT_EDIT` | ✓ | | ✓ |
| `MERCHANT_ASSIGN` | | | ✓ |
| `MERCHANT_REVIEW` | | ✓ | ✓ |
| `SENSITIVE_REVEAL` | | ✓ | ✓ |

---

## Merchants

Every route below requires a bearer token. List/detail also apply **ownership scoping** (see below).

| Method | Path | Permission | What it does |
| --- | --- | --- | --- |
| `GET` | `/api/merchants` | (any authed user) | Paged list of merchants the user can see |
| `GET` | `/api/merchants/:id` | (any authed user) | Full merchant record |
| `POST` | `/api/merchants` | `MERCHANT_CREATE` | Create a `DRAFT` owned by the caller |
| `PATCH` | `/api/merchants/:id` | `MERCHANT_EDIT` | Update fields; only `DRAFT` → `SUBMITTED` for status |
| `POST` | `/api/merchants/:id/assign` | `MERCHANT_ASSIGN` | Assign a `REVIEWER`; `SUBMITTED` becomes `IN_REVIEW` |
| `POST` | `/api/merchants/:id/review` | `MERCHANT_REVIEW` | Approve or reject (locks the merchant) |

### List query

`GET /api/merchants?page=1&pageSize=10&status=DRAFT&q=tea`

| Param | Default | Notes |
| --- | --- | --- |
| `page` | `1` | 1-based |
| `pageSize` | `10` | Clamped to 1–50 |
| `status` | — | Exact match (`DRAFT`, `SUBMITTED`, `IN_REVIEW`, `APPROVED`, `REJECTED`) |
| `q` | — | Case-insensitive substring on `merchantName` |

Response:

```json
{
  "items": [
    {
      "id": "...",
      "merchantName": "...",
      "status": "DRAFT",
      "createdBy": "...",
      "assignedReviewerId": null,
      "updatedAt": "...",
      "createdAt": "..."
    }
  ],
  "total": 1,
  "page": 1,
  "pageSize": 10
}
```

### Create / patch body

Create (`POST`) always sets `status: DRAFT` and `createdBy` to the logged-in user. Optional fields:

`merchantName`, `taxId`, `bankAccountLast4`, `contactEmail`, `contactPhone`, `businessAddress`, `expectedMonthlyVolume`, `draftStep`

Patch (`PATCH`) applies the same fields. It **ignores** `id`, `createdBy`, `createdAt`, and `riskHistory`. Status may only change `DRAFT` → `SUBMITTED`; every other workflow change goes through assign/review.

A decided merchant (`APPROVED` / `REJECTED`) cannot be patched.

### Assign

```json
{ "reviewerId": "3fa85f64-5717-4562-b3fc-2c963f66afa6", "note": "Queued for KYC review" }
```

`reviewerId` must be a user with role `REVIEWER`. Appends an `ASSIGNED` risk-history event.

### Review

```json
{ "decision": "APPROVED", "note": "Low risk" }
```

`decision` is `APPROVED` or `REJECTED`. A reviewer may only decide merchants assigned to them. Admins can decide any. Locks the record.

---

## Who can see / edit what

| Role | Can view | Can edit |
| --- | --- | --- |
| `ADMIN` | All merchants | All (until decided) |
| `SALES` | Merchants they created | Those same merchants (until decided) |
| `REVIEWER` | Merchants assigned to them | Never (review endpoint only) |

---

## Workflow

```
DRAFT → SUBMITTED → IN_REVIEW → APPROVED
                              ↘ REJECTED
```

1. Sales creates a draft (`POST`).
2. Sales submits with `PATCH` `{ "status": "SUBMITTED" }`.
3. Admin assigns a reviewer (`POST .../assign`). If status was `SUBMITTED`, it becomes `IN_REVIEW`.
4. Assigned reviewer (or admin) decides (`POST .../review`). After that the merchant is locked.

---

## Errors

Every failure uses:

```json
{ "error": { "code": "FORBIDDEN", "message": "Insufficient permissions" } }
```

| HTTP | `code` | When |
| --- | --- | --- |
| 400 | `BAD_REQUEST` | Missing `refreshToken`, invalid `reviewerId`, invalid `decision` |
| 401 | `INVALID_CREDENTIALS` | Bad login |
| 401 | `UNAUTHORIZED` | Missing bearer token, or user gone |
| 401 | `TOKEN_EXPIRED` | Access token invalid or past `exp` |
| 401 | `REFRESH_FAILED` | Refresh missing, already rotated, expired, or user gone |
| 403 | `FORBIDDEN` | Missing permission, cannot view/edit, reviewer not assigned |
| 404 | `NOT_FOUND` | Unknown merchant id |
| 409 | `CONFLICT` | Locked after decision, or status change not via assign/review |
| 413 | `PAYLOAD_TOO_LARGE` | Body over 100kb |
| 500 | `INTERNAL` | Unexpected error |

---

## Layout

| File | Role |
| --- | --- |
| `server.js` | App, CORS, JSON, route mount, port |
| `http.js` | Error helper, CORS, `requireAuth`, `requirePermission` |
| `auth.js` | Login and refresh |
| `tokens.js` | Issue / verify access; rotate refresh |
| `permissions.js` | Role → permission codes |
| `store.js` | In-memory users/merchants and scoping rules |
| `merchants.js` | Merchant routes |
| `data.js` | Seed users and Nepal-themed merchants |

Seed merchants cover every status (`DRAFT`, `SUBMITTED`, `IN_REVIEW`, `APPROVED`, `REJECTED`) so list/detail/review can be demoed without creating records first.
