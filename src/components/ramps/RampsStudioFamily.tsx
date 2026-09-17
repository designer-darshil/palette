import React from 'react';
import { RouteType } from '../../types';
import { Sparkles, Activity, Volume2, Box, Type, Compass, ArrowUpRight } from 'lucide-react';

interface RampsStudioFamilyProps {
  onNavigate: (route: RouteType) => void;
  currentTool?: 'ramps' | 'antigravity';
}

interface StudioTool {
  id: string;
  name: string;
  tagline: string;
  desc: string;
  icon: React.ReactNode;
  active: boolean;
  status: string;
  internalRoute?: RouteType;
}

export const RampsStudioFamily: React.FC<RampsStudioFamilyProps> = ({ onNavigate, currentTool = 'ramps' }) => {
  const tools: StudioTool[] = [
    {
      id: 'ramps',
      name: 'Ramps Studio',
      tagline: 'Perceptual OKLCH Scales & Semantic Tokens',
      desc: 'Build perceptually-even color ramps (50–950), scheme-derived harmonies, and WCAG AA/AAA tokens.',
      icon: <Sparkles size={16} className="text-[var(--accent-gold)]" />,
      active: currentTool === 'ramps',
      internalRoute: currentTool !== 'ramps' ? ({ path: 'ramps' } as RouteType) : undefined,
      status: currentTool === 'ramps' ? 'Active' : 'Live Tool',
    },
    {
      id: 'antigravity',
      name: 'Antigravity Studio',
      tagline: 'Physics Simulation & Motion Generator',
      desc: 'Experiment with gravity, velocity, bounce, and damping with real-time exports to CSS and JavaScript.',
      icon: <Compass size={16} className="text-[var(--accent-blue)]" />,
      active: currentTool === 'antigravity',
      internalRoute: currentTool !== 'antigravity' ? ({ path: 'antigravity' } as RouteType) : undefined,
      status: currentTool === 'antigravity' ? 'Active' : 'Live Tool',
    },
    {
      id: 'springs',
      name: 'Springs Studio',
      tagline: 'Motion Curves & Easings',
      desc: 'Interactive spring physics curves, duration scales, and easing presets for UI components.',
      icon: <Activity size={16} className="text-emerald-400" />,
      active: false,
      status: 'Coming Soon',
    },
    {
      id: 'beeps',
      name: 'Beeps Studio',
      tagline: 'Synthesized UI Soundscapes',
      desc: 'Synthesized micro-auditory feedback created via the Web Audio API without heavy sound assets.',
      icon: <Volume2 size={16} className="text-cyan-400" />,
      active: false,
      status: 'Coming Soon',
    },
    {
      id: 'depths',
      name: 'Depths Studio',
      tagline: 'Elevation & Multi-Stop Shadows',
      desc: 'Physically calculated shadow ramps and atmospheric elevation derived from directional light sources.',
      icon: <Box size={16} className="text-purple-400" />,
      active: false,
      status: 'Coming Soon',
    },
    {
      id: 'texts',
      name: 'Texts Studio',
      tagline: 'Fluid Typography & Modular Scales',
      desc: 'Modular typography scales that fluidly interpolate across responsive viewport breakpoints.',
      icon: <Type size={16} className="text-rose-400" />,
      active: false,
      status: 'Coming Soon',
    },
  ];

  return (
    <section id="studio-tools-family" className="w-full flex flex-col gap-4 pt-6 border-t border-[var(--border-subtle)]">
      <div>
        <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] flex items-center gap-2 tracking-tight">
          <span>PaletteParadise Studio Tools</span>
        </h2>
        <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
          First-class creative engineering utilities for design systems, web animation, and AI coding agents.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {tools.map((t) => (
          <div
            key={t.id}
            className={`p-4 rounded-md border flex flex-col justify-between gap-3 transition-all ${
              t.active
                ? 'bg-[var(--bg-surface-2)] border-[var(--border-strong)] shadow-xs'
                : 'bg-[var(--bg-surface-1)] border-[var(--border-subtle)] hover:border-[var(--border-medium)]'
            }`}
            style={{ borderRadius: 'var(--radius-md)' }}
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xs bg-[var(--bg-surface-3)] border border-[var(--border-subtle)]">
                    {t.icon}
                  </div>
                  <span className="font-bold text-sm text-[var(--text-primary)] font-mono">
                    {t.name}
                  </span>
                </div>

                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded-xs border font-bold uppercase ${
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
                className="inline-flex items-center gap-1 text-[11px] font-mono text-[var(--accent-blue)] hover:underline pt-2 border-t border-[var(--border-subtle)] cursor-pointer text-left"
              >
                <span>Launch {t.name}</span>
                <ArrowUpRight size={12} />
              </button>
            ) : t.active ? (
              <div className="text-[11px] font-mono text-emerald-400 pt-2 border-t border-[var(--border-subtle)] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                <span>Currently Active</span>
              </div>
            ) : (
              <div className="text-[11px] font-mono text-[var(--text-tertiary)] pt-2 border-t border-[var(--border-subtle)]">
                <span>In Development</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
