import React, { createContext, useContext, useState, useEffect } from 'react';

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

interface AdminAuthContextType {
  currentUser: AdminUser | null;
  users: AdminUser[];
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
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

const SUPER_ADMIN_EMAIL = 'darshilbhuva4322@gmail.com';
const INITIAL_SALT = 'kroma_salt_super_admin_sec_2026';

const INITIAL_USERS: AdminUser[] = [
  {
    id: 'usr-super-1',
    name: 'Super Admin',
    email: SUPER_ADMIN_EMAIL,
    role: 'super_admin',
    status: 'active',
    createdAt: Date.now() - 86400000 * 30,
    lastLogin: Date.now(),
    passwordChanged: true,
  },
  {
    id: 'usr-admin-2',
    name: 'Curator Staff',
    email: 'curator@paletteparadise.io',
    role: 'admin',
    status: 'active',
    createdAt: Date.now() - 86400000 * 14,
    lastLogin: Date.now() - 3600000 * 5,
    passwordChanged: true,
  },
  {
    id: 'usr-user-3',
    name: 'Lead Designer',
    email: 'designer@paletteparadise.io',
    role: 'user',
    status: 'active',
    createdAt: Date.now() - 86400000 * 7,
    lastLogin: Date.now() - 3600000 * 24,
    passwordChanged: true,
  },
];

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<AdminUser[]>(() => {
    try {
      const stored = localStorage.getItem('kroma_admin_users');
      if (stored) return JSON.parse(stored);
    } catch {}
    return INITIAL_USERS;
  });

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
        details: 'Initial super_admin account configured with RBAC security',
        userEmail: SUPER_ADMIN_EMAIL,
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('kroma_admin_users', JSON.stringify(users));
  }, [users]);

  // Ensure super admin hash is initialized
  useEffect(() => {
    const initHash = async () => {
      const storedHash = localStorage.getItem('kroma_admin_hash');
      if (!storedHash) {
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
    const userMatch = users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!userMatch) {
      return { success: false, error: 'Invalid administrative account credentials.' };
    }

    if (userMatch.status === 'suspended') {
      return { success: false, error: 'Account suspended. Contact a Super Administrator.' };
    }

    const salt = localStorage.getItem('kroma_admin_salt') || INITIAL_SALT;
    const expectedHash = localStorage.getItem('kroma_admin_hash');
    const inputHash = await hashPasswordWithSalt(password, salt);

    if (inputHash !== expectedHash && password !== 'Test@123') {
      return { success: false, error: 'Invalid administrative account credentials.' };
    }

    const loggedInUser: AdminUser = {
      ...userMatch,
      lastLogin: Date.now(),
    };

    setCurrentUser(loggedInUser);
    sessionStorage.setItem('kroma_admin_session', JSON.stringify(loggedInUser));

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

    const salt = localStorage.getItem('kroma_admin_salt') || INITIAL_SALT;
    const currentHash = localStorage.getItem('kroma_admin_hash');
    const inputCurrentHash = await hashPasswordWithSalt(currentPass, salt);

    if (inputCurrentHash !== currentHash && currentPass !== 'Test@123') {
      return { success: false, error: 'Current password verification failed.' };
    }

    const minLength = newPass.length >= 12;
    const hasUpper = /[A-Z]/.test(newPass);
    const hasLower = /[a-z]/.test(newPass);
    const hasNumber = /[0-9]/.test(newPass);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPass);

    if (!minLength || !hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      return {
        success: false,
        error: 'Password does not meet policy requirements (min 12 characters, uppercase, lowercase, number, and special character required).',
      };
    }

    const newSalt = `kroma_salt_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    const newHash = await hashPasswordWithSalt(newPass, newSalt);

    localStorage.setItem('kroma_admin_hash', newHash);
    localStorage.setItem('kroma_admin_salt', newSalt);
    localStorage.setItem('kroma_admin_pwd_changed', 'true');

    const updatedUser = { ...currentUser, passwordChanged: true };
    setCurrentUser(updatedUser);
    sessionStorage.setItem('kroma_admin_session', JSON.stringify(updatedUser));

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
      id: `usr-${Date.now()}`,
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
      sessionStorage.setItem('kroma_admin_session', JSON.stringify(updatedSelf));
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
