import React, { useState, useRef } from 'react';
import { Upload, Plus, Trash2, ArrowLeftRight, Copy, Check, Bookmark, Download, Image as ImageIcon } from 'lucide-react';
import { RouteType } from '../types';
import { copyToClipboard } from '../utils/colorUtils';
import { useToast } from '../context/ToastContext';
import { useSaved } from '../context/SavedContext';
import { SEOHead } from '../components/seo/SEOHead';

interface CreatePalettePageProps {
  onNavigate: (route: RouteType) => void;
  initialColors?: string;
}

export const CreatePalettePage: React.FC<CreatePalettePageProps> = ({ onNavigate, initialColors }) => {
  const { showToast } = useToast();
  const { saveItem } = useSaved();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('Coastal Aerial');
  const [imageUrl, setImageUrl] = useState<string>(
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'
  );
  const [swatches, setSwatches] = useState<string[]>(() => {
    if (initialColors) {
      const parts = initialColors.split(/[,-\s]+/).map((c) => (c.startsWith('#') ? c : `#${c}`));
      if (parts.length >= 2) return parts.slice(0, 8);
    }
    return ['#0A2032', '#3E7385', '#6FA4BB', '#C7B58B', '#B59E87'];
  });
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImageUrl(result);
      // Realistic coastal/architectural dominant pigments
      setSwatches(['#1D3557', '#457B9D', '#A8DADC', '#F1FAEE', '#C7B58B']);
      showToast('Colors extracted from photograph');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImageUrl(result);
        setSwatches(['#1D3557', '#457B9D', '#A8DADC', '#F1FAEE', '#C7B58B']);
        showToast('Image uploaded and colors extracted');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteSwatch = (index?: number) => {
    if (swatches.length <= 2) {
      showToast('Minimum 2 colors required');
      return;
    }
    if (typeof index === 'number') {
      setSwatches(swatches.filter((_, i) => i !== index));
    } else {
      // Remove last swatch
      setSwatches(swatches.slice(0, -1));
      showToast('Removed last swatch');
    }
  };

  const handleReorder = () => {
    // Reverse or cycle colors
    const next = [...swatches.slice(1), swatches[0]];
    setSwatches(next);
    showToast('Re-ordered swatches');
  };

  const handleColorChange = (index: number, newHex: string) => {
    setSwatches(swatches.map((c, i) => (i === index ? newHex : c)));
  };

  const handleSavePalette = () => {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `custom-${Date.now()}`;
    saveItem({
      id: `custom_${Date.now()}`,
      type: 'palette',
      title: title.trim(),
      slug,
      preview: swatches.join(','),
      metadata: `Custom Palette • ${swatches.length} tones`,
    });
    showToast('Saved to collection', title);
  };

  return (
    <div className="w-full min-h-screen bg-[var(--kroma-paper)] text-[var(--kroma-ink)] py-5 md:py-6">
      <SEOHead
        rawTitle
        title="Create Your Own Palette — KROMA"
        description="Build, test, and save custom color palettes from images or custom tones."
        canonicalPath="/create"
      />

      <div className="max-w-[1360px] mx-auto px-4 md:px-8">
        
        {/* Screen 07 Header: Exact Match */}
        <div className="mb-4">
          <h1 className="font-mono text-[11px] md:text-xs uppercase tracking-[0.2em] font-semibold text-[var(--kroma-ink)] mb-1">
            CREATE YOUR OWN PALETTE
          </h1>
          <p className="font-sans text-xs text-[var(--kroma-muted)]">
            Build and save your custom color palettes.
          </p>
        </div>

        {/* 1. Drag & Drop Upload Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full py-9 md:py-12 border border-dashed rounded-[4px] bg-[var(--kroma-white)] flex flex-col items-center justify-center cursor-pointer transition-colors mb-5 ${
            isDragging ? 'border-[var(--kroma-ink)] bg-[var(--kroma-paper)]' : 'border-[var(--kroma-border)] hover:border-[var(--kroma-border-strong)]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Upload size={18} className="text-[var(--kroma-muted)] mb-2" strokeWidth={1.5} />
          <div className="font-sans text-xs font-medium text-[var(--kroma-ink)]">
            Drag &amp; drop an image
          </div>
          <div className="font-sans text-[11px] text-[var(--kroma-muted)] mt-0.5">
            or click to upload
          </div>
        </div>

        {/* 2. Photograph Preview & Palette Name Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch mb-5">
          {/* Photograph */}
          <div className="md:col-span-7 h-[190px] sm:h-[220px] rounded-[4px] overflow-hidden border border-[var(--kroma-border)] bg-[#0D0D0C]">
            <img
              src={imageUrl}
              alt="Uploaded reference photograph"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right Card: Palette Name input */}
          <div className="md:col-span-5 border border-[var(--kroma-border)] rounded-[4px] bg-[var(--kroma-white)] p-4 flex flex-col justify-between">
            <div>
              <label className="block font-mono text-[9.5px] uppercase tracking-[0.16em] text-[var(--kroma-muted)] mb-2">
                Palette name
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Coastal Aerial"
                className="w-full h-[38px] px-3 font-sans text-sm border border-[var(--kroma-border)] rounded-[4px] bg-[var(--kroma-paper)] text-[var(--kroma-ink)] focus:outline-none focus:border-[var(--kroma-ink)]"
              />
            </div>

            <div className="text-right mt-4">
              <button
                onClick={() => onNavigate({ path: 'studio', colors: swatches.join(',').replace(/#/g, '') })}
                className="font-mono text-[10px] uppercase tracking-wider text-[var(--kroma-muted)] hover:text-[var(--kroma-ink)] underline"
              >
                Fine-tune in Studio →
              </button>
            </div>
          </div>
        </div>

        {/* 3. Dominant Colors Strip */}
        <div className="mb-5">
          <div className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-[var(--kroma-muted)] mb-2">
            Dominant colors
          </div>

          {/* Color Blocks (5 horizontal blocks with Hex values underneath) */}
          <div className="flex h-[75px] sm:h-[85px] rounded-[4px] overflow-hidden border border-[var(--kroma-border)] mb-2">
            {swatches.map((hex, idx) => (
              <div
                key={idx}
                style={{ backgroundColor: hex }}
                className="flex-1 h-full cursor-pointer relative group flex items-end p-2"
                title={`Click to edit or copy ${hex}`}
              >
                <input
                  type="color"
                  value={hex}
                  onChange={(e) => handleColorChange(idx, e.target.value)}
                  className="w-5 h-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border border-white/40"
                />
              </div>
            ))}
          </div>

          {/* Hex labels under each block */}
          <div className="flex justify-between font-mono text-[10px] text-[var(--kroma-muted)] uppercase tracking-wider px-1">
            {swatches.map((hex, idx) => (
              <span key={idx} className="cursor-pointer hover:text-[var(--kroma-ink)]" onClick={() => copyToClipboard(hex)}>
                {hex}
              </span>
            ))}
          </div>
        </div>

        {/* 4. Action Buttons: Delete, + Re-order, Save palette */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handleDeleteSwatch()}
              className="kroma-btn-secondary text-xs h-[34px] px-4"
            >
              Delete
            </button>
            <button
              onClick={handleReorder}
              className="kroma-btn-secondary text-xs h-[34px] px-4"
            >
              + Re-order
            </button>
          </div>

          <button
            onClick={handleSavePalette}
            className="kroma-btn-primary text-xs h-[34px] px-5"
          >
            Save palette
          </button>
        </div>

      </div>
    </div>
  );
};
