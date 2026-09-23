import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowLeft, AlertCircle, KeyRound, CheckCircle2 } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { RouteType } from '../../types';
import { SEOHead } from '../../components/seo/SEOHead';
import { KromaButton } from '../../components/common/KromaButton';
import { validateAdminPassword, PASSWORD_POLICY } from '../../utils/passwordPolicy';

interface AdminLoginPageProps {
  onNavigatePublic: (route: RouteType) => void;
  onLoginSuccess: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onNavigatePublic,
  onLoginSuccess,
}) => {
  const { login, needsInitialSetup, setupInitialMasterPassword } = useAdminAuth();
  const [email, setEmail] = useState('darshilbhuva4322@gmail.com');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Setup form validation
  const validation = validateAdminPassword(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (needsInitialSetup) {
      if (!validation.isValid) {
        setError(validation.firstError || 'Password must meet complexity requirements.');
        setLoading(false);
        return;
      }
      if (!passwordsMatch) {
        setError('Passwords do not match.');
        setLoading(false);
        return;
      }

      const setupRes = await setupInitialMasterPassword(password);
      if (!setupRes.success) {
        setError(setupRes.error || 'Failed to initialize master password.');
        setLoading(false);
        return;
      }

      // Automatically login after successful setup
      const loginRes = await login(password, email);
      setLoading(false);
      if (loginRes.success) {
        onLoginSuccess();
      } else {
        setError(loginRes.error || 'Setup completed, please sign in.');
      }
      return;
    }

    const res = await login(password, email);
    setLoading(false);

    if (res.success) {
      onLoginSuccess();
    } else {
      setError(res.error || 'Authentication failed. Verify administrative credentials.');
    }
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'var(--bg-canvas)',
      }}
    >
      <SEOHead
        title={needsInitialSetup ? 'Initialize Admin Security | KROMA' : 'Admin Sign In | KROMA'}
        description="Administrative access authentication."
        canonicalPath="/admin"
        noindex={true}
        nofollow={true}
      />
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'var(--bg-surface-1)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-md)',
          padding: '36px 32px',
          boxShadow: 'var(--shadow-elevated)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '8px',
              background: needsInitialSetup ? 'rgba(233, 196, 106, 0.12)' : 'rgba(230, 57, 70, 0.12)',
              color: needsInitialSetup ? '#E9C46A' : '#E63946',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              border: `1px solid ${needsInitialSetup ? 'rgba(233, 196, 106, 0.25)' : 'rgba(230, 57, 70, 0.25)'}`,
            }}
          >
            {needsInitialSetup ? <KeyRound size={24} /> : <ShieldCheck size={24} />}
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '6px' }}>
            {needsInitialSetup ? 'Initialize Super Admin' : 'KROMA Administration'}
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            {needsInitialSetup
              ? 'Configure your unique master password for cryptographic salt generation.'
              : 'Authenticate with verified administrative credentials to access library management.'}
          </p>
        </div>

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(230, 57, 70, 0.12)',
              border: '1px solid rgba(230, 57, 70, 0.3)',
              borderRadius: 'var(--radius-xs)',
              padding: '10px 12px',
              color: '#F87171',
              fontSize: '0.8rem',
              marginBottom: '20px',
            }}
          >
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase' }}>
              Admin Account Email
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={15} color="var(--text-tertiary)" style={{ position: 'absolute', left: 12 }} />
              <input
                type="email"
                required
                value={email}
                disabled={needsInitialSetup}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-surface-2)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-xs)',
                  padding: '10px 12px 10px 36px',
                  color: 'var(--text-primary)',
                  fontSize: '0.88rem',
                  fontFamily: 'var(--font-mono)',
                  opacity: needsInitialSetup ? 0.75 : 1,
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase' }}>
              {needsInitialSetup ? 'Create Master Password' : 'Password'}
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={15} color="var(--text-tertiary)" style={{ position: 'absolute', left: 12 }} />
              <input
                type="password"
                required
                placeholder={needsInitialSetup ? 'Enter 12+ character master password' : 'Enter password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-surface-2)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-xs)',
                  padding: '10px 12px 10px 36px',
                  color: 'var(--text-primary)',
                  fontSize: '0.88rem',
                }}
              />
            </div>
          </div>

          {needsInitialSetup && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Confirm Master Password
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={15} color="var(--text-tertiary)" style={{ position: 'absolute', left: 12 }} />
                  <input
                    type="password"
                    required
                    placeholder="Repeat master password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--bg-surface-2)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-xs)',
                      padding: '10px 12px 10px 36px',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem',
                    }}
                  />
                </div>
              </div>

              {/* Policy Checklist */}
              <div
                style={{
                  background: 'var(--bg-surface-2)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-xs)',
                  padding: '12px',
                  fontSize: '0.74rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: validation.checks.hasMinLength ? '#22C55E' : 'var(--text-secondary)' }}>
                  <CheckCircle2 size={13} color={validation.checks.hasMinLength ? '#22C55E' : 'var(--text-tertiary)'} />
                  <span>At least {PASSWORD_POLICY.minLength} characters</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: validation.checks.hasUppercase && validation.checks.hasLowercase ? '#22C55E' : 'var(--text-secondary)' }}>
                  <CheckCircle2 size={13} color={validation.checks.hasUppercase && validation.checks.hasLowercase ? '#22C55E' : 'var(--text-tertiary)'} />
                  <span>Uppercase and lowercase letters</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: validation.checks.hasNumber && validation.checks.hasSpecial ? '#22C55E' : 'var(--text-secondary)' }}>
                  <CheckCircle2 size={13} color={validation.checks.hasNumber && validation.checks.hasSpecial ? '#22C55E' : 'var(--text-tertiary)'} />
                  <span>Number and special character (!@#$%^&*)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: passwordsMatch ? '#22C55E' : 'var(--text-secondary)' }}>
                  <CheckCircle2 size={13} color={passwordsMatch ? '#22C55E' : 'var(--text-tertiary)'} />
                  <span>Passwords match</span>
                </div>
              </div>
            </>
          )}

          <KromaButton
            type="submit"
            disabled={loading || (needsInitialSetup && (!validation.isValid || !passwordsMatch))}
            isLoading={loading}
            variant="filled"
            className="w-full mt-2"
            iconLeft={needsInitialSetup ? <KeyRound size={16} /> : <ShieldCheck size={16} />}
          >
            {loading
              ? 'Processing...'
              : needsInitialSetup
              ? 'Initialize & Sign In'
              : 'Sign In to Admin Panel'}
          </KromaButton>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
          <KromaButton
            variant="ghost"
            size="sm"
            onClick={() => onNavigatePublic({ path: 'home' })}
            iconLeft={<ArrowLeft size={13} />}
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
            }}
          >
            Return to Public Library
          </KromaButton>
        </div>
      </div>
    </div>
  );
};
