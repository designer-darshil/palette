import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { RouteType } from '../../types';

interface AdminLoginPageProps {
  onNavigatePublic: (route: RouteType) => void;
  onLoginSuccess: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onNavigatePublic,
  onLoginSuccess,
}) => {
  const { login } = useAdminAuth();
  const [email, setEmail] = useState('darshilbhuva4322@gmail.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

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
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
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
              background: 'rgba(230, 57, 70, 0.12)',
              color: '#E63946',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              border: '1px solid rgba(230, 57, 70, 0.25)',
            }}
          >
            <ShieldCheck size={24} />
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '6px' }}>
            KROMA Administration
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Authenticate with verified administrative credentials to access library management.
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
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase' }}>
              Password
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={15} color="var(--text-tertiary)" style={{ position: 'absolute', left: 12 }} />
              <input
                type="password"
                required
                placeholder="Enter password"
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

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '11px',
              fontSize: '0.88rem',
              marginTop: '8px',
            }}
          >
            <ShieldCheck size={16} />
            <span>{loading ? 'Authenticating...' : 'Sign In to Admin Panel'}</span>
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => onNavigatePublic({ path: 'home' })}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
            }}
          >
            <ArrowLeft size={13} />
            <span>Return to Public Library</span>
          </button>
        </div>
      </div>
    </div>
  );
};
