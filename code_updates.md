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
