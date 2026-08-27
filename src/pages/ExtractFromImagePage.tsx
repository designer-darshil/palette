import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Sparkles,
  Lock,
  Unlock,
  Trash2,
  Plus,
  Copy,
  Check,
  Share2,
  Bookmark,
  ShieldCheck,
  ExternalLink,
  RotateCcw,
  Sliders,
  Palette,
  Eye,
  Zap,
  ArrowRight,
  Layers,
  Wand2,
} from 'lucide-react';
import { RouteType } from '../types';
import { useToast } from '../context/ToastContext';
import { useSaved } from '../context/SavedContext';
import { useLibraryData } from '../context/LibraryDataContext';
import { copyToClipboard, getTextColorForBackground } from '../utils/colorUtils';
import {
  extractColorsFromImage,
  ExtractedSwatch,
  IMAGE_PRESETS,
  ImagePreset,
} from '../utils/imageColorExtractor';
import { createPaletteSlug } from '../utils/canonicalResourceUtils';
import { findClosestColorName } from '../utils/paletteGenerator';
import { SEOHead } from '../components/seo/SEOHead';
import { generateWebApplicationSchema } from '../utils/schemaGenerator';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Link } from '../components/common/Link';
import { Analytics } from '../utils/analytics';

interface ExtractFromImagePageProps {
  imagePreset?: string;
  onNavigate: (route: RouteType) => void;
}

