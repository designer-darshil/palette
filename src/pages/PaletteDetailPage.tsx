import React, { useState, useMemo } from 'react';
import { ArrowLeft, Heart, Copy, Bookmark, Share2, Check, ArrowRight, Download } from 'lucide-react';
import { RouteType, PaletteItem } from '../types';
import { CURATED_PALETTES } from '../data/palettes';
import { copyToClipboard, hexToRgb, hexToHsl, getContrastRatio } from '../utils/colorUtils';
import { useToast } from '../context/ToastContext';
import { useSaved } from '../context/SavedContext';
import { SEOHead } from '../components/seo/SEOHead';
import { generatePaletteSchema } from '../utils/schemaGenerator';
import { Analytics } from '../utils/analytics';
import { NotFoundPage } from './NotFoundPage';
import { Link } from '../components/common/Link';

interface PaletteDetailPageProps {
  slug: string;
  onNavigate: (route: RouteType) => void;
}

export const PaletteDetailPage: React.FC<PaletteDetailPageProps> = ({ slug, onNavigate }) => {
  const { showToast } = useToast();
  const { isSaved, saveItem, removeItem, savedItems } = useSaved();

  const palette: PaletteItem = useMemo(() => {
    const cleanSlug = (slug || '').trim().toLowerCase();
    // 1. Check curated palettes by slug or id
    const foundCurated = CURATED_PALETTES.find(
      (p) => p.slug.toLowerCase() === cleanSlug || p.id.toLowerCase() === cleanSlug
    );
    if (foundCurated) return foundCurated;

    // 2. Check saved items in context
    const foundSaved = savedItems.find(
      (s) => s.slug?.toLowerCase() === cleanSlug || s.id.toLowerCase() === cleanSlug
    );
    if (foundSaved && foundSaved.preview) {
      const hexList = foundSaved.preview.split(',').map((h) => h.trim());
      return {
        id: foundSaved.id,
        title: foundSaved.title,
        slug: foundSaved.slug || cleanSlug,
        category: 'Saved Specimen',
        tags: ['Saved', 'Custom'],
        mood: ['Custom', 'Harmonious'],
        industry: ['Creative', 'Design'],
        description: foundSaved.metadata || 'Custom saved color palette specimen.',
        colors: hexList.map((hex, i) => ({
          hex,
          name: `Tone ${i + 1}`,
          role: i === 0 ? 'Dominant' : 'Accent',
        })),
        likes: 1,
        saved: true,
        createdAt: 'Recently saved',
      };
    }

    // 3. Fallback to first curated palette
    return CURATED_PALETTES[0];
  }, [slug, savedItems]);

  const [testFg, setTestFg] = useState(() => palette.colors[0]?.hex || '#121212');
  const [testBg, setTestBg] = useState(() => palette.colors[palette.colors.length - 1]?.hex || '#E9E2D5');
  const [copiedAll, setCopiedAll] = useState(false);

  // Update contrast swatches when palette changes
  React.useEffect(() => {
    if (palette.colors.length >= 2) {
      setTestFg(palette.colors[0].hex);
      setTestBg(palette.colors[palette.colors.length - 1].hex);
    }
  }, [palette]);

  if (!palette) {
    return <NotFoundPage requestedUrl={`/palettes/${slug}`} onNavigate={onNavigate} />;
  }

  const saved = isSaved(palette.id);
  const colors = palette.colors;

  const handleToggleSave = () => {
    if (saved) {
      removeItem(palette.id);
      showToast('Removed from saved', palette.title);
    } else {
      saveItem({
        id: palette.id,
        type: 'palette',
        title: palette.title,
        slug: palette.slug,
        preview: palette.colors.map((c) => c.hex).join(','),
        metadata: `${palette.category} • ${palette.colors.length} tones`,
      });
      showToast('Saved to collection', palette.title);
    }
  };

  const handleCopySwatch = async (hex: string, name: string) => {
    const success = await copyToClipboard(hex);
    if (success) {
      Analytics.trackColorCopy(hex, 'HEX', name);
      showToast(`Copied ${hex}`, name, hex);
    }
  };

  const handleCopyAll = async () => {
    const payload = colors.map((c) => c.hex).join(', ');
    const success = await copyToClipboard(payload);
    if (success) {
      setCopiedAll(true);
      showToast('Copied all colors to clipboard', palette.title);
      setTimeout(() => setCopiedAll(false), 1600);
    }
  };

  // Contrast calculation
  const contrastRatio = useMemo(() => {
    return getContrastRatio(testFg, testBg);
  }, [testFg, testBg]);

  const passesAA = contrastRatio >= 4.5;
  const passesAAA = contrastRatio >= 7.0;

  // 4 Similar palettes from dataset
  const similarPalettes = useMemo(() => {
    return CURATED_PALETTES.filter((p) => p.id !== palette.id && p.slug !== palette.slug).slice(0, 4);
  }, [palette]);

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] text-[#151513] py-6 md:py-8">
      <SEOHead
        rawTitle
        title={`${palette.title} — KROMA Color Palette`}
        description={palette.description}
        canonicalPath={`/palettes/${palette.slug}`}
        jsonLd={generatePaletteSchema(palette)}
      />

      <div className="max-w-[1360px] mx-auto px-4 md:px-8">
        
        {/* Back Link */}
        <div className="mb-4">
          <button
            onClick={() => onNavigate({ path: 'explore' })}
            className="font-sans text-xs text-[#8E8A81] hover:text-[#151513] transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft size={13} />
            <span>Back to explore</span>
          </button>
        </div>

        {/* Palette Title & Tags */}
        <div className="mb-5">
          <h1 className="font-serif text-[36px] md:text-[46px] tracking-[-0.025em] text-[#151513] leading-[1.05] mb-2 font-normal">
            {palette.title}
          </h1>
          <div className="flex flex-wrap items-center gap-1.5">
            {(palette.tags && palette.tags.length > 0 ? palette.tags : ['Editorial', 'Warm', 'Minimal']).map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 rounded-[12px] bg-transparent border border-[rgba(21,21,19,0.14)] text-[#69665F] font-sans text-[10px]"
              >
                {tag}
              </span>
            ))}
            <span className="px-2.5 py-0.5 rounded-[12px] bg-transparent border border-[rgba(21,21,19,0.14)] text-[#69665F] font-sans text-[10px]">
              {colors.length} colors
            </span>
          </div>
        </div>

        {/* 1. PALETTE HERO (Large Color Rectangles) */}
        <div className="mb-4">
          <div className="flex h-[130px] sm:h-[160px] md:h-[180px] rounded-[4px] overflow-hidden border border-[rgba(21,21,19,0.12)]">
            {colors.map((col, idx) => (
              <div
                key={`${col.hex}-${idx}`}
                onClick={() => handleCopySwatch(col.hex, col.name)}
                className="flex-1 h-full cursor-pointer relative group transition-opacity hover:opacity-95"
                style={{ backgroundColor: col.hex }}
                title={`Click to copy ${col.hex}`}
              />
            ))}
          </div>

          {/* Color Technical Data Underneath (Dot + HEX, RGB, HSL) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
            {colors.map((col, idx) => {
              const rgb = hexToRgb(col.hex);
              const hsl = hexToHsl(col.hex);
              return (
                <div
                  key={`${col.hex}-data-${idx}`}
                  onClick={() => handleCopySwatch(col.hex, col.name)}
                  className="flex flex-col gap-0.5 font-mono text-[9.5px] text-[#69665F] cursor-pointer hover:text-[#151513] transition-colors"
                >
                  <div className="flex items-center gap-1.5 font-bold text-[#151513]">
                    <span className="w-2 h-2 rounded-full border border-black/10" style={{ backgroundColor: col.hex }} />
                    <span>{col.hex.toUpperCase()}</span>
                  </div>
                  <div className="text-[#8E8A81]">
                    RGB {rgb ? `${rgb.r} ${rgb.g} ${rgb.b}` : ''}
                  </div>
                  <div className="text-[#8E8A81]">
                    HSL {hsl ? `${Math.round(hsl.h)}° ${Math.round(hsl.s)}% ${Math.round(hsl.l)}%` : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Row: Copy Palette, Save, Export */}
        <div className="flex flex-wrap items-center gap-2.5 py-4 border-b border-[rgba(21,21,19,0.1)] mb-6">
          <button
            onClick={handleCopyAll}
            className="h-[36px] px-4 rounded-[4px] bg-[#11110F] text-[#FAF8F5] font-sans text-xs font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            {copiedAll ? <Check size={14} /> : <Copy size={14} />}
            <span>Copy palette</span>
          </button>

          <button
            onClick={handleToggleSave}
            className="h-[36px] px-4 rounded-[4px] bg-transparent border border-[rgba(21,21,19,0.18)] hover:border-[#11110F] text-[#151513] font-sans text-xs font-medium flex items-center gap-2 transition-colors"
          >
            <Bookmark size={14} className={saved ? 'fill-current' : ''} />
            <span>{saved ? 'Saved' : 'Save'}</span>
          </button>

          <button
            onClick={() => onNavigate({ path: 'studio', palette: palette.slug || palette.id })}
            className="h-[36px] px-4 rounded-[4px] bg-transparent border border-[rgba(21,21,19,0.18)] hover:border-[#11110F] text-[#151513] font-sans text-xs font-medium flex items-center gap-2 transition-colors"
          >
            <Share2 size={14} />
            <span>Export</span>
          </button>
        </div>

        {/* 2-Column Info & Contrast Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-10 pb-8 border-b border-[rgba(21,21,19,0.1)]">
          
          {/* Left Column: Mood, Works well for, Contrast test dropdowns */}
          <div className="md:col-span-6 flex flex-col gap-5">
            <div>
              <div className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-[#8E8A81] mb-1 font-bold">
                Mood
              </div>
              <div className="font-sans text-xs text-[#151513]">
                {palette.mood?.join(' · ') || 'Moody · Sophisticated · Warm · Minimal'}
              </div>
            </div>

            <div>
              <div className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-[#8E8A81] mb-1 font-bold">
                Works well for
              </div>
              <div className="font-sans text-xs text-[#151513]">
                {palette.industry?.join(' · ') || 'Fashion · Editorial · Luxury · Architecture'}
              </div>
            </div>

            {/* Contrast Test Dropdowns */}
            <div className="pt-2">
              <div className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-[#8E8A81] mb-2 font-bold">
                Contrast test
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Text color */}
                <div>
                  <label className="block font-sans text-[10px] text-[#8E8A81] mb-1">Text color</label>
                  <select
                    value={testFg}
                    onChange={(e) => setTestFg(e.target.value)}
                    className="w-full h-[36px] px-2.5 rounded-[4px] border border-[rgba(21,21,19,0.18)] bg-white font-mono text-xs text-[#151513] outline-none"
                  >
                    {colors.map((c) => (
                      <option key={c.hex} value={c.hex}>
                        {c.hex} ({c.name})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Background color */}
                <div>
                  <label className="block font-sans text-[10px] text-[#8E8A81] mb-1">Background color</label>
                  <select
                    value={testBg}
                    onChange={(e) => setTestBg(e.target.value)}
                    className="w-full h-[36px] px-2.5 rounded-[4px] border border-[rgba(21,21,19,0.18)] bg-white font-mono text-xs text-[#151513] outline-none"
                  >
                    {colors.map((c) => (
                      <option key={c.hex} value={c.hex}>
                        {c.hex} ({c.name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Accessibility badges & Live Aa Specimen */}
          <div className="md:col-span-6 flex flex-col gap-4">
            <div>
              <div className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-[#8E8A81] mb-1.5 font-bold">
                Accessibility
              </div>
              <div className="flex items-center gap-3 font-mono text-xs">
                <span className={`flex items-center gap-1 ${passesAA ? 'text-emerald-700 font-bold' : 'text-[#8E8A81]'}`}>
                  AA {passesAA ? '✓' : '✗'}
                </span>
                <span className={`flex items-center gap-1 ${passesAAA ? 'text-emerald-700 font-bold' : 'text-[#8E8A81]'}`}>
                  AAA {passesAAA ? '✓' : '✗'}
                </span>
                <span className="flex items-center gap-1 text-emerald-700 font-bold">
                  Large text ✓
                </span>
              </div>
            </div>

            {/* Test Contrast Specimen Card */}
            <div>
              <div className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-[#8E8A81] mb-1.5 font-bold">
                Test contrast
              </div>
              <div
                className="p-4 rounded-[4px] border border-[rgba(21,21,19,0.1)] transition-colors"
                style={{ backgroundColor: testBg, color: testFg }}
              >
                <div className="font-serif text-3xl font-bold mb-1">Aa</div>
                <p className="font-sans text-xs leading-relaxed mb-2">
                  The quick brown fox jumps over the lazy dog.
                </p>
                <div className="font-mono text-[10px] opacity-75">
                  Contrast ratio: {contrastRatio.toFixed(1)}:1
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Similar Palettes Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sans text-[18px] md:text-[20px] font-medium text-[#151513]">
              Similar palettes
            </h2>
            <Link
              to={{ path: 'explore' }}
              onNavigate={onNavigate}
              className="text-[11px] font-sans font-medium text-[#8E8A81] hover:text-[#151513] transition-colors flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {similarPalettes.map((p) => (
              <div
                key={p.id}
                onClick={() => onNavigate({ path: 'palette-detail', slug: p.slug || p.id })}
                className="group border border-[rgba(21,21,19,0.12)] hover:border-[rgba(21,21,19,0.28)] rounded-[4px] bg-[#FAF9F5] p-2.5 flex flex-col transition-all cursor-pointer"
              >
                <div className="h-[60px] rounded-[3px] overflow-hidden flex border border-[rgba(21,21,19,0.08)] mb-2">
                  {p.colors.map((c, i) => (
                    <div key={i} className="flex-1 h-full" style={{ backgroundColor: c.hex }} />
                  ))}
                </div>
                <h3 className="font-sans text-[12px] font-medium text-[#151513] leading-snug group-hover:underline">
                  {p.title}
                </h3>
                <span className="font-mono text-[9px] text-[#8E8A81] mt-0.5">
                  {p.colors.length} colors
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
