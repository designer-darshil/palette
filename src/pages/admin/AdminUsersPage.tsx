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
} from 'lucide-react';
import { useAdminAuth, UserRole, AdminUser } from '../../context/AdminAuthContext';

export const AdminUsersPage: React.FC = () => {
  const { users, currentUser, isSuperAdmin, addUser, removeUser, updateUserRole, toggleUserStatus } = useAdminAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Modal States
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
      <div style={{ padding: '32px', textAlign: 'center', background: 'var(--bg-surface-1)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
        <ShieldAlert size={36} color="#F87171" style={{ margin: '0 auto 12px auto' }} />
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>Access Restricted</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          User &amp; role administration is exclusively restricted to the Super Administrator.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#E63946', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            SUPER ADMIN RBAC CONTROLS
          </span>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em', marginTop: '2px' }}>
            User &amp; Access Role Management
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Manage staff accounts, assign administrative privileges, and protect system integrity.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: '0.82rem' }}
        >
          <UserPlus size={14} />
          <span>Provision New User</span>
        </button>
      </div>

      {feedback && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: feedback.type === 'success' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(230, 57, 70, 0.12)',
            border: `1px solid ${feedback.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(230, 57, 70, 0.3)'}`,
            borderRadius: 'var(--radius-xs)',
            padding: '10px 14px',
            color: feedback.type === 'success' ? '#22C55E' : '#F87171',
            fontSize: '0.82rem',
          }}
        >
          {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div
        style={{
          background: 'var(--bg-surface-1)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={14} color="var(--text-tertiary)" style={{ position: 'absolute', left: 10 }} />
            <input
              type="text"
              placeholder="Search user name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'var(--bg-surface-2)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-xs)',
                padding: '6px 12px 6px 32px',
                fontSize: '0.82rem',
                color: 'var(--text-primary)',
                width: '240px',
              }}
            />
          </div>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            style={{
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-xs)',
              padding: '6px 10px',
              fontSize: '0.8rem',
              color: 'var(--text-primary)',
            }}
          >
            <option value="all">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-xs)',
              padding: '6px 10px',
              fontSize: '0.8rem',
              color: 'var(--text-primary)',
            }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
          {filteredUsers.length} USERS CONFIGURED
        </div>
      </div>

      {/* Users Table */}
      <div
        style={{
          background: 'var(--bg-surface-1)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg-surface-2)', borderBottom: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
              <th style={{ padding: '10px 14px' }}>NAME</th>
              <th style={{ padding: '10px 14px' }}>EMAIL</th>
              <th style={{ padding: '10px 14px' }}>AUTHORIZATION ROLE</th>
              <th style={{ padding: '10px 14px' }}>STATUS</th>
              <th style={{ padding: '10px 14px' }}>CREATED</th>
              <th style={{ padding: '10px 14px', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '12px 14px', fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{u.name}</span>
                    {u.id === currentUser?.id && (
                      <span style={{ fontSize: '0.65rem', background: 'var(--bg-surface-3)', padding: '1px 5px', borderRadius: '3px', color: 'var(--text-tertiary)' }}>
                        YOU
                      </span>
                    )}
                  </div>
                </td>
                <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{u.email}</td>
                <td style={{ padding: '12px 14px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      fontSize: '0.68rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      background:
                        u.role === 'super_admin'
                          ? 'rgba(230, 57, 70, 0.15)'
                          : u.role === 'admin'
                          ? 'rgba(59, 130, 246, 0.15)'
                          : 'var(--bg-surface-3)',
                      color:
                        u.role === 'super_admin'
                          ? '#E63946'
                          : u.role === 'admin'
                          ? '#3B82F6'
                          : 'var(--text-secondary)',
                    }}
                  >
                    {u.role.replace('_', ' ')}
                  </span>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      color: u.status === 'active' ? '#22C55E' : '#F87171',
                      fontWeight: 600,
                      textTransform: 'capitalize',
                    }}
                  >
                    {u.status}
                  </span>
                </td>
                <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '6px' }}>
                    <button
                      onClick={() => {
                        setRoleChangeTarget(u);
                        setTargetNewRole(u.role);
                      }}
                      className="btn-secondary"
                      style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                      title="Modify Role"
                    >
                      <span>Role</span>
                    </button>

                    <button
                      onClick={() => toggleUserStatus(u.id)}
                      disabled={u.id === currentUser?.id}
                      className="btn-secondary"
                      style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                      title={u.status === 'active' ? 'Suspend Account' : 'Reactivate Account'}
                    >
                      {u.status === 'active' ? <Ban size={12} /> : <CheckCircle2 size={12} color="#22C55E" />}
                    </button>

                    <button
                      onClick={() => setRemoveTarget(u)}
                      disabled={u.id === currentUser?.id}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '3px',
                        padding: '4px 6px',
                        color: u.id === currentUser?.id ? 'var(--text-tertiary)' : '#F87171',
                        cursor: u.id === currentUser?.id ? 'not-allowed' : 'pointer',
                      }}
                      title="Remove Account"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="search-dialog-card" style={{ maxWidth: '480px', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>Provision New User</h2>
            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  FULL NAME
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-surface-2)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-xs)',
                    padding: '8px 10px',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-surface-2)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-xs)',
                    padding: '8px 10px',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    fontFamily: 'var(--font-mono)',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  ROLE ASSIGNMENT
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-surface-2)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-xs)',
                    padding: '8px 10px',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                  }}
                >
                  <option value="user">User (Public Access)</option>
                  <option value="admin">Admin (Content Management)</option>
                  <option value="super_admin">Super Admin (Full Administrative Authority)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Change Confirmation Modal */}
      {roleChangeTarget && (
        <div className="modal-backdrop" onClick={() => setRoleChangeTarget(null)}>
          <div className="search-dialog-card" style={{ maxWidth: '460px', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '12px' }}>
              Modify Access Role: {roleChangeTarget.name}
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Changing permissions for <code style={{ fontFamily: 'var(--font-mono)' }}>{roleChangeTarget.email}</code>.
            </p>

            <select
              value={targetNewRole}
              onChange={(e) => setTargetNewRole(e.target.value as UserRole)}
              style={{
                width: '100%',
                background: 'var(--bg-surface-2)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-xs)',
                padding: '8px 10px',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                marginBottom: '20px',
              }}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" onClick={() => setRoleChangeTarget(null)} className="btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={handleConfirmRoleChange} className="btn-primary">
                Confirm Role Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove User Confirmation Modal */}
      {removeTarget && (
        <div className="modal-backdrop" onClick={() => setRemoveTarget(null)}>
          <div className="search-dialog-card" style={{ maxWidth: '440px', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#F87171', marginBottom: '12px' }}>
              Confirm Account Removal
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
              Are you sure you want to delete access for <strong>{removeTarget.name}</strong> ({removeTarget.email})? This action cannot be undone.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" onClick={() => setRemoveTarget(null)} className="btn-secondary">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRemove}
                style={{
                  background: '#E63946',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 'var(--radius-xs)',
                  padding: '8px 16px',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                }}
              >
                Permanently Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
