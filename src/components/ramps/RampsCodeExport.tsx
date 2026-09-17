import React, { useState } from 'react';
import {
  GeneratedPaletteResult,
  exportToCssCustomProperties,
  exportToTailwindV4,
  exportToAgentPrompt,
} from '../../utils/rampsEngine';
import { Code, Copy, Check, Download, Terminal, FileJson, FileCode, CheckCircle2 } from 'lucide-react';

interface RampsCodeExportProps {
  paletteResult: GeneratedPaletteResult;
}

type ExportTab = 'css' | 'tailwind' | 'json' | 'prompt' | 'text';

export const RampsCodeExport: React.FC<RampsCodeExportProps> = ({ paletteResult }) => {
  const [activeTab, setActiveTab] = useState<ExportTab>('css');
  const [copiedTab, setCopiedTab] = useState<ExportTab | null>(null);

  const cssCode = React.useMemo(() => exportToCssCustomProperties(paletteResult), [paletteResult]);
  const tailwindCode = React.useMemo(() => exportToTailwindV4(paletteResult), [paletteResult]);
  const jsonCode = React.useMemo(() => JSON.stringify(paletteResult.rawJson, null, 2), [paletteResult]);
  const promptCode = React.useMemo(() => exportToAgentPrompt(paletteResult), [paletteResult]);
  const textCode = paletteResult.rawPlainText;

  const getActiveContent = () => {
    switch (activeTab) {
      case 'css': return cssCode;
      case 'tailwind': return tailwindCode;
      case 'json': return jsonCode;
      case 'prompt': return promptCode;
      case 'text': return textCode;
    }
  };

  const handleCopy = () => {
    const content = getActiveContent();
    navigator.clipboard.writeText(content);
    setCopiedTab(activeTab);
    setTimeout(() => setCopiedTab(null), 1800);
  };

  const handleDownload = () => {
    const content = getActiveContent();
    let filename = `ramps-tokens-${paletteResult.config.brand}.css`;
    let type = 'text/css';

    if (activeTab === 'json') {
      filename = `ramps-tokens-${paletteResult.config.brand}.json`;
      type = 'application/json';
    } else if (activeTab === 'tailwind') {
      filename = `tailwind.theme.css`;
      type = 'text/css';
    } else if (activeTab === 'prompt' || activeTab === 'text') {
      filename = `ramps-palette-${paletteResult.config.brand}.txt`;
      type = 'text/plain';
    }

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs: { id: ExportTab; label: string; icon: React.ReactNode }[] = [
    { id: 'css', label: 'CSS Variables', icon: <FileCode size={13} /> },
    { id: 'tailwind', label: 'Tailwind v4', icon: <Code size={13} /> },
    { id: 'json', label: 'JSON (DTCG)', icon: <FileJson size={13} /> },
    { id: 'prompt', label: 'Agent Hand-off', icon: <Terminal size={13} /> },
    { id: 'text', label: 'Plain Text Spec', icon: <FileCode size={13} /> },
  ];

  return (
    <section id="developer-export" className="w-full flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] flex items-center gap-2 tracking-tight">
            <Code size={18} className="text-[var(--text-secondary)]" />
            <span>Developer Code &amp; Token Export</span>
          </h2>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            Ready-to-use tokens compiled for modern web frameworks, design system packages, and coding agents.
          </p>
        </div>

        {/* Global Copy & Download Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-3)] transition-all"
            title="Download file to local machine"
          >
            <Download size={13} />
            <span>Download</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[var(--text-primary)] text-[var(--text-inverse)] text-xs font-mono font-bold hover:opacity-90 transition-all shadow-xs"
          >
            {copiedTab === activeTab ? (
              <>
                <Check size={13} className="text-emerald-400" />
                <span className="text-emerald-400">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>Copy {tabs.find((t) => t.id === activeTab)?.label}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Container */}
      <div className="w-full bg-[var(--bg-surface-1)] border border-[var(--border-medium)] rounded-xl overflow-hidden shadow-sm">
        {/* Tab Headers */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-surface-2)]/60 px-3 py-2 overflow-x-auto">
          <div className="flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[var(--bg-surface-1)] text-[var(--text-primary)] border border-[var(--border-strong)] shadow-xs'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="text-[10px] font-mono text-[var(--text-tertiary)] hidden md:block">
            UTF-8 · UTF-16 Safe · Pre-formatted
          </div>
        </div>

        {/* Code Content Block */}
        <div className="relative p-4 sm:p-5 max-h-96 overflow-y-auto font-mono text-xs text-[var(--text-secondary)] leading-relaxed bg-[var(--bg-canvas)]">
          <pre className="whitespace-pre overflow-x-auto select-all">
            <code>{getActiveContent()}</code>
          </pre>
        </div>
      </div>
    </section>
  );
};
