import React, { useState } from 'react';
import {
  MeshGradientConfig,
  generateMeshCss,
  generateMeshSvg,
  generateMeshTokensJson,
  hexToRgb,
} from '../../utils/meshEngine';
import { StudioCodeBlock } from '../studio/StudioCodeBlock';
import { Download, Image, Code2, FileJson, Sparkles } from 'lucide-react';

interface MeshCodeExportProps {
  config: MeshGradientConfig;
  sourceUrl?: string;
}

export const MeshCodeExport: React.FC<MeshCodeExportProps> = ({
  config,
  sourceUrl,
}) => {
  const [activeTab, setActiveTab] = useState<'css' | 'svg' | 'tokens'>('css');
  const [rasterWidth, setRasterWidth] = useState(1920);
  const [rasterHeight, setRasterHeight] = useState(1080);
  const [rasterFormat, setRasterFormat] = useState<'png' | 'webp'>('png');
  const [isExportingImage, setIsExportingImage] = useState(false);

  const cssCode = generateMeshCss(config);
  const svgCode = generateMeshSvg(config, rasterWidth, rasterHeight);
  const jsonTokens = generateMeshTokensJson(config, sourceUrl);

  const exportTabs: { id: 'css' | 'svg' | 'tokens'; label: string; icon?: React.ReactNode }[] = [
    {
      id: 'css',
      label: 'CSS Rules',
      icon: <Code2 size={13} />,
    },
    {
      id: 'svg',
      label: 'SVG Vector',
      icon: <Image size={13} />,
    },
    {
      id: 'tokens',
      label: 'DTCG Tokens',
      icon: <FileJson size={13} />,
    },
  ];

  const currentTabConfig = {
    css: { code: cssCode, filename: 'mesh-gradient.css', language: 'css', mimeType: 'text/css' },
    svg: { code: svgCode, filename: 'mesh-gradient.svg', language: 'xml', mimeType: 'image/svg+xml' },
    tokens: { code: jsonTokens, filename: 'mesh-tokens.json', language: 'json', mimeType: 'application/json' },
  }[activeTab];

  // Render high-resolution canvas offscreen and trigger download
  const handleDownloadRaster = () => {
    setIsExportingImage(true);

    try {
      const offscreen = document.createElement('canvas');
      offscreen.width = rasterWidth;
      offscreen.height = rasterHeight;
      const ctx = offscreen.getContext('2d');
      if (!ctx) return;

      // 1. Base Background
      if (config.background === 'solid') {
        ctx.fillStyle = config.solidColor;
        ctx.fillRect(0, 0, rasterWidth, rasterHeight);
      } else if (config.background === 'canvas') {
        ctx.fillStyle = '#090A0C';
        ctx.fillRect(0, 0, rasterWidth, rasterHeight);
      }

      // 2. Radial Multi-Pass Blend
      ctx.save();
      if (config.rotation !== 0 || config.scale !== 1.0) {
        ctx.translate(rasterWidth / 2, rasterHeight / 2);
        ctx.rotate((config.rotation * Math.PI) / 180);
        ctx.scale(config.scale, config.scale);
        ctx.translate(-rasterWidth / 2, -rasterHeight / 2);
      }

      config.points.forEach((point) => {
        const px = (point.x / 100) * rasterWidth;
        const py = (point.y / 100) * rasterHeight;
        const maxDim = Math.max(rasterWidth, rasterHeight);
        const radius = maxDim * 0.55 * point.influence * config.softness;

        const gradient = ctx.createRadialGradient(px, py, 0, px, py, Math.max(10, radius));
        const rgb = hexToRgb(point.color);
        const baseAlpha = Math.min(1.0, 0.95 * config.intensity);

        gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${baseAlpha})`);
        gradient.addColorStop(0.4, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${baseAlpha * 0.6})`);
        gradient.addColorStop(0.8, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${baseAlpha * 0.15})`);
        gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, rasterWidth, rasterHeight);
      });
      ctx.restore();

      // 3. Optional Grain
      if (config.grain > 0) {
        const grainFactor = (config.grain / 100) * 0.15;
        const grainCanvas = document.createElement('canvas');
        grainCanvas.width = 128;
        grainCanvas.height = 128;
        const gCtx = grainCanvas.getContext('2d');
        if (gCtx) {
          const imgData = gCtx.createImageData(128, 128);
          for (let i = 0; i < imgData.data.length; i += 4) {
            const val = Math.random() * 255;
            imgData.data[i] = val;
            imgData.data[i + 1] = val;
            imgData.data[i + 2] = val;
            imgData.data[i + 3] = val * grainFactor;
          }
          gCtx.putImageData(imgData, 0, 0);

          ctx.save();
          ctx.globalCompositeOperation = 'overlay';
          const pattern = ctx.createPattern(grainCanvas, 'repeat');
          if (pattern) {
            ctx.fillStyle = pattern;
            ctx.fillRect(0, 0, rasterWidth, rasterHeight);
          }
          ctx.restore();
        }
      }

      // Convert to blob and download
      const mime = rasterFormat === 'webp' ? 'image/webp' : 'image/png';
      offscreen.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mesh-gradient-${rasterWidth}x${rasterHeight}.${rasterFormat}`;
        a.click();
        URL.revokeObjectURL(url);
        setIsExportingImage(false);
      }, mime, 0.95);
    } catch (err) {
      console.error('Raster export failed:', err);
      setIsExportingImage(false);
    }
  };

  return (
    <section id="mesh-code-export" className="w-full flex flex-col gap-5">
      <div>
        <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] flex items-center gap-2 tracking-tight">
          <Code2 size={18} style={{ color: 'var(--color-primary-text)' }} />
          <span>Code, Vector &amp; Image Export</span>
        </h2>
        <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
          Export as multi-radial CSS, resolution-independent SVG, DTCG design tokens, or high-res PNG/WebP.
        </p>
      </div>

      {/* Raster Image Direct Download Panel */}
      <div
        className="w-full bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
        style={{ borderRadius: 'var(--radius-md)' }}
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Image size={16} style={{ color: 'var(--color-primary-text)' }} />
            <h3 className="text-xs sm:text-sm font-bold font-mono text-[var(--text-primary)]">
              High-Resolution Raster Image Download
            </h3>
          </div>
          <p className="text-xs text-[var(--text-tertiary)]">
            Render offscreen canvas directly to lossless PNG or WebP with full resolution scaling.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Preset Resolution Buttons */}
          <div className="flex items-center gap-1 bg-[var(--bg-surface-2)] p-1 rounded-xs border border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={() => {
                setRasterWidth(1200);
                setRasterHeight(800);
              }}
              className={`px-2.5 py-1 text-xs font-mono rounded-xs transition-colors cursor-pointer ${
                rasterWidth === 1200 && rasterHeight === 800
                  ? 'bg-[var(--bg-surface-1)] text-[var(--text-primary)] font-bold shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              1200 × 800
            </button>
            <button
              type="button"
              onClick={() => {
                setRasterWidth(1920);
                setRasterHeight(1080);
              }}
              className={`px-2.5 py-1 text-xs font-mono rounded-xs transition-colors cursor-pointer ${
                rasterWidth === 1920 && rasterHeight === 1080
                  ? 'bg-[var(--bg-surface-1)] text-[var(--text-primary)] font-bold shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              1080p
            </button>
            <button
              type="button"
              onClick={() => {
                setRasterWidth(3840);
                setRasterHeight(2160);
              }}
              className={`px-2.5 py-1 text-xs font-mono rounded-xs transition-colors cursor-pointer ${
                rasterWidth === 3840 && rasterHeight === 2160
                  ? 'bg-[var(--bg-surface-1)] text-[var(--text-primary)] font-bold shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              4K UHD
            </button>
          </div>

          {/* Format Selector */}
          <div className="flex items-center bg-[var(--bg-surface-2)] p-1 rounded-xs border border-[var(--border-subtle)]">
            {(['png', 'webp'] as const).map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => setRasterFormat(fmt)}
                className={`px-2.5 py-1 text-xs font-mono uppercase rounded-xs transition-colors cursor-pointer ${
                  rasterFormat === fmt
                    ? 'bg-[var(--bg-surface-1)] text-[var(--text-primary)] font-bold shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>

          {/* Download Button */}
          <button
            type="button"
            onClick={handleDownloadRaster}
            disabled={isExportingImage}
            className="btn-studio-primary"
            style={{ padding: '7px 16px', fontSize: '0.8rem' }}
          >
            <Download size={14} />
            <span>{isExportingImage ? 'Rendering...' : `Download ${rasterFormat.toUpperCase()}`}</span>
          </button>
        </div>
      </div>

      {/* Code, SVG & Token Exporter Block */}
      <StudioCodeBlock
        tabs={exportTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        code={currentTabConfig.code}
        filename={currentTabConfig.filename}
        language={currentTabConfig.language}
        mimeType={currentTabConfig.mimeType}
      />
    </section>
  );
};
