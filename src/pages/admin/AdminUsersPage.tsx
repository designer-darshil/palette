import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  ShieldAlert,
  Trash2,
  Edit2,
  Search,
  CheckCircle2,
  Ban,
  AlertCircle,
  X,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAdminAuth, UserRole, AdminUser } from '../../context/AdminAuthContext';
import { KromaButton } from '../../components/common/KromaButton';

export const AdminUsersPage: React.FC = () => {
  const {
    users,
    currentUser,
    isSuperAdmin,
    addUser,
    removeUser,
    updateUserRole,
    toggleUserStatus,
    resetUserPassword,
  } = useAdminAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Add User State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newRole, setNewRole] = useState<UserRole>('admin');
  const [addError, setAddError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Edit Role State
  const [roleChangeTarget, setRoleChangeTarget] = useState<AdminUser | null>(null);
  const [targetNewRole, setTargetNewRole] = useState<UserRole>('admin');
  const [isChangingRole, setIsChangingRole] = useState(false);

  // Reset Password State
  const [resetTarget, setResetTarget] = useState<AdminUser | null>(null);
  const [resetPasswordVal, setResetPasswordVal] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  // Remove User State
  const [removeTarget, setRemoveTarget] = useState<AdminUser | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  // Page Feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (selectedRole !== 'all' && u.role !== selectedRole) return false;
      if (selectedStatus !== 'all' && u.status !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [users, selectedRole, selectedStatus, searchQuery]);

  const handleOpenAddModal = () => {
    setNewName('');
    setNewEmail('');
    setNewPassword('');
    setShowNewPassword(false);
    setNewRole('admin');
    setAddError(null);
    setShowAddModal(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    setFeedback(null);

    if (!newPassword || newPassword.length < 8) {
      setAddError('Password must be at least 8 characters long.');
      return;
    }

    setIsAdding(true);
    try {
      const res = await addUser(newName, newEmail, newRole, newPassword);
      if (res.success) {
        setFeedback({ type: 'success', text: `User "${newName}" was successfully created.` });
        setShowAddModal(false);
        setNewName('');
        setNewEmail('');
        setNewPassword('');
      } else {
        setAddError(res.error || 'Failed to add user.');
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleOpenResetModal = (user: AdminUser) => {
    setResetTarget(user);
    setResetPasswordVal('');
    setShowResetPassword(false);
    setResetError(null);
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTarget) return;
    setResetError(null);
    setFeedback(null);

    if (!resetPasswordVal || resetPasswordVal.length < 8) {
      setResetError('Password must be at least 8 characters long.');
      return;
    }

    setIsResetting(true);
    try {
      const res = await resetUserPassword(resetTarget.id, resetPasswordVal);
      if (res.success) {
        setFeedback({ type: 'success', text: `Password for "${resetTarget.email}" has been reset.` });
        setResetTarget(null);
        setResetPasswordVal('');
      } else {
        setResetError(res.error || 'Failed to reset password.');
      }
    } finally {
      setIsResetting(false);
    }
  };

  const handleConfirmRoleChange = async () => {
    if (!roleChangeTarget) return;
    setFeedback(null);
    setIsChangingRole(true);
    try {
      const res = await updateUserRole(roleChangeTarget.id, targetNewRole);
      if (res.success) {
        setFeedback({ type: 'success', text: `Role for "${roleChangeTarget.email}" updated to ${targetNewRole.replace('_', ' ')}.` });
        setRoleChangeTarget(null);
      } else {
        setFeedback({ type: 'error', text: res.error || 'Failed to update role.' });
      }
    } finally {
      setIsChangingRole(false);
    }
  };

  const handleConfirmRemove = async () => {
    if (!removeTarget) return;
    setFeedback(null);
    setIsRemoving(true);
    try {
      const res = await removeUser(removeTarget.id);
      if (res.success) {
        setFeedback({ type: 'success', text: `User account "${removeTarget.email}" has been removed.` });
        setRemoveTarget(null);
      } else {
        setFeedback({ type: 'error', text: res.error || 'Failed to remove user.' });
        setRemoveTarget(null);
      }
    } finally {
      setIsRemoving(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="p-8 text-center bg-kroma-card border border-kroma-border rounded-xs max-w-md mx-auto">
        <ShieldAlert size={32} className="text-[#D70015] dark:text-[#FF453A] mx-auto mb-3" />
        <h2 className="text-base font-bold text-kroma-foreground mb-1">Access Restricted</h2>
        <p className="text-sm text-kroma-muted">
          User &amp; role administration is exclusively restricted to authorized Super Administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-kroma-foreground">
            User Management
          </h1>
          <p className="text-xs text-kroma-muted mt-1 font-mono">
            Administrative access control, credential management, and role provisioning.
          </p>
        </div>

        <KromaButton
          onClick={handleOpenAddModal}
          variant="filled"
          size="sm"
          iconLeft={<UserPlus size={14} />}
        >
          ADD USER
        </KromaButton>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          role="alert"
          className={`flex items-center gap-2.5 px-4 py-3 text-xs rounded-xs font-mono border ${
            feedback.type === 'success'
              ? 'bg-[#1B8738]/10 text-[#1B8738] dark:bg-[#34C759]/10 dark:text-[#34C759] border-[#1B8738]/20 dark:border-[#34C759]/20'
              : 'bg-[#D70015]/10 text-[#D70015] dark:bg-[#FF453A]/10 dark:text-[#FF453A] border-[#D70015]/20 dark:border-[#FF453A]/20'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 size={16} className="shrink-0" />
          ) : (
            <AlertCircle size={16} className="shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-3 bg-kroma-card border border-kroma-border rounded-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-3 text-kroma-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Search user name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-black/[0.03] dark:bg-white/[0.04] border border-kroma-border rounded-xs text-xs text-kroma-foreground placeholder-kroma-muted w-64 focus:outline-none focus:border-kroma-foreground font-sans"
            />
          </div>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-1.5 bg-black/[0.03] dark:bg-white/[0.04] border border-kroma-border rounded-xs text-xs text-kroma-foreground focus:outline-none font-sans"
          >
            <option value="all">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 bg-black/[0.03] dark:bg-white/[0.04] border border-kroma-border rounded-xs text-xs text-kroma-foreground focus:outline-none font-sans"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        <div className="font-mono text-xs text-kroma-muted tracking-wide">
          {filteredUsers.length} {filteredUsers.length === 1 ? 'ACCOUNT' : 'ACCOUNTS'}
        </div>
      </div>

      {/* User Table */}
      <div className="admin-table-container bg-kroma-card border border-kroma-border rounded-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black/[0.02] dark:bg-white/[0.03] border-b border-kroma-border font-mono text-xs text-kroma-muted tracking-wider">
              <th className="py-3 px-4 font-semibold">USER</th>
              <th className="py-3 px-4 font-semibold">EMAIL</th>
              <th className="py-3 px-4 font-semibold">ROLE</th>
              <th className="py-3 px-4 font-semibold">STATUS</th>
              <th className="py-3 px-4 font-semibold">CREATED</th>
              <th className="py-3 px-4 font-semibold text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-kroma-border text-sm">
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
              >
                <td className="py-3 px-4 font-medium text-kroma-foreground">
                  <div className="flex items-center gap-2">
                    <span>{user.name}</span>
                    {user.id === currentUser?.id && (
                      <span className="font-mono text-xs uppercase px-1.5 py-0.5 bg-[#D70015]/15 dark:bg-[#FF453A]/15 text-[#D70015] dark:text-[#FF453A] rounded-xs font-bold">
                        YOU
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4 font-mono text-xs text-kroma-muted">
                  {user.email}
                </td>
                <td className="py-3 px-4 font-mono text-xs uppercase">
                  <span
                    className={`font-bold ${
                      user.role === 'super_admin'
                        ? 'text-[#D70015] dark:text-[#FF453A]'
                        : 'text-[#0077A8] dark:text-[#00AEEF]'
                    }`}
                  >
                    {user.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center gap-1.5 font-mono text-xs uppercase font-bold px-2 py-0.5 rounded-xs ${
                      user.status === 'active'
                        ? 'bg-[#1B8738]/10 text-[#1B8738] dark:bg-[#34C759]/10 dark:text-[#34C759]'
                        : 'bg-[#D70015]/10 text-[#D70015] dark:bg-[#FF453A]/10 dark:text-[#FF453A]'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        user.status === 'active' ? 'bg-[#1B8738] dark:bg-[#34C759]' : 'bg-[#D70015] dark:bg-[#FF453A]'
                      }`}
                    />
                    {user.status}
                  </span>
                </td>
                <td className="py-3 px-4 font-mono text-xs text-kroma-muted">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setRoleChangeTarget(user);
                        setTargetNewRole(user.role);
                      }}
                      title="Edit Role"
                      className="p-1.5 text-kroma-muted hover:text-kroma-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-xs transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenResetModal(user)}
                      title="Reset Password"
                      className="p-1.5 text-kroma-muted hover:text-kroma-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-xs transition-colors"
                    >
                      <KeyRound size={14} />
                    </button>
                    {user.id !== currentUser?.id && (
                      <>
                        <button
                          type="button"
                          onClick={() => toggleUserStatus(user.id)}
                          title={user.status === 'active' ? 'Suspend User' : 'Activate User'}
                          className="p-1.5 text-kroma-muted hover:text-[#B35300] dark:hover:text-[#FF9500] hover:bg-black/5 dark:hover:bg-white/5 rounded-xs transition-colors"
                        >
                          <Ban size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setRemoveTarget(user)}
                          title="Remove User"
                          className="p-1.5 text-[#D70015] dark:text-[#FF453A] hover:bg-[#D70015]/10 rounded-xs transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white dark:bg-[#111216] border border-kroma-border rounded-xs p-6 max-w-md w-full flex flex-col gap-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-kroma-border">
              <h2 className="text-base font-bold text-kroma-foreground">ADD USER</h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                aria-label="Close"
                className="text-kroma-muted hover:text-kroma-foreground transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {addError && (
              <div
                role="alert"
                className="flex items-center gap-2 p-3 text-xs font-mono rounded-xs border bg-[#D70015]/10 text-[#D70015] dark:bg-[#FF453A]/10 dark:text-[#FF453A] border-[#D70015]/20 dark:border-[#FF453A]/20"
              >
                <AlertCircle size={14} className="shrink-0" />
                <span>{addError}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-mono text-kroma-muted mb-1 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/[0.04] border border-kroma-border rounded-xs text-sm font-sans text-kroma-foreground focus:outline-none focus:border-kroma-foreground"
                  placeholder="e.g. Kenji Sato"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-kroma-muted mb-1 uppercase tracking-wider">
                  Email / Username
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/[0.04] border border-kroma-border rounded-xs text-sm font-mono text-kroma-foreground focus:outline-none focus:border-kroma-foreground"
                  placeholder="name@kroma.design"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-kroma-muted mb-1 uppercase tracking-wider">
                  Password <span className="normal-case text-kroma-muted">(min 8 characters)</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 bg-black/[0.03] dark:bg-white/[0.04] border border-kroma-border rounded-xs text-sm font-mono text-kroma-foreground focus:outline-none focus:border-kroma-foreground"
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-kroma-muted hover:text-kroma-foreground transition-colors"
                  >
                    {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-kroma-muted mb-1 uppercase tracking-wider">
                  Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/[0.04] border border-kroma-border rounded-xs text-sm font-sans text-kroma-foreground focus:outline-none"
                >
                  <option value="admin">Admin (Library management &amp; editing)</option>
                  <option value="super_admin">Super Admin (Full system control)</option>
                  <option value="user">User (Read-only administrative review)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-kroma-border">
                <KromaButton
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                  disabled={isAdding}
                >
                  CANCEL
                </KromaButton>
                <KromaButton
                  type="submit"
                  variant="filled"
                  size="sm"
                  isLoading={isAdding}
                >
                  ADD USER
                </KromaButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetTarget && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setResetTarget(null)}
        >
          <div
            className="bg-white dark:bg-[#111216] border border-kroma-border rounded-xs p-6 max-w-sm w-full flex flex-col gap-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-kroma-border">
              <h2 className="text-base font-bold text-kroma-foreground">RESET PASSWORD</h2>
              <button
                type="button"
                onClick={() => setResetTarget(null)}
                aria-label="Close"
                className="text-kroma-muted hover:text-kroma-foreground transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-kroma-muted font-mono leading-relaxed">
              Set a new administrative password for <strong className="text-kroma-foreground">{resetTarget.name}</strong> ({resetTarget.email}).
            </p>

            {resetError && (
              <div
                role="alert"
                className="flex items-center gap-2 p-2.5 text-xs font-mono rounded-xs border bg-[#D70015]/10 text-[#D70015] dark:bg-[#FF453A]/10 dark:text-[#FF453A] border-[#D70015]/20 dark:border-[#FF453A]/20"
              >
                <AlertCircle size={14} className="shrink-0" />
                <span>{resetError}</span>
              </div>
            )}

            <form onSubmit={handleResetSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-mono text-kroma-muted mb-1 uppercase tracking-wider">
                  New Password <span className="normal-case text-kroma-muted">(min 8 characters)</span>
                </label>
                <div className="relative">
                  <input
                    type={showResetPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={resetPasswordVal}
                    onChange={(e) => setResetPasswordVal(e.target.value)}
                    className="w-full px-3 py-2 pr-10 bg-black/[0.03] dark:bg-white/[0.04] border border-kroma-border rounded-xs text-sm font-mono text-kroma-foreground focus:outline-none focus:border-kroma-foreground"
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    aria-label={showResetPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-kroma-muted hover:text-kroma-foreground transition-colors"
                  >
                    {showResetPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-kroma-border">
                <KromaButton
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setResetTarget(null)}
                  disabled={isResetting}
                >
                  CANCEL
                </KromaButton>
                <KromaButton
                  type="submit"
                  variant="filled"
                  size="sm"
                  isLoading={isResetting}
                >
                  RESET PASSWORD
                </KromaButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      {roleChangeTarget && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setRoleChangeTarget(null)}
        >
          <div
            className="bg-white dark:bg-[#111216] border border-kroma-border rounded-xs p-6 max-w-sm w-full flex flex-col gap-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-kroma-border">
              <h2 className="text-base font-bold text-kroma-foreground">EDIT ROLE</h2>
              <button
                type="button"
                onClick={() => setRoleChangeTarget(null)}
                aria-label="Close"
                className="text-kroma-muted hover:text-kroma-foreground transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-kroma-muted font-mono leading-relaxed">
              Adjust authorization for <strong className="text-kroma-foreground">{roleChangeTarget.email}</strong>.
            </p>

            <select
              value={targetNewRole}
              onChange={(e) => setTargetNewRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/[0.04] border border-kroma-border rounded-xs text-xs font-mono text-kroma-foreground focus:outline-none"
            >
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>

            <div className="flex justify-end gap-2 pt-3 border-t border-kroma-border">
              <KromaButton
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRoleChangeTarget(null)}
                disabled={isChangingRole}
              >
                CANCEL
              </KromaButton>
              <KromaButton
                type="button"
                variant="filled"
                size="sm"
                onClick={handleConfirmRoleChange}
                isLoading={isChangingRole}
              >
                SAVE
              </KromaButton>
            </div>
          </div>
        </div>
      )}

      {/* Remove User Confirmation Modal */}
      {removeTarget && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setRemoveTarget(null)}
        >
          <div
            className="bg-white dark:bg-[#111216] border border-kroma-border rounded-xs p-6 max-w-sm w-full flex flex-col gap-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-kroma-border">
              <h2 className="text-base font-bold text-[#D70015] dark:text-[#FF453A]">
                REMOVE USER?
              </h2>
              <button
                type="button"
                onClick={() => setRemoveTarget(null)}
                aria-label="Close"
                className="text-kroma-muted hover:text-kroma-foreground transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-kroma-foreground">
                Are you sure you want to remove this user?
              </p>
              <p className="text-xs text-kroma-muted font-mono leading-relaxed">
                This will permanently delete the account for <strong className="text-kroma-foreground">{removeTarget.name}</strong> ({removeTarget.email}). They will permanently lose administrative access.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-kroma-border">
              <KromaButton
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRemoveTarget(null)}
                disabled={isRemoving}
              >
                CANCEL
              </KromaButton>
              <KromaButton
                type="button"
                variant="filled"
                size="sm"
                onClick={handleConfirmRemove}
                isLoading={isRemoving}
                className="!bg-[#D70015] dark:!bg-[#FF453A] !text-white hover:opacity-90"
              >
                REMOVE USER
              </KromaButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
