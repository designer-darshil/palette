import React, { useState } from 'react';
import { GeneratedPaletteResult } from '../../utils/rampsEngine';
import {
  Monitor,
  Sun,
  Moon,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  ArrowRight,
  TrendingUp,
  Search,
  Bell,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { KromaButton } from '../common/KromaButton';

interface RampsLiveUiPreviewProps {
  paletteResult: GeneratedPaletteResult;
}

export const RampsLiveUiPreview: React.FC<RampsLiveUiPreviewProps> = ({ paletteResult }) => {
  const [previewTheme, setPreviewTheme] = useState<'light' | 'dark'>('dark');
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'settings'>('overview');
  const [inputText, setInputText] = useState('agentic-design-token-v1');

  // Build inline style dictionary for the preview surface based on active previewTheme
  const previewStyles: React.CSSProperties = React.useMemo(() => {
    const isDark = previewTheme === 'dark';
    const styleObj: Record<string, string> = {};

    for (const token of paletteResult.tokens) {
      styleObj[`--${token.name}`] = isDark ? token.darkHex : token.lightHex;
    }

    return styleObj as React.CSSProperties;
  }, [paletteResult, previewTheme]);

  return (
    <section id="live-preview" className="w-full flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] flex items-center gap-2 tracking-tight">
            <Monitor size={18} className="text-[var(--text-secondary)]" />
            <span>Live Interface Simulation</span>
          </h2>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            Real-world product interface wired directly to generated semantic tokens. Toggle preview modes to test contrast.
          </p>
        </div>

        {/* Preview Theme Selector */}
        <div className="flex items-center gap-1 bg-[var(--bg-surface-2)] p-1 rounded-lg border border-[var(--border-subtle)]">
          <KromaButton
            type="button"
            variant={previewTheme === 'light' ? 'filled' : 'ghost'}
            size="sm"
            onClick={() => setPreviewTheme('light')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-medium min-h-[30px] ${
              previewTheme === 'light'
                ? 'shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            iconLeft={<Sun size={13} className="text-amber-400" />}
          >
            <span>Light Preview</span>
          </KromaButton>
          <KromaButton
            type="button"
            variant={previewTheme === 'dark' ? 'filled' : 'ghost'}
            size="sm"
            onClick={() => setPreviewTheme('dark')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-medium min-h-[30px] ${
              previewTheme === 'dark'
                ? 'shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            iconLeft={<Moon size={13} />}
          >
            <span>Dark Preview</span>
          </KromaButton>
        </div>
      </div>

      {/* Simulated Miniature UI Workspace Container */}
      <div
        className="w-full rounded-2xl border border-[var(--border-strong)] overflow-hidden shadow-xl transition-colors duration-300"
        style={{
          ...previewStyles,
          backgroundColor: 'var(--bg-canvas)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-sans)',
        }}
      >
        {/* Simulated Top Navigation Bar */}
        <div
          className="px-5 py-3.5 flex items-center justify-between border-b transition-colors"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded flex items-center justify-center font-mono font-black text-xs transition-colors"
                style={{
                  backgroundColor: 'var(--bg-brand)',
                  color: 'var(--text-on-brand)',
                }}
              >
                K
              </div>
              <span className="font-bold text-sm tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Nexus Cloud
              </span>
            </div>

            {/* Navigation Tabs */}
            <div className="hidden sm:flex items-center gap-1 text-xs font-mono ml-4">
              {(['overview', 'analytics', 'settings'] as const).map((tab) => (
                <KromaButton
                  key={tab}
                  type="button"
                  variant={activeTab === tab ? 'filled' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab(tab)}
                  className="px-3 py-1 rounded capitalize min-h-[28px]"
                  style={{
                    backgroundColor: activeTab === tab ? 'var(--bg-muted)' : 'transparent',
                    color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: activeTab === tab ? 700 : 500,
                  }}
                >
                  {tab}
                </KromaButton>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className="text-xs font-mono px-2 py-0.5 rounded border"
              style={{
                backgroundColor: 'var(--bg-success-subtle)',
                color: 'var(--text-success)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              System Online
            </span>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center border"
              style={{
                backgroundColor: 'var(--bg-surface-raised)',
                borderColor: 'var(--border-default)',
                color: 'var(--text-secondary)',
              }}
            >
              <Bell size={13} />
            </div>
          </div>
        </div>

        {/* Simulated Main Body Grid */}
        <div className="p-5 sm:p-7 flex flex-col gap-6">
          {/* Top Hero Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Stat Card 1 */}
            <div
              className="p-4 rounded-xl border flex flex-col justify-between gap-3 shadow-xs"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                  Total Compute
                </span>
                <TrendingUp size={15} style={{ color: 'var(--text-success)' }} />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  99.98%
                </span>
                <span className="text-xs font-mono font-bold" style={{ color: 'var(--text-success)' }}>
                  +1.4%
                </span>
              </div>
            </div>

            {/* Stat Card 2 */}
            <div
              className="p-4 rounded-xl border flex flex-col justify-between gap-3 shadow-xs"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                  Active Tokens
                </span>
                <Sparkles size={15} style={{ color: 'var(--bg-accent)' }} />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  1,482
                </span>
                <span className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>
                  WCAG {paletteResult.config.wcag}
                </span>
              </div>
            </div>

            {/* Stat Card 3 */}
            <div
              className="p-4 rounded-xl border flex flex-col justify-between gap-3 shadow-xs"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                  Security Status
                </span>
                <ShieldCheck size={15} style={{ color: 'var(--bg-brand)' }} />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  Verified
                </span>
                <span className="text-xs font-mono" style={{ color: 'var(--text-link)' }}>
                  Audited
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Form & Action Sandbox */}
          <div
            className="p-5 rounded-xl border flex flex-col gap-5 shadow-xs"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                Component &amp; Control Specimens
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                Interactive test-bench exercising button hierarchy, input validation states, and alert banners.
              </p>
            </div>

            {/* Button Hierarchy Matrix */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Primary Brand Button */}
              <KromaButton
                type="button"
                variant="filled"
                size="sm"
                className="font-mono text-xs font-bold"
                style={{
                  backgroundColor: 'var(--bg-brand)',
                  color: 'var(--text-on-brand)',
                }}
              >
                Primary Brand CTA
              </KromaButton>

              {/* Secondary Accent Button */}
              <KromaButton
                type="button"
                variant="filled"
                size="sm"
                className="font-mono text-xs font-bold"
                style={{
                  backgroundColor: 'var(--bg-accent)',
                  color: 'var(--text-on-accent)',
                }}
              >
                Secondary Accent
              </KromaButton>

              {/* Tertiary Button */}
              <KromaButton
                type="button"
                variant="filled"
                size="sm"
                className="font-mono text-xs font-bold"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-on-tertiary)',
                }}
              >
                Tertiary Action
              </KromaButton>

              {/* Destructive Button */}
              <KromaButton
                type="button"
                variant="filled"
                size="sm"
                className="font-mono text-xs font-bold"
                style={{
                  backgroundColor: 'var(--bg-error)',
                  color: 'var(--text-on-error)',
                }}
              >
                Destructive
              </KromaButton>

              {/* Disabled Button */}
              <KromaButton
                type="button"
                disabled
                variant="outline"
                size="sm"
                className="font-mono text-xs font-medium cursor-not-allowed"
                style={{
                  backgroundColor: 'var(--bg-muted)',
                  color: 'var(--text-disabled)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                Disabled Action
              </KromaButton>
            </div>

            {/* Form Input States */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Normal Focused Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                  Active Input (Focus Ring)
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="w-full px-3 py-2 rounded-md font-mono text-xs border transition-all"
                    style={{
                      backgroundColor: 'var(--bg-surface-raised)',
                      borderColor: 'var(--border-active)',
                      color: 'var(--text-primary)',
                      outline: '2px solid var(--ring-focus)',
                      outlineOffset: '2px',
                    }}
                  />
                </div>
                <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                  Focus ring uses <code className="font-mono">var(--ring-focus)</code>
                </span>
              </div>

              {/* Error State Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono" style={{ color: 'var(--text-error)' }}>
                  Invalid Input (Error State)
                </label>
                <input
                  type="text"
                  readOnly
                  value="invalid_cluster_key_404"
                  className="w-full px-3 py-2 rounded-md font-mono text-xs border"
                  style={{
                    backgroundColor: 'var(--bg-surface-raised)',
                    borderColor: 'var(--border-error)',
                    color: 'var(--text-primary)',
                  }}
                />
                <span className="text-[11px] flex items-center gap-1 font-mono" style={{ color: 'var(--text-error)' }}>
                  <XCircle size={12} />
                  <span>Validation error: cluster authentication token expired.</span>
                </span>
              </div>
            </div>

            {/* Notification Banners Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Success Banner */}
              <div
                className="p-3 rounded-lg border flex items-center gap-3 text-xs"
                style={{
                  backgroundColor: 'var(--bg-success-subtle)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-success)',
                }}
              >
                <CheckCircle2 size={16} className="flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="font-bold">Deployment Complete: </span>
                  <span>Tokens compiled and deployed to edge nodes.</span>
                </div>
              </div>

              {/* Warning Banner */}
              <div
                className="p-3 rounded-lg border flex items-center gap-3 text-xs"
                style={{
                  backgroundColor: 'var(--bg-warning-subtle)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-warning)',
                }}
              >
                <AlertTriangle size={16} className="flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="font-bold">Quota Notice: </span>
                  <span>API bandwidth limit approaching 85% threshold.</span>
                </div>
              </div>

              {/* Error Banner */}
              <div
                className="p-3 rounded-lg border flex items-center gap-3 text-xs"
                style={{
                  backgroundColor: 'var(--bg-error-subtle)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-error)',
                }}
              >
                <XCircle size={16} className="flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="font-bold">Build Warning: </span>
                  <span>Legacy fallback module failed to compile.</span>
                </div>
              </div>

              {/* Info Banner */}
              <div
                className="p-3 rounded-lg border flex items-center gap-3 text-xs"
                style={{
                  backgroundColor: 'var(--bg-info-subtle)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-info)',
                }}
              >
                <Info size={16} className="flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="font-bold">Documentation: </span>
                  <span>Read the developer integration guide.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
