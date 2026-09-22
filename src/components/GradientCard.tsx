import React, { useState } from 'react';
import { Copy, Bookmark, Share2, Check } from 'lucide-react';
import { GradientItem, RouteType } from '../types';
import { copyToClipboard } from '../utils/colorUtils';
import { useToast } from '../context/ToastContext';
import { useSaved } from '../context/SavedContext';
import { Link } from './common/Link';
import { KromaCard } from './common/KromaCard';
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
        <span className="font-mono text-[10px] font-semibold text-white bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-[2px] shadow-xs uppercase tracking-wider">
          {gradient.type} {gradient.angle ? `${gradient.angle}°` : ''}
        </span>

        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] font-mono text-[10.5px] font-medium tracking-wider text-white bg-black/75 backdrop-blur-xs shadow-xs transition-all duration-150 ${
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
      <div className="p-3.5 sm:p-4 flex flex-col gap-2 flex-1 bg-[#F8F8F8] dark:bg-[#141518]">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-sans font-bold text-[15px] leading-tight text-[#171717] dark:text-white tracking-[-0.01em] truncate m-0">
            <Link
              to={{ path: 'gradient-detail', slug: gradient.slug }}
              onNavigate={onNavigate}
              onClick={(e) => e.stopPropagation()}
              className="hover:underline text-inherit no-underline"
            >
              {gradient.title}
            </Link>
          </h3>
          <span className="font-mono text-[10px] text-[#707070] dark:text-[#909090] uppercase tracking-wider flex-shrink-0">
            {gradient.stops.length} STOPS
          </span>
        </div>

        {/* Color Stops Swatches Strip */}
        <div className="flex items-center gap-1.5 flex-wrap my-0.5">
          {gradient.stops.map((s, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] bg-black/5 dark:bg-white/10 font-mono text-[10px] text-[#707070] dark:text-[#A0A0A0]"
              title={`${s.name || s.color} at ${s.position}%`}
            >
              <span className="w-2 h-2 rounded-full border border-black/10" style={{ backgroundColor: s.color }} />
              <span>{s.color}</span>
            </span>
          ))}
        </div>

        {/* Minimal Footer & Actions */}
        <div className="mt-auto pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-xs">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#707070] dark:text-[#909090]">
            {gradient.category}
          </span>

          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="p-1.5 text-[#707070] dark:text-[#909090] hover:text-[#171717] dark:hover:text-white rounded-[2px] transition-colors"
              onClick={handleShare}
              aria-label="Share gradient link"
              title="Share gradient link"
            >
              <Share2 size={13} />
            </button>
            <button
              type="button"
              className={`p-1.5 rounded-[2px] transition-colors ${
                saved
                  ? 'text-[var(--accent-gold)]'
                  : 'text-[#707070] dark:text-[#909090] hover:text-[#171717] dark:hover:text-white'
              }`}
              onClick={handleToggleSave}
              aria-label={saved ? 'Remove from saved' : 'Save gradient'}
              title={saved ? 'Saved' : 'Save gradient'}
            >
              <Bookmark size={13} fill={saved ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>
    </KromaCard>
  );
};
