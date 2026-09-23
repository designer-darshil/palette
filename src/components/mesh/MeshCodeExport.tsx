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
import { KromaButton } from '../common/KromaButton';

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
    <section id="mesh-code-export" className="w-full flex flex-col gap-4 min-w-0">
      {/* Raster Image Direct Download Panel */}
      <div
        className="w-full bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md p-3.5 flex flex-col gap-3 shadow-xs min-w-0"
        style={{ borderRadius: 'var(--radius-md)' }}
      >
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <Image size={14} style={{ color: 'var(--color-primary-text)' }} className="flex-shrink-0" />
            <h3 className="text-xs font-bold font-mono text-[var(--text-primary)] truncate">
              Raster Image Export
            </h3>
          </div>
          <p className="text-xs text-[var(--text-tertiary)] leading-snug">
            Render canvas directly to lossless PNG or WebP with full resolution scaling.
          </p>
        </div>

        {/* Controls Grid */}
        <div className="flex flex-col gap-2 min-w-0">
          {/* Row 1: Resolution Options */}
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-xs font-mono text-[var(--text-tertiary)] uppercase font-semibold">Resolution</span>
            <div className="grid grid-cols-3 gap-1 bg-[var(--bg-surface-2)] p-1 rounded-xs border border-[var(--border-subtle)] min-w-0">
              <KromaButton
                size="sm"
                variant={rasterWidth === 1200 && rasterHeight === 800 ? 'filled' : 'ghost'}
                onClick={() => {
                  setRasterWidth(1200);
                  setRasterHeight(800);
                }}
                className="py-1 text-xs font-mono rounded-xs text-center truncate"
              >
                1200×800
              </KromaButton>
              <KromaButton
                size="sm"
                variant={rasterWidth === 1920 && rasterHeight === 1080 ? 'filled' : 'ghost'}
                onClick={() => {
                  setRasterWidth(1920);
                  setRasterHeight(1080);
                }}
                className="py-1 text-xs font-mono rounded-xs text-center truncate"
              >
                1080p
              </KromaButton>
              <KromaButton
                size="sm"
                variant={rasterWidth === 3840 && rasterHeight === 2160 ? 'filled' : 'ghost'}
                onClick={() => {
                  setRasterWidth(3840);
                  setRasterHeight(2160);
                }}
                className="py-1 text-xs font-mono rounded-xs text-center truncate"
              >
                4K UHD
              </KromaButton>
            </div>
          </div>

          {/* Row 2: Format + Download Action */}
          <div className="flex items-center gap-2 min-w-0">
            {/* Format Selector */}
            <div className="flex items-center bg-[var(--bg-surface-2)] p-1 rounded-xs border border-[var(--border-subtle)] flex-shrink-0">
              {(['png', 'webp'] as const).map((fmt) => (
                <KromaButton
                  key={fmt}
                  size="sm"
                  variant={rasterFormat === fmt ? 'filled' : 'ghost'}
                  onClick={() => setRasterFormat(fmt)}
                  className="px-2 py-1 text-xs font-mono uppercase rounded-xs"
                >
                  {fmt}
                </KromaButton>
              ))}
            </div>

            {/* Download Button */}
            <KromaButton
              variant="filled"
              size="sm"
              onClick={handleDownloadRaster}
              disabled={isExportingImage}
              isLoading={isExportingImage}
              className="flex-1 justify-center whitespace-nowrap"
              iconLeft={<Download size={13} />}
            >
              <span className="whitespace-nowrap">{isExportingImage ? 'Rendering...' : `Download ${rasterFormat.toUpperCase()}`}</span>
            </KromaButton>
          </div>
        </div>
      </div>

      {/* Code, SVG & Token Exporter Block */}
      <StudioCodeBlock
        title="Developer Code & Token Export"
        description="Multi-radial CSS, SVG vector markup, and DTCG design tokens."
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
