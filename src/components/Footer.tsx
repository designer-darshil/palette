import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import { RouteType } from '../types';
import { Link } from './common/Link';
import { KromaButton } from './common/KromaButton';

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
    className="shrink-0 block text-white"
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

interface NavLinkItemProps {
  to?: RouteType;
  href?: string;
  dotColor: string;
  children: React.ReactNode;
  onNavigate?: (route: RouteType) => void;
}

const FooterNavLink: React.FC<NavLinkItemProps> = ({ to, href, dotColor, children, onNavigate }) => {
  const content = (
    <>
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0 opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-150"
        style={{ backgroundColor: dotColor }}
        aria-hidden="true"
      />
      <span>{children}</span>
    </>
  );

  if (to && onNavigate) {
    return (
      <Link
        to={to}
        onNavigate={onNavigate}
        className="group inline-flex items-center gap-2 text-sm font-[450] text-[#B0B0B0] hover:text-white transition-all duration-150 hover:translate-x-0.5 py-0.5 select-none"
      >
        {content}
      </Link>
    );
  }

  return (
    <a
      href={href}
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      className="group inline-flex items-center gap-2 text-sm font-[450] text-[#B0B0B0] hover:text-white transition-all duration-150 hover:translate-x-0.5 py-0.5 select-none"
    >
      {content}
    </a>
  );
};

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
      className="w-full bg-[#171717] text-[#F8F8F8] mt-auto border-t border-[rgba(248,248,248,0.08)] px-5 pt-16 pb-7 md:px-8 md:pt-20 md:pb-8 lg:px-10 lg:pt-24 lg:pb-8 relative z-10 box-border"
      role="contentinfo"
    >
      <div className="max-w-[1400px] mx-auto w-full flex flex-col gap-12 md:gap-16">
        {/* ═════════════════════════════════════════════════════════
            1. LARGE CREATIVE STATEMENT & CTA SECTION
            ═════════════════════════════════════════════════════════ */}
        <div
          className={`flex flex-col md:flex-row md:items-end justify-between gap-7 md:gap-10 flex-wrap pb-8 border-b border-[rgba(248,248,248,0.08)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}
        >
          <div className="max-w-[780px] flex flex-col gap-5">
            <h2 className="font-serif text-[clamp(42px,13vw,64px)] md:text-[clamp(52px,6.5vw,78px)] font-normal tracking-[-0.035em] leading-[1.04] text-[#F8F8F8] m-0">
              Let’s create something colorful.
            </h2>

            {/* Subtle Signature Rainbow Strip: 6 solid color segments */}
            <div className="flex w-full max-w-[240px] h-[3px] rounded-xs overflow-hidden opacity-85 mt-2" aria-hidden="true">
              <span className="flex-1 h-full" style={{ backgroundColor: '#FF3B30' }} />
              <span className="flex-1 h-full" style={{ backgroundColor: '#FF9500' }} />
              <span className="flex-1 h-full" style={{ backgroundColor: '#FFD60A' }} />
              <span className="flex-1 h-full" style={{ backgroundColor: '#34C759' }} />
              <span className="flex-1 h-full" style={{ backgroundColor: '#00AEEF' }} />
              <span className="flex-1 h-full" style={{ backgroundColor: '#7B2CBF' }} />
            </div>
          </div>

          <div className="w-full md:w-auto shrink-0">
            <a
              href="mailto:designers.scrillo@gmail.com"
              className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xs bg-[#F8F8F8] text-[#171717] font-sans text-sm font-semibold tracking-[-0.01em] transition-all duration-180 ease-out hover:bg-white hover:shadow-[0_8px_20px_rgba(255,255,255,0.12)] hover:-translate-y-0.5 active:translate-y-0"
              aria-label="Contact Kroma via email at designers.scrillo@gmail.com"
            >
              <span>Get in touch</span>
              <ArrowUpRight size={17} strokeWidth={2.2} className="transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════
            2. ALL PREVIOUS NAVIGATION RESTORED (4 Organized Columns)
            ═════════════════════════════════════════════════════════ */}
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 lg:gap-12 transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] delay-75 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {/* Column 1: DISCOVERY & LIBRARY (Rainbow dot: Red #FF3B30) */}
          <div className="flex flex-col gap-4 min-w-0">
            <span className="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-[#888888]">
              Discovery &amp; Library
            </span>
            <ul className="flex flex-col gap-2.5 list-none p-0 m-0">
              <li>
                <FooterNavLink to={{ path: 'explore' }} onNavigate={handleNav} dotColor="#FF3B30">
                  Explore Hub
                </FooterNavLink>
              </li>
              <li>
                <FooterNavLink to={{ path: 'colors' }} onNavigate={handleNav} dotColor="#FF3B30">
                  Curated Colors
                </FooterNavLink>
              </li>
              <li>
                <FooterNavLink to={{ path: 'palettes' }} onNavigate={handleNav} dotColor="#FF3B30">
                  Palette Systems
                </FooterNavLink>
              </li>
              <li>
                <FooterNavLink to={{ path: 'patterns' }} onNavigate={handleNav} dotColor="#FF3B30">
                  Vector Patterns
                </FooterNavLink>
              </li>
              <li>
                <FooterNavLink to={{ path: 'color-of-the-day' }} onNavigate={handleNav} dotColor="#FF3B30">
                  Color of the Day
                </FooterNavLink>
              </li>
              <li>
                <FooterNavLink to={{ path: 'palette-of-the-day' }} onNavigate={handleNav} dotColor="#FF3B30">
                  Palette of the Day
                </FooterNavLink>
              </li>
            </ul>
          </div>

          {/* Column 2: CREATIVE STUDIOS & DEV (Rainbow dot: Orange #FF9500) */}
          <div className="flex flex-col gap-4 min-w-0">
            <span className="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-[#888888]">
              Creative Studios &amp; Dev
            </span>
            <ul className="flex flex-col gap-2.5 list-none p-0 m-0">
              <li>
                <FooterNavLink to={{ path: 'ramps' }} onNavigate={handleNav} dotColor="#FF9500">
                  Ramps Studio (OKLCH)
                </FooterNavLink>
              </li>
              <li>
                <FooterNavLink to={{ path: 'pattern-studio' }} onNavigate={handleNav} dotColor="#FF9500">
                  Pattern Studio
                </FooterNavLink>
              </li>
              <li>
                <FooterNavLink to={{ path: 'mesh' }} onNavigate={handleNav} dotColor="#FF9500">
                  Mesh Gradient Studio
                </FooterNavLink>
              </li>
              <li>
                <FooterNavLink to={{ path: 'springs' }} onNavigate={handleNav} dotColor="#FF9500">
                  Springs Studio
                </FooterNavLink>
              </li>
              <li>
                <FooterNavLink to={{ path: 'palette-generator' }} onNavigate={handleNav} dotColor="#FF9500">
                  Palette Generator
                </FooterNavLink>
              </li>
              <li>
                <FooterNavLink to={{ path: 'extract-from-image' }} onNavigate={handleNav} dotColor="#FF9500">
                  Image → Palette
                </FooterNavLink>
              </li>
              <li>
                <FooterNavLink to={{ path: 'live' }} onNavigate={handleNav} dotColor="#FF9500">
                  Atmospheric Weather Color
                </FooterNavLink>
              </li>
              <li>
                <FooterNavLink to={{ path: 'api-docs' }} onNavigate={handleNav} dotColor="#FF9500">
                  Developer API &amp; Tokens
                </FooterNavLink>
              </li>
            </ul>
          </div>

          {/* Column 3: COMMUNITY & PLAY (Rainbow dot: Green #34C759) */}
          <div className="flex flex-col gap-4 min-w-0">
            <span className="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-[#888888]">
              Community &amp; Play
            </span>
            <ul className="flex flex-col gap-2.5 list-none p-0 m-0">
              <li>
                <FooterNavLink to={{ path: 'collections' }} onNavigate={handleNav} dotColor="#34C759">
                  Curated Collections
                </FooterNavLink>
              </li>
              <li>
                <FooterNavLink to={{ path: 'creators' }} onNavigate={handleNav} dotColor="#34C759">
                  Designers &amp; Colorists
                </FooterNavLink>
              </li>
              <li>
                <FooterNavLink to={{ path: 'trending' }} onNavigate={handleNav} dotColor="#34C759">
                  Trending Systems
                </FooterNavLink>
              </li>
              <li>
                <FooterNavLink to={{ path: 'new' }} onNavigate={handleNav} dotColor="#34C759">
                  New Releases
                </FooterNavLink>
              </li>
              <li>
                <FooterNavLink to={{ path: 'play' }} onNavigate={handleNav} dotColor="#34C759">
                  Color Play &amp; Hexle
                </FooterNavLink>
              </li>
              <li>
                <FooterNavLink to={{ path: 'saved' }} onNavigate={handleNav} dotColor="#34C759">
                  Curator Workspace
                </FooterNavLink>
              </li>
            </ul>
          </div>

          {/* Column 4: CONNECT & BRAND (Rainbow dot: Blue #00AEEF) */}
          <div className="flex flex-col gap-4 min-w-0">
            <span className="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-[#888888]">
              Connect
            </span>
            <ul className="flex flex-col gap-2.5 list-none p-0 m-0">
              <li>
                <FooterNavLink to={{ path: 'about' }} onNavigate={handleNav} dotColor="#00AEEF">
                  About Kroma
                </FooterNavLink>
              </li>
              <li>
                <FooterNavLink href="https://instagram.com" dotColor="#00AEEF">
                  Instagram
                </FooterNavLink>
              </li>
              <li>
                <FooterNavLink href="https://pinterest.com" dotColor="#00AEEF">
                  Pinterest
                </FooterNavLink>
              </li>
              <li>
                <FooterNavLink href="https://behance.net" dotColor="#00AEEF">
                  Behance
                </FooterNavLink>
              </li>
              <li>
                <FooterNavLink href="mailto:designers.scrillo@gmail.com" dotColor="#7B2CBF">
                  designers.scrillo@gmail.com
                </FooterNavLink>
              </li>
            </ul>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════
            3. FOOTER BRAND AREA
            ═════════════════════════════════════════════════════════ */}
        <div
          className={`flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-6 pt-8 border-t border-[rgba(248,248,248,0.08)] transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] delay-100 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
        >
          <Link
            to={{ path: 'home' }}
            onNavigate={handleNav}
            className="inline-flex items-center gap-2.5 text-white hover:opacity-85 transition-opacity"
            aria-label="KROMA Home"
          >
            <RollerEmblem size={20} />
            <span className="font-sans text-[1.15rem] font-[750] tracking-[-0.035em] leading-none text-white">Kroma</span>
          </Link>
          <span className="font-sans text-[13.5px] text-[#888888]">
            Color, creativity &amp; visual exploration.
          </span>
        </div>

        {/* ═════════════════════════════════════════════════════════
            4. BOTTOM LEGAL BAR
            ═════════════════════════════════════════════════════════ */}
        <div
          className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-5 pt-6 border-t border-[rgba(248,248,248,0.12)] font-sans text-[13px] text-[#777777] flex-wrap transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] delay-150 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          <div className="flex-1 min-w-[140px]">
            &copy; 2026 Kroma. All specimens curated &amp; calibrated.
          </div>
          <div className="flex-1 text-left md:text-center min-w-[140px]">
            Made with curiosity.
          </div>
          <div className="flex-1 flex items-center justify-start md:justify-end gap-2 min-w-[140px]">
            <KromaButton
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setLegalModal('privacy')}
              className="!h-auto !p-0 !min-h-0 !text-xs !font-normal !capitalize !tracking-normal !rounded-none !text-[#777777] hover:!text-[#F8F8F8] hover:underline"
            >
              Privacy
            </KromaButton>
            <span className="opacity-50 text-xs" aria-hidden="true">•</span>
            <KromaButton
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setLegalModal('terms')}
              className="!h-auto !p-0 !min-h-0 !text-xs !font-normal !capitalize !tracking-normal !rounded-none !text-[#777777] hover:!text-[#F8F8F8] hover:underline"
            >
              Terms
            </KromaButton>
          </div>
        </div>
      </div>

      {/* ─── Accessible Privacy & Terms Modal ─────────────────── */}
      {legalModal && (
        <div
          className="fixed inset-0 z-[200] bg-[#040507]/80 backdrop-blur-md flex items-start justify-center pt-[100px] px-4"
          onClick={() => setLegalModal(null)}
          role="dialog"
          aria-modal="true"
          aria-label={legalModal === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
        >
          <div
            className="w-full max-w-lg mx-4 bg-[var(--bg-surface-1)] border border-[var(--border-strong)] rounded-[var(--radius-md)] shadow-[var(--shadow-elevated)] overflow-hidden flex flex-col p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-[var(--border-subtle)]">
              <h3 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
                {legalModal === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
              </h3>
              <KromaButton
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setLegalModal(null)}
                className="w-8 h-8 min-h-[32px] p-1 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)] transition-colors"
                aria-label="Close dialog"
              >
                <X size={18} />
              </KromaButton>
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
