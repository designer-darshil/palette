import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { RouteType } from '../types';
import { SEOHead } from '../components/seo/SEOHead';
import { KromaButton } from '../components/common/KromaButton';

interface NotFoundPageProps {
  requestedUrl?: string;
  onNavigate: (route: RouteType) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  return (
    <div className="w-full min-h-[70vh] flex items-center justify-center py-20 px-6">
      <SEOHead
        title="404 — This Color Doesn't Exist | KROMA"
        description="Or maybe it does, but we haven't found it yet. Explore KROMA color specimens and palettes."
        canonicalPath="/404"
        noindex={true}
        nofollow={true}
      />

      <div className="max-w-xl text-center flex flex-col items-center">
        {/* Tiny rocking rainbow roller mark */}
        <div className="kroma-404-mark mb-8 select-none" aria-hidden="true">
          <div className="w-12 h-6 rounded-t-sm flex overflow-hidden shadow-sm mx-auto">
            <span className="flex-1 bg-[#FF3B30]" />
            <span className="flex-1 bg-[#FF9500]" />
            <span className="flex-1 bg-[#FFD60A]" />
            <span className="flex-1 bg-[#34C759]" />
            <span className="flex-1 bg-[#00AEEF]" />
            <span className="flex-1 bg-[#7B2CBF]" />
          </div>
          <div className="w-1.5 h-6 bg-neutral-400 mx-auto rounded-b-xs mt-0.5" />
        </div>

        {/* Large Headline */}
        <div className="font-mono text-[11px] font-medium tracking-[0.12em] uppercase text-text-secondary mb-2">SPECTRUM ANOMALY · 404</div>
        <h1 className="font-sans text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-neutral-900 dark:text-white uppercase leading-[0.95] mb-4">
          THIS COLOR DOESN'T EXIST.
        </h1>

        {/* Subtitle */}
        <p className="font-sans text-base leading-relaxed text-text-secondary text-center mb-10 max-w-md mx-auto">
          Or maybe it does, but we haven't found it yet.
        </p>

        {/* Three simple text links */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 font-sans text-xs font-bold tracking-wider uppercase">
          <KromaButton
            variant="ghost"
            size="sm"
            onClick={() => onNavigate({ path: 'home' })}
            className="text-neutral-900 dark:text-white uppercase font-bold text-xs p-0 h-auto"
            iconRight={<ArrowUpRight size={14} />}
          >
            <span>TAKE ME HOME</span>
          </KromaButton>
          <KromaButton
            variant="ghost"
            size="sm"
            onClick={() => onNavigate({ path: 'colors' })}
            className="text-neutral-900 dark:text-white uppercase font-bold text-xs p-0 h-auto"
            iconRight={<ArrowUpRight size={14} />}
          >
            <span>EXPLORE COLORS</span>
          </KromaButton>
          <KromaButton
            variant="ghost"
            size="sm"
            onClick={() => onNavigate({ path: 'palette-generator' })}
            className="text-neutral-900 dark:text-white uppercase font-bold text-xs p-0 h-auto"
            iconRight={<ArrowUpRight size={14} />}
          >
            <span>GENERATE A PALETTE</span>
          </KromaButton>
        </div>
      </div>
    </div>
  );
};
