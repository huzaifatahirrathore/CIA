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

| Package                             | From       | To        | Notes                                     |
| ----------------------------------- | ---------- | --------- | ----------------------------------------- |
| `react` / `react-dom`               | `^16.10.2` | `^19.2.6` | Latest stable React                       |
| `@types/react` / `@types/react-dom` | `16.9.x`   | `^19.x`   | Matches React 19                          |
| `react-router-dom`                  | `^5.1.2`   | `^7.15.1` | New Routes/Navigate API                   |
| `react-redux`                       | `^7.1.1`   | `^9.3.0`  |                                           |
| `redux`                             | `^4.0.4`   | `^5.0.1`  | `createStore` now legacy                  |
| `redux-thunk`                       | `^2.3.0`   | `^3.1.0`  | Named export `{ thunk }`                  |
| `axios`                             | `^0.19.2`  | `^1.16.1` |                                           |
| `bootstrap`                         | `^4.3.1`   | `^5.3.8`  | jQuery removed; utility renames           |
| `js-cookie` / `@types/js-cookie`    | `^2.x`     | `^3.x`    |                                           |
| `react-cookie`                      | `^4.0.3`   | `^8.1.2`  |                                           |
| `react-moment`                      | `^0.9.7`   | `^2.0.2`  |                                           |
| `reactjs-popup`                     | `^1.5.0`   | `^2.0.6`  |                                           |
| `dotenv`                            | `^8.2.0`   | `^17.4.2` |                                           |
| `@fortawesome/fontawesome-free`     | `^5.11.2`  | `^6.7.2`  | v6 chosen over v7; v6 has v5 icon aliases |
| `@types/redux-thunk`                | `^2.1.0`   | removed   | redux-thunk v3 ships its own types        |
| `@types/react-router-dom`           | `^5.3.3`   | removed   | react-router-dom v7 ships its own types   |

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

---

## Major Package Upgrades (Backend)

### 5. Full Dependency Upgrade to Latest Versions

#### `backend/package.json` — version changes

| Package                | From       | To          | Notes                                                              |
| ---------------------- | ---------- | ----------- | ------------------------------------------------------------------ |
| `typeorm`              | `0.2.20`   | `^1.0.0`    | Major — requires DataSource API migration (see below)              |
| `express`              | `^4.15.4`  | `^5.2.1`    | Major — async errors now propagate automatically                   |
| `typescript`           | `^5.4.5`   | `^6.0.3`    | Major — `moduleResolution: node` now requires `ignoreDeprecations` |
| `helmet`               | `^3.21.2`  | `^8.2.0`    | Major — API simplified; `@types/helmet` removed (types bundled)    |
| `jsonwebtoken`         | `^8.5.1`   | `^9.0.3`    | Major                                                              |
| `dotenv`               | `^8.2.0`   | `^17.4.2`   | Major                                                              |
| `class-validator`      | `^0.10.2`  | `^0.15.1`   |                                                                    |
| `class-transformer`    | `^0.2.3`   | `^0.5.1`    |                                                                    |
| `@sentry/node`         | `5.7.1`    | `^10.55.0`  | Major                                                              |
| `bcryptjs`             | `^2.4.3`   | `^3.0.3`    | Types now bundled; `@types/bcryptjs` removed                       |
| `reflect-metadata`     | `^0.1.10`  | `^0.2.2`    |                                                                    |
| `swagger-jsdoc`        | `^3.4.0`   | `^6.3.0`    | Major — requires OpenAPI 3.0.0 definition format                   |
| `swagger-ui-express`   | `^4.1.2`   | `^5.0.1`    | Major                                                              |
| `jest`                 | `^24.9.0`  | `^29.7.0`   | Major                                                              |
| `ts-jest`              | `^24.1.0`  | `^29.4.11`  | Aligned with jest 29                                               |
| `@types/jest`          | `^24.0.20` | `^29.5.14`  |                                                                    |
| `@types/jsonwebtoken`  | `^8.3.5`   | `^9.0.10`   |                                                                    |
| `@types/supertest`     | `^2.0.8`   | `^6.0.3`    |                                                                    |
| `@types/swagger-jsdoc` | `^3.0.2`   | `^6.0.4`    |                                                                    |
| `prettier`             | `^1.18.2`  | `^3.8.3`    |                                                                    |
| `tsc-watch`            | `^4.1.0`   | `^7.2.0`    |                                                                    |
| `cors`                 | `^2.8.5`   | `^2.8.6`    |                                                                    |
| `mysql2`               | —          | `^3.22.4`   | Already latest, no change                                          |
| `body-parser`          | `^1.19.0`  | **removed** | Now built into Express 5 (`express.json()`)                        |
| `@types/helmet`        | `^0.0.44`  | **removed** | Types bundled in helmet 8                                          |
| `@types/bcryptjs`      | `^2.4.2`   | **removed** | Types bundled in bcryptjs 3                                        |
| `@types/body-parser`   | `^1.17.1`  | **removed** | Package removed                                                    |

