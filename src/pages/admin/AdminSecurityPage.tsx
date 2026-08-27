import React, { useState } from 'react';
import { ShieldCheck, Lock, Check, AlertCircle, KeyRound, Eye, EyeOff } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

export const AdminSecurityPage: React.FC = () => {
  const { currentUser, changePassword, isSuperAdmin } = useAdminAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Real-time policy checking
  const policyChecks = {
    length: newPassword.length >= 12,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[^A-Za-z0-9]/.test(newPassword),
    match: newPassword.length > 0 && newPassword === confirmPassword,
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (newPassword !== confirmPassword) {
      setStatusMessage({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    setLoading(true);
    const res = await changePassword(currentPassword, newPassword);
    setLoading(false);

    if (res.success) {
      setStatusMessage({
        type: 'success',
        text: 'Super Admin password updated and re-salted successfully. Session security refreshed.',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setStatusMessage({
        type: 'error',
        text: res.error || 'Password update failed. Verify current password.',
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '680px' }}>
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
          Security &amp; Account Control
        </h1>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          Manage administrative credentials, cryptographic key salting, and Super Admin authorization.
        </p>
      </div>

      {/* Account Overview Card */}
      <div
        style={{
          background: 'var(--bg-surface-1)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '6px',
              background: 'rgba(230, 57, 70, 0.12)',
              color: '#E63946',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(230, 57, 70, 0.25)',
            }}
          >
            <ShieldCheck size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>
              SUPER ADMIN IDENTITY
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700 }}>{currentUser?.email}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ background: 'var(--bg-surface-2)', padding: '10px 14px', borderRadius: 'var(--radius-xs)', flex: 1 }}>
            <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>AUTHORIZATION ROLE</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#E63946', textTransform: 'uppercase' }}>
              {currentUser?.role.replace('_', ' ')}
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface-2)', padding: '10px 14px', borderRadius: 'var(--radius-xs)', flex: 1 }}>
            <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>KEY ENCRYPTION</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#22C55E' }}>SHA-256 + Unique Salt</div>
          </div>
        </div>
      </div>

      {/* Change Password Form */}
      <div
        style={{
          background: 'var(--bg-surface-1)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '24px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <KeyRound size={16} color="#E9C46A" />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Change Super Admin Password</h2>
          </div>

          <button
            type="button"
            onClick={() => setShowPasswords(!showPasswords)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem',
            }}
          >
            {showPasswords ? <EyeOff size={13} /> : <Eye size={13} />}
            <span>{showPasswords ? 'Hide' : 'Show'}</span>
          </button>
        </div>

        {statusMessage && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: statusMessage.type === 'success' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(230, 57, 70, 0.12)',
              border: `1px solid ${statusMessage.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(230, 57, 70, 0.3)'}`,
              borderRadius: 'var(--radius-xs)',
              padding: '12px 14px',
              color: statusMessage.type === 'success' ? '#22C55E' : '#F87171',
              fontSize: '0.82rem',
              marginBottom: '20px',
            }}
          >
            {statusMessage.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
              Current Password
            </label>
            <input
              type={showPasswords ? 'text' : 'password'}
              required
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-surface-2)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-xs)',
                padding: '9px 12px',
                color: 'var(--text-primary)',
                fontSize: '0.88rem',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
              New Password
            </label>
            <input
              type={showPasswords ? 'text' : 'password'}
              required
              placeholder="Enter new master password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-surface-2)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-xs)',
                padding: '9px 12px',
                color: 'var(--text-primary)',
                fontSize: '0.88rem',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
              Confirm New Password
            </label>
            <input
              type={showPasswords ? 'text' : 'password'}
              required
              placeholder="Repeat new master password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-surface-2)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-xs)',
                padding: '9px 12px',
                color: 'var(--text-primary)',
                fontSize: '0.88rem',
              }}
            />
          </div>

          {/* Policy Checklist */}
          <div
            style={{
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xs)',
              padding: '12px 14px',
              fontSize: '0.75rem',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '6px',
            }}
          >
            <div style={{ color: policyChecks.length ? '#22C55E' : 'var(--text-tertiary)' }}>
              {policyChecks.length ? '✓' : '•'} At least 12 characters
            </div>
            <div style={{ color: policyChecks.uppercase ? '#22C55E' : 'var(--text-tertiary)' }}>
              {policyChecks.uppercase ? '✓' : '•'} Uppercase letter (A-Z)
            </div>
            <div style={{ color: policyChecks.lowercase ? '#22C55E' : 'var(--text-tertiary)' }}>
              {policyChecks.lowercase ? '✓' : '•'} Lowercase letter (a-z)
            </div>
            <div style={{ color: policyChecks.number ? '#22C55E' : 'var(--text-tertiary)' }}>
              {policyChecks.number ? '✓' : '•'} Number (0-9)
            </div>
            <div style={{ color: policyChecks.special ? '#22C55E' : 'var(--text-tertiary)' }}>
              {policyChecks.special ? '✓' : '•'} Special character (!@#$)
            </div>
            <div style={{ color: policyChecks.match ? '#22C55E' : 'var(--text-tertiary)' }}>
              {policyChecks.match ? '✓' : '•'} Passwords match
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ padding: '10px 22px', fontSize: '0.85rem' }}
            >
              <Lock size={14} />
              <span>{loading ? 'Validating & Updating...' : 'Update Master Password'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
