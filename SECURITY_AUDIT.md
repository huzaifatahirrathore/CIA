# Security Audit — CIA Project

**Date:** 2026-05-29  
**Scope:** Full-stack (Express/TypeORM backend + React/Redux frontend)  
**Status:** All findings fixed.

---

## CRITICAL

### C-1 · Hardcoded, weak JWT secret

|             |                                                                                                                                                                                                                |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **File**    | `backend/src/config/config.ts`                                                                                                                                                                                 |
| **Finding** | Secret was the literal string `@QEGTUI` — trivially guessable, forged tokens possible.                                                                                                                         |
| **Fix**     | Secret now read from `JWT_SECRET` env var. Server throws on startup in production if the var is missing or shorter than 32 characters. Falls back to a cryptographically random 32-byte secret in development. |

### C-2 · Privilege escalation — public register grants ADMIN

|             |                                                                                                           |
| ----------- | --------------------------------------------------------------------------------------------------------- |
| **File**    | `backend/src/controller/AuthController.ts`                                                                |
| **Finding** | `user.role = "ADMIN"` — any visitor who registered became an admin immediately.                           |
| **Fix**     | Changed to `user.role = "NORMAL"`. Only existing admins can promote users via the `/user` PATCH endpoint. |

### C-3 · Passwords and auth tokens written to log files

|             |                                                                                                                                                                                                  |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **File**    | `backend/src/index.ts`                                                                                                                                                                           |
| **Finding** | Two Morgan tokens (`BODY` and `AUTH`) dumped the raw request body (containing passwords) and the full `Authorization` header to `logs/combined.log`. Anyone with log access had all credentials. |
| **Fix**     | Removed both custom Morgan tokens. Only standard request metadata (method, URL, status, response time, IP) is logged.                                                                            |

---

## HIGH

### H-1 · No rate limiting — brute-force login

|             |                                                                                                                                            |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **File**    | `backend/src/routes/auth.ts`                                                                                                               |
| **Finding** | `/auth/login` and `/auth/register` had no request throttling.                                                                              |
| **Fix**     | Added `express-rate-limit` limiter: max 10 requests per 15-minute window per IP on both endpoints. Returns standard `RateLimit-*` headers. |

### H-2 · CORS wildcard — all origins accepted

|             |                                                                                                                                              |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **File**    | `backend/src/index.ts`                                                                                                                       |
| **Finding** | `app.use(cors())` with no configuration accepted requests from any origin, enabling CSRF and cross-site data theft.                          |
| **Fix**     | CORS now validates `Origin` against an allowlist read from `ALLOWED_ORIGINS` env var (comma-separated). Defaults to `http://localhost:3001`. |

### H-3 · No request body size limit — DoS vector

|             |                                                                                                    |
| ----------- | -------------------------------------------------------------------------------------------------- |
| **File**    | `backend/src/index.ts`                                                                             |
| **Finding** | `express.json()` with no limit allowed arbitrarily large payloads, enabling memory-exhaustion DoS. |
| **Fix**     | Body parser limited to `10kb` for both JSON and URL-encoded bodies.                                |

### H-4 · TypeORM `synchronize: true` in production

|             |                                                                                                                                            |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **File**    | `backend/src/data-source.ts`                                                                                                               |
| **Finding** | TypeORM auto-syncs the database schema on every startup. In production this silently drops/alters columns, causing irreversible data loss. |
| **Fix**     | `synchronize` is now `false` when `NODE_ENV=production`. Remains `true` for development convenience.                                       |

### H-5 · JWT token stored in JS-accessible cookie (no security flags)

|             |                                                                                                                                                                               |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **File**    | `frontend/src/store/actions/account.actions.ts`                                                                                                                               |
| **Finding** | `Cookies.set('token', ...)` with no options — cookie was readable by any JavaScript on the page, stealable via XSS, and sent cross-site.                                      |
| **Fix**     | Cookie now set with `sameSite: 'strict'` and `secure: true` when served over HTTPS. Interceptors on the shared Axios client handle token injection and refresh automatically. |

### H-6 · Token sent in non-standard `auth` header — bypasses standard guards

