import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import { RouteType } from '../types';
import { Link } from './common/Link';

export interface FooterProps {
  onNavigate: (route: RouteType) => void;
}

/* ─── Rainbow roller emblem for brand mark ─── */
const RollerEmblem: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className="kroma-footer__roller-icon"
  >
    {/* Roller head */}
    <rect x="3" y="3" width="10" height="14" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
    <rect x="4.2" y="4.2" width="7.6" height="2" rx="0.5" fill="#FF3B30" />
    <rect x="4.2" y="6.2" width="7.6" height="2" rx="0.5" fill="#FF9500" />
    <rect x="4.2" y="8.2" width="7.6" height="2" rx="0.5" fill="#FFD60A" />
    <rect x="4.2" y="10.2" width="7.6" height="2" rx="0.5" fill="#34C759" />
    <rect x="4.2" y="12.2" width="7.6" height="2" rx="0.5" fill="#00AEEF" />
    <rect x="4.2" y="14.2" width="7.6" height="2" rx="0.5" fill="#7B2CBF" />
    {/* Connecting bracket */}
    <path
      d="M8 17 L8 18.5 C8 19 8.5 19.5 9 19.5 L15 19.5 C15.5 19.5 16 19.5 16 19.5"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      fill="none"
    />
    {/* Wooden handle */}
    <line x1="16" y1="18.5" x2="16" y2="22" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const footerRef = useRef<HTMLElement>(null);

  const handleNav = (route: RouteType) => {
    onNavigate(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* Subtle IntersectionObserver animation trigger */
  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <footer
      ref={footerRef}
      className={`kroma-footer ${isVisible ? 'kroma-footer--visible' : ''}`}
      role="contentinfo"
    >
      <div className="kroma-footer__container">
        {/* ═════════════════════════════════════════════════════════
            1. LARGE CREATIVE STATEMENT & CTA SECTION
            ═════════════════════════════════════════════════════════ */}
        <div className="kroma-footer__cta-section">
          <div className="kroma-footer__statement-group">
            <h2 className="kroma-footer__statement">
              Let’s create something colorful.
            </h2>

            {/* Subtle Signature Rainbow Strip: 6 solid color segments */}
            <div className="kroma-footer__rainbow-strip" aria-hidden="true">
              <span className="kroma-footer__rainbow-segment" style={{ backgroundColor: '#FF3B30' }} />
              <span className="kroma-footer__rainbow-segment" style={{ backgroundColor: '#FF9500' }} />
              <span className="kroma-footer__rainbow-segment" style={{ backgroundColor: '#FFD60A' }} />
              <span className="kroma-footer__rainbow-segment" style={{ backgroundColor: '#34C759' }} />
              <span className="kroma-footer__rainbow-segment" style={{ backgroundColor: '#00AEEF' }} />
              <span className="kroma-footer__rainbow-segment" style={{ backgroundColor: '#7B2CBF' }} />
            </div>
          </div>

          <div className="kroma-footer__action-group">
            <a
              href="mailto:support@kroma.design"
              className="kroma-footer__contact-btn"
              aria-label="Contact Kroma via email at support@kroma.design"
            >
              <span>Get in touch</span>
              <ArrowUpRight size={17} strokeWidth={2.2} className="kroma-footer__contact-icon" aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════
            2. ALL PREVIOUS NAVIGATION RESTORED (4 Organized Columns)
            ═════════════════════════════════════════════════════════ */}
        <div className="kroma-footer__nav-grid">
          {/* Column 1: DISCOVERY & LIBRARY (Rainbow dot: Red #FF3B30) */}
          <div
            className="kroma-footer__nav-col"
            style={{ '--col-dot-color': '#FF3B30' } as React.CSSProperties}
          >
            <span className="kroma-footer__col-label">Discovery &amp; Library</span>
            <ul className="kroma-footer__col-list">
              <li>
                <Link to={{ path: 'explore' }} onNavigate={handleNav} className="kroma-footer__link">
                  Explore Hub
                </Link>
              </li>
              <li>
                <Link to={{ path: 'colors' }} onNavigate={handleNav} className="kroma-footer__link">
                  Curated Colors
                </Link>
              </li>
              <li>
                <Link to={{ path: 'palettes' }} onNavigate={handleNav} className="kroma-footer__link">
                  Palette Systems
                </Link>
              </li>
              <li>
                <Link to={{ path: 'patterns' }} onNavigate={handleNav} className="kroma-footer__link">
                  Vector Patterns
                </Link>
              </li>
              <li>
                <Link to={{ path: 'color-of-the-day' }} onNavigate={handleNav} className="kroma-footer__link">
                  Color of the Day
                </Link>
              </li>
              <li>
                <Link to={{ path: 'palette-of-the-day' }} onNavigate={handleNav} className="kroma-footer__link">
                  Palette of the Day
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: CREATIVE STUDIOS & DEV (Rainbow dot: Orange #FF9500) */}
          <div
            className="kroma-footer__nav-col"
            style={{ '--col-dot-color': '#FF9500' } as React.CSSProperties}
          >
            <span className="kroma-footer__col-label">Creative Studios &amp; Dev</span>
            <ul className="kroma-footer__col-list">
              <li>
                <Link to={{ path: 'ramps' }} onNavigate={handleNav} className="kroma-footer__link">
                  Ramps Studio (OKLCH)
                </Link>
              </li>
              <li>
                <Link to={{ path: 'pattern-studio' }} onNavigate={handleNav} className="kroma-footer__link">
                  Pattern Studio
                </Link>
              </li>
              <li>
                <Link to={{ path: 'mesh' }} onNavigate={handleNav} className="kroma-footer__link">
                  Mesh Gradient Studio
                </Link>
              </li>
              <li>
                <Link to={{ path: 'antigravity' }} onNavigate={handleNav} className="kroma-footer__link">
                  Antigravity Physics
                </Link>
              </li>
              <li>
                <Link to={{ path: 'palette-generator' }} onNavigate={handleNav} className="kroma-footer__link">
                  Palette Generator
                </Link>
              </li>
              <li>
                <Link to={{ path: 'extract-from-image' }} onNavigate={handleNav} className="kroma-footer__link">
                  Image → Palette
                </Link>
              </li>
              <li>
                <Link to={{ path: 'live' }} onNavigate={handleNav} className="kroma-footer__link">
                  Atmospheric Weather Color
                </Link>
              </li>
              <li>
                <Link to={{ path: 'api-docs' }} onNavigate={handleNav} className="kroma-footer__link">
                  Developer API &amp; Tokens
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: COMMUNITY & PLAY (Rainbow dot: Green #34C759) */}
          <div
            className="kroma-footer__nav-col"
            style={{ '--col-dot-color': '#34C759' } as React.CSSProperties}
          >
            <span className="kroma-footer__col-label">Community &amp; Play</span>
            <ul className="kroma-footer__col-list">
              <li>
                <Link to={{ path: 'collections' }} onNavigate={handleNav} className="kroma-footer__link">
                  Curated Collections
                </Link>
              </li>
              <li>
                <Link to={{ path: 'creators' }} onNavigate={handleNav} className="kroma-footer__link">
                  Designers &amp; Colorists
                </Link>
              </li>
              <li>
                <Link to={{ path: 'trending' }} onNavigate={handleNav} className="kroma-footer__link">
                  Trending Systems
                </Link>
              </li>
              <li>
                <Link to={{ path: 'new' }} onNavigate={handleNav} className="kroma-footer__link">
                  New Releases
                </Link>
              </li>
              <li>
                <Link to={{ path: 'play' }} onNavigate={handleNav} className="kroma-footer__link">
                  Color Play &amp; Hexle
                </Link>
              </li>
              <li>
                <Link to={{ path: 'saved' }} onNavigate={handleNav} className="kroma-footer__link">
                  Curator Workspace
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: CONNECT & BRAND (Rainbow dot: Blue #00AEEF) */}
          <div
            className="kroma-footer__nav-col"
            style={{ '--col-dot-color': '#00AEEF' } as React.CSSProperties}
          >
            <span className="kroma-footer__col-label">Connect</span>
            <ul className="kroma-footer__col-list">
              <li>
                <Link to={{ path: 'about' }} onNavigate={handleNav} className="kroma-footer__link">
                  About Kroma
                </Link>
              </li>
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="kroma-footer__link"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://pinterest.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="kroma-footer__link"
                >
                  Pinterest
                </a>
              </li>
              <li>
                <a
                  href="https://behance.net"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="kroma-footer__link"
                >
                  Behance
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@kroma.design"
                  className="kroma-footer__link kroma-footer__link--email"
                  style={{ '--col-dot-color': '#7B2CBF' } as React.CSSProperties}
                >
                  support@kroma.design
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════
            3. FOOTER BRAND AREA
            ═════════════════════════════════════════════════════════ */}
        <div className="kroma-footer__brand-area">
          <Link
            to={{ path: 'home' }}
            onNavigate={handleNav}
            className="kroma-footer__logo"
            aria-label="KROMA Home"
          >
            <RollerEmblem size={20} />
            <span className="kroma-footer__wordmark">Kroma</span>
          </Link>
          <span className="kroma-footer__tagline">
            Color, creativity &amp; visual exploration.
          </span>
        </div>

        {/* ═════════════════════════════════════════════════════════
            4. BOTTOM LEGAL BAR
            ═════════════════════════════════════════════════════════ */}
        <div className="kroma-footer__bottom-bar">
          <div className="kroma-footer__bottom-left">
            &copy; 2026 Kroma. All specimens curated &amp; calibrated.
          </div>
          <div className="kroma-footer__bottom-center">
            Made with curiosity.
          </div>
          <div className="kroma-footer__bottom-right">
            <button
              type="button"
              onClick={() => setLegalModal('privacy')}
              className="kroma-footer__legal-link"
            >
              Privacy
            </button>
            <span className="kroma-footer__legal-sep" aria-hidden="true">•</span>
            <button
              type="button"
              onClick={() => setLegalModal('terms')}
              className="kroma-footer__legal-link"
            >
              Terms
            </button>
          </div>
        </div>
      </div>

      {/* ─── Accessible Privacy & Terms Modal ─────────────────── */}
      {legalModal && (
        <div
          className="modal-backdrop"
          onClick={() => setLegalModal(null)}
          role="dialog"
          aria-modal="true"
          aria-label={legalModal === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
        >
          <div
            className="search-dialog-card p-6 max-w-lg mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-[var(--border-subtle)]">
              <h3 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
                {legalModal === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
              </h3>
              <button
                type="button"
                onClick={() => setLegalModal(null)}
                className="p-1 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)] transition-colors"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>
            <div className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed space-y-3">
              {legalModal === 'privacy' ? (
                <>
                  <p>
                    At Kroma, privacy is a fundamental architectural commitment. We do not track personal identifiers, sell analytical profiling, or run third-party advertising cookies.
                  </p>
                  <p>
                    All color calculations, OKLCH tone spaces, perceptual gamuts, mesh gradient math, and physics simulations run 100% locally on your browser hardware.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    All color recipes, calibrated pigments, design tokens, and algorithmic studios are provided under open creative licenses (CC0 and MIT) for designers, engineers, and digital artists.
                  </p>
                  <p>
                    Curated with precision, calibrated for WCAG AAA accessibility, and built with curiosity.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
