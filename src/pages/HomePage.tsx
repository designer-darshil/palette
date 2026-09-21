import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowUpRight, RotateCcw, Copy, Check } from 'lucide-react';
import { RouteType } from '../types';
import { CURATED_PALETTES } from '../data/palettes';
import { CURATED_COLLECTIONS } from '../data/collections';
import { copyToClipboard } from '../utils/colorUtils';
import { generatePalette, GeneratorColor } from '../utils/paletteGenerator';
import { SEOHead } from '../components/seo/SEOHead';
import { generateWebSiteSchema } from '../utils/schemaGenerator';
import { Link } from '../components/common/Link';
import { Analytics } from '../utils/analytics';
import '../styles/home.css';

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
    <div className="home-reimagined">
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
      <section className="home-hero" ref={heroRef} aria-label="Hero Introduction">
        {/* Parallax Color Swatch Shapes */}
        <div className="home-hero__canvas" aria-hidden="true">
          <div
            className="home-hero__shape home-hero__shape--1"
            style={{
              transform: `rotate(12deg) translate(${mouseOffset.x * 14}px, ${mouseOffset.y * 12}px)`,
            }}
          />
          <div
            className="home-hero__shape home-hero__shape--2"
            style={{
              transform: `translate(${mouseOffset.x * -10}px, ${mouseOffset.y * -8}px)`,
            }}
          />
          <div
            className="home-hero__shape home-hero__shape--3"
            style={{
              transform: `rotate(-8deg) translate(${mouseOffset.x * 8}px, ${mouseOffset.y * 14}px)`,
            }}
          />
          <div
            className="home-hero__shape home-hero__shape--4"
            style={{
              transform: `rotate(18deg) translate(${mouseOffset.x * -12}px, ${mouseOffset.y * 10}px)`,
            }}
          />
          <div
            className="home-hero__shape home-hero__shape--5"
            style={{
              transform: `rotate(-14deg) translate(${mouseOffset.x * 15}px, ${mouseOffset.y * -11}px)`,
            }}
          />
          <div
            className="home-hero__shape home-hero__shape--6"
            style={{
              transform: `rotate(6deg) translate(${mouseOffset.x * -8}px, ${mouseOffset.y * -12}px)`,
            }}
          />
        </div>

        {/* Hero Typography & Content */}
        <div className="home-hero__header">
          <span className="home-label">THE COLOR STUDIO</span>
          <h1 className="home-hero__headline">
            COLOR<br />
            CHANGES<br />
            EVERYTHING.
          </h1>
        </div>

        <div className="home-hero__content-row">
          <div className="home-hero__copy-group">
            <p className="home-hero__lead">
              Discover palettes, generate new combinations, and build a visual language that feels like yours.
            </p>
            <div className="home-hero__actions">
              <Link to={{ path: 'colors' }} onNavigate={onNavigate} className="home-btn-primary">
                <span>Explore Colors</span>
                <ArrowUpRight size={15} />
              </Link>
              <Link to={{ path: 'generate' }} onNavigate={onNavigate} className="home-btn-secondary">
                <span>Generate a Palette</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════
          SECTION 02 — COLOR OF THE MOMENT
          ═════════════════════════════════════════════════════════ */}
      <section className="home-section-medium home-moment" aria-label="Color of the Moment">
        <span className="home-label">COLOR OF THE MOMENT</span>
        <div
          className="home-moment__block"
          style={{ backgroundColor: momentColor.hex, color: '#FFFFFF' }}
          onClick={handleCopyMoment}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleCopyMoment()}
          aria-label={`Copy color ${momentColor.name} (${momentColor.hex})`}
        >
          <div className="home-moment__top">
            <span>SPECIMEN Nº 01</span>
            <span>{momentColor.role}</span>
          </div>

          <div className="home-moment__bottom">
            <div>
              <div className="home-moment__name">{momentColor.name}</div>
              <div className="home-moment__specs">
                {momentColor.hex} • RGB {momentColor.rgb}
              </div>
            </div>

            <button
              type="button"
              className="home-moment__copy-action"
              onClick={handleCopyMoment}
              aria-label="Copy color"
            >
              {momentCopied ? (
                <>
                  <Check size={14} />
                  <span>COPIED</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>COPY COLOR</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════
          SECTION 03 — DISCOVER PALETTES
          ═════════════════════════════════════════════════════════ */}
      <section className="home-section-major home-palettes" aria-label="Discover Palettes">
        <div className="home-palettes__header">
          <div>
            <span className="home-label">CURATED SYSTEMS</span>
            <h2 className="home-palettes__title">DISCOVER PALETTES</h2>
          </div>
          <Link to={{ path: 'palettes' }} onNavigate={onNavigate} className="home-btn-secondary">
            <span>All Palettes ↗</span>
          </Link>
        </div>

        <div className="home-palettes__grid">
          {featuredPalettes.map((palette) => (
            <Link
              key={palette.id}
              to={{ path: 'palette-detail', slug: palette.slug }}
              onNavigate={onNavigate}
              className="home-palette-card"
              aria-label={`View palette ${palette.title}`}
            >
              <div className="home-palette-card__strip">
                {palette.colors.map((color, idx) => (
                  <div
                    key={idx}
                    className="home-palette-card__swatch"
                    style={{ backgroundColor: color.hex }}
                    title={`${color.name} (${color.hex})`}
                  />
                ))}
              </div>
              <div className="home-palette-card__info">
                <span className="home-palette-card__name">{palette.title}</span>
                <span className="home-palette-card__cta">
                  <span>View</span>
                  <ArrowUpRight size={13} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════
          SECTION 04 — COLOR EXPLORATION (Split Layout)
          ═════════════════════════════════════════════════════════ */}
      <section className="home-section-major home-explore-split" aria-label="Color Exploration">
        <div className="home-explore-split__left">
          <span className="home-label">EXPLORATION</span>
          <h2 className="home-explore-split__title">
            FIND<br />
            YOUR<br />
            COLOR.
          </h2>
          <p className="home-explore-split__desc">
            Explore chromatic families, natural earth pigments, and precision architectural hues.
          </p>
        </div>

        <div className="home-explore-grid" role="group" aria-label="Color family tiles">
          {COLOR_FAMILIES.map((family) => (
            <Link
              key={family.name}
              to={{ path: 'colors' }}
              onNavigate={onNavigate}
              className="home-family-tile"
              style={{ backgroundColor: family.hex, color: family.text }}
              aria-label={`Explore ${family.name} color family`}
            >
              <span className="home-family-tile__label">{family.name}</span>
              <span className="home-family-tile__hex">{family.hex}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════
          SECTION 05 — GENERATE (Dark Dramatic Section)
          ═════════════════════════════════════════════════════════ */}
      <section className="home-section-major home-generate-dark" aria-label="Generative Engine">
        <div className="home-generate-grid">
          <div>
            <span className="home-label" style={{ color: '#00AEEF' }}>GENERATIVE STUDIO</span>
            <h2 className="home-generate__heading">
              MAKE<br />
              A COLOR<br />
              YOU'VE NEVER<br />
              SEEN.
            </h2>
            <p className="home-generate__text">
              Generate unexpected palettes, starting from a color, image, or idea. Real-time chromatic balance calibrated to harmonious scales.
            </p>
            <Link to={{ path: 'generate' }} onNavigate={onNavigate} className="home-btn-primary">
              <span>Generate Palette</span>
              <ArrowUpRight size={15} />
            </Link>
          </div>

          {/* Working Interactive Mini-Generator */}
          <div className="home-mini-generator">
            <div className="home-mini-generator__strip">
              {generatedColors.map((col, idx) => (
                <div
                  key={col.id || idx}
                  className="home-mini-generator__slot"
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

            <div className="home-mini-generator__specs">
              <div>
                <span className="font-bold text-white block text-sm">{activeGeneratorColor.name}</span>
                <span className="text-xs text-[#888888]">{activeGeneratorColor.hex}</span>
              </div>
              <button
                type="button"
                className="home-mini-generator__btn"
                onClick={handleReGenerate}
                aria-label="Generate new harmonic palette"
              >
                <RotateCcw size={14} />
                <span>GENERATE ↻</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════
          SECTION 06 — FROM IMAGE TO COLOR
          ═════════════════════════════════════════════════════════ */}
      <section className="home-section-major home-image-extract" aria-label="Extract From Image">
        <div className="home-image-extract__header">
          <div>
            <span className="home-label">PHOTO EXTRACTION</span>
            <h2 className="home-image-extract__title">YOUR IMAGE. YOUR PALETTE.</h2>
          </div>
          <Link to={{ path: 'extract-from-image' }} onNavigate={onNavigate} className="home-btn-secondary">
            <span>Extract From Image ↗</span>
          </Link>
        </div>

        <div
          className="home-image-extract__stage"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&q=85')`,
          }}
        >
          {/* Chromatic Pin Markers on the photo */}
          {IMAGE_SPECIMEN_PINS.map((pin) => (
            <div
              key={pin.id}
              className="home-image-pin"
              style={{
                left: `${pin.x}%`,
                top: `${pin.y}%`,
                backgroundColor: pin.hex,
              }}
              title={`${pin.name} (${pin.hex})`}
            />
          ))}

          {/* Swatches strip overlay */}
          <div className="home-image-swatches">
            {IMAGE_SPECIMEN_PINS.map((pin) => (
              <button
                key={pin.id}
                type="button"
                className="home-image-swatch-chip"
                onClick={() => handleCopyPinHex(pin.hex, pin.id)}
                title={`Click to copy ${pin.hex}`}
              >
                <span className="home-image-swatch-dot" style={{ backgroundColor: pin.hex }} />
                <span>{copiedPin === pin.id ? 'COPIED' : pin.hex}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════
          SECTION 07 — SAVED COLORS / COLLECTIONS
          ═════════════════════════════════════════════════════════ */}
      <section className="home-section-major home-collections" aria-label="Collections and Inspiration">
        <div className="home-collections__header">
          <div>
            <span className="home-label">INSPIRATION ARCHIVE</span>
            <h2 className="home-collections__title">KEEP WHAT INSPIRES YOU.</h2>
          </div>
          <Link to={{ path: 'collections' }} onNavigate={onNavigate} className="home-btn-secondary">
            <span>View Collections ↗</span>
          </Link>
        </div>

        <div className="home-collections__grid">
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
                className="home-collection-card"
                aria-label={`View collection ${col.title}`}
              >
                <div>
                  <div className="home-collection-card__swatches">
                    {previewColors.map((hex, idx) => (
                      <span
                        key={idx}
                        className="home-collection-card__swatch"
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                  <div className="home-collection-card__name">{col.title}</div>
                </div>
                <div className="home-collection-card__meta">
                  <span>{col.creator.name}</span> • <span>{col.items.length} items</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════
          SECTION 08 — COLOR STATEMENT
          ═════════════════════════════════════════════════════════ */}
      <section className="home-statement" aria-label="Final Creative Statement">
        <h2 className="home-statement__text">
          THERE'S A<br />
          COLOR FOR<br />
          EVERY IDEA.
        </h2>

        {/* Signature Rocking Rainbow Roller Emblem */}
        <div className="home-statement__roller-container" aria-hidden="true">
          <div className="home-statement__roller-rock">
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