|             |                                                                                                                                                                                              |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Files**   | `frontend/src/store/actions/*.ts`, `backend/src/middlewares/checkJwt.ts`                                                                                                                     |
| **Finding** | Frontend used a custom `auth` header; backend had a fallback that accepted it alongside `Authorization`. Non-standard headers bypass many WAF and proxy security checks.                     |
| **Fix**     | All API calls now use the standard `Authorization: Bearer <token>` header. Shared `apiClient.ts` attaches it via an Axios request interceptor. Backend only accepts `Authorization: Bearer`. |

### H-7 · `listAll` users endpoint leaked password hashes

|             |                                                                                                                      |
| ----------- | -------------------------------------------------------------------------------------------------------------------- |
| **File**    | `backend/src/controller/UserController.ts`                                                                           |
| **Finding** | `userRepository.find()` returned all columns including the bcrypt hash, which could be used for offline cracking.    |
| **Fix**     | Added `select: { id, username, role, createdAt, updatedAt }` — password hash is never returned by the list endpoint. |

---

## MEDIUM

### M-1 · Hardcoded `admin/admin` default credentials in migration

|             |                                                                                                                                                 |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **File**    | `backend/src/migration/1572547308077-CreateAdminUser.ts`                                                                                        |
| **Finding** | Migration seeded an admin account with username `admin` and password `admin` — a well-known default attacked by every credential-stuffing tool. |
| **Fix**     | Migration now reads the password from `ADMIN_PASSWORD` env var and throws if it is unset. Also idempotent — skips if admin already exists.      |

### M-2 · Weak bcrypt cost factor (rounds = 8)

|             |                                                                                               |
| ----------- | --------------------------------------------------------------------------------------------- |
| **File**    | `backend/src/entity/User.ts`                                                                  |
| **Finding** | bcrypt work factor of 8 is fast enough to crack on modern hardware (~100k hashes/sec on GPU). |
| **Fix**     | Increased to 12 (industry standard), configured via `config.bcryptRounds`.                    |

### M-3 · No password complexity requirement

|             |                                                                                                                                                         |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **File**    | `backend/src/entity/User.ts`                                                                                                                            |
| **Finding** | Only a length of 4–100 was validated. Short, all-lowercase passwords were accepted.                                                                     |
| **Fix**     | Minimum length raised to 8. Added `@Matches` regex requiring at least one uppercase letter, one lowercase letter, one digit, and one special character. |

### M-4 · `console.log` statements leaked full request headers and JWT tokens

|             |                                                                                                                                          |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **File**    | `backend/src/middlewares/checkJwt.ts`                                                                                                    |
| **Finding** | Debug `console.log` calls printed all incoming headers (including `Authorization` with the raw JWT) and token parsing results to stdout. |
| **Fix**     | All `console.log` calls removed. Error branch uses a generic message with no token detail.                                               |

### M-5 · Swagger-stats and test routes exposed in production

|             |                                                                                                                                                                |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **File**    | `backend/src/index.ts`                                                                                                                                         |
| **Finding** | `swagger-stats` (exposes API call counts, paths, errors) and `/test/error`, `/test/logs` routes were mounted unconditionally — a recon goldmine for attackers. |
| **Fix**     | Both are now only mounted when `NODE_ENV !== 'production'`. Also removed `swagger-stats` from production entirely (unauthenticated metrics endpoint).          |

### M-6 · Broken Register form validation (logic bug)

|             |                                                                                                                                      |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------ | --- | --------------------------------------------------------------------------------------------------- |
| **File**    | `frontend/src/components/Account/Register.tsx`                                                                                       |
| **Finding** | `isFormInvalid()` used `&&` instead of `                                                                                             |     | ` — the form submitted with empty required fields or mismatched passwords under certain conditions. |
| **Fix**     | Rewritten: returns `true` (invalid) if any required field is empty, any field has an error, or the two password fields do not match. |

---

## LOW

### L-1 · `deleteUser` passed a string ID to TypeORM `delete()`

|             |                                                                                                                                                                                                |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **File**    | `backend/src/controller/UserController.ts`                                                                                                                                                     |
| **Finding** | `req.params.id` is always a string; passing it directly to `repository.delete(id)` causes a type mismatch that TypeORM silently coerces, which could behave unexpectedly with some DB drivers. |
| **Fix**     | `id` now cast to `Number` before being passed to `delete()`.                                                                                                                                   |

---

## IMPROVEMENTS (Post-Audit Hardening)

### I-1 · No refresh token system — stolen access tokens irrevocable

