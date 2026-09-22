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
    <div className="studio-page">
      <SEOHead
        title="Image to Palette — Visual Extraction Studio | KROMA"
        description="A visual color extraction workspace. Sample chromatic moments from images into calibrated color palettes."
        canonicalPath="/extract-image"
        jsonLd={webAppSchema}
      />

      {/* Editorial Breadcrumb */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2 font-mono text-[11px] text-[var(--text-secondary)] uppercase tracking-wider">
          <span className="cursor-pointer hover:text-[var(--text-primary)]" onClick={() => onNavigate({ path: 'create' })}>STUDIO</span>
          <span>/</span>
          <span className="text-[var(--text-primary)] font-semibold">IMAGE → PALETTE</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyAll}
            className="studio-btn-secondary py-1.5 px-3 text-[11px]"
          >
            <Copy size={12} />
            <span>{copiedAll ? 'COPIED ALL' : 'COPY ALL'}</span>
          </button>
          <button
            onClick={handleGenerateVariation}
            className="studio-btn-secondary py-1.5 px-3 text-[11px]"
          >
            <Sparkles size={12} />
            <span>VARIATION ↗</span>
          </button>
          <button
            onClick={handleSavePalette}
            className="studio-btn-primary py-1.5 px-3 text-[11px]"
          >
            <Bookmark size={12} />
            <span>{saved ? 'SAVED' : 'SAVE PALETTE'}</span>
          </button>
        </div>
      </div>

      {/* Preset Reference Images or Drop Image */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="font-mono text-[11px] text-[var(--text-secondary)] uppercase tracking-wider whitespace-nowrap mr-2">
            PRESETS:
          </span>
          {IMAGE_PRESETS.map((p) => {
            const isSelected = selectedImage === p.url;
            return (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xs border text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
                  isSelected
                    ? 'border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--bg-canvas)] font-bold'
                    : 'border-[var(--border-subtle)] hover:border-[var(--text-primary)] text-[var(--text-secondary)]'
                }`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-xs bg-cover bg-center border border-black/10 flex-shrink-0"
                  style={{ backgroundImage: `url(${p.thumbnail})` }}
                />
                <span>{p.title.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

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
            className="studio-btn-secondary py-1.5 px-4 text-xs font-mono tracking-wider"
          >
            <Upload size={13} />
            <span>CHOOSE IMAGE ↗</span>
          </button>
        </div>
      </div>

      {/* Centerpiece: Open Visual Image Canvas */}
      <section
        className={`relative w-full rounded-xs overflow-hidden border transition-all duration-200 bg-neutral-900 ${
          isDragging
            ? 'border-dashed border-[var(--text-primary)] ring-4 ring-black/10'
            : 'border-[var(--border-subtle)]'
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
                onClick={() => {
                  setActiveSwatchIndex(idx);
                  handleCopySingle(swatch.hex, swatch.name);
                }}
              >
                <div
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-white shadow-[0_4px_12px_rgba(0,0,0,0.6)] flex items-center justify-center transition-transform duration-200 ${
                    isActive ? 'scale-125 ring-4 ring-white/50' : 'group-hover:scale-115'
                  }`}
                  style={{ backgroundColor: swatch.hex }}
                >
                  <span className="font-mono text-[9px] font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    0{idx + 1}
                  </span>
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 pointer-events-none bg-black/90 text-white px-2.5 py-1 rounded-xs font-mono text-[10px] tracking-wider uppercase whitespace-nowrap shadow-lg">
                  {swatch.name} • {swatch.hex}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-mono text-xs tracking-widest uppercase">
              EXTRACTING CHROMATIC COORDINATES...
            </div>
          )}
        </div>
      </section>

      {/* EXTRACTED COLORS (Proportional Canvas underneath) */}
      <section className="mt-8 mb-16">
        <div className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-secondary)] mb-3 flex items-center justify-between">
          <span>EXTRACTED COLORS ({swatches.length})</span>
          <span>CLICK TO COPY HEX</span>
        </div>

        <div className="w-full rounded-xs overflow-hidden border border-[var(--border-subtle)] flex flex-col md:flex-row mb-6">
          {swatches.map((swatch, idx) => {
            const isActive = activeSwatchIndex === idx;
            const isCopied = copiedHex === swatch.hex;

            return (
              <div
                key={swatch.id || idx}
                onClick={() => {
                  setActiveSwatchIndex(idx);
                  handleCopySingle(swatch.hex, swatch.name);
                }}
                className={`flex-1 p-5 min-h-[140px] flex flex-col justify-between cursor-pointer transition-all ${
                  isActive ? 'ring-2 ring-[var(--text-primary)] z-10' : ''
                }`}
                style={{ backgroundColor: swatch.hex }}
              >
                <div className="flex items-center justify-between text-white drop-shadow-md">
                  <span className="font-mono text-[11px] font-bold">0{idx + 1}</span>
                  <span className="font-mono text-[10px] uppercase tracking-wider bg-black/30 px-1.5 py-0.5 rounded-xs">
                    {Math.round(swatch.frequency)}%
                  </span>
                </div>

                <div className="text-white drop-shadow-md flex flex-col">
                  <span className="font-sans text-xs font-semibold uppercase tracking-wider truncate">
                    {swatch.name}
                  </span>
                  <span className="font-mono text-xs font-bold flex items-center justify-between">
                    <span>{swatch.hex}</span>
                    <span className="text-[10px] font-mono opacity-0 hover:opacity-100 uppercase tracking-wider">
                      {isCopied ? 'COPIED' : 'COPY'}
                    </span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
