import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Copy,
  Check,
  Bookmark,
  RefreshCw,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { RouteType } from '../types';
import { useToast } from '../context/ToastContext';
import { useSaved } from '../context/SavedContext';
import { useLibraryData } from '../context/LibraryDataContext';
import { copyToClipboard } from '../utils/colorUtils';
import {
  extractColorsFromImage,
  ExtractedSwatch,
  IMAGE_PRESETS,
  ImagePreset,
} from '../utils/imageColorExtractor';
import { SEOHead } from '../components/seo/SEOHead';
import { generateWebApplicationSchema } from '../utils/schemaGenerator';

interface ExtractFromImagePageProps {
  imagePreset?: string;
  onNavigate: (route: RouteType) => void;
}

// Representative pin sampling coordinates across image
const PIN_COORDINATES = [
  { top: '32%', left: '26%' },
  { top: '24%', left: '68%' },
  { top: '56%', left: '42%' },
  { top: '74%', left: '18%' },
  { top: '68%', left: '78%' },
  { top: '44%', left: '84%' },
  { top: '82%', left: '50%' },
];

export const ExtractFromImagePage: React.FC<ExtractFromImagePageProps> = ({
  imagePreset,
  onNavigate,
}) => {
  const { showToast } = useToast();
  const { saveItem, isSaved } = useSaved();
  const { addPalette } = useLibraryData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedImage, setSelectedImage] = useState<string>(() => {
    if (imagePreset) {
      const match = IMAGE_PRESETS.find((p) => p.id === imagePreset);
      if (match) return match.url;
    }
    return IMAGE_PRESETS[0].url;
  });

  const [imageTitle, setImageTitle] = useState<string>(IMAGE_PRESETS[0].title);
  const [colorCount, setColorCount] = useState<number>(5);
  const [swatches, setSwatches] = useState<ExtractedSwatch[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [activeSwatchIndex, setActiveSwatchIndex] = useState<number | null>(null);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Perform extraction whenever image or count changes
  const runExtraction = async (imgSrc: string, count: number) => {
    setLoading(true);
    try {
      const result = await extractColorsFromImage(imgSrc, count, []);
      setSwatches(result);
    } catch (err: any) {
      showToast('Image extraction failed', err?.message || 'Unsupported image format');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedImage) {
      runExtraction(selectedImage, colorCount);
    }
  }, [selectedImage, colorCount]);

  // File upload handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Invalid file format', 'Please upload a JPG, PNG, or WEBP image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const dataUrl = event.target.result as string;
        setSelectedImage(dataUrl);
        setImageTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const dataUrl = event.target.result as string;
          setSelectedImage(dataUrl);
          setImageTitle(file.name.replace(/\.[^/.]+$/, ''));
        }
      };
      reader.readAsDataURL(file);
    } else {
      showToast('Invalid file dropped', 'Please drop a JPG, PNG, or WEBP image.');
    }
  };

  const handleSelectPreset = (preset: ImagePreset) => {
    setSelectedImage(preset.url);
    setImageTitle(preset.title);
  };

  // Actions
  const handleCopySingle = async (hex: string, name: string) => {
    const ok = await copyToClipboard(hex);
    if (ok) {
      setCopiedHex(hex);
      showToast(`Copied ${hex}`, name, hex);
      setTimeout(() => setCopiedHex(null), 1500);
    }
  };

  const handleCopyAll = async () => {
    const all = swatches.map((s) => s.hex).join(', ');
    const ok = await copyToClipboard(all);
    if (ok) {
      setCopiedAll(true);
      showToast(`Copied ${swatches.length} colors`, imageTitle);
      setTimeout(() => setCopiedAll(false), 2000);
    }
  };

  const handleSavePalette = () => {
    const id = `img-pal-${swatches.map((s) => s.hex.replace('#', '').toLowerCase()).join('-')}`;
    const preview = swatches.map((s) => s.hex).join(',');
    const title = `${imageTitle} System`;

    saveItem({
      id,
      type: 'palette',
      title,
      slug: id,
      preview,
      metadata: `Extracted from image • ${swatches.length} colors`,
    });

    addPalette({
      id,
      slug: id,
      title,
      category: 'Image Extraction',
      description: `Extracted chromatic harmony from "${imageTitle}".`,
      colors: swatches.map((s, idx) => ({
        name: s.name,
        hex: s.hex,
        role: idx === 0 ? 'Dominant' : idx < 3 ? 'Secondary' : 'Accent',
      })),
      tags: ['image', 'extracted', 'study'],
    });

    showToast('Saved extracted palette to collection', title);
  };

  const handleGenerateVariation = () => {
    const colorParam = swatches.map((s) => s.hex.replace('#', '')).join('-');
    onNavigate({ path: 'palette-generator', colors: colorParam });
  };

  const currentId = `img-pal-${swatches.map((s) => s.hex.replace('#', '').toLowerCase()).join('-')}`;
  const saved = isSaved(currentId);

  const webAppSchema = generateWebApplicationSchema({
    name: 'KROMA Image Color Extractor',
    applicationCategory: 'DesignApplication',
    url: '/extract-image',
    description: 'Forensic image color extraction lab with interactive pins and design token exports.',
  });

  return (
    <div className="kroma-page">
      <SEOHead
        title="Extract from Image — Turn Images into Color | KROMA"
        description="A forensic color lab. Upload any image, inspect interactive sampled chromatic pins, and extract harmonic palettes."
        canonicalPath="/extract-image"
        jsonLd={webAppSchema}
      />

      {/* Top Hero */}
      <header className="kroma-hero">
        <div className="kroma-label">EXTRACT FROM IMAGE</div>
        <h1 className="kroma-headline">TURN IMAGES INTO COLOR.</h1>
        <p className="kroma-lead">
          A forensic color lab. Sample chromatic moments from photography, paintings, and real-world scenes into calibrated color palettes.
        </p>
      </header>

      {/* Preset Sample Images or Dropzone */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Preset Sample Images */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider whitespace-nowrap mr-1">
            SAMPLE IMAGES:
          </span>
          {IMAGE_PRESETS.map((p) => {
            const isSelected = selectedImage === p.url;
            return (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border text-xs font-sans transition-all whitespace-nowrap ${
                  isSelected
                    ? 'border-neutral-900 dark:border-white bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold'
                    : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full bg-cover bg-center border border-black/10 flex-shrink-0"
                  style={{ backgroundImage: `url(${p.thumbnail})` }}
                />
                <span>{p.title.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Upload Trigger */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="font-sans text-xs font-bold tracking-wider uppercase px-4 py-2 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white hover:border-neutral-900 dark:hover:border-white rounded-sm transition-colors flex items-center gap-2"
          >
            <Upload size={13} />
            <span>CHOOSE IMAGE ↗</span>
          </button>
        </div>
      </div>

      {/* Centerpiece: Image Canvas with Interactive Pin Markers */}
      <section
        className={`relative w-full rounded-sm overflow-hidden border transition-all duration-200 shadow-xl bg-neutral-100 dark:bg-[#15171C] ${
          isDragging
            ? 'border-dashed border-neutral-900 dark:border-white ring-4 ring-black/5'
            : 'border-neutral-200 dark:border-neutral-800'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        aria-label="Image Analysis Stage"
      >
        <div className="relative w-full min-h-[360px] sm:min-h-[480px] max-h-[640px] flex items-center justify-center overflow-hidden">
          <img
            src={selectedImage}
            alt={imageTitle}
            className="w-full h-full object-cover max-h-[640px]"
          />

          {/* Foreground Chromatic Pins Overlaid ON the Image */}
          {swatches.map((swatch, idx) => {
            const pos = PIN_COORDINATES[idx % PIN_COORDINATES.length];
            const isActive = activeSwatchIndex === idx;

            return (
              <div
                key={swatch.id || idx}
                style={{
                  top: pos.top,
                  left: pos.left,
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer group flex flex-col items-center"
                onClick={() => setActiveSwatchIndex(idx)}
              >
                {/* Tactical Dot with Pulsing Halo */}
                <div
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] flex items-center justify-center transition-transform duration-200 ${
                    isActive ? 'scale-125 ring-4 ring-black/40' : 'group-hover:scale-115'
                  }`}
                  style={{ backgroundColor: swatch.hex }}
                >
                  <span className="font-mono text-[9px] font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    0{idx + 1}
                  </span>
                </div>

                {/* Micro Hover Readout */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 pointer-events-none bg-black/80 backdrop-blur-md text-white px-2.5 py-1 rounded-xs font-mono text-[10px] tracking-wider uppercase whitespace-nowrap shadow-lg">
                  {swatch.name} • {swatch.hex}
                </div>
              </div>
            );
          })}

          {/* Loading Overlay if recalculating */}
          {loading && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center text-white font-mono text-xs tracking-widest uppercase">
              ANALYZING CHROMATIC SPECTRUM...
            </div>
          )}
        </div>
      </section>

      {/* Below the Image: Clean Horizontal Palette Strip with Proportions & Actions */}
      <section className="mt-8 mb-16">
        <div className="font-mono text-[11px] uppercase tracking-wider text-neutral-400 mb-3 flex items-center justify-between">
          <span>EXTRACTED PALETTE STRIP ({swatches.length} SPECIMENS)</span>
          <span>CLICK TO COPY HEX</span>
        </div>

        {/* The Clean Horizontal Strip */}
        <div className="w-full rounded-sm overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-md flex flex-col md:flex-row mb-8">
          {swatches.map((swatch, idx) => {
            const isActive = activeSwatchIndex === idx;
            const isCopied = copiedHex === swatch.hex;

            return (
              <div
                key={swatch.id || idx}
                className={`flex-1 flex flex-col justify-between p-4 cursor-pointer transition-all duration-150 ${
                  isActive ? 'ring-2 ring-inset ring-neutral-900 dark:ring-white' : ''
                }`}
                style={{ backgroundColor: swatch.hex }}
                onClick={() => handleCopySingle(swatch.hex, swatch.name)}
                onMouseEnter={() => setActiveSwatchIndex(idx)}
                onMouseLeave={() => setActiveSwatchIndex(null)}
              >
                <div className="flex items-center justify-between drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                  <span className="font-mono text-[10px] font-bold text-white bg-black/30 px-1.5 py-0.5 rounded-xs">
                    0{idx + 1}
                  </span>
                  <span className="font-mono text-[10px] font-bold text-white/90">
                    {Math.round(swatch.frequency || (100 / swatches.length))}%
                  </span>
                </div>

                <div className="mt-8 drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)] text-white">
                  <div className="font-sans text-xs sm:text-sm font-bold truncate">
                    {swatch.name}
                  </div>
                  <div className="font-mono text-xs font-bold text-white/90 flex items-center justify-between">
                    <span>{swatch.hex}</span>
                    {isCopied ? (
                      <span className="text-emerald-300 text-[10px]">COPIED!</span>
                    ) : (
                      <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Primary Actions: SAVE PALETTE · COPY COLORS · GENERATE VARIATION */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex flex-wrap items-center gap-3">
            {/* SAVE PALETTE */}
            <button
              onClick={handleSavePalette}
              className={`font-sans text-xs font-bold tracking-wider uppercase px-5 py-3 rounded-sm border transition-colors flex items-center gap-2 ${
                saved
                  ? 'bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white'
                  : 'bg-transparent text-neutral-900 dark:text-white border-neutral-300 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-white'
              }`}
            >
              <Bookmark size={14} fill={saved ? 'currentColor' : 'none'} />
              <span>{saved ? 'SAVED TO STUDIO' : 'SAVE PALETTE'}</span>
            </button>

            {/* COPY COLORS */}
            <button
              onClick={handleCopyAll}
              className="font-sans text-xs font-bold tracking-wider uppercase px-5 py-3 rounded-sm border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white hover:border-neutral-900 dark:hover:border-white transition-colors flex items-center gap-2"
            >
              {copiedAll ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              <span>{copiedAll ? 'ALL COPIED!' : 'COPY COLORS'}</span>
            </button>

            {/* GENERATE VARIATION */}
            <button
              onClick={handleGenerateVariation}
              className="font-sans text-xs font-bold tracking-wider uppercase px-5 py-3 rounded-sm border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white hover:border-neutral-900 dark:hover:border-white transition-colors flex items-center gap-2"
            >
              <RefreshCw size={14} />
              <span>GENERATE VARIATION ↗</span>
            </button>
          </div>

          <div className="font-mono text-xs text-neutral-400 uppercase tracking-wider">
            FORENSIC LAB • {imageTitle}
          </div>
        </div>
      </section>
    </div>
  );
};
