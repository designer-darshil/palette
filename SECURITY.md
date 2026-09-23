# KROMA — Security & Access Control Policy (SECURITY.md)

## 1. Authentication & Password Security
- All administrative accounts authenticate via salted cryptographic hashing (PBKDF2/SHA-256).
- Minimum password length is strictly enforced at **8 characters** (`scripts/test-password-policy.ts`).
- No default or backdoor credentials exist in source code.
- Last Super Admin protection is enforced in `AdminAuthContext` to prevent administrative lockout.

## 2. Environment Protection & Secret Handling
- `.env` and `.env.*` files are explicitly excluded from git tracking via `.gitignore`.
- `.env.example` provides non-sensitive template configurations.

## 3. Input Validation & Upload Protection
- File upload handlers (e.g. `ExtractFromImagePage.tsx`) enforce strict raster image MIME type whitelists (`image/png`, `image/jpeg`, `image/webp`).
- SVG files are explicitly rejected to prevent SVG-based XSS attacks.
- Maximum upload size is strictly capped at 10MB.
- Canvas image processing limits dimensions to 16,384px to prevent canvas memory exhaustion and denial-of-service.

## 4. HTTP Headers & Production Security
Configured in `vercel.json`:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- Content Security Policy (CSP) restricting script execution and style sources.
- Static assets under `/assets/` bypass SPA rewrite to return correct MIME types and 404s for missing chunks.
