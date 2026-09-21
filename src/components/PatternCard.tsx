import React, { useMemo } from 'react';
import { Bookmark, Copy, Sliders, ArrowRight } from 'lucide-react';
import { PatternItem, RouteType } from '../types';
import { generatePatternSvg, generatePatternCss } from '../utils/patternEngine';
import { copyToClipboard } from '../utils/colorUtils';
import { useToast } from '../context/ToastContext';
import { useSaved } from '../context/SavedContext';
import { Link } from './common/Link';
import { SpecimenCardBase } from './common/SpecimenCardBase';

interface PatternCardProps {
  pattern: PatternItem;
  onNavigate: (route: RouteType) => void;
}

export const PatternCard: React.FC<PatternCardProps> = ({ pattern, onNavigate }) => {
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
  };

  return (
    <SpecimenCardBase
      className="specimen-card justify-between"
      aria-label={`Pattern: ${pattern.title}`}
    >
      <div>
        {/* Live Vector Pattern Preview */}
        <Link
          to={{ path: 'pattern-detail', slug: pattern.slug }}
          onNavigate={onNavigate}
          className="block h-36 rounded-sm overflow-hidden mb-3 border border-[var(--border-subtle)] relative group-hover:shadow-md transition-shadow"
          dangerouslySetInnerHTML={{ __html: svgPreview }}
        />

        {/* Title & Category */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <Link
            to={{ path: 'pattern-detail', slug: pattern.slug }}
            onNavigate={onNavigate}
            className="font-bold text-sm text-[var(--text-primary)] hover:text-[var(--color-primary)] truncate"
          >
            {pattern.title}
          </Link>
          <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded-xs bg-[var(--bg-surface-2)] text-[var(--text-tertiary)] flex-shrink-0">
            {pattern.type}
          </span>
        </div>

        <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed mb-3">
          {pattern.description}
        </p>

        {/* Swatch Palette Row */}
        <div className="flex items-center gap-1.5 mb-3">
          {pattern.palette.map((color, idx) => (
            <div
              key={idx}
              className="w-4 h-4 rounded-xs border border-black/10 shadow-2xs"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="pt-2.5 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
        <span className="font-mono text-[10px] text-[var(--text-tertiary)]">
          {pattern.scale}px scale • {pattern.density}% density
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopyCss}
            className="p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            title="Copy CSS Background"
          >
            <Copy size={13} />
          </button>
          <button
            onClick={handleToggleSave}
            className="p-1 text-[var(--text-tertiary)] hover:text-[var(--accent-gold)] transition-colors"
            title={saved ? 'Remove from saved' : 'Save pattern'}
          >
            <Bookmark size={13} fill={saved ? '#E9C46A' : 'none'} color={saved ? '#E9C46A' : 'currentColor'} />
          </button>
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
            className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            title="Open in Pattern Studio"
          >
            <Sliders size={13} />
          </Link>
        </div>
      </div>
    </SpecimenCardBase>
  );
};
