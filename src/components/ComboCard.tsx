import React, { useState } from 'react';
import { Bookmark, Share2, ArrowRight, Check } from 'lucide-react';
import { ComboItem, RouteType } from '../types';
import { copyToClipboard, getComboKeyColors } from '../utils/colorUtils';
import { useToast } from '../context/ToastContext';
import { useSaved } from '../context/SavedContext';
import { Link } from './common/Link';
import { KromaCard } from './common/KromaCard';
import { Analytics } from '../utils/analytics';

interface ComboCardProps {
  combo: ComboItem;
  onNavigate: (route: RouteType) => void;
}

export const ComboCard: React.FC<ComboCardProps> = ({ combo, onNavigate }) => {
  const { showToast } = useToast();
  const { isSaved, saveItem } = useSaved();
  const saved = isSaved(combo.id);

  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // Extract the true focal color pair representing the relationship
  const [color1, color2] = getComboKeyColors(combo.colors);

  const handleCopyHex = async (e: React.MouseEvent, hex: string, name: string) => {
    e.stopPropagation();
    const success = await copyToClipboard(hex);
    if (success) {
      setCopiedHex(hex);
      setTimeout(() => setCopiedHex(null), 1400);
      Analytics.trackColorCopy(hex, 'HEX', name);
      showToast(`Copied ${hex}`, name, hex);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/combos/${combo.slug}`;
    const success = await copyToClipboard(url);
    if (success) {
      showToast('Copied combo link', combo.title);
    }
  };

  const handleToggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    saveItem({
      id: combo.id,
      type: 'combo',
      title: combo.title,
      slug: combo.slug,
      preview: `${color1.hex},${color2.hex}`,
      metadata: `${combo.harmonyType} • ${combo.contrastScore}`,
    });
    if (!saved) {
      Analytics.trackSpecimenSave('combo', combo.id, combo.title);
    }
    showToast(
      saved ? 'Removed harmony from saved' : 'Saved harmony to collection',
      combo.title
    );
  };

  return (
    <KromaCard
      aria-label={`Color harmony combo: ${combo.title} (${color1.hex} and ${color2.hex})`}
      className="group/combo"
      onClick={() => onNavigate({ path: 'combo-detail', slug: combo.slug })}
    >
      {/* Pure Two-Color Split Visual Hero — Zero Text Overlay */}
      <div className="w-full h-44 sm:h-48 flex select-none overflow-hidden relative">
        <div
          className="flex-1 h-full cursor-pointer transition-[flex] duration-200 hover:flex-[1.12]"
          style={{ backgroundColor: color1.hex }}
          onClick={(e) => handleCopyHex(e, color1.hex, color1.name)}
          title={`Click to copy ${color1.name} (${color1.hex})`}
        />
        <div
          className="flex-1 h-full cursor-pointer transition-[flex] duration-200 hover:flex-[1.12]"
          style={{ backgroundColor: color2.hex }}
          onClick={(e) => handleCopyHex(e, color2.hex, color2.name)}
          title={`Click to copy ${color2.name} (${color2.hex})`}
        />
      </div>

      {/* Editorial Information Layer */}
      <div className="p-3.5 sm:p-4 flex flex-col gap-2.5 flex-1 bg-[#F8F8F8] dark:bg-[#141518]">
        {/* Two-Column Aligned HEX Values & Names */}
        <div className="grid grid-cols-2 gap-3">
          {/* Left Specimen Info */}
          <div className="flex flex-col gap-1 min-w-0">
            <button
              type="button"
              className="inline-flex items-center gap-1 font-mono text-xs font-semibold px-2 py-0.5 rounded-[2px] bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[#171717] dark:text-white transition-colors w-fit"
              onClick={(e) => handleCopyHex(e, color1.hex, color1.name)}
              title="Click to copy HEX"
            >
              <span>{copiedHex === color1.hex ? 'COPIED' : color1.hex}</span>
              {copiedHex === color1.hex && <Check size={11} className="text-emerald-400" />}
            </button>
            <span className="font-sans text-xs text-[#707070] dark:text-[#A0A0A0] truncate" title={color1.name}>
              {color1.name}
            </span>
          </div>

          {/* Right Specimen Info */}
          <div className="flex flex-col gap-1 min-w-0 items-end text-right">
            <button
              type="button"
              className="inline-flex items-center gap-1 font-mono text-xs font-semibold px-2 py-0.5 rounded-[2px] bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[#171717] dark:text-white transition-colors w-fit"
              onClick={(e) => handleCopyHex(e, color2.hex, color2.name)}
              title="Click to copy HEX"
            >
              <span>{copiedHex === color2.hex ? 'COPIED' : color2.hex}</span>
              {copiedHex === color2.hex && <Check size={11} className="text-emerald-400" />}
            </button>
            <span className="font-sans text-xs text-[#707070] dark:text-[#A0A0A0] truncate" title={color2.name}>
              {color2.name}
            </span>
          </div>
        </div>

        {/* Minimal Relationship Footer */}
        <div className="mt-auto pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-xs">
          <div className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-[#707070] dark:text-[#909090]">
            <span>{combo.harmonyType}</span>
            <ArrowRight size={11} className="transition-transform group-hover/combo:translate-x-0.5" />
          </div>

          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="p-1.5 text-[#707070] dark:text-[#909090] hover:text-[#171717] dark:hover:text-white rounded-[2px] transition-colors"
              onClick={handleShare}
              aria-label="Share combo link"
              title="Share combo link"
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
              aria-label={saved ? 'Remove from saved' : 'Save combo'}
              title={saved ? 'Saved' : 'Save combo'}
            >
              <Bookmark size={13} fill={saved ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>
    </KromaCard>
  );
};
