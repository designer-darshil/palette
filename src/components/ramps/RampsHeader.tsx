import React, { useState } from 'react';
import { RouteType } from '../../types';
import { Sparkles, Terminal, Copy, Check, ExternalLink, ChevronDown, Wand2, Activity, Layers, Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface RampsHeaderProps {
  onNavigate: (route: RouteType) => void;
  onCopyPrompt: () => void;
  hasCopiedPrompt: boolean;
  onScrollToSection: (sectionId: string) => void;
  currentTool?: 'ramps' | 'antigravity';
}

export const RampsHeader: React.FC<RampsHeaderProps> = ({
  onNavigate,
  onCopyPrompt,
  hasCopiedPrompt,
  onScrollToSection,
  currentTool = 'ramps',
}) => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [familyOpen, setFamilyOpen] = useState(false);

  const cycleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('system');
    else setTheme('dark');
  };

  const familyTools = [
    { name: 'Ramps', desc: 'Color scales & semantic tokens', active: currentTool === 'ramps', path: { path: 'ramps' } as RouteType },
    { name: 'Antigravity', desc: 'Physics motion & token generator', active: currentTool === 'antigravity', path: { path: 'antigravity' } as RouteType },
    { name: 'Springs', desc: 'Motion curves, easings & physics', active: false, badge: 'Studio' },
    { name: 'Beeps', desc: 'Synthesized UI auditory feedback', active: false, badge: 'Studio' },
    { name: 'Depths', desc: 'Elevation & derived shadow ramps', active: false, badge: 'Studio' },
    { name: 'Texts', desc: 'Fluid typography & type scales', active: false, badge: 'Coming Soon' },
    { name: 'SVGs', desc: 'Icon optical grid alignment', active: false, badge: 'Coming Soon' },
  ];

  const rampsAnchors = [
    { id: 'ramps-generator', label: 'Generator' },
    { id: 'semantic-tokens', label: 'Tokens' },
    { id: 'live-preview', label: 'Preview' },
    { id: 'developer-export', label: 'Export' },
    { id: 'api-docs', label: 'API' },
  ];

  const antigravityAnchors = [
    { id: 'antigravity-playground', label: 'Playground' },
    { id: 'physics-controls', label: 'Controls' },
    { id: 'presets-gallery', label: 'Presets' },
    { id: 'developer-export', label: 'Export' },
    { id: 'api-docs', label: 'API' },
  ];

  const activeAnchors = currentTool === 'antigravity' ? antigravityAnchors : rampsAnchors;
  const toolName = currentTool === 'antigravity' ? 'Antigravity' : 'Ramps';
  const toolGlyph = currentTool === 'antigravity' ? 'A' : 'R';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)]/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Brand & Family Tool Switcher */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setFamilyOpen(!familyOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-[var(--bg-surface-2)] transition-colors border border-transparent hover:border-[var(--border-subtle)]"
              aria-expanded={familyOpen}
            >
              <div className="w-5 h-5 rounded bg-[var(--text-primary)] flex items-center justify-center text-[var(--text-inverse)] font-mono font-black text-xs">
                {toolGlyph}
              </div>
              <span className="font-bold text-sm tracking-tight text-[var(--text-primary)]">
                {toolName}
              </span>
              <span className="text-[11px] font-mono text-[var(--text-tertiary)] hidden sm:inline">
                by Studio Tools
              </span>
              <ChevronDown size={13} className={`text-[var(--text-tertiary)] transition-transform duration-200 ${familyOpen ? 'rotate-180' : ''}`} />
            </button>

            {familyOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-[var(--bg-surface-1)] border border-[var(--border-strong)] rounded-lg shadow-2xl p-2 z-50 flex flex-col gap-1 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 font-mono text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                  Studio Tools Ecosystem
                </div>
                {familyTools.map((tool) => (
                  <button
                    key={tool.name}
                    onClick={() => {
                      setFamilyOpen(false);
                      if (tool.path) onNavigate(tool.path);
                      else onScrollToSection('studio-tools-family');
                    }}
                    className={`w-full flex items-start justify-between p-2 rounded text-left transition-all ${
                      tool.active
                        ? 'bg-[var(--bg-surface-3)] text-[var(--text-primary)]'
                        : 'hover:bg-[var(--bg-surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                        <span>{tool.name}</span>
                        {tool.active && (
                          <span className="font-mono text-[9px] px-1.5 py-0.2 bg-emerald-500/15 text-emerald-400 rounded">
                            Active
                          </span>
                        )}
                        {!tool.active && tool.path && (
                          <span className="font-mono text-[9px] px-1.5 py-0.2 bg-[var(--bg-surface-3)] text-[var(--text-tertiary)] rounded">
                            Live
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[var(--text-tertiary)] leading-tight mt-0.5">
                        {tool.desc}
                      </p>
                    </div>
                    {tool.badge && !tool.active && (
                      <span className="font-mono text-[9px] px-1.5 py-0.5 bg-[var(--bg-surface-3)] text-[var(--text-tertiary)] rounded">
                        {tool.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Fast Navigation Anchors */}
          <nav className="hidden md:flex items-center gap-1 mr-2 text-xs font-mono text-[var(--text-secondary)]">
            {activeAnchors.map((anchor) => (
              <button
                key={anchor.id}
                onClick={() => onScrollToSection(anchor.id)}
                className="px-2.5 py-1 rounded hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)] transition-colors"
              >
                {anchor.label}
              </button>
            ))}
          </nav>

          {/* Copy Prompt for Agent */}
          <button
            onClick={onCopyPrompt}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] text-xs font-mono font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-3)] hover:border-[var(--border-medium)] transition-all shadow-xs"
            title="Copy prompt instructions ready for coding agents"
          >
            {hasCopiedPrompt ? (
              <>
                <Check size={13} className="text-emerald-400" />
                <span className="text-emerald-400">Prompt Copied!</span>
              </>
            ) : (
              <>
                <Terminal size={13} className="text-[var(--text-tertiary)]" />
                <span>Agent Prompt</span>
              </>
            )}
          </button>

          {/* Theme switcher */}
          <button
            onClick={cycleTheme}
            className="p-1.5 rounded bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === 'system' ? (
              <Monitor size={14} />
            ) : resolvedTheme === 'dark' ? (
              <Moon size={14} />
            ) : (
              <Sun size={14} className="text-amber-400" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
