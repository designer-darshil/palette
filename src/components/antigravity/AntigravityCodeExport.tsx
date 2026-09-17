import React, { useState, useMemo } from 'react';
import {
  AntigravityConfig,
  generateCssExport,
  generateJsExport,
  generateFramerMotionExport,
  generateMotionTokens,
  generateAgentPrompt,
} from '../../utils/antigravityEngine';
import { Code, Copy, Check, Download, Terminal, FileCode, FileJson, Sparkles } from 'lucide-react';

interface AntigravityCodeExportProps {
  config: AntigravityConfig;
  sourceUrl: string;
}

type ExportTab = 'css' | 'js' | 'react' | 'json' | 'prompt';

export const AntigravityCodeExport: React.FC<AntigravityCodeExportProps> = ({ config, sourceUrl }) => {
  const [activeTab, setActiveTab] = useState<ExportTab>('css');
  const [copiedTab, setCopiedTab] = useState<ExportTab | null>(null);

  const cssCode = useMemo(() => generateCssExport(config, sourceUrl), [config, sourceUrl]);
  const jsCode = useMemo(() => generateJsExport(config, sourceUrl), [config, sourceUrl]);
  const reactCode = useMemo(() => generateFramerMotionExport(config, sourceUrl), [config, sourceUrl]);
  const jsonCode = useMemo(() => JSON.stringify(generateMotionTokens(config), null, 2), [config]);
  const promptCode = useMemo(() => generateAgentPrompt(config, sourceUrl), [config, sourceUrl]);

  const getActiveContent = () => {
    switch (activeTab) {
      case 'css': return cssCode;
      case 'js': return jsCode;
      case 'react': return reactCode;
      case 'json': return jsonCode;
      case 'prompt': return promptCode;
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
    let filename = `antigravity-${config.preset || 'custom'}.css`;
    let type = 'text/css';

    if (activeTab === 'js') {
      filename = `antigravity-motion.js`;
      type = 'application/javascript';
    } else if (activeTab === 'react') {
      filename = `AntigravityMotion.tsx`;
      type = 'text/typescript';
    } else if (activeTab === 'json') {
      filename = `motion-tokens.json`;
      type = 'application/json';
    } else if (activeTab === 'prompt') {
      filename = `antigravity-prompt.txt`;
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
    { id: 'css', label: 'CSS Keyframes', icon: <FileCode size={13} /> },
    { id: 'js', label: 'JavaScript Loop', icon: <Code size={13} /> },
    { id: 'react', label: 'React / Motion', icon: <Sparkles size={13} /> },
    { id: 'json', label: 'Motion Tokens (JSON)', icon: <FileJson size={13} /> },
    { id: 'prompt', label: 'Agent Hand-off', icon: <Terminal size={13} /> },
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
            Physics kinematics compiled into CSS approximations, vanilla JS integration loops, React components, and DTCG design tokens.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-3)] transition-all"
            title="Download code file"
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

      {/* Code Viewer Container */}
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
            Deterministic · Reduced-Motion Verified
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
