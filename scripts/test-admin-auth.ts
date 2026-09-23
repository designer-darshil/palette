import crypto from 'crypto';
import { validateAdminPassword } from '../src/utils/passwordPolicy';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${msg}`);
}

console.log('🧪 Running Comprehensive Admin Auth & User Management Verification Suite...\n');

// 1. Password Policy Tests
console.log('--- 1. Password Policy (Min 8 Characters) ---');
{
  assert(!validateAdminPassword('').isValid, 'Empty password rejected');
  assert(!validateAdminPassword('1234567').isValid, '7-character password rejected');
  assert(validateAdminPassword('12345678').isValid, '8-character password accepted');
  assert(validateAdminPassword('Admin@12345').isValid, '11-character complex password accepted');
  assert(validateAdminPassword('SecureMasterPassword2026').isValid, 'Long password accepted');
}

// 2. Cryptographic Salt & Hashing Simulation
console.log('\n--- 2. Cryptographic Hashing & Salt Security ---');
{
  function hashWithSalt(password: string, salt: string): string {
    return crypto.createHash('sha256').update(password + salt).digest('hex');
  }

  const salt1 = crypto.randomBytes(16).toString('hex');
  const salt2 = crypto.randomBytes(16).toString('hex');
  assert(salt1 !== salt2, 'Salts are cryptographically unique');

  const password = 'Admin@12345';
  const hash1 = hashWithSalt(password, salt1);
  const hash2 = hashWithSalt(password, salt2);
  assert(hash1 !== hash2, 'Different salts produce different hashes for identical passwords');
  assert(hash1 === hashWithSalt(password, salt1), 'Matching salt verifies password correctly');
  assert(hash1 !== hashWithSalt('WrongPassword', salt1), 'Incorrect password fails hash check');
}

// 3. User Management Business Logic & Last Admin Protection
console.log('\n--- 3. User Management Business Logic & Last Admin Protection ---');
{
  interface MockUser {
    id: string;
    name: string;
    email: string;
    role: 'super_admin' | 'admin' | 'user';
    status: 'active' | 'suspended';
    passwordSalt?: string;
    passwordHash?: string;
  }

  let users: MockUser[] = [
    {
      id: 'super-admin-1',
      name: 'System SuperAdmin',
      email: 'admin@kroma.design',
      role: 'super_admin',
      status: 'active',
    },
    {
      id: 'admin-2',
      name: 'Operations Admin',
      email: 'ops@kroma.design',
      role: 'admin',
      status: 'active',
    },
    {
      id: 'reviewer-3',
      name: 'Design Reviewer',
      email: 'reviewer@kroma.design',
      role: 'user',
      status: 'active',
    },
  ];

  function removeUser(userId: string, currentSessionUserId: string): { success: boolean; error?: string } {
    const target = users.find((u) => u.id === userId);
    if (!target) return { success: false, error: 'User account not found.' };

    if (userId === currentSessionUserId) {
      return { success: false, error: 'You cannot remove your own active administrator account.' };
    }

    if (target.role === 'super_admin') {
      const activeSuperAdmins = users.filter((u) => u.role === 'super_admin' && u.status === 'active');
      if (activeSuperAdmins.length <= 1) {
        return { success: false, error: 'Cannot remove the last remaining Super Administrator account.' };
      }
    }

    const remainingAdmins = users.filter(
      (u) => u.id !== userId && (u.role === 'super_admin' || u.role === 'admin') && u.status === 'active'
    );
    if (remainingAdmins.length === 0) {
      return { success: false, error: 'System must maintain at least one valid Administrator account.' };
    }

    users = users.filter((u) => u.id !== userId);
    return { success: true };
  }

  // Attempt removing self
  const selfRemoveResult = removeUser('super-admin-1', 'super-admin-1');
  assert(!selfRemoveResult.success, 'Cannot remove own active account');
  assert(selfRemoveResult.error?.includes('own active'), 'Self-remove error message clear');

  // Attempt removing only super_admin when only 1 exists
  const superAdminRemoveResult = removeUser('super-admin-1', 'admin-2');
  assert(!superAdminRemoveResult.success, 'Cannot remove the last super_admin');
  assert(superAdminRemoveResult.error?.includes('last remaining Super Administrator'), 'Protected last Super Admin');

  // Remove reviewer user (non-admin)
  const removeReviewerResult = removeUser('reviewer-3', 'super-admin-1');
  assert(removeReviewerResult.success, 'Successfully removed reviewer');
  assert(users.length === 2, 'User count updated to 2');

  // Remove secondary admin
  const removeAdmin2Result = removeUser('admin-2', 'super-admin-1');
  assert(removeAdmin2Result.success, 'Successfully removed secondary admin');
  assert(users.length === 1, 'Only primary admin remains');

  // Attempt removing final admin
  const removeFinalAdmin = removeUser('super-admin-1', 'other-user');
  assert(!removeFinalAdmin.success, 'Cannot remove final admin account');
  assert(users.length === 1, 'Final admin remains intact');
}

// 4. Route Parsing & Redirection Emulation
console.log('\n--- 4. Route Parsing & Normalization ---');
{
  function urlToRoute(urlPath: string): { path: string; tab?: string } {
    const clean = urlPath.split('?')[0].split('#')[0];
    const segments = clean.split('/').filter(Boolean);
    const s0 = segments[0] ? segments[0].toLowerCase() : '';

    if (s0 === 'signup' || s0 === 'register' || s0 === 'create-account') {
      return { path: 'admin', tab: 'dashboard' };
    }

    if (s0 === 'admin') {
      const rawTab = segments[1];
      let tab = rawTab;
      if (rawTab === 'harmonies') tab = 'combos';
      if (rawTab === 'network') tab = 'relationships';
      if (rawTab === 'data-health') tab = 'validation';
      if (rawTab === 'roles') tab = 'users';
      if (rawTab === 'settings') tab = 'security';
      if (rawTab === 'signup' || rawTab === 'register' || rawTab === 'create-account' || rawTab === 'login') {
        tab = 'dashboard';
      }
      return { path: 'admin', tab: tab || undefined };
    }

    return { path: s0 || 'home' };
  }

  function routeToUrl(route: { path: string; tab?: string }): string {
    if (route.path === 'admin') {
      return route.tab ? `/admin/${route.tab}` : '/admin';
    }
    return `/${route.path}`;
  }

  // /admin
  const r1 = urlToRoute('/admin');
  assert(r1.path === 'admin' && r1.tab === undefined, '/admin routes to admin without tab (shows login form)');
  assert(routeToUrl(r1) === '/admin', 'routeToUrl preserves /admin without redirect to home');

  // /admin/dashboard
  const r2 = urlToRoute('/admin/dashboard');
  assert(r2.path === 'admin' && r2.tab === 'dashboard', '/admin/dashboard routes to admin dashboard');
  assert(routeToUrl(r2) === '/admin/dashboard', 'routeToUrl preserves /admin/dashboard');

  // /admin/users
  const r3 = urlToRoute('/admin/users');
  assert(r3.path === 'admin' && r3.tab === 'users', '/admin/users routes to admin users');
  assert(routeToUrl(r3) === '/admin/users', 'routeToUrl preserves /admin/users');

  // /admin/settings (alias to security)
  const r4 = urlToRoute('/admin/settings');
  assert(r4.path === 'admin' && r4.tab === 'security', '/admin/settings maps to security');

  // Public signup routes
  assert(urlToRoute('/signup').path === 'admin', '/signup redirects to /admin');
  assert(urlToRoute('/register').path === 'admin', '/register redirects to /admin');
  assert(urlToRoute('/create-account').path === 'admin', '/create-account redirects to /admin');

  // Admin signup routes
  assert(urlToRoute('/admin/signup').tab === 'dashboard', '/admin/signup normalizes to dashboard');
  assert(urlToRoute('/admin/register').tab === 'dashboard', '/admin/register normalizes to dashboard');
}

console.log('\n🎉 ALL ADMIN AUTH & USER MANAGEMENT TESTS PASSED!\n');
