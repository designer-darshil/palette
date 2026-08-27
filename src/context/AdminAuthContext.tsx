import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'user' | 'admin' | 'super_admin';

export interface AdminUser {
  email: string;
  role: UserRole;
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

interface AdminAuthContextType {
  currentUser: AdminUser | null;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  activityLogs: ActivityLogItem[];
  login: (password: string, email?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  changePassword: (currentPass: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
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

const SUPER_ADMIN_EMAIL = 'darshilbhuva4322@gmail.com';
const INITIAL_SALT = 'kroma_salt_super_admin_sec_2026';

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => {
    try {
      const stored = sessionStorage.getItem('kroma_admin_session');
      if (stored) return JSON.parse(stored);
    } catch {}
    return null;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>(() => {
    try {
      const stored = localStorage.getItem('kroma_activity_logs');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 'act-1',
        timestamp: Date.now() - 3600000 * 2,
        action: 'System Provisioned',
        details: 'Initial super_admin account configured with security parameters',
        userEmail: SUPER_ADMIN_EMAIL,
      },
    ];
  });

  // Ensure super admin hash is initialized in localStorage
  useEffect(() => {
    const initHash = async () => {
      const storedHash = localStorage.getItem('kroma_admin_hash');
      if (!storedHash) {
        // Initial setup credential: Test@123
        const initialHash = await hashPasswordWithSalt('Test@123', INITIAL_SALT);
        localStorage.setItem('kroma_admin_hash', initialHash);
        localStorage.setItem('kroma_admin_salt', INITIAL_SALT);
      }
    };
    initHash();
  }, []);

  const logActivity = (action: string, details: string) => {
    const item: ActivityLogItem = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
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
  };

  const login = async (password: string, email: string = SUPER_ADMIN_EMAIL) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail !== SUPER_ADMIN_EMAIL) {
      return { success: false, error: 'Invalid administrative account credentials.' };
    }

    const salt = localStorage.getItem('kroma_admin_salt') || INITIAL_SALT;
    const expectedHash = localStorage.getItem('kroma_admin_hash');
    const inputHash = await hashPasswordWithSalt(password, salt);

    if (inputHash !== expectedHash) {
      return { success: false, error: 'Invalid administrative account credentials.' };
    }

    const user: AdminUser = {
      email: SUPER_ADMIN_EMAIL,
      role: 'super_admin',
      createdAt: Date.now() - 86400000,
      lastLogin: Date.now(),
      passwordChanged: localStorage.getItem('kroma_admin_pwd_changed') === 'true',
    };

    setCurrentUser(user);
    sessionStorage.setItem('kroma_admin_session', JSON.stringify(user));
    logActivity('Admin Login', `Super Admin signed in successfully from ${navigator.userAgent.substring(0, 30)}...`);

    return { success: true };
  };

  const logout = () => {
    if (currentUser) {
      logActivity('Admin Logout', 'Super Admin signed out of session');
    }
    setCurrentUser(null);
    sessionStorage.removeItem('kroma_admin_session');
  };

  const changePassword = async (currentPass: string, newPass: string) => {
    if (!currentUser || currentUser.role !== 'super_admin') {
      return { success: false, error: 'Unauthorized. Super Admin authorization required.' };
    }

    const salt = localStorage.getItem('kroma_admin_salt') || INITIAL_SALT;
    const currentHash = localStorage.getItem('kroma_admin_hash');
    const inputCurrentHash = await hashPasswordWithSalt(currentPass, salt);

    if (inputCurrentHash !== currentHash) {
      return { success: false, error: 'Current password verification failed.' };
    }

    // Enforce strong password policy
    // Requirements: At least 12 characters, uppercase, lowercase, number, special character
    const minLength = newPass.length >= 12;
    const hasUpper = /[A-Z]/.test(newPass);
    const hasLower = /[a-z]/.test(newPass);
    const hasNumber = /[0-9]/.test(newPass);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPass);

    if (!minLength || !hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      return {
        success: false,
        error: 'Password does not meet policy requirements (minimum 12 characters, uppercase, lowercase, number, and special character required).',
      };
    }

    // Generate new unique salt and hash
    const newSalt = `kroma_salt_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    const newHash = await hashPasswordWithSalt(newPass, newSalt);

    localStorage.setItem('kroma_admin_hash', newHash);
    localStorage.setItem('kroma_admin_salt', newSalt);
    localStorage.setItem('kroma_admin_pwd_changed', 'true');

    const updatedUser = { ...currentUser, passwordChanged: true };
    setCurrentUser(updatedUser);
    sessionStorage.setItem('kroma_admin_session', JSON.stringify(updatedUser));

    logActivity('Security Password Changed', 'Super Admin master password was changed and re-salted');
    return { success: true };
  };

  return (
    <AdminAuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isSuperAdmin: currentUser?.role === 'super_admin',
        activityLogs,
        login,
        logout,
        changePassword,
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
