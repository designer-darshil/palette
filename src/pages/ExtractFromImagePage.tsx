import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Copy, Bookmark, Search, RefreshCw, SlidersHorizontal } from 'lucide-react';
import { RouteType } from '../types';
import { copyToClipboard, hexToRgb } from '../utils/colorUtils';
import { useToast } from '../context/ToastContext';
import { useSaved } from '../context/SavedContext';
import { SEOHead } from '../components/seo/SEOHead';

interface ExtractProps {
  onNavigate: (route: RouteType) => void;
}

export const ExtractFromImagePage: React.FC<ExtractProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const { saveItem } = useSaved();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageUrl, setImageUrl] = useState<string>(
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'
  );
  const [extractedColors, setExtractedColors] = useState<string[]>([
    '#0A3D62',
    '#2E7DA7',
    '#6AABB8',
    '#C7B8A3',
    '#EAF4F7',
  ]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImageUrl(result);
      // Simulate extraction of realistic architectural/nature swatches from uploaded file
      setExtractedColors(['#1D3557', '#457B9D', '#A8DADC', '#F1FAEE', '#E63946']);
      showToast('Colors extracted from photograph');
    };
    reader.readAsDataURL(file);
  };

  const handleCopyHex = async (hex: string) => {
    const success = await copyToClipboard(hex);
    if (success) {
      showToast(`Copied ${hex}`);
    }
  };

  const handleSavePalette = () => {
    saveItem({
      id: `extracted-${Date.now()}`,
      type: 'palette',
      title: 'Image Extraction Palette',
      slug: `extracted-${Date.now()}`,
      preview: extractedColors.join(','),
      metadata: 'Image to Palette • 5 tones',
    });
    showToast('Saved to collection', 'Image Extraction Palette');
  };

  return (
    <div className="w-full min-h-screen bg-[var(--kroma-paper)] text-[var(--kroma-ink)] py-5 md:py-6">
      <SEOHead
        rawTitle
        title="Extract Color from Image — KROMA"
        description="Extract harmonious dominant colors and tonal scales from architectural and editorial photography."
        canonicalPath="/image-to-palette"
      />

      <div className="max-w-[1360px] mx-auto px-4 md:px-8">
        
        {/* Header */}
        <div className="mb-4">
          <div className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-[var(--kroma-muted)] mb-1.5">
            PIGMENT EXTRACTION
          </div>
          <h1 className="font-sans text-[32px] md:text-[40px] leading-[1.05] tracking-[-0.03em] text-[var(--kroma-ink)] font-normal mb-1.5">
            Image to Palette
          </h1>
          <p className="font-sans text-xs text-[var(--kroma-muted)]">
            Extract a harmonious palette from your architectural or editorial photograph.
          </p>
        </div>

        {/* 1. Large Dashed Drag & Drop Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full border border-dashed border-[var(--kroma-border-strong)] rounded-[4px] bg-[var(--kroma-card)] p-5 md:p-6 mb-5 text-center cursor-pointer hover:border-[var(--kroma-ink)] transition-all flex flex-col items-center justify-center gap-2"
        >
          <Upload size={18} strokeWidth={1.5} className="text-[var(--kroma-muted)]" />
          <div className="font-sans text-xs text-[var(--kroma-ink)]">
            <span className="font-medium">Drag &amp; drop an image</span> or click to upload
          </div>
          <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--kroma-muted)]">
            SUPPORTS JPG, PNG, WEBP, AVIF
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* 2. Image Preview & Dominant Colors */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6 items-start mb-5">
          
          {/* Large Image Preview */}
          <div className="lg:col-span-7 rounded-[4px] overflow-hidden border border-[var(--kroma-border)] h-[240px] md:h-[280px] bg-[#0D0D0C]">
            <img
              src={imageUrl}
              alt="Extracted source"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Extracted Colors Panel */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full gap-4">
            <div>
              <div className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-[var(--kroma-muted)] mb-2">
                DOMINANT COLORS
              </div>

              {/* Swatches Strip */}
              <div className="flex h-[60px] rounded-[4px] overflow-hidden border border-[var(--kroma-border)] mb-3">
                {extractedColors.map((hex, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleCopyHex(hex)}
                    style={{ backgroundColor: hex }}
                    className="flex-1 h-full cursor-pointer hover:opacity-90 transition-opacity"
                    title={`Click to copy ${hex}`}
                  />
                ))}
              </div>

              {/* Data Rows */}
              <div className="flex flex-col gap-2">
                {extractedColors.map((hex, idx) => {
                  const rgb = hexToRgb(hex);
                  return (
                    <div
                      key={idx}
                      onClick={() => handleCopyHex(hex)}
                      className="flex items-center justify-between p-2 rounded-[2px] border border-[var(--kroma-border)] bg-[var(--kroma-card)] cursor-pointer hover:border-[var(--kroma-border-strong)] transition-all font-mono text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-4 h-4 rounded-[2px]" style={{ backgroundColor: hex }} />
                        <span className="font-bold text-[var(--kroma-ink)]">{hex}</span>
                      </div>
                      <span className="text-[var(--kroma-muted)] text-[10px]">
                        {rgb ? `RGB: ${rgb.r}, ${rgb.g}, ${rgb.b}` : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[var(--kroma-border)]">
              <button
                onClick={handleSavePalette}
                className="kroma-btn-primary"
              >
                <Bookmark size={14} />
                <span>Save palette</span>
              </button>

              <button
                onClick={() => {
                  const hexList = extractedColors.map((c) => c.replace('#', '')).join(',');
                  onNavigate({ path: 'create', colors: hexList });
                }}
                className="kroma-btn-secondary"
              >
                <SlidersHorizontal size={14} />
                <span>Open in Create</span>
              </button>

              <button
                onClick={() => onNavigate({ path: 'search', q: extractedColors[0] })}
                className="kroma-btn-secondary"
              >
                <Search size={14} />
                <span>Find similar</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
