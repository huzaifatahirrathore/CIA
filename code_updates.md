# Backend & Frontend Setup Updates

## Backend Fixes

### 1. Fixed MySQL Authentication Error

**Issue:**
`yarn start` failed with:

```bash
ER_NOT_SUPPORTED_AUTH_MODE
```

**Cause:**
The project was using the old `mysql` package, which does not support MySQL 8+ authentication.

**Fix:**
Removed the `mysql` dependency and kept only `mysql2`, which is fully compatible with MySQL 8+.

**Files Updated:**

- `backend/package.json`
- `backend/yarn.lock`

---

## Frontend Fix

### 2. Fixed OpenSSL / Webpack Error

**Issue:**
Frontend failed to start with:

```bash
ERR_OSSL_EVP_UNSUPPORTED
```

**Cause:**
Webpack 4 is incompatible with OpenSSL 3 used in Node.js 17+.

**Fix:**
Added:

```bash
NODE_OPTIONS=--openssl-legacy-provider
```

to the frontend `start` and `build` scripts.

**Files Updated:**

- `frontend/package.json`

---

## Node Version Upgrade (Frontend)

### 3. Upgraded Node.js to v24 (Current LTS)

**Changes:**

#### `frontend/Dockerfile`
- Replaced deprecated `mhart/alpine-node:11` base image with official `node:24-alpine`.
  - `mhart/alpine-node` is unmaintained and Node 11 has been EOL since 2021.

#### `frontend/package.json`
- `react-scripts`: `3.2.0` → `5.0.1`
  - CRA v5 uses webpack 5, which has native Node 17+ support and eliminates the need for `--openssl-legacy-provider`.
- `typescript`: `^3.7.0-beta` → `^4.9.5`
  - Required peer dependency for CRA v5; also resolves instability from the beta version.
- `@types/jest`: `24.0.18` → `^27.5.2`
  - Aligns with Jest 27, which CRA v5 ships internally.
- `@types/node`: `12.7.12` → `^24.0.0`
  - Type definitions now match the actual runtime Node version.
- Removed `NODE_OPTIONS=--openssl-legacy-provider` from `start` and `build` scripts.
  - No longer needed with webpack 5.

#### `frontend/tsconfig.json`
- Added `"useUnknownInCatchVariables": false`
  - TypeScript 4.x changed `catch (e)` to type `e` as `unknown` under `strict` mode. This option restores the previous `any` behavior to avoid source-code changes across all catch blocks.

---

## Major Package Upgrades (Frontend)

### 4. Full Framework & Dependency Upgrade

#### `frontend/package.json` — version changes

| Package | From | To | Notes |
|---|---|---|---|
| `react` / `react-dom` | `^16.10.2` | `^19.2.6` | Latest stable React |
| `@types/react` / `@types/react-dom` | `16.9.x` | `^19.x` | Matches React 19 |
| `react-router-dom` | `^5.1.2` | `^7.15.1` | New Routes/Navigate API |
| `react-redux` | `^7.1.1` | `^9.3.0` | |
| `redux` | `^4.0.4` | `^5.0.1` | `createStore` now legacy |
| `redux-thunk` | `^2.3.0` | `^3.1.0` | Named export `{ thunk }` |
| `axios` | `^0.19.2` | `^1.16.1` | |
| `bootstrap` | `^4.3.1` | `^5.3.8` | jQuery removed; utility renames |
| `js-cookie` / `@types/js-cookie` | `^2.x` | `^3.x` | |
| `react-cookie` | `^4.0.3` | `^8.1.2` | |
| `react-moment` | `^0.9.7` | `^2.0.2` | |
| `reactjs-popup` | `^1.5.0` | `^2.0.6` | |
| `dotenv` | `^8.2.0` | `^17.4.2` | |
| `@fortawesome/fontawesome-free` | `^5.11.2` | `^6.7.2` | v6 chosen over v7; v6 has v5 icon aliases |
| `@types/redux-thunk` | `^2.1.0` | removed | redux-thunk v3 ships its own types |
| `@types/react-router-dom` | `^5.3.3` | removed | react-router-dom v7 ships its own types |

#### Source code changes

**React 19 — `src/index.tsx`, `src/App.test.tsx`**
- `ReactDOM.render(...)` → `createRoot(container).render(...)` — `ReactDOM.render` was removed in React 19.

**react-router-dom v7 — `src/App.tsx`, `src/components/Admin/Admin.tsx`**
- `Switch` → `Routes`, `<Route component={X}>` → `<Route element={<X />}>`, removed `exact` prop (all routes are exact by default in v7).
- All imports moved from `react-router` to `react-router-dom`.

**react-router-dom v7 — `src/common/components/PrivateRoute.tsx`, `PrivateComponent.tsx`**
- `Redirect` → `Navigate`, removed `Route render` prop pattern; rewrote as plain wrapper components with explicit `children: React.ReactNode` prop.

**react-router-dom v7 — `src/components/Account/Login.tsx`**
- `useHistory()` + `history.push('/')` → `useNavigate()` + `navigate('/')`.

**redux v5 + redux-thunk v3 — `src/store/store.ts`**
- `import thunkMiddleware from 'redux-thunk'` → `import { thunk } from 'redux-thunk'`.
- `createStore` → `legacy_createStore as createStore` (redux v5 deprecates `createStore`; `legacy_createStore` suppresses the warning).
- `applyMiddleware(thunk as any)` — required due to type mismatch between redux v5's `UnknownAction` and redux-thunk v3's type signature.

**Bootstrap 5 — class renames across all components**
- `ml-*` → `ms-*`, `mr-*` → `me-*` (spacing utilities renamed from left/right to start/end).
- `dropdown-menu-right` → `dropdown-menu-end`.
- `data-toggle` → `data-bs-toggle`, `data-target` → `data-bs-target`, `data-dismiss` → `data-bs-dismiss`.
- `custom-control` / `custom-control-input` / `custom-control-label` → `form-check` / `form-check-input` / `form-check-label`.
- `btn-block` → `w-100`.
- `font-weight-bold` → `fw-bold`.
- `thead-light` → `table-light`.
- `form-group` → `mb-3`.
- `close` button → `btn-close` (empty button, no `×` character needed).

**React 19 type changes — multiple files**
- Global `JSX` namespace removed in `@types/react@19`; all `JSX.Element` return types updated to `React.ReactElement` across: `TextInput`, `NumberInput`, `Select`, `Checkbox`, `TopMenuAccount`, `PrivateRoute`, `ProductsList`, `OrderList`, `Users`.
- `UseSessionProvider` from unmaintained `react-session-hook` cast to `React.ComponentType<{children: React.ReactNode}>` in `App.tsx` to satisfy React 19 types.
