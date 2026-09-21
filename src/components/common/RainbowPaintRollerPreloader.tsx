import React from 'react';
import '../../styles/preloader.css';
import { useTheme } from '../../context/ThemeContext';

export interface RainbowPaintRollerPreloaderProps {
  className?: string;
  fullscreen?: boolean;
  isExiting?: boolean;
  theme?: 'light' | 'dark';
  ariaLabel?: string;
}

/**
 * Safely resolves the current application theme.
 * Reuses the existing global ThemeContext, with fallback to DOM `data-theme`
 * or localStorage to guarantee zero flash.
 */
function useResolvedTheme(explicitTheme?: 'light' | 'dark'): 'light' | 'dark' {
  let contextTheme: 'light' | 'dark' | undefined;
  try {
    const ctx = useTheme();
    if (ctx && (ctx.theme === 'light' || ctx.theme === 'dark')) {
      contextTheme = ctx.theme;
    }
  } catch {
    // If mounted outside ThemeProvider, fall back to DOM or localStorage
  }

  if (explicitTheme) return explicitTheme;
  if (contextTheme) return contextTheme;

  if (typeof document !== 'undefined') {
    const attr = document.documentElement.getAttribute('data-theme');
    if (attr === 'light' || attr === 'dark') return attr;
  }

  if (typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem('kroma-theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {}
  }

  return 'dark';
}

export const RainbowPaintRollerPreloader: React.FC<RainbowPaintRollerPreloaderProps> = ({
  className = '',
  fullscreen = true,
  isExiting = false,
  theme: explicitTheme,
  ariaLabel = 'Loading KROMA...',
}) => {
  const currentTheme = useResolvedTheme(explicitTheme);
  const isDark = currentTheme === 'dark';

  // Theme-aware tokens
  const outlineColor = isDark ? '#F8F8F8' : '#171717';
  const handleColor = isDark ? '#C99568' : '#D9A77A';
  const ferruleColor = isDark ? '#3A3D45' : '#D0D0D4';

  return (
    <div
      role="status"
      aria-label={ariaLabel}
      aria-live="polite"
      className={`rainbow-preloader-container rainbow-preloader-theme-${currentTheme} ${
        fullscreen ? 'rainbow-preloader-fullscreen' : 'rainbow-preloader-inline'
      } ${isExiting ? 'rainbow-preloader-exit' : ''} ${className}`}
    >
      <div className="rainbow-roller-wrapper">
        <svg
          viewBox="0 0 100 100"
          className="rainbow-roller-svg"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <defs>
            {/* Cylinder rounded clip boundary */}
            <clipPath id="rainbowCylinderClip">
              <rect x="33" y="18" width="20" height="44" rx="6" ry="6" />
            </clipPath>
          </defs>

          {/* Roller Assembly (Main physical rocking & displacement around axle) */}
          <g className="roller-assembly" style={{ transformOrigin: '43px 40px' }}>
            {/* Roller Frame & Wooden Handle Layer (Pinned at top axle 43, 18) */}
            <g className="roller-frame" style={{ transformOrigin: '43px 18px' }}>
              {/* Metal Wire Bracket */}
              <path
                d="M 43 19 L 43 14 C 43 11, 45 9, 48 9 L 60 9 C 63.5 9, 65.5 11, 65.5 14.5 L 65.5 39 C 65.5 42, 63.5 44, 61 45.5 L 59 47 C 58 47.7, 57.5 48.8, 57.5 50 L 57.5 55"
                fill="none"
                stroke={outlineColor}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="rainbow-roller-outline"
              />

              {/* Metal Ferrule Collar */}
              <rect
                x="55.5"
                y="55"
                width="4"
                height="3"
                rx="0.8"
                fill={ferruleColor}
                stroke={outlineColor}
                strokeWidth="1.2"
                className="rainbow-roller-ferrule"
              />

              {/* Wooden Handle */}
              <path
                d="M 55.5 58 L 54 75 C 53.5 81, 61.5 81, 61 75 L 59.5 58 Z"
                fill={handleColor}
                stroke={outlineColor}
                strokeWidth="1.4"
                strokeLinejoin="round"
                className="rainbow-roller-handle"
              />
            </g>

            {/* Roller Cylinder Layer (Performs natural rolling rotation around axle) */}
            <g className="roller-cylinder" style={{ transformOrigin: '43px 40px' }}>
              {/* Clipped Solid Rainbow Stripes (Constant vibrant hues) */}
              <g clipPath="url(#rainbowCylinderClip)">
                {/* 6. Purple (#7B2CBF) */}
                <path
                  d="M 31 16 L 55 16 L 55 25.5 C 48 27.5, 39 23.5, 31 25.5 Z"
                  fill="#7B2CBF"
                />
                {/* 5. Blue / Cyan (#00AEEF) */}
                <path
                  d="M 31 25.5 C 39 23.5, 48 27.5, 55 25.5 L 55 33 C 48 35, 39 31, 31 33 Z"
                  fill="#00AEEF"
                />
                {/* 4. Green (#34C759) */}
                <path
                  d="M 31 33 C 39 31, 48 35, 55 33 L 55 40.5 C 48 42.5, 39 38.5, 31 40.5 Z"
                  fill="#34C759"
                />
                {/* 3. Yellow (#FFD60A) */}
                <path
                  d="M 31 40.5 C 39 38.5, 48 42.5, 55 40.5 L 55 48 C 48 50, 39 46, 31 48 Z"
                  fill="#FFD60A"
                />
                {/* 2. Orange (#FF9500) */}
                <path
                  d="M 31 48 C 48 46, 48 50, 55 48 L 55 55.5 C 48 57.5, 39 53.5, 31 55.5 Z"
                  fill="#FF9500"
                />
                {/* 1. Red (#FF3B30) */}
                <path
                  d="M 31 55.5 C 39 53.5, 48 57.5, 55 55.5 L 55 65 L 31 65 Z"
                  fill="#FF3B30"
                />
              </g>

              {/* Organic Wave Separators */}
              <path
                d="M 33 25.5 C 40 23.8, 47 27.2, 53 25.5"
                fill="none"
                stroke={outlineColor}
                strokeWidth="1.2"
                strokeLinecap="round"
                className="rainbow-roller-outline"
              />
              <path
                d="M 33 33 C 40 31.3, 47 34.7, 53 33"
                fill="none"
                stroke={outlineColor}
                strokeWidth="1.2"
                strokeLinecap="round"
                className="rainbow-roller-outline"
              />
              <path
                d="M 33 40.5 C 40 38.8, 47 42.2, 53 40.5"
                fill="none"
                stroke={outlineColor}
                strokeWidth="1.2"
                strokeLinecap="round"
                className="rainbow-roller-outline"
              />
              <path
                d="M 33 48 C 40 46.3, 47 49.7, 53 48"
                fill="none"
                stroke={outlineColor}
                strokeWidth="1.2"
                strokeLinecap="round"
                className="rainbow-roller-outline"
              />
              <path
                d="M 33 55.5 C 40 53.8, 47 57.2, 53 55.5"
                fill="none"
                stroke={outlineColor}
                strokeWidth="1.2"
                strokeLinecap="round"
                className="rainbow-roller-outline"
              />

              {/* Roller Outer Border */}
              <rect
                x="33"
                y="18"
                width="20"
                height="44"
                rx="6"
                ry="6"
                fill="none"
                stroke={outlineColor}
                strokeWidth="1.4"
                className="rainbow-roller-outline"
              />

              {/* Top Wire Axis Pin */}
              <circle
                cx="43"
                cy="18"
                r="1.5"
                fill={outlineColor}
                className="rainbow-roller-fill"
              />
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
};
