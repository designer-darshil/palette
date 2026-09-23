import { validateAdminPassword, PASSWORD_POLICY } from '../src/utils/passwordPolicy';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${msg}`);
}

console.log('🔒 Running Admin Password Policy Verification Suite (Min 8 Characters)...\n');

// 1. Valid password test (>= 8 characters)
{
  const pass = 'Admin@12345';
  const result = validateAdminPassword(pass);
  assert(result.isValid === true, `Valid password "${pass}" passes policy`);
  assert(result.errors.length === 0, `Valid password has zero error messages`);
  assert(result.checks.hasMinLength === true, 'hasMinLength is true');
}

// 2. Exactly 8 characters test
{
  const pass = '12345678';
  const result = validateAdminPassword(pass);
  assert(result.isValid === true, `8-char password "${pass}" passes minimum length requirement`);
  assert(result.checks.hasMinLength === true, 'hasMinLength is true for 8-char password');
}

// 3. Short password test (7 characters)
{
  const pass = '1234567';
  const result = validateAdminPassword(pass);
  assert(result.isValid === false, `7-char password "${pass}" correctly fails 8-char minimum`);
  assert(result.checks.hasMinLength === false, 'hasMinLength is false');
  assert(
    result.errors.some((e) => e.includes('at least 8 characters')),
    'Includes specific minimum 8-char error message'
  );
}

// 4. Empty password test
{
  const pass = '';
  const result = validateAdminPassword(pass);
  assert(result.isValid === false, 'Empty password fails policy');
  assert(result.checks.hasMinLength === false, 'hasMinLength is false for empty string');
}

// 5. Config minimum length
{
  assert(PASSWORD_POLICY.minLength === 8, 'Configured minLength is exactly 8 characters');
}

console.log('\n🎉 ALL ADMIN PASSWORD POLICY TESTS PASSED!\n');
