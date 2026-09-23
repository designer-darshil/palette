import React, { useState } from 'react';
import { useMaintenance } from '../context/MaintenanceContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import { SEOHead } from '../components/seo/SEOHead';
import {
  Wrench,
  Clock,
  RefreshCw,
  Mail,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../components/common/Button';

interface MaintenancePageProps {
  isPreview?: boolean;
  onExitPreview?: () => void;
  onNavigateAdmin?: () => void;
}

export const MaintenancePage: React.FC<MaintenancePageProps> = ({
  isPreview = false,
  onExitPreview,
  onNavigateAdmin,
}) => {
  const { state, status, remainingTime, refresh } = useMaintenance();
  const { isAuthenticated, isSuperAdmin } = useAdminAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const formattedReturnTime = React.useMemo(() => {
    const raw = state.scheduledEnd || state.estimatedReturn;
    if (!raw) return null;
    try {
      const date = new Date(raw);
      if (isNaN(date.getTime())) return raw;
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
      }).format(date);
    } catch {
      return raw;
    }
  }, [state.scheduledEnd, state.estimatedReturn]);

  return (
    <>
      <SEOHead
        title="Scheduled System Maintenance | KROMA"
        description="PaletteParadise is currently undergoing scheduled system calibration. Public services will resume momentarily."
        noindex={true}
        nofollow={true}
      />

      <div className="min-h-screen min-h-[100dvh] w-full flex flex-col justify-between bg-[var(--bg-canvas)] text-[var(--text-primary)] p-4 sm:p-8 relative overflow-hidden select-none">
        {/* Subtle Ambient Radial Glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none rounded-full blur-[120px] opacity-25"
          style={{
            background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)',
          }}
        />

        {/* Top Bar: Brand & Admin Preview Indicator */}
        <header className="w-full max-w-4xl mx-auto flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-[3px] bg-gradient-to-br from-[#FF3B30] via-[#00AEEF] to-[#34C759] inline-block shrink-0" />
            <span className="font-mono text-xs font-extrabold tracking-[0.18em] uppercase">
              KROMA / PALETTEPARADISE
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isPreview && (
              <span className="px-2.5 py-1 rounded-xs bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                ADMIN PREVIEW MODE
              </span>
            )}

            {isAuthenticated && (
              <Button
                variant="secondary"
                size="sm"
                iconRight={<ArrowRight size={12} />}
                onClick={onNavigateAdmin || (() => { window.location.href = '/admin'; })}
              >
                Admin Hub
              </Button>
            )}

            {isPreview && onExitPreview && (
              <Button
                variant="primary"
                size="sm"
                onClick={onExitPreview}
              >
                Exit Preview
              </Button>
            )}
          </div>
        </header>

        {/* Central Card */}
        <main className="w-full max-w-lg mx-auto my-auto py-10 flex flex-col items-center text-center z-10">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-surface-1)] border border-[var(--border-medium)] shadow-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-mono text-[11px] font-bold tracking-wider uppercase text-[var(--text-secondary)]">
              {status === 'ending_soon' ? 'MAINTENANCE ENDING SOON' : 'SYSTEM CALIBRATION IN PROGRESS'}
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 text-[var(--text-primary)] font-sans">
            {state.title || "We'll be back shortly"}
          </h1>

          {/* Message */}
          <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-md leading-relaxed mb-8">
            {state.message}
          </p>

          {/* Countdown Clock (if enabled and remaining time exists) */}
          {state.showCountdown && remainingTime && !remainingTime.isExpired && (
            <div className="w-full bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md p-4 mb-6 shadow-sm">
              <div className="font-mono text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-3 flex items-center justify-center gap-1.5">
                <Clock size={11} />
                <span>Estimated Window Remaining</span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div className="flex flex-col items-center p-2 rounded-xs bg-[var(--bg-surface-2)] border border-[var(--border-subtle)]">
                  <span className="font-mono text-xl sm:text-2xl font-extrabold text-[var(--text-primary)]">
                    {String(remainingTime.days).padStart(2, '0')}
                  </span>
                  <span className="font-mono text-[9px] text-[var(--text-tertiary)] uppercase mt-0.5">Days</span>
                </div>

                <div className="flex flex-col items-center p-2 rounded-xs bg-[var(--bg-surface-2)] border border-[var(--border-subtle)]">
                  <span className="font-mono text-xl sm:text-2xl font-extrabold text-[var(--text-primary)]">
                    {String(remainingTime.hours).padStart(2, '0')}
                  </span>
                  <span className="font-mono text-[9px] text-[var(--text-tertiary)] uppercase mt-0.5">Hours</span>
                </div>

                <div className="flex flex-col items-center p-2 rounded-xs bg-[var(--bg-surface-2)] border border-[var(--border-subtle)]">
                  <span className="font-mono text-xl sm:text-2xl font-extrabold text-[var(--color-primary)]">
                    {String(remainingTime.minutes).padStart(2, '0')}
                  </span>
                  <span className="font-mono text-[9px] text-[var(--text-tertiary)] uppercase mt-0.5">Min</span>
                </div>

                <div className="flex flex-col items-center p-2 rounded-xs bg-[var(--bg-surface-2)] border border-[var(--border-subtle)]">
                  <span className="font-mono text-xl sm:text-2xl font-extrabold text-[var(--text-primary)]">
                    {String(remainingTime.seconds).padStart(2, '0')}
                  </span>
                  <span className="font-mono text-[9px] text-[var(--text-tertiary)] uppercase mt-0.5">Sec</span>
                </div>
              </div>
            </div>
          )}

          {/* Target Return Callout */}
          {formattedReturnTime && (
            <div className="text-xs text-[var(--text-tertiary)] font-mono mb-6">
              Expected return: <strong className="text-[var(--text-secondary)]">{formattedReturnTime}</strong>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <Button
              variant="primary"
              size="md"
              iconLeft={<RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />}
              onClick={handleManualRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? 'Checking...' : 'Check Status'}
            </Button>

            {state.supportUrl && (
              <Button
                variant="secondary"
                size="md"
                iconLeft={<Mail size={13} />}
                onClick={() => {
                  if (state.supportUrl) window.open(state.supportUrl, '_blank');
                }}
              >
                Contact Support
              </Button>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-[var(--text-tertiary)] pt-6 border-t border-[var(--border-subtle)] gap-2 z-10">
          <div>&copy; {new Date().getFullYear()} KROMA DIGITAL LIBRARY • ALL SYSTEMS MONITORED</div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Core Data Layer Intact</span>
          </div>
        </footer>
      </div>
    </>
  );
};
