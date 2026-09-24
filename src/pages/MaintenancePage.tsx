import React, { useState } from 'react';
import { useMaintenance } from '../context/MaintenanceContext';
import { SEOHead } from '../components/seo/SEOHead';
import { KromaButton } from '../components/common/KromaButton';
import { RefreshCw } from 'lucide-react';

interface MaintenancePageProps {
  isPreview?: boolean;
  onExitPreview?: () => void;
  onNavigateAdmin?: () => void;
}

const RollerEmblem: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className="shrink-0 text-text-primary"
  >
    <rect x="3" y="3" width="10" height="14" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
    <rect x="4.2" y="4.2" width="7.6" height="2" rx="0.5" fill="#FF3B30" />
    <rect x="4.2" y="6.2" width="7.6" height="2" rx="0.5" fill="#FF9500" />
    <rect x="4.2" y="8.2" width="7.6" height="2" rx="0.5" fill="#FFD60A" />
    <rect x="4.2" y="10.2" width="7.6" height="2" rx="0.5" fill="#34C759" />
    <rect x="4.2" y="12.2" width="7.6" height="2" rx="0.5" fill="#00AEEF" />
    <rect x="4.2" y="14.2" width="7.6" height="2" rx="0.5" fill="#7B2CBF" />
    <path
      d="M8 17 L8 18.5 C8 19 8.5 19.5 9 19.5 L15 19.5 C15.5 19.5 16 19.5 16 19.5"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      fill="none"
    />
    <line x1="16" y1="18.5" x2="16" y2="22" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const MaintenancePage: React.FC<MaintenancePageProps> = ({
  isPreview = false,
}) => {
  const { state, refresh } = useMaintenance();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRetry = async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const displayMessage =
    state.message &&
    !state.message.includes('undergoing scheduled system upgrades') &&
    state.message.trim().length > 0
      ? state.message
      : "We're making a few updates behind the scenes. Kroma will be back shortly.";

  return (
    <>
      <SEOHead
        title="Maintenance | KROMA"
        description="Kroma is temporarily unavailable. We'll be back shortly."
        noindex={true}
        nofollow={true}
      />

      <div className="min-h-screen min-h-[100dvh] w-full flex flex-col justify-between bg-canvas text-text-primary p-6 sm:p-10 lg:p-16 select-none font-sans">
        {/* ── Brand Header ── */}
        <header className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <RollerEmblem size={20} />
            <span className="text-sm font-bold tracking-widest uppercase text-text-primary">
              KROMA
            </span>
          </div>

          {isPreview && (
            <span className="text-xs font-mono text-text-tertiary uppercase tracking-wider">
              Preview Mode
            </span>
          )}
        </header>

        {/* ── Focused Single Composition ── */}
        <main className="my-auto py-12 flex flex-col items-start gap-8 max-w-xl">
          {/* Subtle horizontal sequence of solid Kroma color blocks */}
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="w-6 h-1 rounded-xs bg-kroma-red" />
            <span className="w-6 h-1 rounded-xs bg-kroma-orange" />
            <span className="w-6 h-1 rounded-xs bg-kroma-yellow" />
            <span className="w-6 h-1 rounded-xs bg-kroma-green" />
            <span className="w-6 h-1 rounded-xs bg-kroma-blue" />
            <span className="w-6 h-1 rounded-xs bg-kroma-purple" />
          </div>

          <div className="flex flex-col gap-4">
            <h1 className="font-sans text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-bold leading-[1.05] tracking-tight text-text-primary uppercase m-0">
              MAINTENANCE
            </h1>
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-md mt-2">
              {displayMessage}
            </p>
          </div>

          <div aria-live="polite">
            <KromaButton
              variant="filled"
              size="md"
              onClick={handleRetry}
              disabled={isRefreshing}
              iconLeft={
                <RefreshCw
                  size={14}
                  className={isRefreshing ? 'motion-safe:animate-spin' : ''}
                />
              }
              className="!min-h-[40px] !px-5 !text-sm"
            >
              {isRefreshing ? 'Checking...' : 'Try Again'}
            </KromaButton>
          </div>
        </main>

        {/* ── Minimal Quiet Footer ── */}
        <footer className="w-full flex items-center justify-between text-xs text-text-tertiary">
          <span>&copy; {new Date().getFullYear()} Kroma</span>
        </footer>
      </div>
    </>
  );
};