**devDependencies cleanup:** `@types/bcryptjs`, `@types/body-parser`, `@types/cors`, `@types/helmet`, `@types/jsonwebtoken`, `@types/supertest`, `@types/swagger-jsdoc`, `jest`, `prettier`, `supertest`, `tsc-watch`, `tslint` and related packages were all moved from `dependencies` to `devDependencies`.

---

### TypeORM 0.2.20 → 1.0.0 — API Migration

TypeORM 1.0.0 dropped the global connection API. All usages of `createConnection()` and `getRepository()` were replaced with an explicit `DataSource` instance.

#### `backend/src/data-source.ts` — new file

Created to replace `ormconfig.js`. Exports an `AppDataSource` instance configured with explicit entity and migration imports:

```typescript
export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  entities: [User, Inventory],
  migrations: [CreateAdminUser1572547308077],
  ...
});
```

#### `backend/ormconfig.js` — deleted

No longer supported by TypeORM 1.0.0.

#### `backend/src/index.ts`

- `import { createConnection } from "typeorm"` → `import { AppDataSource } from "./data-source"`
- `createConnection().then(...)` → `AppDataSource.initialize().then(...)`
- `import bodyParser from "body-parser"; app.use(bodyParser.json())` → `app.use(express.json())`
- Swagger options updated to OpenAPI 3.0.0 format (`definition.openapi: "3.0.0"` instead of `swaggerDefinition`).

#### `backend/src/controller/UserController.ts`, `AuthController.ts`, `InventoryController.ts`

- `import { getRepository } from 'typeorm'` removed.
- `getRepository(Entity)` → `AppDataSource.getRepository(Entity)` in every method.
- `findOneOrFail(id)` (positional primary key, removed in 1.0.0) → `findOneOrFail({ where: { id } })`.
- `select: ['id', 'username']` (array form) → `select: { id: true, username: true }` (object form).

#### `backend/src/middlewares/checkRole.ts`

- `getRepository(User)` → `AppDataSource.getRepository(User)`.
- `findOneOrFail(id)` → `findOneOrFail({ where: { id } })`.

#### `backend/src/migration/1572547308077-CreateAdminUser.ts`

- `import { getRepository } from 'typeorm'` removed.
- `getRepository(User)` → `queryRunner.manager.getRepository(User)` (correct API for use inside a migration).
- Return type changed from `Promise<any>` to `Promise<void>`.

#### `backend/package.json` — script changes

TypeORM CLI commands updated to use the new data-source flag:

```json
"schema:drop": "typeorm-ts-node-commonjs -d src/data-source.ts schema:drop",
"schema:sync": "typeorm-ts-node-commonjs -d src/data-source.ts schema:sync",
"migration:run": "typeorm-ts-node-commonjs -d src/data-source.ts migration:run"
```

---

### TypeScript 6.0 — Config Changes

#### `backend/tsconfig.json`

- `"target"`: `"es5"` → `"ES2020"` — Node 24 supports ES2020 natively; TypeORM 1.0.0 targets ES2023+.
- `"lib"`: `["es5", "es6"]` → `["ES2020"]`.
- `"useDefineForClassFields": false` — required for TypeORM's legacy decorators to work correctly when targeting ES2020+. Without this, TypeScript compiles class fields using `Object.defineProperty`, which overwrites decorator-set metadata.
- `"ignoreDeprecations": "6.0"` — TypeScript 6 deprecated `moduleResolution: "node"` (now called `node10`). This option silences the error while the project remains on CommonJS. Migrating to `moduleResolution: "node16"` requires pairing it with `module: "node16"`, which enforces ES module import extensions across all source files.

**Note:** `tslint` and its plugins (`tslint-eslint-rules`, `tslint-plugin-prettier`, `tslint-config-prettier`) are deprecated and incompatible with TypeScript 6 and Prettier 3. `npm install --legacy-peer-deps` is required until these are replaced with ESLint.
