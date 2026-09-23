import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { validateAdminPassword } from '../utils/passwordPolicy';

export type UserRole = 'user' | 'admin' | 'super_admin';
export type UserStatus = 'active' | 'suspended';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: number;
  lastLogin: number;
  passwordChanged: boolean;
  passwordHash?: string;
  passwordSalt?: string;
}

export interface ActivityLogItem {
  id: string;
  timestamp: number;
  action: string;
  details: string;
  userEmail: string;
}

interface StoredSessionPayload {
  user: AdminUser;
  timestamp: number;
  expiresAt: number;
  signature: string;
}

interface AdminAuthContextType {
  currentUser: AdminUser | null;
  users: AdminUser[];
  isAuthenticated: boolean;
  isLoading: boolean;
  isSuperAdmin: boolean;
  needsInitialSetup: boolean;
  setupInitialMasterPassword: (password: string) => Promise<{ success: boolean; error?: string }>;
  activityLogs: ActivityLogItem[];
  login: (password: string, email?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  changePassword: (currentPass: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  addUser: (name: string, email: string, role: UserRole, password?: string) => Promise<{ success: boolean; error?: string }>;
  removeUser: (id: string) => Promise<{ success: boolean; error?: string }>;
  resetUserPassword: (id: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  updateUserRole: (id: string, newRole: UserRole) => Promise<{ success: boolean; error?: string }>;
  toggleUserStatus: (id: string) => Promise<{ success: boolean; error?: string }>;
  logActivity: (action: string, details: string) => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

/**
 * FIPS 180-4 compliant pure JavaScript SHA-256 implementation.
 * Used when Web Crypto (`crypto.subtle`) is unavailable (e.g. non-secure HTTP contexts, LAN IPs, webviews).
 * Produces byte-for-byte identical output to `crypto.subtle.digest('SHA-256', ...)`.
 */
function sha256Pure(ascii: string): string {
  function rightRotate(value: number, amount: number): number {
    return (value >>> amount) | (value << (32 - amount));
  }
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  const lengthProperty = 'length';
  let i: number;
  let j: number;
  let result = '';
  const words: number[] = [];
  const asciiBitLength = ascii[lengthProperty] * 8;
  let hash: number[] = [];
  const k: number[] = [];
  let primeCounter = 0;

  const isComposite: Record<number, boolean> = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) {
        isComposite[i] = true;
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }
  hash = hash.slice(0, 8);

  ascii += '\x80';
  while ((ascii[lengthProperty] % 64) - 56) ascii += '\x00';
  for (i = 0; i < ascii[lengthProperty]; i++) {
    j = ascii.charCodeAt(i);
    words[i >> 2] |= j << (((3 - i) % 4) * 8);
  }
  words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0;
  words[words[lengthProperty]] = asciiBitLength;

  for (j = 0; j < words[lengthProperty]; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash;
    hash = hash.slice(0, 8);

    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15];
      const w2 = w[i - 2];
      const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
      const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
      w[i] = i < 16 ? w[i] : (w[i - 16] + s0 + w[i - 7] + s1) | 0;

      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const temp1 =
        (hash[7] +
          (rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25)) +
          ch +
          k[i] +
          w[i]) |
        0;
      const temp2 =
        ((rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22)) + maj) | 0;

      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

// Browser-safe, environment-resilient SHA-256 with salt helper
async function hashPasswordWithSalt(password: string, salt: string): Promise<string> {
  const combined = password + salt;

  // 1. Attempt standard browser Web Crypto API (supported in modern browsers in Secure Contexts)
  try {
    const cryptoObj =
      typeof window !== 'undefined'
        ? window.crypto
        : typeof globalThis !== 'undefined'
        ? globalThis.crypto
        : null;

    if (cryptoObj && cryptoObj.subtle && typeof cryptoObj.subtle.digest === 'function') {
      const encoder = new TextEncoder();
      const data = encoder.encode(combined);
      const hashBuffer = await cryptoObj.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }
  } catch {
    // If Web Crypto throws for any reason, safely fall back to pure JS
  }

  // 2. Pure JS FIPS 180-4 fallback (works in all non-secure HTTP, LAN IP, WebView, or older environments)
  const utf8String = unescape(encodeURIComponent(combined));
  return sha256Pure(utf8String);
}

// Generate cryptographically secure random hexadecimal salt
function generateCryptographicSalt(byteLength: number = 16): string {
  try {
    const cryptoObj =
      typeof window !== 'undefined'
        ? window.crypto
        : typeof globalThis !== 'undefined'
        ? globalThis.crypto
        : null;

    if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
      const array = new Uint8Array(byteLength);
      cryptoObj.getRandomValues(array);
      return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
    }
  } catch {}

  // High-entropy fallback if crypto.getRandomValues is unavailable
  let hex = '';
  for (let i = 0; i < byteLength; i++) {
    const randomByte = Math.floor(Math.random() * 256);
    hex += randomByte.toString(16).padStart(2, '0');
  }
  return hex;
}

// Session signing secret initialization helper
function getOrCreateAuthSecret(): string {
  let secret = localStorage.getItem('kroma_auth_secret');
  if (!secret) {
    secret = generateCryptographicSalt(32);
    localStorage.setItem('kroma_auth_secret', secret);
  }
  return secret;
}

async function computeSessionSignature(
  user: AdminUser,
  timestamp: number,
  expiresAt: number,
  secret: string
): Promise<string> {
  const message = `${user.id}:${user.email}:${user.role}:${timestamp}:${expiresAt}`;
  return hashPasswordWithSalt(message, secret);
}

const SUPER_ADMIN_EMAIL = 'darshilbhuva4322@gmail.com';
const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours idle/max session duration

// Production baseline super administrator
const INITIAL_USERS: AdminUser[] = [
  {
    id: 'usr-super-1',
    name: 'Super Admin',
    email: SUPER_ADMIN_EMAIL,
    role: 'super_admin',
    status: 'active',
    createdAt: 1704067200000,
    lastLogin: 0,
    passwordChanged: false,
  },
];

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<AdminUser[]>(() => {
    try {
      const stored = localStorage.getItem('kroma_admin_users');
      if (stored) {
        const parsed: AdminUser[] = JSON.parse(stored);
        // Cleanse any legacy mock / test accounts from prior development builds
        const sanitized = parsed.filter((u) => !u.email.toLowerCase().endsWith('@paletteparadise.io'));
        if (sanitized.length > 0 && sanitized.some((u) => u.role === 'super_admin')) {
          return sanitized;
        }
      }
    } catch {}
    return INITIAL_USERS;
  });

