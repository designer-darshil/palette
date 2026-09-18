import React from 'react';
import { RouteType } from '../types';
import { Link } from './common/Link';

interface FooterProps {
  onNavigate: (route: RouteType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleNav = (route: RouteType) => {
    onNavigate(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-brand-title">
            <span className="brand-glyph" />
            <span>PaletteParadise</span>
          </div>
          <p className="footer-brand-desc">
            A comprehensive digital color discovery, creation, curation, and utility platform calibrated for designers, engineers, and digital architects.
          </p>
        </div>

        <div className="footer-links-group">
          <div>
            <div className="footer-col-title">Discovery &amp; Library</div>
            <ul className="footer-links-list">
              <li>
                <Link to={{ path: 'explore' }} onNavigate={handleNav}>Explore Hub</Link>
              </li>
              <li>
                <Link to={{ path: 'colors' }} onNavigate={handleNav}>Curated Colors</Link>
              </li>
              <li>
                <Link to={{ path: 'palettes' }} onNavigate={handleNav}>Palette Systems</Link>
              </li>
              <li>
                <Link to={{ path: 'patterns' }} onNavigate={handleNav}>Vector Patterns</Link>
              </li>
              <li>
                <Link to={{ path: 'color-of-the-day' }} onNavigate={handleNav}>Color of the Day</Link>
              </li>
              <li>
                <Link to={{ path: 'palette-of-the-day' }} onNavigate={handleNav}>Palette of the Day</Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Community &amp; Play</div>
            <ul className="footer-links-list">
              <li>
                <Link to={{ path: 'collections' }} onNavigate={handleNav}>Curated Collections</Link>
              </li>
              <li>
                <Link to={{ path: 'creators' }} onNavigate={handleNav}>Designers &amp; Colorists</Link>
              </li>
              <li>
                <Link to={{ path: 'trending' }} onNavigate={handleNav}>Trending Systems</Link>
              </li>
              <li>
                <Link to={{ path: 'new' }} onNavigate={handleNav}>New Releases</Link>
              </li>
              <li>
                <Link to={{ path: 'play' }} onNavigate={handleNav}>Color Play &amp; Hexle</Link>
              </li>
              <li>
                <Link to={{ path: 'profile' }} onNavigate={handleNav}>Curator Workspace</Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Creative Studios &amp; Dev</div>
            <ul className="footer-links-list">
              <li>
                <Link to={{ path: 'ramps' }} onNavigate={handleNav}>Ramps Studio</Link>
              </li>
              <li>
                <Link to={{ path: 'pattern-studio' }} onNavigate={handleNav}>Pattern Studio</Link>
              </li>
              <li>
                <Link to={{ path: 'mesh' }} onNavigate={handleNav}>Mesh Gradient Studio</Link>
              </li>
              <li>
                <Link to={{ path: 'antigravity' }} onNavigate={handleNav}>Antigravity Physics</Link>
              </li>
              <li>
                <Link to={{ path: 'extract-from-image' }} onNavigate={handleNav}>Image → Palette</Link>
              </li>
              <li>
                <Link to={{ path: 'api-docs' }} onNavigate={handleNav}>Developer API &amp; Tokens</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div>&copy; {new Date().getFullYear()} PALETTEPARADISE. ALL SPECIMENS CURATED &amp; CALIBRATED.</div>
        <div>PERCEPTUAL OKLCH • WCAG AAA HARMONIES • DTCG TOKENS</div>
      </div>
    </footer>
  );
};
