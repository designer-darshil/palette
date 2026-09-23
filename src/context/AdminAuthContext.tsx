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
  isSuperAdmin: boolean;
  needsInitialSetup: boolean;
  setupInitialMasterPassword: (password: string) => Promise<{ success: boolean; error?: string }>;
  activityLogs: ActivityLogItem[];
  login: (password: string, email?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  changePassword: (currentPass: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  addUser: (name: string, email: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  removeUser: (id: string) => Promise<{ success: boolean; error?: string }>;
  updateUserRole: (id: string, newRole: UserRole) => Promise<{ success: boolean; error?: string }>;
  toggleUserStatus: (id: string) => Promise<{ success: boolean; error?: string }>;
  logActivity: (action: string, details: string) => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// Web Crypto SHA-256 with salt helper
async function hashPasswordWithSalt(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Generate cryptographically secure random hexadecimal salt
function generateCryptographicSalt(byteLength: number = 16): string {
  const array = new Uint8Array(byteLength);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
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
        if (!raw) return;

        const sessionPayload: StoredSessionPayload = JSON.parse(raw);
        if (!sessionPayload || !sessionPayload.user || !sessionPayload.expiresAt) {
          sessionStorage.removeItem('kroma_admin_session');
          return;
        }

        // 1. Expiration check
        const now = Date.now();
        if (now > sessionPayload.expiresAt) {
          sessionStorage.removeItem('kroma_admin_session');
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
          return;
        }

        // 3. Status check against current registered users
        const registered = users.find((u) => u.id === sessionPayload.user.id);
        if (!registered || registered.status !== 'active') {
          sessionStorage.removeItem('kroma_admin_session');
          return;
        }

        setCurrentUser(sessionPayload.user);
      } catch {
        sessionStorage.removeItem('kroma_admin_session');
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
    const validation = validateAdminPassword(password);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.firstError || 'Password does not meet required policy (12+ characters, uppercase, lowercase, number, special character).',
      };
    }

    const salt = generateCryptographicSalt(16);
    const hash = await hashPasswordWithSalt(password, salt);

    localStorage.setItem('kroma_admin_salt', salt);
    localStorage.setItem('kroma_admin_hash', hash);
    localStorage.setItem('kroma_admin_pwd_changed', 'true');
    setNeedsInitialSetup(false);

    logActivity('Master Security Initialized', 'Super administrator master credentials successfully established.');
    return { success: true };
  };

  const login = async (password: string, email: string = SUPER_ADMIN_EMAIL) => {
    if (needsInitialSetup) {
      return {
        success: false,
        error: 'System security setup pending. Please initialize your master administrator password.',
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

    const salt = localStorage.getItem('kroma_admin_salt');
    const expectedHash = localStorage.getItem('kroma_admin_hash');

    if (!salt || !expectedHash) {
      return { success: false, error: 'Cryptographic credentials missing. Run master setup.' };
    }

    const inputHash = await hashPasswordWithSalt(password, salt);

    if (inputHash !== expectedHash) {
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
  };

  const logout = () => {
    if (currentUser) {
      logActivity('Admin Logout', `User "${currentUser.email}" signed out`);
    }
    setCurrentUser(null);
    sessionStorage.removeItem('kroma_admin_session');
  };

  const changePassword = async (currentPass: string, newPass: string) => {
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

    const validation = validateAdminPassword(newPass);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.firstError || 'New password does not meet policy requirements (min 12 characters, uppercase, lowercase, number, and special character required).',
      };
    }

    const newSalt = generateCryptographicSalt(16);
    const newHash = await hashPasswordWithSalt(newPass, newSalt);

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
  };

  // Super Admin User Management Actions
  const addUser = async (name: string, email: string, role: UserRole) => {
    if (currentUser?.role !== 'super_admin') {
      return { success: false, error: 'Permission denied. Super Admin role required.' };
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
      return { success: false, error: 'A user with this email address already exists.' };
    }

    const newUser: AdminUser = {
      id: `usr-${Date.now()}-${generateCryptographicSalt(4)}`,
      name: name.trim(),
      email: normalizedEmail,
      role,
      status: 'active',
      createdAt: Date.now(),
      lastLogin: 0,
      passwordChanged: false,
    };

    setUsers((prev) => [newUser, ...prev]);
    logActivity('Created User', `Added user "${name}" (${normalizedEmail}) with role "${role}"`);
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
        return { success: false, error: 'Cannot complete this action. At least one Super Admin must remain in the system.' };
      }
    }

    // Self-destruct prevention
    if (currentUser.id === id) {
      return { success: false, error: 'Self-removal blocked. You cannot delete your own active administrative account.' };
    }

    setUsers((prev) => prev.filter((u) => u.id !== id));
    logActivity('Removed User', `Deleted user account "${targetUser.email}"`);
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
        isSuperAdmin: currentUser?.role === 'super_admin',
        needsInitialSetup,
        setupInitialMasterPassword,
        activityLogs,
        login,
        logout,
        changePassword,
        addUser,
        removeUser,
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
