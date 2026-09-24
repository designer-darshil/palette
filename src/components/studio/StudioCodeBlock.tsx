import React, { useState } from 'react';
import { Copy, Check, Download, FileCode } from 'lucide-react';
import { KromaButton } from '../common/KromaButton';

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
          <h3 className="font-bold text-text-primary flex items-center gap-1.5 tracking-tight">
            <FileCode size={15} className="text-text-secondary flex-shrink-0" />
            <span className="font-display text-[13px] font-bold tracking-tight text-text-primary truncate">{title}</span>
          </h3>
          {description && (
            <p className="text-xs text-text-tertiary mt-0.5 leading-snug break-words">
              {description}
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <KromaButton
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownload}
            iconLeft={<Download size={12} />}
            title="Download file to your local workspace"
          >
            Download
          </KromaButton>

          <KromaButton
            type="button"
            variant="filled"
            size="sm"
            onClick={handleCopy}
            iconLeft={copied ? <Check size={12} /> : <Copy size={12} />}
            title="Copy code to clipboard"
          >
            {copied ? 'Copied!' : 'Copy Code'}
          </KromaButton>
        </div>
      </div>

      {/* Code Container with Tabs Header */}
      <div className="w-full min-w-0 max-w-full overflow-hidden rounded-md border border-border-subtle bg-surface-1 shadow-xs">
        {/* Tab Navigation Header */}
        <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-border-subtle bg-surface-2/70 min-w-0">
          <div className="flex min-w-0 max-w-full overflow-x-auto overflow-y-hidden items-center gap-1 scrollbar-none">
            {tabs.map((tab) => (
              <KromaButton
                key={tab.id}
                type="button"
                variant={activeTab === tab.id ? 'filled' : 'ghost'}
                size="sm"
                onClick={() => onTabChange(tab.id)}
                className={`shrink-0 whitespace-nowrap min-h-[28px] px-2.5 py-1 text-xs font-mono normal-case font-medium ${
                  activeTab === tab.id
                    ? 'font-bold shadow-2xs'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </KromaButton>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-text-tertiary pl-2 flex-shrink-0">
            <span>{code.split('\n').length}L</span>
            <span>•</span>
            <span className="uppercase">{language}</span>
          </div>
        </div>

        {/* Code Content Viewport (Strictly isolated horizontal scroll) */}
        <div className="w-full min-w-0 max-w-full overflow-x-auto overflow-y-auto overscroll-x-contain relative p-3 max-h-[380px] bg-surface-1">
          <pre className="font-mono text-xs leading-relaxed text-text-primary selection:bg-primary selection:text-white m-0 w-max min-w-full whitespace-pre">
            <code>{code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