|             |                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Files**   | `backend/src/controller/AuthController.ts`, `backend/src/entity/RefreshToken.ts`, `frontend/src/store/apiClient.ts`, `frontend/src/store/tokenStore.ts`                                                                                                                                                                                                                                                                              |
| **Finding** | The system used a 1-hour access token with a "sliding window" — on every authenticated request it re-signed and returned a new token via the `Authorization` response header. This meant: (1) a stolen token stayed valid for up to 1 hour with no way to revoke it, (2) there was no `/auth/logout` that actually invalidated credentials server-side, (3) the "renewal" sent a JWT in a response header that could be intercepted. |
| **Fix**     | Full two-token system implemented:                                                                                                                                                                                                                                                                                                                                                                                                   |

**Access token** — 15 minutes, returned in JSON response body, stored in JavaScript memory only (`tokenStore.ts`). Never written to a cookie or localStorage. Lost on page reload (by design).

**Refresh token** — 7 days, 40 random bytes, stored as a SHA-256 hash in the `refresh_token` DB table. Sent to the browser as an `httpOnly`, `secure`, `sameSite=strict` cookie scoped to `/auth`. JavaScript can never read it.

**Session indicator** — A non-sensitive `loggedIn=1` cookie (no token data) lets the React app know a refresh token likely exists, enabling seamless session restore on page reload without storing the access token anywhere persistent.

**New endpoints:**

| Endpoint             | What it does                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------- |
| `POST /auth/login`   | Issues access token (body) + sets refresh token (httpOnly cookie) + sets `loggedIn` cookie              |
| `POST /auth/refresh` | Validates refresh token from cookie, **rotates** it (revokes old, issues new), returns new access token |
| `POST /auth/logout`  | Revokes the DB record for the refresh token, clears both cookies                                        |

**Token rotation** — every call to `/auth/refresh` revokes the old refresh token and issues a new one. If a refresh token is stolen and used, the next legitimate use by the real user invalidates the stolen token immediately.

**Password change revokes all sessions** — `changePassword` now sets `isRevoked = true` on all refresh tokens for that user, forcing every other active session to re-authenticate.

**Frontend 401 interceptor** — the Axios client transparently retries any failed request: on 401 it calls `/auth/refresh`, updates the in-memory token, and replays the original request. If refresh itself fails, it calls `tokenStore.triggerUnauthenticated()` which dispatches `LOG_OUT` and redirects to `/login`. Multiple simultaneous 401s are queued so only one refresh call is made.

### I-2 · App served over HTTP — tokens transmitted in plaintext

|             |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Files**   | `backend/src/index.ts`, `backend/certs/`, `frontend/.env`                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **Finding** | Both the backend API and the React dev server ran on plain HTTP. Any network observer (same-network attacker, corporate proxy, ISP) could read access tokens, passwords, and all API responses in transit.                                                                                                                                                                                                                                                                           |
| **Fix**     | TLS certificates generated with `mkcert` (`localhost+1.pem` + `localhost+1-key.pem`, excluded from git). Backend now starts `https.createServer()` on port 3000; if certs are missing it falls back to HTTP with a warning. React dev server configured with `HTTPS=true` and the same cert pair via `SSL_CRT_FILE` / `SSL_KEY_FILE`. CORS and cookie `secure` flags updated to require HTTPS origins. Run `mkcert -install` once (with sudo) to trust the local CA in your browser. |

### M-7 · No last-admin guard — entire admin access could be wiped

|             |                                                                                                                                                                                                                                                                                                        |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Files**   | `backend/src/controller/UserController.ts`, `frontend/src/components/Users/Users.tsx`                                                                                                                                                                                                                  |
| **Finding** | Any admin could demote every other admin including themselves, leaving the system with zero admins and no way to recover access without direct database intervention. There was no check in the API or the UI.                                                                                         |
| **Fix**     | Backend: `editUser` now counts admins before a demotion; returns `409 Cannot demote the last admin` if only one remains. This blocks direct API calls as well as UI clicks. Frontend: the "Revert admin" button is hidden when `admins.length <= 1`, giving clear feedback before the user even tries. |

### B-1 · 401 interceptor triggered on unauthenticated endpoints — hard page redirect on wrong password

