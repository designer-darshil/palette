import React from 'react';
import { RouteType } from '../../types';
import { Sparkles, Activity, Volume2, Box, Type, Compass, ArrowUpRight } from 'lucide-react';

interface RampsStudioFamilyProps {
  onNavigate: (route: RouteType) => void;
}

interface StudioTool {
  id: string;
  name: string;
  tagline: string;
  desc: string;
  icon: React.ReactNode;
  active: boolean;
  status: string;
  url?: string;
  internalRoute?: RouteType;
}

export const RampsStudioFamily: React.FC<RampsStudioFamilyProps> = ({ onNavigate }) => {
  const tools: StudioTool[] = [
    {
      id: 'ramps',
      name: 'Ramps',
      tagline: 'Color Scales & Semantic Tokens',
      desc: 'Perceptually-even OKLCH scales and accessible semantic tokens from a single brand color anchor.',
      icon: <Sparkles size={16} className="text-amber-400" />,
      active: true,
      status: 'Active Tool',
    },
    {
      id: 'antigravity',
      name: 'Antigravity',
      tagline: 'Physics & Kinetic Motion',
      desc: 'Physics-driven UI motion generator with deterministic parameters, collision bounds, and code exports.',
      icon: <Compass size={16} className="text-cyan-400" />,
      active: false,
      internalRoute: { path: 'antigravity' } as RouteType,
      status: 'Live on Suite',
    },
    {
      id: 'springs',
      name: 'Springs',
      tagline: 'Motion, Easings & Physics',
      desc: 'Spring physics curves, duration scales, and easing presets previewable on interactive components.',
      icon: <Activity size={16} className="text-blue-400" />,
      active: false,
      status: 'In Development',
    },
    {
      id: 'beeps',
      name: 'Beeps',
      tagline: 'UI Sounds & Synthesized Feedback',
      desc: 'A coherent set of interface auditory cues synthesized via Web Audio API rather than bloated samples.',
      icon: <Volume2 size={16} className="text-emerald-400" />,
      active: false,
      status: 'In Development',
    },
    {
      id: 'depths',
      name: 'Depths',
      tagline: 'Elevation & Multi-Layer Shadows',
      desc: 'Atmospheric depth and multi-stop shadow ramps derived deterministically from an optical light source.',
      icon: <Box size={16} className="text-purple-400" />,
      active: false,
      status: 'In Development',
    },
    {
      id: 'texts',
      name: 'Texts',
      tagline: 'Fluid Typography & Modular Scales',
      desc: 'Perceptual modular typography scales that fluidly interpolate across responsive viewports.',
      icon: <Type size={16} className="text-rose-400" />,
      active: false,
      status: 'In Development',
    },
  ];

  return (
    <section id="studio-tools-family" className="w-full flex flex-col gap-5 pt-6 border-t border-[var(--border-subtle)]">
      <div>
        <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] flex items-center gap-2 tracking-tight">
          <span>Studio Tools Family</span>
        </h2>
        <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
          A coherent suite of focused, machine-readable design utilities. Zero tracking, zero telemetry, fully agent-accessible.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((t) => (
          <div
            key={t.id}
            className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all ${
              t.active
                ? 'bg-[var(--bg-surface-2)] border-[var(--border-strong)] shadow-xs'
                : 'bg-[var(--bg-surface-1)] border-[var(--border-subtle)] hover:border-[var(--border-medium)]'
            }`}
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-[var(--bg-surface-3)] border border-[var(--border-subtle)]">
                    {t.icon}
                  </div>
                  <span className="font-bold text-sm text-[var(--text-primary)] font-mono">
                    {t.name}
                  </span>
                </div>

                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                    t.active
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-[var(--bg-surface-3)] text-[var(--text-tertiary)] border-[var(--border-subtle)]'
                  }`}
                >
                  {t.status}
                </span>
              </div>

              <div className="text-xs font-bold text-[var(--text-secondary)]">
                {t.tagline}
              </div>

              <p className="text-[11px] text-[var(--text-tertiary)] leading-relaxed">
                {t.desc}
              </p>
            </div>

            {t.internalRoute ? (
              <button
                type="button"
                onClick={() => {
                  onNavigate(t.internalRoute!);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:underline pt-2 border-t border-[var(--border-subtle)] cursor-pointer text-left"
              >
                <span>Launch Antigravity Studio</span>
                <ArrowUpRight size={12} />
              </button>
            ) : t.url ? (
              <a
                href={t.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-mono text-[var(--text-link)] hover:underline pt-2 border-t border-[var(--border-subtle)]"
              >
                <span>Launch Tool</span>
                <ArrowUpRight size={12} />
              </a>
            ) : t.active ? (
              <div className="text-[11px] font-mono text-emerald-400 pt-2 border-t border-[var(--border-subtle)] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                <span>Currently Active</span>
              </div>
            ) : (
              <div className="text-[11px] font-mono text-[var(--text-tertiary)] pt-2 border-t border-[var(--border-subtle)]">
                <span>Coming to Suite</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
