import React, { useEffect, useRef, useState } from 'react';

// ─────────────────────────────────────────────────────────────
// Simulated progress curve.
// Quickly reaches ~94%, then plateaus until the "ready" signal,
// then completes instantly to 100%.
//
// tick  target%  cumulative-delay(ms)
//   1     28       120
//   2     52       300
//   3     69       500
//   4     80       750
//   5     88      1100
//   6     93      1550
//   7     94      2200   ← plateau here until app is ready
//   ─     100     +0     ← instant on app-ready signal
// ─────────────────────────────────────────────────────────────
const SCHEDULE: { target: number; delay: number }[] = [
  { target: 28, delay: 120 },
  { target: 52, delay: 300 },
  { target: 69, delay: 500 },
  { target: 80, delay: 750 },
  { target: 88, delay: 1100 },
  { target: 93, delay: 1550 },
  { target: 94, delay: 2200 },
];

// If app never signals ready within FAILSAFE_MS, exit anyway.
const FAILSAFE_MS = 8000;

interface AppLoaderProps {
  /** Set to true once the application is genuinely ready to render */
  isReady: boolean;
}

export const AppLoader: React.FC<AppLoaderProps> = ({ isReady }) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'loading' | 'completing' | 'exiting' | 'done'>('loading');
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // ── Scroll lock while loader is active ──────────────────────
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // ── Simulated progress ────────────────────────────────────────
  useEffect(() => {
    SCHEDULE.forEach(({ target, delay }) => {
      const t = setTimeout(() => setProgress(target), delay);
      timersRef.current.push(t);
    });
    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, []);

  // ── React to app-ready signal ────────────────────────────────
  useEffect(() => {
    if (!isReady || phase !== 'loading') return;
    setPhase('completing');
    setProgress(100);
    const t = setTimeout(() => setPhase('exiting'), 340);
    return () => clearTimeout(t);
  }, [isReady, phase]);

  // ── Failsafe exit ─────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      setProgress(100);
      setPhase('exiting');
    }, FAILSAFE_MS);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    // Only act when the opacity transition on the root element completes
    if (e.propertyName === 'opacity' && phase === 'exiting') {
      setPhase('done');
    }
  };

  if (phase === 'done') return null;

  const pct = Math.round(progress);
  const pctLabel = String(pct).padStart(2, '0') + '%';

  return (
    <div
      className={`kroma-app-loader${phase === 'exiting' ? ' kroma-app-loader--exit' : ''}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-label="KROMA is loading, please wait"
      aria-live="polite"
      onTransitionEnd={handleTransitionEnd}
    >
      <div className="kroma-loader-inner">
        {/* Branding */}
        <div className="kroma-loader-brand">
          <span className="kroma-loader-glyph" aria-hidden="true" />
          <span className="kroma-loader-wordmark">KROMA</span>
        </div>

        {/* Progress track */}
        <div className="kroma-loader-track-wrap" aria-hidden="true">
          <div className="kroma-loader-track">
            <div
              className="kroma-loader-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Percentage */}
        <div className="kroma-loader-pct" aria-hidden="true">
          {pctLabel}
        </div>

        {/* Label */}
        <div className="kroma-loader-label" aria-hidden="true">
          LOADING EXPERIENCE
        </div>
      </div>
    </div>
  );
};