|             |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **File**    | `frontend/src/store/apiClient.ts`                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **Finding** | The Axios 401 interceptor fired on every 401 response regardless of whether the request carried an auth token. When a user entered a wrong password, `/auth/login` returned 401, the interceptor tried `/auth/refresh` (which also failed), and `tokenStore.triggerUnauthenticated()` executed `window.location.href = '/login'` — a hard full-page navigation that wiped Redux state, the error notification, and the browser network tab, making it appear the page had refreshed with no explanation. |
| **Fix**     | Added `hadAuthHeader` guard: the interceptor now only attempts a token refresh when the original request carried an `Authorization` header. Login and register never attach one, so their 401s go straight to the action's `catch` block and show the error notification normally.                                                                                                                                                                                                                       |

### A-1 · User list restricted to ADMINs — normal users denied read access unnecessarily

|             |                                                                                                                                                                                                                                                                                                                  |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Files**   | `backend/src/routes/user.ts`, `frontend/src/components/Users/Users.tsx`                                                                                                                                                                                                                                          |
| **Finding** | `GET /user` and `GET /user/:id` required `ADMIN` role, preventing normal users from seeing any user directory. This over-restriction also meant the Users page was broken for non-admins despite being linked in the sidebar.                                                                                    |
| **Fix**     | Read routes (`GET /`, `GET /:id`) now require only `checkJwt` — any authenticated user can view the list. Write routes (`POST`, `PATCH`, `DELETE`) still require `ADMIN`. In the UI, the Action column (Set admin / Revert admin buttons) is rendered only for admins; normal users see a clean read-only table. |

---

## Summary Table

| ID  | Severity       | Area       | Description                                                  | Fixed |
| --- | -------------- | ---------- | ------------------------------------------------------------ | ----- |
| C-1 | Critical       | Backend    | Hardcoded weak JWT secret                                    | ✅    |
| C-2 | Critical       | Backend    | Public register grants ADMIN role                            | ✅    |
| C-3 | Critical       | Backend    | Passwords/tokens logged to file                              | ✅    |
| H-1 | High           | Backend    | No rate limiting on auth endpoints                           | ✅    |
| H-2 | High           | Backend    | CORS wildcard                                                | ✅    |
| H-3 | High           | Backend    | No request body size limit                                   | ✅    |
| H-4 | High           | Backend    | TypeORM `synchronize: true` in production                    | ✅    |
| H-5 | High           | Frontend   | JWT cookie lacks security flags                              | ✅    |
| H-6 | High           | Full-stack | Non-standard `auth` header bypasses WAF/proxies              | ✅    |
| H-7 | High           | Backend    | `listAll` leaks bcrypt password hashes                       | ✅    |
| M-1 | Medium         | Backend    | Hardcoded `admin/admin` default credentials                  | ✅    |
| M-2 | Medium         | Backend    | bcrypt rounds too low (8)                                    | ✅    |
| M-3 | Medium         | Backend    | Weak password policy (min 4 chars, no complexity)            | ✅    |
| M-4 | Medium         | Backend    | `console.log` leaks headers and JWT tokens                   | ✅    |
| M-5 | Medium         | Backend    | Swagger-stats and test routes exposed in production          | ✅    |
| M-6 | Medium         | Frontend   | Broken register form validation logic                        | ✅    |
| L-1 | Low            | Backend    | `deleteUser` type mismatch (string vs number)                | ✅    |
| I-1 | Improvement    | Full-stack | No refresh token — stolen tokens irrevocable, no real logout | ✅    |
| I-2 | Improvement    | Full-stack | HTTP only — tokens transmitted in plaintext                  | ✅    |
| M-7 | Medium         | Full-stack | No last-admin guard — admin access could be fully wiped      | ✅    |
| B-1 | Bug            | Frontend   | 401 interceptor caused hard redirect on wrong password       | ✅    |
| A-1 | Access Control | Full-stack | User list unnecessarily restricted to ADMINs                 | ✅    |

---

## Required Action Before Running

Set the following environment variables in `backend/.env`:

```
JWT_SECRET=<random 32+ character secret>
ADMIN_PASSWORD=<strong password — upper+lower+digit+special, 8+ chars>
ALLOWED_ORIGINS=https://localhost:3001
NODE_ENV=development
```

Generate a strong JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Install the local CA so browsers trust the dev HTTPS cert (one-time, needs your password):

```bash
mkcert -install
```

Regenerate certs if needed:

```bash
cd backend/certs && mkcert localhost 127.0.0.1
```
