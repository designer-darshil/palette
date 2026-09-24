import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, RotateCcw, Copy, Check } from 'lucide-react';
import { RouteType } from '../types';
import { CURATED_PALETTES } from '../data/palettes';
import { CURATED_COLLECTIONS } from '../data/collections';
import { copyToClipboard } from '../utils/colorUtils';
import { generatePalette, GeneratorColor } from '../utils/paletteGenerator';
import { SEOHead } from '../components/seo/SEOHead';
import { generateWebSiteSchema } from '../utils/schemaGenerator';
import { Link } from '../components/common/Link';
import { KromaButton } from '../components/common/KromaButton';
import { Analytics } from '../utils/analytics';

interface HomePageProps {
  onNavigate: (route: RouteType) => void;
}

/* ─── Color Families for Section 04 ─── */
const COLOR_FAMILIES = [
  { name: 'Reds', hex: '#FF3B30', text: '#FFFFFF', mood: 'warm' },
  { name: 'Oranges', hex: '#FF9500', text: '#FFFFFF', mood: 'energetic' },
  { name: 'Yellows', hex: '#FFD60A', text: '#171717', mood: 'cheerful' },
  { name: 'Greens', hex: '#34C759', text: '#FFFFFF', mood: 'natural' },
  { name: 'Blues', hex: '#00AEEF', text: '#FFFFFF', mood: 'calm' },
  { name: 'Purples', hex: '#7B2CBF', text: '#FFFFFF', mood: 'creative' },
  { name: 'Neutrals', hex: '#2D3142', text: '#FFFFFF', mood: 'minimal' },
  { name: 'Darks', hex: '#171717', text: '#FFFFFF', mood: 'bold' },
];

