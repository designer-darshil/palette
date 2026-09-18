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
            <span>KROMA</span>
          </div>
          <p className="footer-brand-desc">
            An editorial digital color library, palette catalog, harmony reference, and CSS gradient specimen system curated for designers, engineers, and digital architects.
          </p>
        </div>

        <div className="footer-links-group">
          <div>
            <div className="footer-col-title">Color Resources</div>
            <ul className="footer-links-list">
              <li>
                <Link to={{ path: 'colors' }} onNavigate={handleNav}>Curated Colors</Link>
              </li>
              <li>
                <Link to={{ path: 'palettes' }} onNavigate={handleNav}>Palette Systems</Link>
              </li>
              <li>
                <Link to={{ path: 'combos' }} onNavigate={handleNav}>Harmonies &amp; Combos</Link>
              </li>
              <li>
                <Link to={{ path: 'gradients' }} onNavigate={handleNav}>CSS Gradients</Link>
              </li>
              <li>
                <Link to={{ path: 'live' }} onNavigate={handleNav}>Live Atmosphere</Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Color Gamuts</div>
            <ul className="footer-links-list">
              <li>
                <Link to={{ path: 'colors' }} onNavigate={handleNav}>HEX / sRGB Matrix</Link>
              </li>
              <li>
                <Link to={{ path: 'colors' }} onNavigate={handleNav}>OKLCH Perceptual</Link>
              </li>
              <li>
                <Link to={{ path: 'combos' }} onNavigate={handleNav}>WCAG AAA Contrast</Link>
              </li>
              <li>
                <Link to={{ path: 'saved' }} onNavigate={handleNav}>Saved Workspace</Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Creative Studios</div>
            <ul className="footer-links-list">
              <li>
                <Link to={{ path: 'ramps' }} onNavigate={handleNav}>Ramps Studio</Link>
              </li>
              <li>
                <Link to={{ path: 'antigravity' }} onNavigate={handleNav}>Antigravity Studio</Link>
              </li>
              <li>
                <Link to={{ path: 'mesh' }} onNavigate={handleNav}>Mesh Gradient Studio</Link>
              </li>
              <li>
                <Link to={{ path: 'palette-generator' }} onNavigate={handleNav}>Palette Generator</Link>
              </li>
              <li>
                <Link to={{ path: 'contrast-checker' }} onNavigate={handleNav}>Contrast Matrix</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div>&copy; {new Date().getFullYear()} KROMA DIGITAL LIBRARY. ALL SPECIMENS CURATED.</div>
        <div>CALIBRATED FOR HIGH CONTRAST &amp; ACCESSIBILITY</div>
      </div>
    </footer>
  );
};