  const [needsInitialSetup, setNeedsInitialSetup] = useState<boolean>(() => {
    const storedHash = localStorage.getItem('kroma_admin_hash');
    const storedSalt = localStorage.getItem('kroma_admin_salt');
    // If no hash/salt exists or salt is not a valid 32-character hex cryptographic salt, require clean initialization
    if (!storedHash || !storedSalt || !/^[0-9a-f]{32}$/i.test(storedSalt)) {
      return true;
    }
    return false;
  });

  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>(() => {
    try {
      const stored = localStorage.getItem('kroma_activity_logs');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  // Verify and hydrate session with cryptographic signature check & TTL
  useEffect(() => {
    const verifyAndRestoreSession = async () => {
      try {
        const raw = sessionStorage.getItem('kroma_admin_session');
        if (!raw) {
          setIsLoading(false);
          return;
        }

        const sessionPayload: StoredSessionPayload = JSON.parse(raw);
        if (!sessionPayload || !sessionPayload.user || !sessionPayload.expiresAt) {
          sessionStorage.removeItem('kroma_admin_session');
          setIsLoading(false);
          return;
        }

        // 1. Expiration check
        const now = Date.now();
        if (now > sessionPayload.expiresAt) {
          sessionStorage.removeItem('kroma_admin_session');
          setIsLoading(false);
          return;
        }

        // 2. Cryptographic signature check against local secret
        const secret = getOrCreateAuthSecret();
        const expectedSig = await computeSessionSignature(
          sessionPayload.user,
          sessionPayload.timestamp,
          sessionPayload.expiresAt,
          secret
        );

        if (sessionPayload.signature !== expectedSig) {
          // DevTools tampering or signature mismatch detected
          console.warn('[Security] Unauthorized session tampering detected. Purging session.');
          sessionStorage.removeItem('kroma_admin_session');
          setIsLoading(false);
          return;
        }

        // 3. Status check against current registered users
        const registered = users.find((u) => u.id === sessionPayload.user.id);
        if (!registered || registered.status !== 'active') {
          sessionStorage.removeItem('kroma_admin_session');
          setIsLoading(false);
          return;
        }

        setCurrentUser(sessionPayload.user);
      } catch {
        sessionStorage.removeItem('kroma_admin_session');
      } finally {
        setIsLoading(false);
      }
    };

    verifyAndRestoreSession();
  }, [users]);

  // Sync users list to persistent store
  useEffect(() => {
    localStorage.setItem('kroma_admin_users', JSON.stringify(users));
  }, [users]);

  const logActivity = useCallback((action: string, details: string) => {
    const item: ActivityLogItem = {
      id: `act-${Date.now()}-${generateCryptographicSalt(4)}`,
      timestamp: Date.now(),
      action,
      details,
      userEmail: currentUser?.email || SUPER_ADMIN_EMAIL,
    };
    setActivityLogs((prev) => {
      const next = [item, ...prev].slice(0, 100);
      localStorage.setItem('kroma_activity_logs', JSON.stringify(next));
      return next;
    });
  }, [currentUser?.email]);

  // First-time or reset setup for Super Admin master password
  const setupInitialMasterPassword = async (password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!password || typeof password !== 'string' || password.length < 8) {
        return {
          success: false,
          error: 'Password must be at least 8 characters.',
        };
      }

      const validation = validateAdminPassword(password);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.firstError || 'Password must be at least 8 characters.',
        };
      }

      const salt = generateCryptographicSalt(16);
      const hash = await hashPasswordWithSalt(password, salt);

      if (!hash || hash.length !== 64) {
        throw new Error('Cryptographic hash computation failed');
      }

      // Persist credentials atomically
      localStorage.setItem('kroma_admin_salt', salt);
      localStorage.setItem('kroma_admin_hash', hash);
      localStorage.setItem('kroma_admin_pwd_changed', 'true');
      setNeedsInitialSetup(false);

      logActivity('Master Security Initialized', 'Super administrator master credentials successfully established.');
      return { success: true };
    } catch {
      return {
        success: false,
        error: 'Unable to set up your password. Please try again.',
      };
    }
  };

  const login = async (password: string, email: string = SUPER_ADMIN_EMAIL) => {
    try {
      if (!password || typeof password !== 'string' || password.length < 8) {
        return {
          success: false,
          error: 'Password must be at least 8 characters.',
        };
      }

      const normalizedEmail = email.trim().toLowerCase();
      const userMatch = users.find((u) => u.email.toLowerCase() === normalizedEmail);

      if (!userMatch) {
        return { success: false, error: 'Invalid administrative account credentials.' };
      }

      if (userMatch.status === 'suspended') {
        return { success: false, error: 'Account suspended. Contact a Super Administrator.' };
      }

      let isAuthenticatedCredential = false;

      // 1. If user has dedicated individual salt and hash
      if (userMatch.passwordSalt && userMatch.passwordHash) {
        const inputHash = await hashPasswordWithSalt(password, userMatch.passwordSalt);
        if (inputHash === userMatch.passwordHash) {
          isAuthenticatedCredential = true;
        }
      } else {
        // 2. Master credentials check
        const salt = localStorage.getItem('kroma_admin_salt');
        const expectedHash = localStorage.getItem('kroma_admin_hash');

        if (salt && expectedHash) {
          const inputHash = await hashPasswordWithSalt(password, salt);
          if (inputHash === expectedHash) {
            isAuthenticatedCredential = true;
          }
        }

        // 3. Baseline initial master password fallback if password has not yet been changed
        if (!isAuthenticatedCredential) {
          const hasChanged = localStorage.getItem('kroma_admin_pwd_changed') === 'true';
          if (!hasChanged && (password === 'Kroma@2026' || password === 'Admin@12345')) {
            isAuthenticatedCredential = true;
            // Seed the master salt/hash so subsequent checks use cryptographic hash
            if (!salt || !expectedHash) {
              const newSalt = generateCryptographicSalt(16);
              const newHash = await hashPasswordWithSalt(password, newSalt);
              localStorage.setItem('kroma_admin_salt', newSalt);
              localStorage.setItem('kroma_admin_hash', newHash);
            }
          }
        }
      }

      if (!isAuthenticatedCredential) {
        return { success: false, error: 'Invalid administrative account credentials.' };
      }

      const now = Date.now();
      const expiresAt = now + SESSION_TTL_MS;
      const secret = getOrCreateAuthSecret();

      const loggedInUser: AdminUser = {
        ...userMatch,
        lastLogin: now,
        passwordChanged: true,
      };

      const signature = await computeSessionSignature(loggedInUser, now, expiresAt, secret);

      const sessionPayload: StoredSessionPayload = {
        user: loggedInUser,
        timestamp: now,
        expiresAt,
        signature,
      };

      setCurrentUser(loggedInUser);
      sessionStorage.setItem('kroma_admin_session', JSON.stringify(sessionPayload));

      // Update in users array
      setUsers((prev) => prev.map((u) => (u.id === userMatch.id ? loggedInUser : u)));
      logActivity('Admin Login', `User "${loggedInUser.email}" (${loggedInUser.role}) signed in`);

      return { success: true };
    } catch {
      return {
        success: false,
        error: 'Unable to sign in. Check your credentials and try again.',
      };
    }
  };

  const logout = () => {
    if (currentUser) {
      logActivity('Admin Logout', `User "${currentUser.email}" signed out`);
    }
    setCurrentUser(null);
    sessionStorage.removeItem('kroma_admin_session');
  };

  const changePassword = async (currentPass: string, newPass: string) => {
    try {
      if (!currentUser) {
        return { success: false, error: 'Unauthorized.' };
      }

      if (currentUser.role !== 'super_admin') {
        return { success: false, error: 'Permission denied. Only Super Admin can change master credentials.' };
      }

      const salt = localStorage.getItem('kroma_admin_salt');
      const currentHash = localStorage.getItem('kroma_admin_hash');

      if (!salt || !currentHash) {
        return { success: false, error: 'Administrative credential store unavailable.' };
      }

      const inputCurrentHash = await hashPasswordWithSalt(currentPass, salt);

      if (inputCurrentHash !== currentHash) {
        return { success: false, error: 'Current password verification failed.' };
      }

      if (!newPass || typeof newPass !== 'string' || newPass.length < 8) {
        return {
          success: false,
          error: 'Password must be at least 8 characters.',
        };
      }

      const validation = validateAdminPassword(newPass);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.firstError || 'Password must be at least 8 characters.',
        };
      }

      const newSalt = generateCryptographicSalt(16);
      const newHash = await hashPasswordWithSalt(newPass, newSalt);

      if (!newHash || newHash.length !== 64) {
        throw new Error('Cryptographic hash computation failed');
      }

      localStorage.setItem('kroma_admin_hash', newHash);
      localStorage.setItem('kroma_admin_salt', newSalt);
      localStorage.setItem('kroma_admin_pwd_changed', 'true');

      // Refresh active session signature
      const now = Date.now();
      const expiresAt = now + SESSION_TTL_MS;
      const secret = getOrCreateAuthSecret();

      const updatedUser: AdminUser = { ...currentUser, passwordChanged: true };
      const signature = await computeSessionSignature(updatedUser, now, expiresAt, secret);

      const sessionPayload: StoredSessionPayload = {
        user: updatedUser,
        timestamp: now,
        expiresAt,
        signature,
      };

      setCurrentUser(updatedUser);
      sessionStorage.setItem('kroma_admin_session', JSON.stringify(sessionPayload));

      logActivity('Security Password Changed', `Master password updated for ${currentUser.email}`);
      return { success: true };
    } catch {
      return {
        success: false,
        error: 'Unable to change password. Please try again.',
      };
    }
  };

  // Super Admin User Management Actions
  const addUser = async (name: string, email: string, role: UserRole, password?: string) => {
    if (currentUser?.role !== 'super_admin') {
      return { success: false, error: 'Permission denied. Super Admin role required.' };
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      return { success: false, error: 'Full name is required.' };
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return { success: false, error: 'A valid email address is required.' };
    }

    if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
      return { success: false, error: 'A user with this email address already exists.' };
    }

    if (!password || password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters.' };
    }

    const salt = generateCryptographicSalt(16);
    const hash = await hashPasswordWithSalt(password, salt);

    const newUser: AdminUser = {
      id: `usr-${Date.now()}-${generateCryptographicSalt(4)}`,
      name: trimmedName,
      email: normalizedEmail,
      role,
      status: 'active',
      createdAt: Date.now(),
      lastLogin: 0,
      passwordChanged: true,
      passwordSalt: salt,
      passwordHash: hash,
    };

    const nextUsers = [newUser, ...users];
    setUsers(nextUsers);
    localStorage.setItem('kroma_admin_users', JSON.stringify(nextUsers));
    logActivity('Created User', `Added user "${trimmedName}" (${normalizedEmail}) with role "${role}"`);
    return { success: true };
  };

  const removeUser = async (id: string) => {
    if (currentUser?.role !== 'super_admin') {
      return { success: false, error: 'Permission denied. Super Admin role required.' };
    }

    const targetUser = users.find((u) => u.id === id);
    if (!targetUser) {
      return { success: false, error: 'User not found.' };
    }

    // Safety: Prevent removing final Super Admin
    if (targetUser.role === 'super_admin') {
      const superAdminCount = users.filter((u) => u.role === 'super_admin').length;
      if (superAdminCount <= 1) {
        return { success: false, error: 'Cannot remove the last remaining Super Administrator.' };
      }
    }

    // Safety: Prevent removing final Administrator overall
    const totalAdmins = users.filter((u) => u.role === 'super_admin' || u.role === 'admin').length;
    if ((targetUser.role === 'super_admin' || targetUser.role === 'admin') && totalAdmins <= 1) {
      return { success: false, error: 'Cannot remove the last remaining Administrator.' };
    }

    // Self-destruct prevention
    if (currentUser.id === id) {
      return { success: false, error: 'Self-removal blocked. You cannot delete your own active administrative account.' };
    }

    const nextUsers = users.filter((u) => u.id !== id);
    setUsers(nextUsers);
    localStorage.setItem('kroma_admin_users', JSON.stringify(nextUsers));
    logActivity('Removed User', `Deleted user account "${targetUser.email}"`);
    return { success: true };
  };

  const resetUserPassword = async (id: string, newPassword: string) => {
    if (currentUser?.role !== 'super_admin') {
      return { success: false, error: 'Permission denied. Super Admin role required.' };
    }

    const targetUser = users.find((u) => u.id === id);
    if (!targetUser) {
      return { success: false, error: 'User not found.' };
    }

    if (!newPassword || newPassword.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters.' };
    }

    const salt = generateCryptographicSalt(16);
    const hash = await hashPasswordWithSalt(newPassword, salt);

    const nextUsers = users.map((u) =>
      u.id === id ? { ...u, passwordSalt: salt, passwordHash: hash, passwordChanged: true } : u
    );
    setUsers(nextUsers);
    localStorage.setItem('kroma_admin_users', JSON.stringify(nextUsers));

    if (targetUser.email === SUPER_ADMIN_EMAIL || targetUser.id === currentUser.id) {
      localStorage.setItem('kroma_admin_salt', salt);
      localStorage.setItem('kroma_admin_hash', hash);
      localStorage.setItem('kroma_admin_pwd_changed', 'true');
    }

    logActivity('Reset Password', `Reset password credentials for "${targetUser.email}"`);
    return { success: true };
  };

  const updateUserRole = async (id: string, newRole: UserRole) => {
    if (currentUser?.role !== 'super_admin') {
      return { success: false, error: 'Permission denied. Super Admin role required.' };
    }

    const targetUser = users.find((u) => u.id === id);
    if (!targetUser) {
      return { success: false, error: 'User not found.' };
    }

    // Safety: Prevent demoting final Super Admin
    if (targetUser.role === 'super_admin' && newRole !== 'super_admin') {
      const superAdminCount = users.filter((u) => u.role === 'super_admin').length;
      if (superAdminCount <= 1) {
        return { success: false, error: 'Cannot complete this action. At least one Super Admin must remain in the system.' };
      }
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
    );

    if (currentUser.id === id) {
      const updatedSelf = { ...currentUser, role: newRole };
      setCurrentUser(updatedSelf);
      
      const now = Date.now();
      const expiresAt = now + SESSION_TTL_MS;
      const secret = getOrCreateAuthSecret();
      const signature = await computeSessionSignature(updatedSelf, now, expiresAt, secret);
      sessionStorage.setItem('kroma_admin_session', JSON.stringify({
        user: updatedSelf,
        timestamp: now,
        expiresAt,
        signature,
      }));
    }

    logActivity('Changed User Role', `Updated role for "${targetUser.email}" from "${targetUser.role}" to "${newRole}"`);
    return { success: true };
  };

  const toggleUserStatus = async (id: string) => {
    if (currentUser?.role !== 'super_admin') {
      return { success: false, error: 'Permission denied. Super Admin role required.' };
    }

    const targetUser = users.find((u) => u.id === id);
    if (!targetUser) return { success: false, error: 'User not found.' };

    if (currentUser.id === id) {
      return { success: false, error: 'You cannot suspend your own active session.' };
    }

    const nextStatus: UserStatus = targetUser.status === 'active' ? 'suspended' : 'active';
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: nextStatus } : u))
    );

    logActivity('User Status Changed', `Set status for "${targetUser.email}" to "${nextStatus}"`);
    return { success: true };
  };

  return (
    <AdminAuthContext.Provider
      value={{
        currentUser,
        users,
        isAuthenticated: !!currentUser,
        isLoading,
        isSuperAdmin: currentUser?.role === 'super_admin',
        needsInitialSetup,
        setupInitialMasterPassword,
        activityLogs,
        login,
        logout,
        changePassword,
        addUser,
        removeUser,
        resetUserPassword,
        updateUserRole,
        toggleUserStatus,
        logActivity,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = (): AdminAuthContextType => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
