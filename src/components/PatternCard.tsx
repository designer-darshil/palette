import React, { useMemo } from 'react';
import { Bookmark, Copy, Sliders } from 'lucide-react';
import { PatternItem, RouteType } from '../types';
import { generatePatternSvg, generatePatternCss } from '../utils/patternEngine';
import { copyToClipboard } from '../utils/colorUtils';
import { useToast } from '../context/ToastContext';
import { useSaved } from '../context/SavedContext';
import { Link } from './common/Link';
import { KromaCard } from './common/KromaCard';
import { KromaButton } from './common/KromaButton';

interface PatternCardProps {
  pattern: PatternItem;
  onNavigate: (route: RouteType) => void;
  heightClass?: string;
  className?: string;
}

export const PatternCard: React.FC<PatternCardProps> = ({
  pattern,
  onNavigate,
  heightClass = 'h-44 sm:h-48',
  className = '',
}) => {
  const { showToast } = useToast();
  const { isSaved, saveItem } = useSaved();
  const saved = isSaved(pattern.id);

  const svgPreview = useMemo(() => {
    return generatePatternSvg(
      {
        type: pattern.type,
        palette: pattern.palette,
        scale: pattern.scale,
        density: pattern.density,
        rotation: pattern.rotation,
        strokeWidth: pattern.strokeWidth,
        opacity: pattern.opacity,
      },
      320,
      180
    );
  }, [pattern]);

  const handleCopyCss = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const css = generatePatternCss({
      type: pattern.type,
      palette: pattern.palette,
      scale: pattern.scale,
      density: pattern.density,
      rotation: pattern.rotation,
      strokeWidth: pattern.strokeWidth,
      opacity: pattern.opacity,
    });
    const success = await copyToClipboard(css);
    if (success) {
      showToast('Copied Pattern CSS', pattern.title);
    }
  };

  const handleToggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    saveItem({
      id: pattern.id,
      type: 'pattern',
      title: pattern.title,
      slug: pattern.slug,
      preview: pattern.palette.join(','),
      metadata: `${pattern.type.toUpperCase()} • Scale ${pattern.scale}%`,
    });
    showToast(
      saved ? 'Removed pattern from saved' : 'Saved pattern to collection',
      pattern.title
    );
  };

  return (
    <KromaCard
      aria-label={`Pattern: ${pattern.title}`}
      className={`group/pat ${className}`}
      onClick={() => onNavigate({ path: 'pattern-detail', slug: pattern.slug })}
    >
      {/* Edge-to-Edge Vector Pattern Preview (Hero of the Card) */}
      <div className={`w-full ${heightClass} relative overflow-hidden select-none cursor-pointer border-b border-black/[0.06] dark:border-white/[0.06]`}>
        <div
          className="w-full h-full transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/pat:scale-105 motion-reduce:transform-none"
          dangerouslySetInnerHTML={{ __html: svgPreview }}
        />
        <span className="absolute top-2.5 right-2.5 font-mono text-xs font-semibold uppercase px-1.5 py-0.5 rounded-[2px] bg-black/70 text-white backdrop-blur-xs tracking-wider">
          {pattern.type}
        </span>
      </div>

      {/* Editorial Content Layer */}
      <div className="p-3.5 sm:p-4 flex flex-col gap-2 flex-1 bg-[var(--bg-surface-1)]">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-sans font-bold text-[15px] leading-tight text-[var(--text-primary)] tracking-[-0.01em] truncate m-0">
            <Link
              to={{ path: 'pattern-detail', slug: pattern.slug }}
              onNavigate={onNavigate}
              onClick={(e) => e.stopPropagation()}
              className="hover:underline text-inherit no-underline"
            >
              {pattern.title}
            </Link>
          </h3>
        </div>

        {pattern.description && (
          <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed m-0">
            {pattern.description}
          </p>
        )}

        {/* Swatch Palette Dots Row */}
        <div className="flex items-center gap-1.5 my-1">
          {pattern.palette.map((color, idx) => (
            <div
              key={idx}
              className="w-4 h-4 rounded-[2px] border border-black/15 shadow-2xs"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>

        {/* Minimal Footer & Controls */}
        <div className="mt-auto pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
          <span className="font-mono text-xs text-[var(--text-secondary)] uppercase tracking-wider">
            {pattern.scale}PX · {pattern.density}% DENSITY
          </span>

          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <KromaButton
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={handleCopyCss}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-xs"
              title="Copy CSS Background"
              aria-label="Copy CSS Background"
              iconLeft={<Copy size={13} />}
            />
            <KromaButton
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={handleToggleSave}
              className={`rounded-xs ${
                saved
                  ? 'text-[var(--accent-gold)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              title={saved ? 'Remove from saved' : 'Save pattern'}
              aria-label={saved ? 'Remove from saved' : 'Save pattern'}
              iconLeft={<Bookmark size={13} fill={saved ? 'currentColor' : 'none'} />}
            />
            <Link
              to={{
                path: 'pattern-studio',
                palette: pattern.palette.map((c) => c.replace('#', '')).join('-'),
                type: pattern.type,
                scale: String(pattern.scale),
                density: String(pattern.density),
                rotation: String(pattern.rotation),
              }}
              onNavigate={onNavigate}
              onClick={(e) => e.stopPropagation()}
              className="w-7 h-7 inline-flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-xs transition-colors"
              title="Open in Pattern Studio"
              aria-label="Open in Pattern Studio"
            >
              <Sliders size={13} />
            </Link>
          </div>
        </div>
      </div>
    </KromaCard>
  );
};
