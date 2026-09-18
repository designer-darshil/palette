import React from 'react';
import { RouteType } from '../types';
import { Link } from './common/Link';
import { Instagram, Twitter } from 'lucide-react';

interface FooterProps {
  onNavigate: (route: RouteType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-[#11110F] text-[#F5F2EB] py-10 md:py-12 border-t border-white/10">
      <div className="max-w-[1360px] mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-white/10">
          
          {/* Left: KROMA Brand & Description */}
          <div>
            <h2 className="font-sans font-medium text-2xl md:text-3xl text-white tracking-[0.14em] uppercase mb-2">
              KROMA
            </h2>
            <p className="font-sans text-xs md:text-[13px] text-white/60 max-w-sm leading-relaxed">
              A curated digital color archive and creative tool for designers.
            </p>
          </div>

          {/* Right: Clean Horizontal Links & Socials */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-10">
            <nav className="flex items-center gap-6 font-sans text-xs text-white/80">
              <Link to={{ path: 'explore' }} onNavigate={onNavigate} className="hover:text-white transition-colors">
                Explore
              </Link>
              <Link to={{ path: 'generate' }} onNavigate={onNavigate} className="hover:text-white transition-colors">
                Generate
              </Link>
              <Link to={{ path: 'collections' }} onNavigate={onNavigate} className="hover:text-white transition-colors">
                Collections
              </Link>
              <Link to={{ path: 'create' }} onNavigate={onNavigate} className="hover:text-white transition-colors">
                Create
              </Link>
            </nav>

            {/* Social Icons */}
            <div className="flex items-center gap-3.5 text-white/60">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={15} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors"
                aria-label="X / Twitter"
              >
                <Twitter size={15} />
              </a>
              <span className="font-mono text-[10px] text-white/40 cursor-default">
                ℗
              </span>
            </div>
          </div>

        </div>

        {/* Bottom copyright hairline */}
        <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-2 font-mono text-[9px] uppercase tracking-widest text-white/40">
          <div>© {new Date().getFullYear()} KROMA ARCHIVE. ALL RIGHTS RESERVED.</div>
          <div>SWISS GRID SYSTEM · WCAG AAA CALIBRATED</div>
        </div>
      </div>
    </footer>
  );
};
