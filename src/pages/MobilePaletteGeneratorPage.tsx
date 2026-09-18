import React, { useState, useEffect } from 'react';
import { RefreshCw, Copy, Check, Lock, Unlock, Bookmark, Share2 } from 'lucide-react';
import { RouteType } from '../types';
import { copyToClipboard } from '../utils/colorUtils';
import { generatePalette, HarmonyMode } from '../utils/paletteGenerator';
import { useToast } from '../context/ToastContext';
import { useSaved } from '../context/SavedContext';
import { SEOHead } from '../components/seo/SEOHead';

interface GeneratorProps {
  onNavigate: (route: RouteType) => void;
  initialColors?: string;
}

export const MobilePaletteGeneratorPage: React.FC<GeneratorProps> = ({ onNavigate, initialColors }) => {
  const { showToast } = useToast();
  const { saveItem } = useSaved();

  const [baseColor, setBaseColor] = useState('#7861FF');
  const [harmony, setHarmony] = useState<HarmonyMode>('complementary');
  const [swatches, setSwatches] = useState<{ id: string; hex: string; name: string; locked: boolean }[]>([
    { id: '1', hex: '#7861FF', name: 'Base Iris', locked: false },
    { id: '2', hex: '#6366F1', name: 'Indigo Accent', locked: false },
    { id: '3', hex: '#D8B4E2', name: 'Lilac Soft', locked: false },
    { id: '4', hex: '#99F6E4', name: 'Teal Pastel', locked: false },
    { id: '5', hex: '#38BDF8', name: 'Sky Cyan', locked: false },
  ]);
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    const generated = generatePalette(5, swatches, harmony, baseColor);
    setSwatches(generated);
  };

  useEffect(() => {
    handleGenerate();
  }, [baseColor, harmony]);

  // Spacebar triggers regeneration
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (e.target as HTMLElement).tagName !== 'INPUT') {
        e.preventDefault();
        handleGenerate();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [baseColor, harmony, swatches]);

  const toggleLock = (idx: number) => {
    setSwatches((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, locked: !s.locked } : s))
    );
  };

  const handleCopyPalette = async () => {
    const hexList = swatches.map((s) => s.hex).join(', ');
    const success = await copyToClipboard(hexList);
    if (success) {
      setCopied(true);
      showToast('Copied palette to clipboard', hexList);
      setTimeout(() => setCopied(false), 1600);
    }
  };

  const handleSavePalette = () => {
    saveItem({
      id: `gen-${Date.now()}`,
      type: 'palette',
      title: `${harmony.toUpperCase()} System`,
      slug: `custom-${Date.now()}`,
      preview: swatches.map((s) => s.hex).join(','),
      metadata: `${harmony} • 5 tones`,
    });
    showToast('Saved to collection', 'Generated Palette');
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] text-[#151513] py-6 md:py-8">
      <SEOHead
        rawTitle
        title="Generate a palette — KROMA"
        description="Choose a base color and select a harmony type to create beautiful palettes."
        canonicalPath="/generate"
      />

      <div className="max-w-[1360px] mx-auto px-4 md:px-8">
        
        {/* Header matching Screen 3 */}
        <div className="mb-6">
          <h1 className="font-serif text-[32px] md:text-[42px] leading-[1.05] tracking-[-0.025em] text-[#151513] font-normal mb-2">
            Generate a palette
          </h1>
          <p className="font-sans text-xs md:text-sm text-[#69665F]">
            Choose a base color and select a harmony type to create beautiful palettes.
          </p>
        </div>

        {/* 1. Harmony Type Pills */}
        <div className="mb-5">
          <div className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-[#8E8A81] mb-2 font-bold">
            Harmony type
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'complementary', label: 'Complementary' },
              { id: 'analogous', label: 'Analogous' },
              { id: 'monochromatic', label: 'Monochromatic' },
              { id: 'triadic', label: 'Triadic' },
              { id: 'splitComplementary', label: 'Split Complementary' },
            ].map((h) => (
              <button
                key={h.id}
                onClick={() => setHarmony(h.id as HarmonyMode)}
                className={`h-[30px] px-3.5 rounded-[15px] font-sans text-xs transition-all ${
                  harmony === h.id
                    ? 'bg-[#11110F] text-[#FAF8F5] font-medium'
                    : 'bg-white border border-[rgba(21,21,19,0.14)] text-[#151513] hover:border-[#11110F]'
                }`}
              >
                {h.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Base Color Selector */}
        <div className="mb-6 flex items-center gap-3">
          <div className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-[#8E8A81] font-bold">
            Base color
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={baseColor}
              onChange={(e) => setBaseColor(e.target.value)}
              className="w-6 h-6 rounded-full border border-[rgba(21,21,19,0.2)] cursor-pointer"
            />
            <input
              type="text"
              value={baseColor}
              onChange={(e) => setBaseColor(e.target.value)}
              className="h-[30px] px-2.5 font-mono text-xs border border-[rgba(21,21,19,0.18)] rounded-[4px] bg-white w-24 text-[#151513] uppercase"
            />
          </div>
        </div>

        {/* 3. Generated Swatches (5 Large Color Fields) */}
        <div className="rounded-[6px] overflow-hidden border border-[rgba(21,21,19,0.12)] mb-3 bg-white shadow-sm">
          <div className="flex flex-col sm:flex-row h-[280px] sm:h-[180px] md:h-[220px]">
            {swatches.map((s, idx) => (
              <div
                key={idx}
                style={{ backgroundColor: s.hex }}
                className="flex-1 h-full p-4 flex flex-row sm:flex-col justify-between items-center sm:items-start transition-all relative group"
              >
                {/* Lock Button */}
                <button
                  onClick={() => toggleLock(idx)}
                  className="p-1.5 rounded-[4px] bg-black/40 text-white hover:bg-black/70 transition-colors"
                  title={s.locked ? 'Unlock swatch' : 'Lock swatch'}
                >
                  {s.locked ? <Lock size={13} /> : <Unlock size={13} className="opacity-60 group-hover:opacity-100" />}
                </button>

                {/* Hex Code */}
                <div className="font-mono text-xs font-bold text-white drop-shadow uppercase tracking-wider">
                  {s.hex}
                </div>
              </div>
            ))}
          </div>

          {/* Controls Underneath Canvas (Lock status & Regenerate button) */}
          <div className="flex items-center justify-between p-3 border-t border-[rgba(21,21,19,0.08)] bg-[#FAF9F5]">
            <div className="flex items-center gap-2 font-sans text-xs text-[#69665F]">
              <input
                type="checkbox"
                id="lock-all"
                checked={swatches.every((s) => s.locked)}
                onChange={() => {
                  const allLocked = swatches.every((s) => s.locked);
                  setSwatches(swatches.map((s) => ({ ...s, locked: !allLocked })));
                }}
                className="rounded cursor-pointer"
              />
              <label htmlFor="lock-all" className="cursor-pointer">
                Lock colors
              </label>
            </div>

            <button
              onClick={handleGenerate}
              className="h-[34px] px-4 rounded-[4px] bg-white border border-[rgba(21,21,19,0.18)] hover:border-[#11110F] text-[#151513] font-sans text-xs font-medium flex items-center gap-1.5 transition-all shadow-xs"
            >
              <RefreshCw size={13} />
              <span>Regenerate</span>
            </button>
          </div>
        </div>

        {/* 4. Action Buttons Bar (Solid black Copy palette, Save, Export) */}
        <div className="flex flex-wrap items-center gap-2.5 pt-4">
          <button
            onClick={handleCopyPalette}
            className="h-[38px] px-5 rounded-[4px] bg-[#11110F] text-[#FAF8F5] font-sans text-xs font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>Copy palette</span>
          </button>

          <button
            onClick={handleSavePalette}
            className="h-[38px] px-5 rounded-[4px] bg-white border border-[rgba(21,21,19,0.18)] hover:border-[#11110F] text-[#151513] font-sans text-xs font-medium flex items-center gap-2 transition-colors"
          >
            <Bookmark size={14} />
            <span>Save</span>
          </button>

          <button
            onClick={() => onNavigate({ path: 'studio', colors: swatches.map((s) => s.hex).join(',').replace(/#/g, '') })}
            className="h-[38px] px-5 rounded-[4px] bg-white border border-[rgba(21,21,19,0.18)] hover:border-[#11110F] text-[#151513] font-sans text-xs font-medium flex items-center gap-2 transition-colors"
          >
            <Share2 size={14} />
            <span>Export</span>
          </button>
        </div>

      </div>
    </div>
  );
};
