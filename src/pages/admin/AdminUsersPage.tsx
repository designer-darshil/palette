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
} from 'lucide-react';
import { useAdminAuth, UserRole, AdminUser } from '../../context/AdminAuthContext';
import { KromaButton } from '../../components/common/KromaButton';

export const AdminUsersPage: React.FC = () => {
  const { users, currentUser, isSuperAdmin, addUser, removeUser, updateUserRole, toggleUserStatus } = useAdminAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('admin');

  const [roleChangeTarget, setRoleChangeTarget] = useState<AdminUser | null>(null);
  const [targetNewRole, setTargetNewRole] = useState<UserRole>('admin');

  const [removeTarget, setRemoveTarget] = useState<AdminUser | null>(null);
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

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    const res = await addUser(newName, newEmail, newRole);
    if (res.success) {
      setFeedback({ type: 'success', text: `User "${newName}" successfully provisioned.` });
      setShowAddModal(false);
      setNewName('');
      setNewEmail('');
    } else {
      setFeedback({ type: 'error', text: res.error || 'Failed to add user.' });
    }
  };

  const handleConfirmRoleChange = async () => {
    if (!roleChangeTarget) return;
    setFeedback(null);
    const res = await updateUserRole(roleChangeTarget.id, targetNewRole);
    if (res.success) {
      setFeedback({ type: 'success', text: `Role for "${roleChangeTarget.email}" updated to ${targetNewRole}.` });
      setRoleChangeTarget(null);
    } else {
      setFeedback({ type: 'error', text: res.error || 'Failed to update role.' });
    }
  };

  const handleConfirmRemove = async () => {
    if (!removeTarget) return;
    setFeedback(null);
    const res = await removeUser(removeTarget.id);
    if (res.success) {
      setFeedback({ type: 'success', text: `User account "${removeTarget.email}" removed.` });
      setRemoveTarget(null);
    } else {
      setFeedback({ type: 'error', text: res.error || 'Failed to remove user.' });
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="p-8 text-center bg-white dark:bg-[#111216] border border-black/10 dark:border-white/10 rounded-xs max-w-md mx-auto">
        <ShieldAlert size={32} className="text-[#D70015] dark:text-[#FF453A] mx-auto mb-3" />
        <h2 className="text-base font-bold mb-1">Access Restricted</h2>
        <p className="text-xs text-[#595959] dark:text-[#9DA3AF]">
          User &amp; role administration is exclusively restricted to the Super Administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#171717] dark:text-[#F8F8F8]">
            Staff &amp; Role Management
          </h1>
          <p className="text-xs text-[#595959] dark:text-[#9DA3AF] mt-1 font-mono">
            RBAC permission control, administrative provisioning, and access policies.
          </p>
        </div>

        <KromaButton
          onClick={() => setShowAddModal(true)}
          variant="filled"
          size="sm"
          iconLeft={<UserPlus size={14} />}
        >
          Add Staff Member
        </KromaButton>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          role="alert"
          className={`flex items-center gap-2 px-3.5 py-2.5 text-xs rounded-xs font-mono border ${
            feedback.type === 'success'
              ? 'bg-[#1B8738]/10 text-[#1B8738] dark:bg-[#34C759]/10 dark:text-[#34C759] border-[#1B8738]/20 dark:border-[#34C759]/20'
              : 'bg-[#D70015]/10 text-[#D70015] dark:bg-[#FF453A]/10 dark:text-[#FF453A] border-[#D70015]/20 dark:border-[#FF453A]/20'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 size={14} className="shrink-0" /> : <AlertCircle size={14} className="shrink-0" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-3 bg-white dark:bg-[#111216] border border-black/10 dark:border-white/10 rounded-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-2.5 text-[#707070]" />
            <input
              type="text"
              placeholder="Search user name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xs text-xs text-[#171717] dark:text-[#F8F8F8] placeholder-[#707070] w-64 focus:outline-none focus:border-[#171717] dark:focus:border-[#F8F8F8]"
            />
          </div>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-2.5 py-1.5 bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xs text-xs text-[#171717] dark:text-[#F8F8F8] focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xs text-xs text-[#171717] dark:text-[#F8F8F8] focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        <div className="font-mono text-xs text-[#707070] dark:text-[#9DA3AF]">
          {filteredUsers.length} STAFF ACCOUNTS
        </div>
      </div>

      {/* Editorial Table */}
      <div className="admin-table-container">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-black/[0.02] dark:bg-white/[0.04] border-b border-black/10 dark:border-white/10 font-mono text-[10.5px] text-[#707070] dark:text-[#9DA3AF]">
              <th className="py-2.5 px-4 font-semibold">USER</th>
              <th className="py-2.5 px-4 font-semibold">EMAIL</th>
              <th className="py-2.5 px-4 font-semibold">ROLE</th>
              <th className="py-2.5 px-4 font-semibold">STATUS</th>
              <th className="py-2.5 px-4 font-semibold">CREATED</th>
              <th className="py-2.5 px-4 font-semibold text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/5">
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
              >
                <td className="py-2.5 px-4 font-semibold text-[#171717] dark:text-[#F8F8F8]">
                  {user.name}
                  {user.id === currentUser?.id && (
                    <span className="ml-2 font-mono text-[9px] uppercase px-1 py-0.2 bg-[#D70015]/15 dark:bg-[#FF453A]/15 text-[#D70015] dark:text-[#FF453A] rounded-xs font-bold">
                      YOU
                    </span>
                  )}
                </td>
                <td className="py-2.5 px-4 font-mono text-[11px] text-[#595959] dark:text-[#9DA3AF]">
                  {user.email}
                </td>
                <td className="py-2.5 px-4 font-mono text-[11px] uppercase">
                  <span
                    className={`font-bold ${user.role === 'super_admin' ? 'text-[#D70015] dark:text-[#FF453A]' : 'text-[#0077A8] dark:text-[#00AEEF]'}`}
                  >
                    {user.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-2.5 px-4">
                  <span
                    className={`inline-flex items-center gap-1 font-mono text-[10.5px] uppercase font-bold px-1.5 py-0.5 rounded-xs ${
                      user.status === 'active'
                        ? 'bg-[#1B8738]/10 text-[#1B8738] dark:bg-[#34C759]/10 dark:text-[#34C759]'
                        : 'bg-[#D70015]/10 text-[#D70015] dark:bg-[#FF453A]/10 dark:text-[#FF453A]'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-[#1B8738] dark:bg-[#34C759]' : 'bg-[#D70015] dark:bg-[#FF453A]'}`} />
                    {user.status}
                  </span>
                </td>
                <td className="py-2.5 px-4 font-mono text-[11px] text-[#595959] dark:text-[#9DA3AF]">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="py-2.5 px-4 text-right">
                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setRoleChangeTarget(user);
                        setTargetNewRole(user.role);
                      }}
                      title="Change Role"
                      className="p-1 text-[#595959] hover:text-[#171717] dark:hover:text-[#F8F8F8]"
                    >
                      <Edit2 size={12} />
                    </button>
                    {user.id !== currentUser?.id && (
                      <>
                        <button
                          type="button"
                          onClick={() => toggleUserStatus(user.id)}
                          title={user.status === 'active' ? 'Suspend User' : 'Activate User'}
                          className="p-1 text-[#595959] hover:text-[#B35300] dark:hover:text-[#FF9500]"
                        >
                          <Ban size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setRemoveTarget(user)}
                          title="Remove User"
                          className="p-1 text-[#D70015] dark:text-[#FF453A] hover:bg-[#D70015]/10 rounded-xs"
                        >
                          <Trash2 size={12} />
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
            className="bg-white dark:bg-[#111216] border border-black/15 dark:border-white/15 rounded-xs p-6 max-w-md w-full flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-black/10 dark:border-white/10">
              <h2 className="text-base font-bold">Add Staff Account</h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                aria-label="Close"
                className="text-[#707070] hover:text-[#171717] dark:hover:text-[#F8F8F8]"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="flex flex-col gap-4 text-xs font-mono">
              <div>
                <label className="block text-[#707070] dark:text-[#9DA3AF] mb-1 uppercase">Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 rounded-xs text-sm font-sans"
                  placeholder="e.g. Kenji Sato"
                />
              </div>

              <div>
                <label className="block text-[#707070] dark:text-[#9DA3AF] mb-1 uppercase">Email Address</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 rounded-xs text-xs font-mono"
                  placeholder="name@kroma.design"
                />
              </div>

              <div>
                <label className="block text-[#707070] dark:text-[#9DA3AF] mb-1 uppercase">Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full px-2.5 py-2 bg-black/[0.03] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 rounded-xs"
                >
                  <option value="admin">Admin (Library management &amp; editing)</option>
                  <option value="super_admin">Super Admin (Full system control)</option>
                  <option value="user">User (Read-only administrative review)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-black/10 dark:border-white/10">
                <KromaButton
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </KromaButton>
                <KromaButton
                  type="submit"
                  variant="filled"
                  size="sm"
                >
                  Provision Account
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
            className="bg-white dark:bg-[#111216] border border-black/15 dark:border-white/15 rounded-xs p-6 max-w-sm w-full flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-black/10 dark:border-white/10">
              <h2 className="text-base font-bold">Update Role</h2>
              <button
                type="button"
                onClick={() => setRoleChangeTarget(null)}
                aria-label="Close"
                className="text-[#707070] hover:text-[#171717] dark:hover:text-[#F8F8F8]"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-[#707070] dark:text-[#9DA3AF] font-mono">
              Adjust authorization for <strong className="text-[#171717] dark:text-[#F8F8F8]">{roleChangeTarget.email}</strong>.
            </p>

            <select
              value={targetNewRole}
              onChange={(e) => setTargetNewRole(e.target.value as UserRole)}
              className="w-full px-2.5 py-2 bg-black/[0.03] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 rounded-xs text-xs font-mono"
            >
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>

            <div className="flex justify-end gap-2 pt-2 border-t border-black/10 dark:border-white/10">
              <KromaButton
                variant="outline"
                size="sm"
                onClick={() => setRoleChangeTarget(null)}
              >
                Cancel
              </KromaButton>
              <KromaButton
                variant="filled"
                size="sm"
                onClick={handleConfirmRoleChange}
              >
                Save Role
              </KromaButton>
            </div>
          </div>
        </div>
      )}

      {/* Remove User Modal */}
      {removeTarget && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setRemoveTarget(null)}
        >
          <div
            className="bg-white dark:bg-[#111216] border border-black/15 dark:border-white/15 rounded-xs p-6 max-w-sm w-full flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-black/10 dark:border-white/10">
              <h2 className="text-base font-bold text-[#D70015] dark:text-[#FF453A]">Remove Account</h2>
              <button
                type="button"
                onClick={() => setRemoveTarget(null)}
                aria-label="Close"
                className="text-[#595959] hover:text-[#171717] dark:hover:text-[#F8F8F8]"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-[#595959] dark:text-[#9DA3AF] leading-relaxed">
              Are you sure you want to remove <strong className="text-[#171717] dark:text-[#F8F8F8]">{removeTarget.email}</strong>? They will permanently lose access to the administrative workspace.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-black/10 dark:border-white/10">
              <KromaButton
                variant="outline"
                size="sm"
                onClick={() => setRemoveTarget(null)}
              >
                Cancel
              </KromaButton>
              <KromaButton
                variant="filled"
                size="sm"
                onClick={handleConfirmRemove}
                className="!bg-[#D70015] dark:!bg-[#FF453A] !text-white hover:opacity-90"
              >
                Remove
              </KromaButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
