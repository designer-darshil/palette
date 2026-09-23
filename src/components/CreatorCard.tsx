import React from 'react';
import { Palette, Layers, Grid, ArrowRight, ShieldCheck } from 'lucide-react';
import { CreatorItem, RouteType } from '../types';
import { Link } from './common/Link';
import { KromaCard } from './common/KromaCard';

interface CreatorCardProps {
  creator: CreatorItem;
  onNavigate: (route: RouteType) => void;
}

export const CreatorCard: React.FC<CreatorCardProps> = ({ creator, onNavigate }) => {
  return (
    <KromaCard
      aria-label={`Creator: ${creator.name}`}
      className="group/creator p-4 sm:p-5 flex flex-col justify-between min-h-[220px]"
      onClick={() => onNavigate({ path: 'creator-detail', username: creator.username })}
    >
      <div>
        {/* Creator Header */}
        <div className="flex items-center gap-3 mb-3">
          <img
            src={creator.avatar}
            alt={creator.name}
            className="w-12 h-12 rounded-full object-cover border border-black/10 dark:border-white/10 flex-shrink-0"
          />
          <div className="min-w-0 flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <Link
                to={{ path: 'creator-detail', username: creator.username }}
                onNavigate={onNavigate}
                onClick={(e) => e.stopPropagation()}
                className="font-sans font-bold text-[15px] leading-tight text-[#171717] dark:text-white hover:underline truncate"
              >
                {creator.name}
              </Link>
              {creator.featured && (
                <ShieldCheck size={13} className="text-[var(--accent-gold)] flex-shrink-0" />
              )}
            </div>
            <div className="font-mono text-xs text-[#707070] dark:text-[#909090] truncate">
              @{creator.username}
            </div>
          </div>
        </div>

        <p className="text-xs text-[#707070] dark:text-[#A0A0A0] line-clamp-2 leading-relaxed mb-3 m-0">
          {creator.bio}
        </p>

        {/* Specialties */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {creator.specialties.slice(0, 3).map((spec, i) => (
            <span
              key={i}
              className="text-xs font-mono px-2 py-0.5 rounded-[2px] bg-black/5 dark:bg-white/10 text-[#707070] dark:text-[#A0A0A0]"
            >
              {spec}
            </span>
          ))}
        </div>
      </div>

      {/* Stats and Action Footer */}
      <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-xs font-mono text-[#707070] dark:text-[#909090]">
        <div className="flex items-center gap-3">
          <span title={`${creator.paletteCount} Palettes`} className="flex items-center gap-1">
            <Palette size={11} />
            {creator.paletteCount}
          </span>
          <span title={`${creator.collectionCount} Collections`} className="flex items-center gap-1">
            <Layers size={11} />
            {creator.collectionCount}
          </span>
          <span title={`${creator.patternCount} Patterns`} className="flex items-center gap-1">
            <Grid size={11} />
            {creator.patternCount}
          </span>
        </div>

        <span className="inline-flex items-center gap-1 text-[#171717] dark:text-white font-sans text-xs font-semibold group-hover/creator:translate-x-0.5 transition-transform">
          <span>PORTFOLIO</span>
          <ArrowRight size={11} />
        </span>
      </div>
    </KromaCard>
  );
};
