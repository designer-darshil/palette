import React, { useState } from 'react';
import { Layout, Smartphone, BookOpen, Sparkles, Layers } from 'lucide-react';
import { PaletteItem } from '../types';
import { getTextColorForBackground } from '../utils/colorUtils';
import { KromaButton } from './common/KromaButton';

interface PalettePreviewModesProps {
  palette: PaletteItem;
}

export type PreviewMode = 'basic' | 'ui' | 'editorial' | 'mobile' | 'branding';

export const PalettePreviewModes: React.FC<PalettePreviewModesProps> = ({ palette }) => {
  const [activeMode, setActiveMode] = useState<PreviewMode>('ui');

  const bg = palette.colors[0]?.hex || '#111215';
  const c1 = palette.colors[1]?.hex || '#E63946';
  const c2 = palette.colors[2]?.hex || '#8D99AE';
  const c3 = palette.colors[3]?.hex || '#E9C46A';
  const c4 = palette.colors[4]?.hex || '#FFFFFF';

  const bgText = getTextColorForBackground(bg);
  const c1Text = getTextColorForBackground(c1);

  return (
    <div className="p-4 sm:p-6 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md flex flex-col gap-4">
      {/* Mode Switcher Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold tracking-tight text-[var(--text-primary)]">
            Interactive Product Preview Proofs
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
            Simulate how this calibrated chromatic system performs across real-world digital contexts.
          </p>
        </div>

        <div className="flex flex-wrap gap-1">
          <KromaButton
            type="button"
            variant={activeMode === 'ui' ? 'filled' : 'subtle'}
            size="sm"
            className="text-xs px-2.5 py-1 min-h-[30px]"
            onClick={() => setActiveMode('ui')}
            iconLeft={<Layout size={12} />}
          >
            <span>SaaS Dashboard</span>
          </KromaButton>
          <KromaButton
            type="button"
            variant={activeMode === 'editorial' ? 'filled' : 'subtle'}
            size="sm"
            className="text-xs px-2.5 py-1 min-h-[30px]"
            onClick={() => setActiveMode('editorial')}
            iconLeft={<BookOpen size={12} />}
          >
            <span>Editorial</span>
          </KromaButton>
          <KromaButton
            type="button"
            variant={activeMode === 'mobile' ? 'filled' : 'subtle'}
            size="sm"
            className="text-xs px-2.5 py-1 min-h-[30px]"
            onClick={() => setActiveMode('mobile')}
            iconLeft={<Smartphone size={12} />}
          >
            <span>Mobile App</span>
          </KromaButton>
          <KromaButton
            type="button"
            variant={activeMode === 'branding' ? 'filled' : 'subtle'}
            size="sm"
            className="text-xs px-2.5 py-1 min-h-[30px]"
            onClick={() => setActiveMode('branding')}
            iconLeft={<Sparkles size={12} />}
          >
            <span>Branding Identity</span>
          </KromaButton>
        </div>
      </div>

      {/* Mode 1: UI / SaaS Dashboard */}
      {activeMode === 'ui' && (
        <div
          className="rounded-md p-4 sm:p-6 border flex flex-col gap-4 shadow-lg transition-all"
          style={{ backgroundColor: bg, color: bgText, borderColor: 'var(--border-strong)' }}
        >
          {/* Simulated App Header */}
          <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: `${c2}33` }}>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c1 }} />
              <span className="font-bold text-xs font-mono tracking-wider">{palette.title.toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-xs" style={{ backgroundColor: `${c2}22`, color: c4 }}>
                v2.4 TELEMETRY
              </span>
            </div>
          </div>

          {/* Simulated Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xs border" style={{ backgroundColor: `${c2}11`, borderColor: `${c2}25` }}>
              <span className="text-[10px] font-mono uppercase" style={{ color: c2 }}>Active Sessions</span>
              <div className="text-2xl font-extrabold mt-1" style={{ color: c4 }}>128,490</div>
              <span className="text-[10px] font-mono" style={{ color: c1 }}>+14.8% vs last cycle</span>
            </div>
            <div className="p-3.5 rounded-xs border" style={{ backgroundColor: `${c2}11`, borderColor: `${c2}25` }}>
              <span className="text-[10px] font-mono uppercase" style={{ color: c2 }}>Throughput</span>
              <div className="text-2xl font-extrabold mt-1" style={{ color: c3 }}>99.98%</div>
              <span className="text-[10px] font-mono" style={{ color: c2 }}>OKLCH Calibrated</span>
            </div>
            <div className="p-3.5 rounded-xs border" style={{ backgroundColor: `${c2}11`, borderColor: `${c2}25` }}>
              <span className="text-[10px] font-mono uppercase" style={{ color: c2 }}>Error Rate</span>
              <div className="text-2xl font-extrabold mt-1" style={{ color: c1 }}>0.002%</div>
              <span className="text-[10px] font-mono" style={{ color: c2 }}>Zero friction</span>
            </div>
          </div>

          {/* Primary & Secondary Action row */}
          <div className="flex items-center gap-3 pt-2">
            <KromaButton
              type="button"
              variant="filled"
              size="sm"
              className="font-bold text-xs uppercase tracking-wider shadow-sm cursor-default"
              style={{ backgroundColor: c1, color: c1Text }}
            >
              Deploy Pipeline
            </KromaButton>
            <KromaButton
              type="button"
              variant="outline"
              size="sm"
              className="font-semibold text-xs border cursor-default"
              style={{ borderColor: c2, color: c4 }}
            >
              Inspect Logs
            </KromaButton>
          </div>
        </div>
      )}

      {/* Mode 2: Editorial Magazine */}
      {activeMode === 'editorial' && (
        <div
          className="rounded-md p-6 sm:p-10 border flex flex-col gap-6 shadow-lg transition-all"
          style={{ backgroundColor: bg, color: bgText, borderColor: 'var(--border-strong)' }}
        >
          <div className="border-b-2 pb-2" style={{ borderColor: c1 }}>
            <span className="font-mono text-[11px] font-bold tracking-widest uppercase" style={{ color: c3 }}>
              DISPATCH Nº 48 · CHROMA &amp; ARCHITECTURE
            </span>
          </div>

          <div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-3" style={{ color: c4 }}>
              The Modernist Grammar of Relational Pigments
            </h2>
            <p className="text-xs sm:text-base leading-relaxed max-w-2xl" style={{ color: c2 }}>
              Color functions as structural scaffolding rather than superficial decoration. Through rigorous luminance calibration and semantic hierarchy, interfaces communicate without unnecessary visual noise.
            </p>
          </div>

          <div className="p-4 border-l-4" style={{ borderColor: c1, backgroundColor: `${c2}15` }}>
            <p className="text-xs italic" style={{ color: c3 }}>
              "Perceptually uniform spaces unlock mathematical precision in digital design systems."
            </p>
          </div>
        </div>
      )}

      {/* Mode 3: Mobile App */}
      {activeMode === 'mobile' && (
        <div className="flex justify-center p-4">
          <div
            className="w-full max-w-[280px] rounded-2xl border-4 p-4 flex flex-col gap-4 shadow-xl"
            style={{ backgroundColor: bg, color: bgText, borderColor: `${c2}44` }}
          >
            <div className="flex justify-between items-center text-[10px] font-mono" style={{ color: c2 }}>
              <span>9:41</span>
              <span>5G 100%</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs" style={{ backgroundColor: c1, color: c1Text }}>
                KP
              </div>
              <div>
                <div className="font-bold text-xs" style={{ color: c4 }}>Portfolio Balance</div>
                <div className="text-lg font-black" style={{ color: c3 }}>$42,850.00</div>
              </div>
            </div>

            <div className="p-3 rounded-lg flex flex-col gap-1" style={{ backgroundColor: `${c2}18` }}>
              <div className="text-[10px] font-mono" style={{ color: c2 }}>Recent Allocation</div>
              <div className="text-xs font-bold" style={{ color: c4 }}>Swiss Modernism Fund</div>
              <div className="text-[10px] font-mono" style={{ color: c1 }}>+$1,240.50 (3.2%)</div>
            </div>

            <KromaButton
              type="button"
              variant="filled"
              size="md"
              className="w-full rounded-lg font-bold text-xs uppercase tracking-wider text-center"
              style={{ backgroundColor: c1, color: c1Text }}
            >
              Instant Transfer
            </KromaButton>
          </div>
        </div>
      )}

      {/* Mode 4: Branding Identity */}
      {activeMode === 'branding' && (
        <div
          className="rounded-md p-8 sm:p-12 border flex flex-col items-center justify-center text-center gap-4 shadow-lg transition-all"
          style={{ backgroundColor: bg, color: bgText, borderColor: 'var(--border-strong)' }}
        >
          <div
            className="w-20 h-20 rounded-xl flex items-center justify-center shadow-lg transform -rotate-3"
            style={{ backgroundColor: c1, color: c1Text }}
          >
            <Layers size={36} />
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight" style={{ color: c4 }}>
            {palette.title}
          </h2>

          <p className="font-mono text-xs max-w-md tracking-wider uppercase" style={{ color: c3 }}>
            CALIBRATED BRAND IDENTITY · ACCESSIBLE AAA GAMUT
          </p>

          <div className="flex gap-2 mt-2">
            {palette.colors.map((c, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 border-white/20 shadow-md"
                style={{ backgroundColor: c.hex }}
                title={`${c.name} (${c.hex})`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
