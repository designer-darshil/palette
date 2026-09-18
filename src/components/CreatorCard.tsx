import React from 'react';
import { Palette, Layers, Grid, ArrowRight, ShieldCheck } from 'lucide-react';
import { CreatorItem, RouteType } from '../types';
import { Link } from './common/Link';

interface CreatorCardProps {
  creator: CreatorItem;
  onNavigate: (route: RouteType) => void;
}

export const CreatorCard: React.FC<CreatorCardProps> = ({ creator, onNavigate }) => {
  return (
    <div className="specimen-card group flex flex-col justify-between p-4 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] rounded-md transition-all duration-200">
      <div>
        {/* Creator Header */}
        <div className="flex items-center gap-3 mb-3">
          <img
            src={creator.avatar}
            alt={creator.name}
            className="w-12 h-12 rounded-full object-cover border border-[var(--border-subtle)]"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <Link
                to={{ path: 'creator-detail', username: creator.username }}
                onNavigate={onNavigate}
                className="font-bold text-sm text-[var(--text-primary)] hover:text-[var(--color-primary)] truncate"
              >
                {creator.name}
              </Link>
              {creator.featured && (
                <ShieldCheck size={13} className="text-[var(--accent-gold)] flex-shrink-0" />
              )}
            </div>
            <div className="text-[11px] font-mono text-[var(--text-tertiary)] truncate">
              @{creator.username}
            </div>
          </div>
        </div>

        <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed mb-3">
          {creator.bio}
        </p>

        {/* Specialties */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {creator.specialties.slice(0, 3).map((spec, i) => (
            <span
              key={i}
              className="text-[10px] font-mono px-2 py-0.5 rounded-xs bg-[var(--bg-surface-2)] text-[var(--text-secondary)]"
            >
              {spec}
            </span>
          ))}
        </div>
      </div>

      {/* Stats and Action */}
      <div className="pt-2.5 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] font-mono text-[var(--text-tertiary)]">
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

        <Link
          to={{ path: 'creator-detail', username: creator.username }}
          onNavigate={onNavigate}
          className="inline-flex items-center gap-1 text-[var(--color-primary)] hover:underline font-semibold"
        >
          <span>Portfolio</span>
          <ArrowRight size={11} />
        </Link>
      </div>
    </div>
  );
};
