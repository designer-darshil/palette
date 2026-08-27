import React from 'react';
import { RouteType } from '../types';

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
                <button onClick={() => handleNav({ path: 'colors' })}>Curated Colors</button>
              </li>
              <li>
                <button onClick={() => handleNav({ path: 'palettes' })}>Palette Systems</button>
              </li>
              <li>
                <button onClick={() => handleNav({ path: 'combos' })}>Harmonies &amp; Combos</button>
              </li>
              <li>
                <button onClick={() => handleNav({ path: 'gradients' })}>CSS Gradients</button>
              </li>
              <li>
                <button onClick={() => handleNav({ path: 'live' })}>Live Atmosphere</button>
              </li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Color Gamuts</div>
            <ul className="footer-links-list">
              <li>
                <button onClick={() => handleNav({ path: 'colors' })}>HEX / sRGB Matrix</button>
              </li>
              <li>
                <button onClick={() => handleNav({ path: 'colors' })}>OKLCH Perceptual</button>
              </li>
              <li>
                <button onClick={() => handleNav({ path: 'combos' })}>WCAG AAA Contrast</button>
              </li>
              <li>
                <button onClick={() => handleNav({ path: 'saved' })}>Saved Workspace</button>
              </li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Design Principles</div>
            <ul className="footer-links-list">
              <li>
                <span style={{ color: '#9DA3AF' }}>Swiss Modernism</span>
              </li>
              <li>
                <span style={{ color: '#9DA3AF' }}>Bauhaus Form</span>
              </li>
              <li>
                <span style={{ color: '#9DA3AF' }}>Nordic Equilibrium</span>
              </li>
              <li>
                <span style={{ color: '#9DA3AF' }}>Zero Clutter</span>
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
