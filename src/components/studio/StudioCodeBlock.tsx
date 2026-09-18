import React, { useState } from 'react';
import { Copy, Check, Download, FileCode } from 'lucide-react';

export interface StudioExportTab<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
}

interface StudioCodeBlockProps<T extends string = string> {
  title?: string;
  description?: string;
  tabs: StudioExportTab<T>[];
  activeTab: T;
  onTabChange: (tabId: T) => void;
  code: string;
  filename?: string;
  mimeType?: string;
  language?: string;
}

export const StudioCodeBlock = <T extends string>({
  title = 'Developer Code & Token Export',
  description = 'Deterministic output compiled for modern frontend stacks, design systems, and coding agents.',
  tabs,
  activeTab,
  onTabChange,
  code,
  filename = 'export.txt',
  mimeType = 'text/plain',
  language = 'css',
}: StudioCodeBlockProps<T>) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full flex flex-col gap-2.5 min-w-0">
      {/* Section Header */}
      <div className="flex flex-col gap-2 min-w-0">
        <div className="min-w-0">
          <h3 className="studio-section-title font-bold text-[var(--text-primary)] flex items-center gap-1.5 tracking-tight">
            <FileCode size={15} className="text-[var(--text-secondary)] flex-shrink-0" />
            <span className="studio-heading">{title}</span>
          </h3>
          {description && (
            <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5 leading-snug break-words">
              {description}
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <button
            type="button"
            onClick={handleDownload}
            className="btn-secondary studio-button flex-1 min-w-[90px] justify-center sm:flex-initial"
            style={{ padding: '5px 10px', fontSize: '0.75rem' }}
            title="Download file to your local workspace"
          >
            <Download size={12} className="flex-shrink-0" />
            <span>Download</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="btn-studio-primary studio-button flex-1 min-w-[100px] justify-center sm:flex-initial"
            style={{ padding: '5px 12px', fontSize: '0.75rem' }}
            title="Copy code to clipboard"
          >
            {copied ? (
              <>
                <Check size={12} className="flex-shrink-0" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={12} className="flex-shrink-0" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Container with Tabs Header */}
      <div
        className="code-wrapper rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface-1)] shadow-xs"
        style={{ borderRadius: 'var(--radius-md)' }}
      >
        {/* Tab Navigation Header */}
        <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-2)]/70 min-w-0">
          <div className="code-tabs items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`code-tab flex items-center gap-1 px-2.5 py-1 rounded-xs text-[11px] font-mono font-medium transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[var(--bg-surface-1)] text-[var(--text-primary)] font-bold border border-[var(--border-medium)] shadow-2xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-3)]'
                }`}
                style={
                  activeTab === tab.id
                    ? {
                        borderColor: 'var(--color-primary-border)',
                        color: 'var(--text-primary)',
                      }
                    : {}
                }
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-[var(--text-tertiary)] pl-2 flex-shrink-0">
            <span>{code.split('\n').length}L</span>
            <span>•</span>
            <span className="uppercase">{language}</span>
          </div>
        </div>

        {/* Code Content Viewport (Strictly isolated horizontal scroll) */}
        <div className="code-editor relative p-3 max-h-[380px] bg-[var(--bg-surface-1)]">
          <pre
            className="font-mono text-[11px] leading-relaxed text-[var(--text-primary)] selection:bg-[var(--color-primary)] selection:text-[var(--color-primary-contrast)] m-0"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            <code>{code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
