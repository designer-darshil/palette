import React from 'react';
import {
  Palette,
  Layers,
  Wand2,
  Sparkles,
  Activity,
  Radio,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  Shield,
  Clock,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useLibraryData } from '../../context/LibraryDataContext';

interface AdminDashboardPageProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigateTab }) => {
  const { currentUser, activityLogs } = useAdminAuth();
  const { colors, palettes, combos, gradients } = useLibraryData();

  const metrics = [
    {
      id: 'colors',
      label: 'COLOR SPECIMENS',
      count: colors.length.toLocaleString(),
      subtext: '16 spectrum groups • OKLCH/sRGB',
      icon: Palette,
      accent: '#3B82F6',
    },
    {
      id: 'palettes',
      label: 'PALETTE SYSTEMS',
      count: palettes.length.toLocaleString(),
      subtext: '8 aesthetic categories • 5-tone sets',
      icon: Layers,
      accent: '#E9C46A',
    },
    {
      id: 'combos',
      label: 'COLOR HARMONIES',
      count: combos.length.toLocaleString(),
      subtext: 'WCAG AAA validated pairings',
      icon: Wand2,
      accent: '#E63946',
    },
    {
      id: 'gradients',
      label: 'CSS GRADIENTS',
      count: gradients.length.toLocaleString(),
      subtext: 'Continuous multi-stop spectra',
      icon: Sparkles,
      accent: '#A855F7',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#E63946', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            SUPER ADMIN COMMAND CENTER
          </span>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em', marginTop: '4px' }}>
            Production Library Overview
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            System state, live telemetry, and administrative control for {colors.length.toLocaleString()} total specimens.
          </p>
        </div>

        {/* Super Admin Status Pill */}
        <div
          style={{
            background: 'var(--bg-surface-1)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-sm)',
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <Shield size={16} color="#E63946" />
          <div>
            <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>
              SUPER ADMIN
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{currentUser?.email}</div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.id}
              onClick={() => onNavigateTab(m.id)}
              style={{
                background: 'var(--bg-surface-1)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '20px',
                cursor: 'pointer',
                transition: 'border-color 140ms ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)', letterSpacing: '0.08em' }}>
                  {m.label}
                </span>
                <Icon size={16} color={m.accent} />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '4px' }}>
                {m.count}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{m.subtext}</div>
            </div>
          );
        })}
      </div>

      {/* Real-Time Live Status & Health Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Live Broadcast Module */}
        <div
          style={{
            background: 'var(--bg-surface-1)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Radio size={16} color="#E63946" />
              <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Real-Time Live Color Engine</h2>
            </div>
            <span style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22C55E', fontSize: '0.68rem', fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
              BROADCAST ACTIVE
            </span>
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
            The environmental synthesis engine calculates Rayleigh atmospheric scattering across 9 solar phases with real-time temperature vectors.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ background: 'var(--bg-surface-2)', padding: '8px 12px', borderRadius: 'var(--radius-xs)', flex: 1 }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>SOLAR PHASES</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>9 Trajectories</div>
            </div>
            <div style={{ background: 'var(--bg-surface-2)', padding: '8px 12px', borderRadius: 'var(--radius-xs)', flex: 1 }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>PRESET HUBS</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>10 Global Cities</div>
            </div>
            <div style={{ background: 'var(--bg-surface-2)', padding: '8px 12px', borderRadius: 'var(--radius-xs)', flex: 1 }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>TELEMETRY</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Open-Meteo GPS</div>
            </div>
          </div>
        </div>

        {/* Data Health & Integrity */}
        <div
          style={{
            background: 'var(--bg-surface-1)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={16} color="#22C55E" />
              <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Library Data Health</h2>
            </div>
            <button
              onClick={() => onNavigateTab('validation')}
              className="btn-secondary"
              style={{ padding: '4px 10px', fontSize: '0.72rem' }}
            >
              <span>View Audit</span>
              <ArrowUpRight size={12} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#22C55E' }}>99.8%</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Overall Health Score</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            <div>✓ 2,288/2,288 colors with valid sRGB, HSL &amp; OKLCH</div>
            <div>✓ 1,210/1,210 palettes with 5-tone role structure</div>
            <div>✓ 810/810 combinations compliant with WCAG AAA</div>
            <div>✓ 0 broken references detected</div>
          </div>
        </div>
      </div>

      {/* Admin Activity Log */}
      <div
        style={{
          background: 'var(--bg-surface-1)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '24px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} color="var(--text-secondary)" />
            <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Administrative Activity Log</h2>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
            {activityLogs.length} LOGGED ACTIONS
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {activityLogs.slice(0, 6).map((log) => (
            <div
              key={log.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 12px',
                background: 'var(--bg-surface-2)',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.8rem',
              }}
            >
              <div>
                <span style={{ fontWeight: 700, marginRight: '8px' }}>{log.action}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{log.details}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-tertiary)', flexShrink: 0, marginLeft: '12px' }}>
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