export const ExtractFromImagePage: React.FC<ExtractFromImagePageProps> = ({
  imagePreset,
  onNavigate,
}) => {
  const { showToast } = useToast();
  const { saveItem, isSaved } = useSaved();
  const { addPalette } = useLibraryData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(() => {
    if (imagePreset) {
      const match = IMAGE_PRESETS.find((p) => p.id === imagePreset);
      if (match) return match.url;
    }
    return IMAGE_PRESETS[0].url; // Default to Botanical preset for immediate beauty
  });

  const [imageTitle, setImageTitle] = useState<string>(IMAGE_PRESETS[0].title);
  const [colorCount, setColorCount] = useState<number>(5);
  const [swatches, setSwatches] = useState<ExtractedSwatch[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showPresets, setShowPresets] = useState<boolean>(false);

  // Perform extraction whenever image or count changes
  const runExtraction = async (
    imgSrc: string,
    count: number,
    lockedList: ExtractedSwatch[] = []
  ) => {
    setLoading(true);
    try {
      const result = await extractColorsFromImage(imgSrc, count, lockedList);
      setSwatches(result);
    } catch (err: any) {
      showToast('Image extraction failed', err?.message || 'Unsupported image format');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedImage) {
      runExtraction(selectedImage, colorCount, swatches.filter((s) => s.locked));
    }
  }, [selectedImage, colorCount]);

  // Handle file selection
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
        setShowPresets(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop handlers
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
          setShowPresets(false);
        }
      };
      reader.readAsDataURL(file);
    } else {
      showToast('Invalid file dropped', 'Please drop a valid image file.');
    }
  };

  // Preset selection
  const handleSelectPreset = (preset: ImagePreset) => {
    setSelectedImage(preset.url);
    setImageTitle(preset.title);
    setShowPresets(false);
  };

  // Swatch interaction handlers
  const handleToggleLock = (id: string) => {
    setSwatches((prev) =>
      prev.map((s) => (s.id === id ? { ...s, locked: !s.locked } : s))
    );
  };

  const handleColorChange = (id: string, newHex: string) => {
    const clean = newHex.startsWith('#') ? newHex.toUpperCase() : `#${newHex.toUpperCase()}`;
    if (/^#[0-9A-F]{0,6}$/i.test(clean)) {
      setSwatches((prev) =>
        prev.map((s) => {
          if (s.id === id) {
            return {
              ...s,
              hex: clean,
              name: findClosestColorName(clean),
            };
          }
          return s;
        })
      );
    }
  };

  const handleRoleChange = (id: string, newRole: string) => {
    setSwatches((prev) =>
      prev.map((s) => (s.id === id ? { ...s, role: newRole } : s))
    );
  };

  const handleDeleteSwatch = (id: string) => {
    if (swatches.length <= 2) {
      showToast('Minimum 2 swatches required');
      return;
    }
    setSwatches((prev) => prev.filter((s) => s.id !== id));
  };

  const handleAddSwatch = () => {
    if (swatches.length >= 10) {
      showToast('Maximum 10 swatches allowed');
      return;
    }
    const newHex = '#E9C46A';
    const newSwatch: ExtractedSwatch = {
      id: `swatch-manual-${Date.now()}`,
      hex: newHex,
      name: findClosestColorName(newHex),
      role: 'Accent Highlight',
      locked: false,
      frequency: 5,
      luminance: 70,
    };
    setSwatches((prev) => [...prev, newSwatch]);
  };

  // Copy helper
  const handleCopy = async (text: string, key: string, label: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1200);
      showToast(`Copied ${label}`, text);
    }
  };

  const handleCopyAllHex = async () => {
    const all = swatches.map((s) => s.hex).join(', ');
    const success = await copyToClipboard(all);
    if (success) {
      showToast('Copied all extracted HEX values', all);
    }
  };

  // Canonical Slug & Save Action
  const hexHash = swatches.map((s) => s.hex.replace('#', '').toLowerCase()).join('-');
  const canonicalSlug = `ext-pal-${hexHash.slice(0, 30)}`;
  const saved = isSaved(canonicalSlug);

  const handleSavePalette = () => {
    const title = `${imageTitle} Extracted Palette`;
    const preview = swatches.map((s) => s.hex).join(',');

    saveItem({
      id: canonicalSlug,
      type: 'palette',
      title,
      slug: canonicalSlug,
      preview,
      metadata: `Image Extraction • ${swatches.length} Tones`,
    });

    addPalette({
      id: canonicalSlug,
      slug: canonicalSlug,
      title,
      category: 'Image Extraction',
      description: `Color system extracted from photograph "${imageTitle}".`,
      colors: swatches.map((s) => ({
        name: s.name,
        hex: s.hex,
        role: s.role,
      })),
      tags: ['extracted', 'image', 'natural'],
    });

    showToast(
      saved ? 'Removed from saved' : 'Saved extracted palette to workspace',
      title
    );
  };

  const handleShare = async () => {
    const success = await copyToClipboard(window.location.href);
    if (success) {
      showToast('Share link copied to clipboard', imageTitle);
    }
  };

  const ROLES_OPTIONS = [
    'Primary Dominant',
    'Secondary',
    'Accent Highlight',
    'Vibrant Accent',
    'Light Background',
    'Dark Canvas',
    'Neutral Muted',
    'Surface / Border',
  ];

  const extractorSchema = React.useMemo(() => {
    return generateWebApplicationSchema({
      name: 'Extract Color Palette from Image',
      description:
        'Upload images to extract dominant color spectra, perceptual hues, semantic UI roles, and create reusable palettes.',
      url: '/extract-from-image',
      applicationCategory: 'DesignApplication',
    });
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 md:py-8 flex flex-col gap-6 sm:gap-8">
      <SEOHead
        title="Extract Color Palette from Image | KROMA Spectrum"
        description="Extract dominant and harmonious color palettes from photographs and graphic assets with automatic semantic UI role mapping and instant token exports."
        canonicalPath="/extract-from-image"
        jsonLd={extractorSchema}
        keywords={['extract color from image', 'image color palette generator', 'photo color picker', 'image hex extractor']}
      />

      <Breadcrumbs
        items={[
          { label: 'Home', to: { path: 'home' } },
          { label: 'Tools', to: { path: 'palettes' } },
          { label: 'Extract from Image', isCurrent: true },
        ]}
        onNavigate={onNavigate}
      />

      {/* Page Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 sm:pb-6 border-b border-[var(--border-subtle)]">
        <div>
          <span className="font-mono text-xs text-[var(--accent-gold)] uppercase tracking-wider font-semibold">
            IMAGE CHROMATIC HARMONY ENGINE
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1 text-[var(--text-primary)]">
            Extract from Image
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-xl">
            Upload photographs or design assets to extract perceptually distinct color gamuts, detect semantic UI roles, and create reusable palettes.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowPresets(!showPresets)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wider bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] text-[var(--text-primary)] border border-[var(--border-medium)] rounded-xs transition-colors whitespace-nowrap"
            title="Try Curated Photography Presets"
          >
            <Sparkles size={13} className="text-[var(--accent-gold)]" />
            <span>Try Examples</span>
          </button>
          <button
            onClick={handleCopyAllHex}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wider bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] text-[var(--text-primary)] border border-[var(--border-medium)] rounded-xs transition-colors whitespace-nowrap"
            title="Copy All Swatches"
          >
            <Copy size={13} />
            <span>Copy All</span>
          </button>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wider bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] text-[var(--text-primary)] border border-[var(--border-medium)] rounded-xs transition-colors whitespace-nowrap"
            title="Share Palette URL"
          >
            <Share2 size={13} />
            <span>Share</span>
          </button>
          <button
            onClick={handleSavePalette}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wider bg-[var(--bg-surface-3)] hover:bg-[var(--bg-surface-elevated)] text-[var(--accent-gold)] border border-[var(--accent-gold)] rounded-xs transition-colors whitespace-nowrap"
            title="Save Palette"
          >
            <Bookmark size={13} fill={saved ? 'currentColor' : 'none'} />
            <span>{saved ? 'Saved' : 'Save Palette'}</span>
          </button>
        </div>
      </header>

      {/* Photography Presets Drawer (Collapsible) */}
      {showPresets && (
        <div className="bg-[var(--bg-surface-1)] border border-[var(--border-medium)] rounded-md p-5 shadow-xl flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-semibold">
              SAMPLE PHOTOGRAPHY PRESETS
            </span>
            <button
              onClick={() => setShowPresets(false)}
              className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              Close ✕
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {IMAGE_PRESETS.map((preset) => (
              <div
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className="bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] hover:border-[var(--accent-gold)] rounded-xs overflow-hidden cursor-pointer group transition-all"
              >
                <img
                  src={preset.thumbnail}
                  alt={preset.title}
                  className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="p-2.5">
                  <div className="text-xs font-bold text-[var(--text-primary)] truncate">
                    {preset.title}
                  </div>
                  <div className="text-[10px] text-[var(--text-tertiary)] mt-0.5">
                    {preset.category}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image Viewport & Upload Controls (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Upload Dropzone & Viewport Card */}
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md overflow-hidden shadow-lg flex flex-col">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
            />

            {selectedImage ? (
              <div className="relative group">
                <img
                  src={selectedImage}
                  alt="Source Specimen"
                  className="w-full h-64 md:h-72 object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-primary text-xs"
                  >
                    Replace Image
                  </button>
                  <button
                    onClick={() =>
                      runExtraction(selectedImage, colorCount, swatches.filter((s) => s.locked))
                    }
                    className="btn-secondary text-xs"
                  >
                    Re-Analyze
                  </button>
                </div>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full h-64 border-2 border-dashed rounded-md flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? 'border-[var(--accent-gold)] bg-[var(--bg-surface-2)]'
                    : 'border-[var(--border-medium)] hover:border-[var(--text-primary)] bg-[var(--bg-surface-1)]'
                }`}
              >
                <Upload size={32} className="text-[var(--text-tertiary)] mb-2" />
                <div className="text-sm font-bold text-[var(--text-primary)]">
                  Upload an image to extract colors
                </div>
                <p className="text-xs text-[var(--text-tertiary)] mt-1 max-w-xs">
                  Drag and drop PNG, JPG, or WEBP, or click to browse your files.
                </p>
              </div>
            )}

            {/* Image Metadata & Count Controls */}
            <div className="p-4 bg-[var(--bg-surface-1)] border-t border-[var(--border-subtle)] flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[var(--text-primary)] truncate max-w-[200px]">
                    {imageTitle}
                  </div>
                  <div className="font-mono text-[10px] text-[var(--text-tertiary)]">
                    {loading ? 'Analyzing spectrum...' : `${swatches.length} swatches extracted`}
                  </div>
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-semibold text-[var(--accent-gold)] hover:underline"
                >
                  Upload New
                </button>
              </div>

              {/* Swatch Count Selector */}
              <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
                <span className="font-mono text-xs text-[var(--text-secondary)] font-bold">
                  SWATCH COUNT
                </span>
                <div className="flex items-center gap-1">
                  {[3, 4, 5, 6, 7, 8, 10].map((num) => (
                    <button
                      key={num}
                      onClick={() => setColorCount(num)}
                      className={`w-7 h-7 font-mono text-xs font-bold rounded-xs transition-all ${
                        colorCount === num
                          ? 'bg-[var(--text-primary)] text-[var(--text-inverse)]'
                          : 'bg-[var(--bg-surface-2)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-3)] border border-[var(--border-subtle)]'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Cross-Tool Launcher Shortcuts */}
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md p-5 shadow-lg flex flex-col gap-3">
            <span className="font-mono text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-semibold">
              CONNECTED CREATION TOOLS
            </span>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  const fg = swatches[0]?.hex || '#10288C';
                  const bg = swatches[1]?.hex || '#FFFFFF';
                  onNavigate({ path: 'contrast-checker', fg, bg });
                }}
                className="w-full flex items-center justify-between p-2.5 bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] border border-[var(--border-subtle)] rounded-xs transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={14} className="text-blue-400" />
                  <span className="text-xs font-bold text-[var(--text-primary)]">
                    Check Contrast in Studio
                  </span>
                </div>
                <ArrowRight size={13} className="text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)]" />
              </button>

              <button
                onClick={() => {
                  const hexList = swatches.map((s) => s.hex.replace('#', '')).join('-');
                  onNavigate({ path: 'palette-generator', colors: hexList });
                }}
                className="w-full flex items-center justify-between p-2.5 bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] border border-[var(--border-subtle)] rounded-xs transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles size={14} className="text-amber-400" />
                  <span className="text-xs font-bold text-[var(--text-primary)]">
                    Open in Mobile Palette Generator
                  </span>
                </div>
                <ArrowRight size={13} className="text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)]" />
              </button>

              <button
                onClick={() => {
                  const hexList = swatches.map((s) => s.hex.replace('#', '')).join('-');
                  onNavigate({ path: 'brand-kit', paletteSlug: hexList });
                }}
                className="w-full flex items-center justify-between p-2.5 bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] border border-[var(--border-subtle)] rounded-xs transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Palette size={14} className="text-emerald-400" />
                  <span className="text-xs font-bold text-[var(--text-primary)]">
                    Create Brand Kit with Colors
                  </span>
                </div>
                <ArrowRight size={13} className="text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)]" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Extracted Palette & Interactive Editing (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Continuous Multi-Tone Palette Preview Strip */}
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md overflow-hidden shadow-lg p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-semibold">
                EXTRACTED PALETTE SPECIMEN
              </span>
              <button
                onClick={handleAddSwatch}
                className="inline-flex items-center gap-1 text-xs font-mono text-[var(--accent-gold)] hover:underline"
              >
                <Plus size={12} />
                <span>Add Tone</span>
              </button>
            </div>

            {/* Seamless Visual Gradient Bar */}
            <div className="w-full h-16 rounded-xs overflow-hidden flex border border-[var(--border-medium)] shadow-inner">
              {swatches.map((s) => (
                <div
                  key={s.id}
                  style={{ backgroundColor: s.hex }}
                  className="flex-1 h-full relative group cursor-pointer"
                  onClick={() => handleCopy(s.hex, s.id, s.name)}
                  title={`${s.name} (${s.hex}) - Click to copy`}
                />
              ))}
            </div>

            {/* Detailed Swatch Cards List */}
            <div className="flex flex-col gap-2.5 mt-2">
              {swatches.map((swatch) => {
                const textColor = getTextColorForBackground(swatch.hex);
                return (
                  <div
                    key={swatch.id}
                    className="p-3.5 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] rounded-xs flex items-center justify-between gap-3 transition-all"
                  >
                    {/* Color Swatch & Live Picker */}
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <input
                          type="color"
                          value={swatch.hex}
                          onChange={(e) => handleColorChange(swatch.id, e.target.value)}
                          className="w-11 h-11 border border-[var(--border-medium)] rounded-xs cursor-pointer p-0 bg-transparent"
                          title="Pick Color"
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[var(--text-primary)]">
                            {swatch.name}
                          </span>
                          {swatch.locked && (
                            <span className="font-mono text-[9px] px-1 py-0.2 bg-amber-500/20 text-amber-400 rounded-xs">
                              LOCKED
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[11px] font-bold text-[var(--text-secondary)]">
                            {swatch.hex}
                          </span>
                          <span className="text-[10px] text-[var(--text-tertiary)] font-mono">
                            • {swatch.frequency}% image coverage
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Role Selector & Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        value={swatch.role}
                        onChange={(e) => handleRoleChange(swatch.id, e.target.value)}
                        className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] text-[var(--text-secondary)] text-[11px] font-mono rounded-xs px-2 py-1 outline-none"
                      >
                        {ROLES_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => handleToggleLock(swatch.id)}
                        className={`p-1.5 border rounded-xs transition-colors ${
                          swatch.locked
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                            : 'bg-[var(--bg-surface-1)] border-[var(--border-subtle)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                        }`}
                        title={swatch.locked ? 'Unlock Color' : 'Lock Color during Re-extraction'}
                      >
                        {swatch.locked ? <Lock size={13} /> : <Unlock size={13} />}
                      </button>

                      <button
                        onClick={() =>
                          onNavigate({ path: 'color-name-finder', hex: swatch.hex })
                        }
                        className="p-1.5 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] rounded-xs transition-colors"
                        title="Identify in Color Name Finder"
                      >
                        <ExternalLink size={13} />
                      </button>

                      <button
                        onClick={() => handleDeleteSwatch(swatch.id)}
                        className="p-1.5 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] text-[var(--text-tertiary)] hover:text-rose-400 rounded-xs transition-colors"
                        title="Delete Swatch"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Canonical Palette Bar Action */}
            <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border-subtle)]">
              <button
                onClick={() =>
                  onNavigate({ path: 'palette-detail', slug: canonicalSlug })
                }
                className="btn-primary inline-flex items-center gap-1.5 text-xs"
              >
                <span>View Canonical Specimen</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
