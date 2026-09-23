# KROMA — Testing Strategy & Verification Guidelines (TESTING.md)

## 1. Automated Test Framework
KROMA uses TypeScript-executed test suites (`npx tsx scripts/test-*.ts`) for deterministic, zero-dependency testing of mathematical colorimetry, security policies, routing, physics simulation, and header integrity.

## 2. Test Execution
Run the full test suite using:
```bash
npm test
```

To run individual test suites:
- Header Integrity & Tokens: `npx tsx scripts/test-header-integrity.ts`
- WCAG Contrast & Palette Math: `npx tsx scripts/test-palette-wcag.ts`
- Mesh Gradient Generation: `npx tsx scripts/test-mesh.ts`
- Physics & Rigid-Body Serialization: `npx tsx scripts/test-physics.ts`
- Admin Password Policy: `npx tsx scripts/test-password-policy.ts`
- Admin Auth & Route Normalization: `npx tsx scripts/test-admin-auth.ts`
- OKLCH Brand Kit & Perceptual Gamut: `npx tsx scripts/test-oklch-brandkit.ts`
- Security Audit & Rate Limiting: `npx tsx scripts/test-security-audit.ts`
- Production MIME & SPA Rewrites: `npx tsx scripts/test-preview-mime.ts`

## 3. TypeScript Type Checking
Verify all types across the codebase:
```bash
npx tsc --noEmit
```

## 4. Production Build Verification
Verify production bundling and sitemap generation:
```bash
npm run build
```

## 5. Header Verification Requirements
Any header modification must satisfy:
1. Single shared public header component at `src/components/Header.tsx`.
2. No arbitrary hex classes in header CSS (`#171717`, `#707070`, `#F8F8F8`).
3. Explicit `position: fixed; top: 0; z-index: 100`.
4. Mobile menu drawer with `z-index: 120`.
5. Active state handling for all public routes (`explore`, `search`, `colors`, `palettes`, `patterns`, `studios`, `community`, `saved`, `about`).
6. Zero React hook order violations.
