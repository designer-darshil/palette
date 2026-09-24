import React, { useState } from 'react';
import { Copy, Bookmark, Share2, Check } from 'lucide-react';
import { GradientItem, RouteType } from '../types';
import { copyToClipboard } from '../utils/colorUtils';
import { useToast } from '../context/ToastContext';
import { useSaved } from '../context/SavedContext';
import { Link } from './common/Link';
import { KromaCard } from './common/KromaCard';
import { KromaButton } from './common/KromaButton';
import { Analytics } from '../utils/analytics';

interface GradientCardProps {
  gradient: GradientItem;
  onNavigate: (route: RouteType) => void;
}

export const GradientCard: React.FC<GradientCardProps> = ({ gradient, onNavigate }) => {
  const { showToast } = useToast();
  const { isSaved, saveItem } = useSaved();
  const saved = isSaved(gradient.id);
  const [copied, setCopied] = useState(false);

  const handleCopyCss = async (e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.stopPropagation();
    const cssString = `background: ${gradient.css};`;
    const success = await copyToClipboard(cssString);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
      Analytics.trackColorCopy(gradient.css, 'CSS Gradient', gradient.title);
      showToast('Copied CSS Gradient', gradient.title, gradient.css);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/gradients/${gradient.slug}`;
    const success = await copyToClipboard(url);
    if (success) {
      showToast('Copied gradient link', gradient.title);
    }
  };

  const handleToggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    saveItem({
      id: gradient.id,
      type: 'gradient',
      title: gradient.title,
      slug: gradient.slug,
      preview: gradient.css,
      metadata: `${gradient.type} • ${gradient.category}`,
    });
    if (!saved) {
      Analytics.trackSpecimenSave('gradient', gradient.id, gradient.title);
    }
    showToast(
      saved ? 'Removed gradient from saved' : 'Saved gradient to collection',
      gradient.title
    );
  };

  return (
    <KromaCard
      aria-label={`CSS Gradient: ${gradient.title}`}
      className="group/grad"
      onClick={() => onNavigate({ path: 'gradient-detail', slug: gradient.slug })}
    >
      {/* Edge-to-Edge Gradient Field (Hero of the Card) */}
      <div
        className="w-full h-44 sm:h-48 relative cursor-pointer flex items-end justify-between p-3 select-none"
        style={{ background: gradient.css }}
        onClick={handleCopyCss}
        role="button"
        tabIndex={0}
        aria-label="Click to copy CSS gradient"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCopyCss(e);
          }
        }}
      >
        <span className="font-mono text-xs font-semibold text-white bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-[2px] shadow-xs uppercase tracking-wider">
          {gradient.type} {gradient.angle ? `${gradient.angle}°` : ''}
        </span>

        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] font-mono text-xs font-semibold tracking-wider text-white bg-black/75 backdrop-blur-xs shadow-xs transition-all duration-150 ${
            copied ? 'opacity-100 scale-100' : 'opacity-0 scale-95 group-hover/grad:opacity-100 group-hover/grad:scale-100'
          }`}
        >
          {copied ? (
            <>
              <Check size={11} className="text-emerald-400" />
              <span>COPIED</span>
            </>
          ) : (
            <>
              <Copy size={11} />
              <span>COPY CSS</span>
            </>
          )}
        </span>
      </div>

      {/* Editorial Content Layer */}
      <div className="p-3.5 sm:p-4 flex flex-col gap-2 flex-1 bg-[var(--bg-surface-1)]">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-sans font-bold text-[15px] leading-tight text-[var(--text-primary)] tracking-[-0.01em] truncate m-0">
            <Link
              to={{ path: 'gradient-detail', slug: gradient.slug }}
              onNavigate={onNavigate}
              onClick={(e) => e.stopPropagation()}
              className="hover:underline text-inherit no-underline"
            >
              {gradient.title}
            </Link>
          </h3>
          <span className="font-mono text-xs text-[var(--text-secondary)] uppercase tracking-wider flex-shrink-0">
            {gradient.stops.length} STOPS
          </span>
        </div>

        {/* Color Stops Swatches Strip */}
        <div className="flex items-center gap-1.5 flex-wrap my-0.5">
          {gradient.stops.map((s, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] bg-[var(--bg-surface-2)] font-mono text-xs text-[var(--text-secondary)]"
              title={`${s.name || s.color} at ${s.position}%`}
            >
              <span className="w-2 h-2 rounded-full border border-black/10" style={{ backgroundColor: s.color }} />
              <span>{s.color}</span>
            </span>
          ))}
        </div>

        {/* Minimal Footer & Actions */}
        <div className="mt-auto pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
          <span className="font-mono text-xs uppercase tracking-wider text-[var(--text-secondary)]">
            {gradient.category}
          </span>

          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <KromaButton
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-xs"
              onClick={handleShare}
              aria-label="Share gradient link"
              title="Share gradient link"
              iconLeft={<Share2 size={13} />}
            />
            <KromaButton
              type="button"
              variant="ghost"
              size="icon-sm"
              className={`rounded-xs ${
                saved
                  ? 'text-[var(--accent-gold)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              onClick={handleToggleSave}
              aria-label={saved ? 'Remove from saved' : 'Save gradient'}
              title={saved ? 'Saved' : 'Save gradient'}
              iconLeft={<Bookmark size={13} fill={saved ? 'currentColor' : 'none'} />}
            />
          </div>
        </div>
      </div>
    </KromaCard>
  );
};
