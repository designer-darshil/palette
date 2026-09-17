import { validateAdminPassword, PASSWORD_POLICY_REGEX } from '../src/utils/passwordPolicy';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${msg}`);
}

console.log('🔒 Running Admin Password Policy Verification Suite...\n');

// 1. Valid password test
{
  const pass = 'Qaz!11223344';
  const result = validateAdminPassword(pass);
  assert(result.isValid === true, `Valid password "${pass}" passes policy`);
  assert(PASSWORD_POLICY_REGEX.test(pass), `Regex validates "${pass}"`);
  assert(result.errors.length === 0, `Valid password has zero error messages`);
  assert(result.checks.hasMinLength === true, 'hasMinLength is true');
  assert(result.checks.hasUppercase === true, 'hasUppercase is true');
  assert(result.checks.hasLowercase === true, 'hasLowercase is true');
  assert(result.checks.hasNumber === true, 'hasNumber is true');
  assert(result.checks.hasSpecial === true, 'hasSpecial is true');
}

// 2. Ten-character password test (The user's specific test case)
{
  const pass = 'Qaz!112233'; // 10 characters
  const result = validateAdminPassword(pass);
  assert(result.isValid === false, `10-char password "${pass}" correctly fails 12-char minimum`);
  assert(result.checks.hasMinLength === false, 'hasMinLength is false');
  assert(result.checks.hasUppercase === true, 'hasUppercase is true');
  assert(result.checks.hasLowercase === true, 'hasLowercase is true');
  assert(result.checks.hasNumber === true, 'hasNumber is true');
  assert(result.checks.hasSpecial === true, 'hasSpecial is true');
  assert(
    result.errors.some((e) => e.includes('at least 12 characters')),
    'Includes specific minimum length error message'
  );
}

// 3. Missing uppercase test
{
  const pass = 'qaz!11223344';
  const result = validateAdminPassword(pass);
  assert(result.isValid === false, `No-uppercase password "${pass}" fails policy`);
  assert(result.checks.hasUppercase === false, 'hasUppercase is false');
  assert(
    result.errors.some((e) => e.includes('uppercase letter')),
    'Includes specific uppercase error message'
  );
}

// 4. Missing lowercase test
{
  const pass = 'QAZ!11223344';
  const result = validateAdminPassword(pass);
  assert(result.isValid === false, `No-lowercase password "${pass}" fails policy`);
  assert(result.checks.hasLowercase === false, 'hasLowercase is false');
  assert(
    result.errors.some((e) => e.includes('lowercase letter')),
    'Includes specific lowercase error message'
  );
}

// 5. Missing number test
{
  const pass = 'Qaz!abcdefgh';
  const result = validateAdminPassword(pass);
  assert(result.isValid === false, `No-number password "${pass}" fails policy`);
  assert(result.checks.hasNumber === false, 'hasNumber is false');
  assert(
    result.errors.some((e) => e.includes('number')),
    'Includes specific number error message'
  );
}

// 6. Missing special character test
{
  const pass = 'Qaz11223344';
  const result = validateAdminPassword(pass);
  assert(result.isValid === false, `No-special-character password "${pass}" fails policy`);
  assert(result.checks.hasSpecial === false, 'hasSpecial is false');
  assert(
    result.errors.some((e) => e.includes('special character')),
    'Includes specific special character error message'
  );
}

// 7. Short password test (8 characters)
{
  const pass = 'Qaz!1122';
  const result = validateAdminPassword(pass);
  assert(result.isValid === false, `Short 8-char password "${pass}" fails policy`);
  assert(result.checks.hasMinLength === false, 'hasMinLength is false');
}

console.log('\n🎉 ALL ADMIN PASSWORD POLICY TESTS PASSED!\n');