/* ─── Image Extraction Pin Specimen ─── */
const IMAGE_SPECIMEN_PINS = [
  { id: 'pin-1', x: 28, y: 35, hex: '#244D3B', name: 'Kyoto Bamboo' },
  { id: 'pin-2', x: 52, y: 65, hex: '#7DAA83', name: 'Moss Emerald' },
  { id: 'pin-3', x: 74, y: 25, hex: '#D8C7A8', name: 'Morning Mist' },
  { id: 'pin-4', x: 82, y: 78, hex: '#54463A', name: 'Cedar Trunk' },
  { id: 'pin-5', x: 42, y: 88, hex: '#16241C', name: 'Obsidian Soil' },
];

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  /* ─── Parallax State for Hero Shapes ─── */
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 768) return;
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 2; // -1 to 1
      const y = (e.clientY / innerHeight - 0.5) * 2;
      setMouseOffset({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  /* ─── Section 02: Color of the Moment State ─── */
  const [momentCopied, setMomentCopied] = useState(false);
  const momentColor = {
    name: 'Coral Red',
    hex: '#FF3B30',
    rgb: '255 / 59 / 48',
    role: 'PRIMARY CHROMATIC SPECIMEN',
  };

  const handleCopyMoment = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const ok = await copyToClipboard(momentColor.hex);
    if (ok) {
      Analytics.trackColorCopy(momentColor.hex, 'HEX', momentColor.name);
      setMomentCopied(true);
      setTimeout(() => setMomentCopied(false), 1800);
    }
  };

  /* ─── Section 05: Real Interactive Generator State ─── */
  const [generatedColors, setGeneratedColors] = useState<GeneratorColor[]>(() =>
    generatePalette(5, [], 'curated')
  );
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0);

  const handleReGenerate = () => {
    const next = generatePalette(5, [], 'curated');
    setGeneratedColors(next);
  };

  const activeGeneratorColor = generatedColors[selectedSlotIndex] || generatedColors[0];

  /* ─── Section 06: Image Swatch Copy State ─── */
  const [copiedPin, setCopiedPin] = useState<string | null>(null);

  const handleCopyPinHex = async (hex: string, id: string) => {
    const ok = await copyToClipboard(hex);
    if (ok) {
      Analytics.trackColorCopy(hex, 'HEX', 'Image Pin');
      setCopiedPin(id);
      setTimeout(() => setCopiedPin(null), 1800);
    }
  };

  /* 4 Curated Palettes for Section 03 */
  const featuredPalettes = CURATED_PALETTES.slice(0, 4);

  /* 3 Curated Collections for Section 07 */
  const featuredCollections = CURATED_COLLECTIONS.slice(0, 3);

  return (
    <div className="w-full max-w-[1400px] mx-auto px-5 sm:px-8 box-border text-[#171717] dark:text-white bg-transparent overflow-x-hidden">
      <SEOHead
        rawTitle
        title="KROMA — The Digital Color Studio"
        description="An interactive digital color laboratory to discover, explore, generate, and create with color. Perceptual palettes, OKLCH tokens, and editorial color science."
        canonicalPath="/"
        jsonLd={generateWebSiteSchema()}
      />

      {/* ═════════════════════════════════════════════════════════
          SECTION 01 — HERO / COLOR CANVAS
          ═════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[84dvh] flex flex-col justify-center py-8 md:py-12 select-none" ref={heroRef} aria-label="Hero Introduction">
        {/* Parallax Color Swatch Shapes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-70 md:opacity-100" aria-hidden="true">
          <div
            className="absolute will-change-transform transition-transform duration-150 ease-out shadow-[0_12px_32px_-8px_rgba(0,0,0,0.1)] top-[2%] md:top-[8%] right-[4%] md:right-[6%] w-[70px] md:w-[90px] lg:w-[130px] h-[100px] md:h-[130px] lg:h-[180px] rounded-md bg-[#FF3B30]"
            style={{
              transform: `rotate(12deg) translate(${mouseOffset.x * 14}px, ${mouseOffset.y * 12}px)`,
            }}
          />
          <div
            className="absolute will-change-transform transition-transform duration-150 ease-out shadow-[0_12px_32px_-8px_rgba(0,0,0,0.1)] top-[45%] md:top-[36%] right-[4%] md:right-[18%] w-[70px] md:w-[100px] lg:w-[140px] h-[70px] md:h-[100px] lg:h-[140px] rounded-full bg-[#FFD60A]"
            style={{
              transform: `translate(${mouseOffset.x * -10}px, ${mouseOffset.y * -8}px)`,
            }}
          />
          <div
            className="hidden md:block absolute will-change-transform transition-transform duration-150 ease-out shadow-[0_12px_32px_-8px_rgba(0,0,0,0.1)] bottom-[12%] right-[8%] w-[120px] lg:w-[160px] h-[70px] lg:h-[90px] rounded-md bg-[#FF9500]"
            style={{
              transform: `rotate(-8deg) translate(${mouseOffset.x * 8}px, ${mouseOffset.y * 14}px)`,
            }}
          />
          <div
            className="hidden md:block absolute will-change-transform transition-transform duration-150 ease-out shadow-[0_12px_32px_-8px_rgba(0,0,0,0.1)] top-[14%] left-[56%] w-[70px] h-[70px] rounded bg-[#34C759]"
            style={{
              transform: `rotate(18deg) translate(${mouseOffset.x * -12}px, ${mouseOffset.y * 10}px)`,
            }}
          />
          <div
            className="hidden md:block absolute will-change-transform transition-transform duration-150 ease-out shadow-[0_12px_32px_-8px_rgba(0,0,0,0.1)] bottom-[24%] left-[48%] w-8 h-[120px] rounded bg-[#00AEEF]"
            style={{
              transform: `rotate(-14deg) translate(${mouseOffset.x * 15}px, ${mouseOffset.y * -11}px)`,
            }}
          />
          <div
            className="hidden lg:block absolute will-change-transform transition-transform duration-150 ease-out shadow-[0_12px_32px_-8px_rgba(0,0,0,0.1)] top-[48%] right-[32%] w-[88px] h-[88px] rounded-md bg-[#7B2CBF]"
            style={{
              transform: `rotate(6deg) translate(${mouseOffset.x * -8}px, ${mouseOffset.y * -12}px)`,
            }}
          />
        </div>

        {/* Hero Typography & Content */}
        <div className="relative z-10 max-w-full">
          <span className="font-mono text-xs font-semibold tracking-wider uppercase text-text-tertiary inline-flex items-center gap-2 mb-4">THE COLOR STUDIO</span>
          <h1 className="font-sans text-[clamp(44px,9vw,140px)] font-bold leading-[1.02] tracking-tight text-text-primary m-0 p-0 uppercase pointer-events-none">
            COLOR<br />
            CHANGES<br />
            EVERYTHING.
          </h1>
        </div>

        <div className="flex items-end justify-between gap-8 mt-12 relative z-10 flex-wrap">
          <div className="max-w-[440px]">
            <p className="font-sans text-[17px] leading-[1.55] text-[#666666] dark:text-[#A0A0A0] mb-7">
              Discover palettes, generate new combinations, and build a visual language that feels like yours.
            </p>
            <div className="flex items-center gap-3.5 flex-wrap">
              <KromaButton
                variant="filled"
                to={{ path: 'colors' }}
                onNavigate={onNavigate}
                iconRight={<ArrowUpRight size={15} />}
              >
                Explore Colors
              </KromaButton>
              <KromaButton
                variant="outline"
                to={{ path: 'generate' }}
                onNavigate={onNavigate}
              >
                Generate a Palette
              </KromaButton>
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════
          SECTION 02 — COLOR OF THE MOMENT
          ═════════════════════════════════════════════════════════ */}
      <section className="my-12 md:my-16 lg:my-[88px] flex flex-col" aria-label="Color of the Moment">
        <span className="font-sans text-xs font-semibold tracking-wider uppercase text-[#707070] dark:text-[#9E9E9E] inline-flex items-center gap-2 mb-4">COLOR OF THE MOMENT</span>
        <div
          className="group/moment relative w-full min-h-[320px] md:min-h-[440px] rounded p-5 md:p-8 flex flex-col justify-between transition-all duration-300 hover:scale-[1.012] hover:shadow-[0_20px_48px_-12px_rgba(0,0,0,0.2)] select-none box-border"
          style={{ backgroundColor: momentColor.hex, color: '#FFFFFF' }}
        >
          <div className="flex items-center justify-between font-mono text-xs tracking-[0.06em] uppercase">
            <span>SPECIMEN Nº 01</span>
            <span>{momentColor.role}</span>
          </div>

          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <div className="font-sans text-[clamp(32px,5vw,64px)] font-bold leading-none tracking-[-0.03em] mb-1.5">{momentColor.name}</div>
              <div className="font-mono text-[13px] tracking-[0.04em] opacity-90">
                {momentColor.hex} • RGB {momentColor.rgb}
              </div>
            </div>

            <KromaButton
              variant="outline"
              size="sm"
              className="rounded-full bg-white/20 backdrop-blur-md font-sans text-xs font-semibold tracking-[0.05em] uppercase border border-white/30 text-inherit transition-all group-hover/moment:bg-white/35 group-hover/moment:-translate-y-0.5"
              onClick={handleCopyMoment}
              aria-label="Copy color"
              iconLeft={momentCopied ? <Check size={14} /> : <Copy size={14} />}
            >
              <span>{momentCopied ? 'COPIED' : 'COPY COLOR'}</span>
            </KromaButton>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════
          SECTION 03 — DISCOVER PALETTES
          ═════════════════════════════════════════════════════════ */}
      <section className="my-16 md:my-24 lg:my-[120px]" aria-label="Discover Palettes">
        <div className="flex items-end justify-between mb-7">
          <div>
            <span className="font-sans text-xs font-semibold tracking-wider uppercase text-[#707070] dark:text-[#9E9E9E] inline-flex items-center gap-2 mb-4">CURATED SYSTEMS</span>
            <h2 className="font-sans text-[clamp(28px,4vw,48px)] font-bold tracking-tight uppercase m-0 leading-[1.08]">DISCOVER PALETTES</h2>
          </div>
          <KromaButton
            variant="outline"
            to={{ path: 'palettes' }}
            onNavigate={onNavigate}
            iconRight={<ArrowUpRight size={14} />}
          >
            All Palettes
          </KromaButton>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {featuredPalettes.map((palette) => (
            <Link
              key={palette.id}
              to={{ path: 'palette-detail', slug: palette.slug }}
              onNavigate={onNavigate}
              className="group/pcard flex flex-col bg-[#F8F8F8] dark:bg-[#141518] border border-black/[0.08] dark:border-white/[0.08] rounded-[4px] overflow-hidden no-underline text-[#171717] dark:text-white transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-black/20 dark:hover:border-white/20 hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.35)] cursor-pointer select-none"
              aria-label={`View palette ${palette.title}`}
            >
              <div className="flex h-52 sm:h-56 w-full overflow-hidden">
                {palette.colors.map((color, idx) => (
                  <div
                    key={idx}
                    className="flex-1 h-full transition-[flex] duration-200 group-hover/pcard:hover:flex-[1.35]"
                    style={{ backgroundColor: color.hex }}
                    title={`${color.name} (${color.hex})`}
                  />
                ))}
              </div>
              <div className="p-3.5 sm:p-4 flex items-center justify-between">
                <span className="font-sans text-[15px] font-bold tracking-[-0.01em] truncate">{palette.title}</span>
                <span className="font-mono text-xs font-semibold text-[#707070] dark:text-[#909090] group-hover/pcard:text-[#171717] dark:group-hover/pcard:text-white inline-flex items-center gap-1 transition-all group-hover/pcard:translate-x-0.5">
                  <span>VIEW</span>
                  <ArrowUpRight size={12} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════
          SECTION 04 — COLOR EXPLORATION (Split Layout)
          ═════════════════════════════════════════════════════════ */}
      <section className="my-16 md:my-24 lg:my-[120px] grid grid-cols-1 md:grid-cols-[1fr_1.3fr] gap-8 md:gap-12 items-center" aria-label="Color Exploration">
        <div>
          <span className="font-sans text-xs font-semibold tracking-wider uppercase text-[#707070] dark:text-[#9E9E9E] inline-flex items-center gap-2 mb-4">EXPLORATION</span>
          <h2 className="font-sans text-[clamp(36px,6vw,84px)] font-bold leading-[1.04] tracking-tight uppercase mb-5">
            FIND<br />
            YOUR<br />
            COLOR.
          </h2>
          <p className="font-sans text-base text-[#666666] dark:text-[#9E9E9E] max-w-[360px] leading-[1.5] m-0">
            Explore chromatic families, natural earth pigments, and precision architectural hues.
          </p>
        </div>

        <div className="group/tilegrid grid grid-cols-2 sm:grid-cols-4 gap-3">
          {COLOR_FAMILIES.map((family) => (
            <Link
              key={family.name}
              to={{ path: 'colors' }}
              onNavigate={onNavigate}
              className="relative aspect-square rounded-[4px] p-3.5 flex flex-col justify-between no-underline cursor-pointer transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden border border-black/10 dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.18)]"
              style={{ backgroundColor: family.hex, color: family.text }}
              aria-label={`Explore ${family.name} color family`}
            >
              <span className="font-sans text-sm font-bold tracking-[-0.01em]">{family.name}</span>
              <span className="font-mono text-xs font-semibold opacity-95">{family.hex}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════
          SECTION 05 — GENERATE (Dark Dramatic Section)
          ═════════════════════════════════════════════════════════ */}
      <section className="my-16 md:my-24 lg:my-[120px] bg-[#171717] text-[#F8F8F8] rounded-[4px] p-5 sm:p-9 md:p-12 lg:p-16 box-border" aria-label="Generative Engine">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-9 md:gap-12 items-center">
          <div>
            <span className="font-sans text-xs font-semibold tracking-wider uppercase text-[#00AEEF] inline-flex items-center gap-2 mb-4">GENERATIVE STUDIO</span>
            <h2 className="font-sans text-[clamp(32px,5.5vw,72px)] font-bold leading-[1.05] tracking-tight uppercase mb-4 text-white">
              MAKE<br />
              A COLOR<br />
              YOU'VE NEVER<br />
              SEEN.
            </h2>
            <p className="font-sans text-base text-[#A0A0A0] leading-[1.5] mb-7 max-w-[440px]">
              Generate unexpected palettes, starting from a color, image, or idea. Real-time chromatic balance calibrated to harmonious scales.
            </p>
            <KromaButton
              variant="filled"
              className="!bg-[#F8F8F8] !text-[#171717] hover:!opacity-90"
              to={{ path: 'generate' }}
              onNavigate={onNavigate}
              iconRight={<ArrowUpRight size={15} />}
            >
              Generate Palette
            </KromaButton>
          </div>

          {/* Working Interactive Mini-Generator */}
          <div className="bg-[#202020] border border-white/10 rounded-[4px] p-5 sm:p-6 flex flex-col gap-5">
            <div className="flex h-[100px] rounded-[3px] overflow-hidden shadow-[0_6px_20px_rgba(0,0,0,0.3)]">
              {generatedColors.map((col, idx) => (
                <button
                  type="button"
                  key={col.id || idx}
                  aria-pressed={selectedSlotIndex === idx}
                  aria-label={`Select slot ${idx + 1}: ${col.name} (${col.hex})`}
                  className="flex-1 h-full transition-colors duration-250 cursor-pointer border-0 p-0"
                  style={{
                    backgroundColor: col.hex,
                    outline: selectedSlotIndex === idx ? '2px solid #FFFFFF' : 'none',
                    outlineOffset: '-2px',
                  }}
                  onClick={() => setSelectedSlotIndex(idx)}
                  title={`${col.name} (${col.hex}) - Click to inspect`}
                />
              ))}
            </div>

            <div className="flex items-center justify-between font-mono text-xs text-[#CCCCCC]">
              <div>
                <span className="font-bold text-white block text-sm">{activeGeneratorColor.name}</span>
                <span className="text-xs text-[#888888]">{activeGeneratorColor.hex}</span>
              </div>
              <KromaButton
                variant="filled"
                className="!bg-white !text-[#171717] hover:!bg-[#E8E8E8]"
                iconLeft={<RotateCcw size={14} />}
                onClick={handleReGenerate}
                aria-label="Generate new harmonic palette"
              >
                GENERATE
              </KromaButton>
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════
          SECTION 06 — FROM IMAGE TO COLOR
          ═════════════════════════════════════════════════════════ */}
      {/* ═════════════════════════════════════════════════════════
          SECTION 06 — FROM IMAGE TO COLOR
          ═════════════════════════════════════════════════════════ */}
      <section className="my-16 md:my-24 lg:my-[120px] flex flex-col gap-7" aria-label="Extract From Image">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <span className="font-sans text-xs font-semibold tracking-wider uppercase text-[#707070] dark:text-[#9E9E9E] inline-flex items-center gap-2 mb-4">PHOTO EXTRACTION</span>
            <h2 className="font-sans text-[clamp(28px,5vw,60px)] font-bold tracking-tight uppercase m-0 leading-[1.08]">YOUR IMAGE. YOUR PALETTE.</h2>
          </div>
          <KromaButton
            variant="outline"
            to={{ path: 'extract-from-image' }}
            onNavigate={onNavigate}
            iconRight={<ArrowUpRight size={14} />}
          >
            Extract From Image
          </KromaButton>
        </div>

        <div
          className="relative w-full h-[320px] md:h-[440px] rounded-[4px] overflow-hidden bg-cover bg-center flex items-end p-4 md:p-6 box-border"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&q=85')`,
          }}
        >
          {/* Chromatic Pin Markers on the photo */}
          {IMAGE_SPECIMEN_PINS.map((pin) => (
            <div
              key={pin.id}
              className="absolute w-[22px] h-[22px] rounded-full border-2 border-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] animate-pin-pulse -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${pin.x}%`,
                top: `${pin.y}%`,
                backgroundColor: pin.hex,
              }}
              title={`${pin.name} (${pin.hex})`}
            />
          ))}

          {/* Swatches strip overlay */}
          <div className="relative z-10 flex items-center gap-2.5 bg-[#171717]/80 backdrop-blur-md py-3 px-4 rounded-xl sm:rounded-full border border-white/15 max-w-fit flex-wrap sm:flex-nowrap">
            {IMAGE_SPECIMEN_PINS.map((pin) => (
              <KromaButton
                key={pin.id}
                variant="ghost"
                size="sm"
                className="flex items-center gap-1.5 font-mono text-xs text-white py-1 px-2.5 rounded-full bg-white/10"
                onClick={() => handleCopyPinHex(pin.hex, pin.id)}
                title={`Click to copy ${pin.hex}`}
                iconLeft={<span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: pin.hex }} />}
              >
                <span>{copiedPin === pin.id ? 'COPIED' : pin.hex}</span>
              </KromaButton>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════
          SECTION 07 — SAVED COLORS / COLLECTIONS
          ═════════════════════════════════════════════════════════ */}
      <section className="my-16 md:my-24 lg:my-[120px]" aria-label="Collections and Inspiration">
        <div className="flex items-end justify-between mb-7 flex-wrap gap-4">
          <div>
            <span className="font-sans text-xs font-semibold tracking-wider uppercase text-[#707070] dark:text-[#9E9E9E] inline-flex items-center gap-2 mb-4">INSPIRATION ARCHIVE</span>
            <h2 className="font-sans text-[clamp(28px,5vw,60px)] font-bold tracking-tight uppercase m-0 leading-[1.08]">KEEP WHAT INSPIRES YOU.</h2>
          </div>
          <KromaButton
            variant="outline"
            to={{ path: 'collections' }}
            onNavigate={onNavigate}
            iconRight={<ArrowUpRight size={14} />}
          >
            View Collections
          </KromaButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {featuredCollections.map((col) => {
            const previewColors = (col.coverPreview || '#171717,#FF3B30,#00AEEF,#34C759,#FFD60A')
              .split(',')
              .filter((c) => c.startsWith('#'))
              .slice(0, 5);

            return (
              <Link
                key={col.id}
                to={{ path: 'collection-detail', slug: col.slug }}
                onNavigate={onNavigate}
                className="group/hcol bg-[#F8F8F8] dark:bg-[#141518] border border-black/[0.08] dark:border-white/[0.08] rounded-[4px] overflow-hidden no-underline text-[#171717] dark:text-white flex flex-col justify-between h-[200px] transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-black/20 dark:hover:border-white/20 hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.35)] cursor-pointer select-none"
                aria-label={`View collection ${col.title}`}
              >
                <div className="flex h-12 w-full border-b border-black/[0.06] dark:border-white/[0.06]">
                  {previewColors.map((hex, idx) => (
                    <span
                      key={idx}
                      className="flex-1 h-full transition-[flex] duration-200 group-hover/hcol:hover:flex-[1.25]"
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
                <div className="p-4 flex flex-col justify-between flex-1">
                  <div className="font-sans text-[16px] font-bold tracking-[-0.01em]">{col.title}</div>
                  <div className="font-mono text-xs text-[#707070] dark:text-[#909090] flex items-center justify-between">
                    <span>BY {col.creator.name.toUpperCase()}</span>
                    <span>{col.items.length} ITEMS</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════
          SECTION 08 — COLOR STATEMENT
          ═════════════════════════════════════════════════════════ */}
      <section className="flex flex-col items-center justify-center text-center pt-24 pb-28 select-none" aria-label="Final Creative Statement">
        <h2 className="font-sans text-[clamp(40px,7.5vw,108px)] font-bold leading-[1.04] tracking-tight uppercase text-[#171717] dark:text-white max-w-[960px] mx-auto mb-9">
          THERE'S A<br />
          COLOR FOR<br />
          EVERY IDEA.
        </h2>

        {/* Signature Rocking Rainbow Roller Emblem */}
        <div className="flex items-center justify-center w-14 h-14" aria-hidden="true">
          <div className="origin-center animate-roller-rock">
            <svg
              width="42"
              height="42"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="3" y="3" width="10" height="14" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
              <rect x="4.2" y="4.2" width="7.6" height="2" rx="0.5" fill="#FF3B30" />
              <rect x="4.2" y="6.2" width="7.6" height="2" rx="0.5" fill="#FF9500" />
              <rect x="4.2" y="8.2" width="7.6" height="2" rx="0.5" fill="#FFD60A" />
              <rect x="4.2" y="10.2" width="7.6" height="2" rx="0.5" fill="#34C759" />
              <rect x="4.2" y="12.2" width="7.6" height="2" rx="0.5" fill="#00AEEF" />
              <rect x="4.2" y="14.2" width="7.6" height="2" rx="0.5" fill="#7B2CBF" />
              <path
                d="M8 17 L8 18.5 C8 19 8.5 19.5 9 19.5 L15 19.5 C15.5 19.5 16 19.5 16 19.5"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                fill="none"
              />
              <line x1="16" y1="18.5" x2="16" y2="22" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </section>
    </div>
  );
};
