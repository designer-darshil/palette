import React, { useState } from 'react';
import { ShieldCheck, Lock, Check, AlertCircle, KeyRound, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { validateAdminPassword, PASSWORD_POLICY } from '../../utils/passwordPolicy';

export const AdminSecurityPage: React.FC = () => {
  const { currentUser, changePassword, isSuperAdmin } = useAdminAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  const [touchedNew, setTouchedNew] = useState(false);
  const [touchedConfirm, setTouchedConfirm] = useState(false);

  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Live validation checks against centralized policy
  const validation = validateAdminPassword(newPassword);
  const { checks } = validation;
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  // Derive contextual field-level error
  const getFieldErrorMessage = (): string | null => {
    if (touchedNew && newPassword.length > 0 && !validation.isValid) {
      return validation.firstError;
    }
    if (touchedConfirm && confirmPassword.length > 0 && !passwordsMatch) {
      return 'New password and confirmation do not match.';
    }
    return null;
  };

  const fieldError = getFieldErrorMessage();

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    setTouchedNew(true);
    setTouchedConfirm(true);

    if (!currentPassword) {
      setStatusMessage({ type: 'error', text: 'Current password is required.' });
      return;
    }

    if (!validation.isValid) {
      setStatusMessage({
        type: 'error',
        text: validation.firstError || `Password must contain at least ${PASSWORD_POLICY.minLength} characters and meet complexity rules.`,
      });
      return;
    }

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
      setTouchedNew(false);
      setTouchedConfirm(false);
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
            aria-label={showPasswords ? 'Hide password characters' : 'Show password characters'}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                New Password (Min 12 Chars)
              </label>
              {newPassword.length > 0 && (
                <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: checks.hasMinLength ? '#22C55E' : '#F59E0B' }}>
                  {newPassword.length} / {PASSWORD_POLICY.minLength} characters
                </span>
              )}
            </div>
            <input
              type={showPasswords ? 'text' : 'password'}
              required
              placeholder="Enter new 12+ character master password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              onBlur={() => setTouchedNew(true)}
              style={{
                width: '100%',
                background: 'var(--bg-surface-2)',
                border: `1px solid ${touchedNew && !validation.isValid && newPassword.length > 0 ? '#EF4444' : 'var(--border-medium)'}`,
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
              onBlur={() => setTouchedConfirm(true)}
              style={{
                width: '100%',
                background: 'var(--bg-surface-2)',
                border: `1px solid ${touchedConfirm && !passwordsMatch && confirmPassword.length > 0 ? '#EF4444' : 'var(--border-medium)'}`,
                borderRadius: 'var(--radius-xs)',
                padding: '9px 12px',
                color: 'var(--text-primary)',
                fontSize: '0.88rem',
              }}
            />
          </div>

          {/* Contextual Warning / Hint */}
          {fieldError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#F87171', fontSize: '0.76rem', marginTop: '-4px' }}>
              <AlertCircle size={13} style={{ flexShrink: 0 }} />
              <span>{fieldError}</span>
            </div>
          )}

          {/* Live Requirements Checklist */}
          <div
            style={{
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xs)',
              padding: '14px',
              fontSize: '0.75rem',
            }}
          >
            <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 700 }}>
              Password Requirements
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '8px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: checks.hasMinLength ? '#22C55E' : 'var(--text-secondary)',
                  fontWeight: checks.hasMinLength ? 600 : 400,
                }}
              >
                {checks.hasMinLength ? (
                  <CheckCircle2 size={14} color="#22C55E" style={{ flexShrink: 0 }} />
                ) : (
                  <span style={{ width: 14, textAlign: 'center', color: 'var(--text-tertiary)' }}>•</span>
                )}
                <span>12+ characters</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: checks.hasUppercase ? '#22C55E' : 'var(--text-secondary)',
                  fontWeight: checks.hasUppercase ? 600 : 400,
                }}
              >
                {checks.hasUppercase ? (
                  <CheckCircle2 size={14} color="#22C55E" style={{ flexShrink: 0 }} />
                ) : (
                  <span style={{ width: 14, textAlign: 'center', color: 'var(--text-tertiary)' }}>•</span>
                )}
                <span>Uppercase letter (A-Z)</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: checks.hasLowercase ? '#22C55E' : 'var(--text-secondary)',
                  fontWeight: checks.hasLowercase ? 600 : 400,
                }}
              >
                {checks.hasLowercase ? (
                  <CheckCircle2 size={14} color="#22C55E" style={{ flexShrink: 0 }} />
                ) : (
                  <span style={{ width: 14, textAlign: 'center', color: 'var(--text-tertiary)' }}>•</span>
                )}
                <span>Lowercase letter (a-z)</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: checks.hasNumber ? '#22C55E' : 'var(--text-secondary)',
                  fontWeight: checks.hasNumber ? 600 : 400,
                }}
              >
                {checks.hasNumber ? (
                  <CheckCircle2 size={14} color="#22C55E" style={{ flexShrink: 0 }} />
                ) : (
                  <span style={{ width: 14, textAlign: 'center', color: 'var(--text-tertiary)' }}>•</span>
                )}
                <span>Number (0-9)</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: checks.hasSpecial ? '#22C55E' : 'var(--text-secondary)',
                  fontWeight: checks.hasSpecial ? 600 : 400,
                }}
              >
                {checks.hasSpecial ? (
                  <CheckCircle2 size={14} color="#22C55E" style={{ flexShrink: 0 }} />
                ) : (
                  <span style={{ width: 14, textAlign: 'center', color: 'var(--text-tertiary)' }}>•</span>
                )}
                <span>Special character (!@#$%^&*)</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: passwordsMatch ? '#22C55E' : 'var(--text-secondary)',
                  fontWeight: passwordsMatch ? 600 : 400,
                }}
              >
                {passwordsMatch ? (
                  <CheckCircle2 size={14} color="#22C55E" style={{ flexShrink: 0 }} />
                ) : (
                  <span style={{ width: 14, textAlign: 'center', color: 'var(--text-tertiary)' }}>•</span>
                )}
                <span>Passwords match</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button
              type="submit"
              disabled={loading || !validation.isValid || !passwordsMatch || !currentPassword}
              className="btn-primary"
              style={{
                padding: '10px 22px',
                fontSize: '0.85rem',
                opacity: loading || !validation.isValid || !passwordsMatch || !currentPassword ? 0.6 : 1,
                cursor: loading || !validation.isValid || !passwordsMatch || !currentPassword ? 'not-allowed' : 'pointer',
              }}
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
