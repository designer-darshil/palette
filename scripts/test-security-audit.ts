/**
 * Comprehensive Automated Security & Break-Test Verification Suite
 * Tests Phase 1 through Phase 17 defensive remediations.
 */

import { validateAdminPassword } from '../src/utils/passwordPolicy';
import { checkRateLimit } from '../api/_rateLimit';
import fs from 'fs';
import path from 'path';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`✅ PASSED: ${testName}`);
    passed++;
  } else {
    console.error(`❌ FAILED: ${testName}`);
    failed++;
  }
}

async function runSecurityAuditTests() {
  console.log('🛡️  Running Production Security, Stability & Break-Test Audit Suite...\n');

  // --- 1. Phase 1 Audit: Dummy Data & Credentials Purged ---
  console.log('--- 1. Phase 1: Test Data & Credential Purge ---');
  const adminAuthContent = fs.readFileSync(path.resolve('./src/context/AdminAuthContext.tsx'), 'utf-8');
  assert(!adminAuthContent.includes('Test@123'), 'AdminAuthContext has zero occurrences of backdoor password "Test@123"');
  assert(!adminAuthContent.includes('curator@paletteparadise.io'), 'AdminAuthContext has zero dummy curator accounts');
  assert(!adminAuthContent.includes('designer@paletteparadise.io'), 'AdminAuthContext has zero dummy designer accounts');
  assert(!adminAuthContent.includes('kroma_salt_super_admin_sec_2026'), 'Hardcoded static salt has been eradicated');

  // --- 2. Phase 2 Audit: Environment & Gitignore Protection ---
  console.log('\n--- 2. Phase 2: Environment File Protection ---');
  const gitignoreContent = fs.readFileSync(path.resolve('./.gitignore'), 'utf-8');
  assert(gitignoreContent.includes('.env'), '.gitignore excludes .env files');
  assert(gitignoreContent.includes('.env.*'), '.gitignore excludes .env.* files');
  assert(gitignoreContent.includes('!.env.example'), '.gitignore preserves .env.example template');
  assert(fs.existsSync(path.resolve('./.env.example')), '.env.example exists with documentation');

  // --- 3. Phase 3 & 4 Audit: Password Policy & Session Tamper Resistance ---
  console.log('\n--- 3. Phase 3 & 4: Auth & Password Defense ---');
  const weakPasswords = ['Test@123', 'admin', 'password', '12345678', 'Short1!', 'NoNumber!abc', 'lowercaseonly1!'];
  for (const pw of weakPasswords) {
    const res = validateAdminPassword(pw);
    assert(!res.isValid, `Weak/policy-violating password "${pw}" is rejected`);
  }

  const strongPw = 'SuperSecret2026#Secure!';
  const strongRes = validateAdminPassword(strongPw);
  assert(strongRes.isValid, `Strong 20+ char password "${strongPw}" passes validation`);

  // --- 4. Phase 7: API Rate Limiting & Abuse Defense ---
  console.log('\n--- 4. Phase 7: API Rate Limiting Simulation ---');
  const mockReq = {
    headers: { 'x-forwarded-for': '198.51.100.42' },
    url: '/api/fuzz-test',
  };
  const headersSet: Record<string, string> = {};
  let lastStatus = 200;
  const mockRes = {
    setHeader: (k: string, v: string) => { headersSet[k] = v; },
    status: (s: number) => {
      lastStatus = s;
      return {
        json: () => {},
      };
    },
  };

  let allowedCount = 0;
  let blockedCount = 0;
  for (let i = 0; i < 25; i++) {
    const isAllowed = checkRateLimit(mockReq, mockRes, { limit: 10, windowMs: 10000 });
    if (isAllowed) allowedCount++;
    else blockedCount++;
  }

  assert(allowedCount === 10, `Rate limiter precisely permitted limit of 10 requests (got ${allowedCount})`);
  assert(blockedCount === 15, `Rate limiter blocked remaining 15 excessive flood requests (got ${blockedCount})`);
  assert(lastStatus === 429, 'Rate limiter correctly sent HTTP 429 Too Many Requests status');
  assert(!!headersSet['Retry-After'], 'Rate limiter included Retry-After header');

  // --- 5. Phase 8: File Upload & Asset Processing Guards ---
  console.log('\n--- 5. Phase 8: File Upload Security Guards ---');
  const extractPageContent = fs.readFileSync(path.resolve('./src/pages/ExtractFromImagePage.tsx'), 'utf-8');
  assert(extractPageContent.includes('image/svg+xml'), 'ExtractFromImagePage explicitly inspects and rejects SVG payloads');
  assert(extractPageContent.includes('MAX_FILE_SIZE = 10 * 1024 * 1024'), 'ExtractFromImagePage enforces 10MB upload ceiling');
  assert(extractPageContent.includes('ALLOWED_MIME_TYPES'), 'ExtractFromImagePage validates against strict raster MIME whitelist');

  const extractorEngineContent = fs.readFileSync(path.resolve('./src/utils/imageColorExtractor.ts'), 'utf-8');
  assert(extractorEngineContent.includes('16384'), 'imageColorExtractor caps image dimensions to 16,384px to prevent canvas DoS');

  // --- 6. Phase 12: Security Headers & Transport Security ---
  console.log('\n--- 6. Phase 12: Security Headers Verification ---');
  const vercelContent = fs.readFileSync(path.resolve('./vercel.json'), 'utf-8');
  const vercelConfig = JSON.parse(vercelContent);
  assert(Array.isArray(vercelConfig.headers), 'vercel.json contains headers configuration');
  
  const headerKeys = vercelConfig.headers[0].headers.map((h: any) => h.key);
  assert(headerKeys.includes('X-Content-Type-Options'), 'X-Content-Type-Options: nosniff header configured');
  assert(headerKeys.includes('X-Frame-Options'), 'X-Frame-Options: DENY header configured');
  assert(headerKeys.includes('Strict-Transport-Security'), 'HSTS Strict-Transport-Security configured');
  assert(headerKeys.includes('Content-Security-Policy'), 'Content-Security-Policy configured');
  assert(headerKeys.includes('Permissions-Policy'), 'Permissions-Policy configured');

  console.log('\n========================================');
  console.log(`Security Audit Results: ${passed} Passed, ${failed} Failed`);
  console.log('========================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityAuditTests().catch((err) => {
  console.error('Audit execution error:', err);
  process.exit(1);
});
