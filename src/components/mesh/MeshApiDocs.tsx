import React, { useState, useMemo } from 'react';
import { MeshGradientConfig, serializeMeshConfig } from '../../utils/meshEngine';
import { Terminal, Copy, Check, Play, FileJson } from 'lucide-react';

interface MeshApiDocsProps {
  config: MeshGradientConfig;
}

export const MeshApiDocs: React.FC<MeshApiDocsProps> = ({ config }) => {
  const [hasCopiedCurl, setHasCopiedCurl] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'json' | 'css' | 'svg'>('json');

  const queryString = useMemo(() => serializeMeshConfig(config), [config]);

  const endpointUrl = useMemo(() => {
    return `https://kroma.design/api/mesh?${queryString}&format=${selectedFormat}`;
  }, [queryString, selectedFormat]);

  const curlSnippet = `curl -X GET "${endpointUrl}" \\
  -H "Accept: application/json"`;

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlSnippet);
    setHasCopiedCurl(true);
    setTimeout(() => setHasCopiedCurl(false), 2000);
  };

  const handleTestInBrowser = () => {
    window.open(`/api/mesh?${queryString}&format=${selectedFormat}`, '_blank');
  };

  return (
    <section id="mesh-api-docs" className="w-full flex flex-col gap-3 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 min-w-0">
        <div className="min-w-0">
          <h2 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5 tracking-tight">
            <Terminal size={15} style={{ color: 'var(--color-primary-text)' }} className="flex-shrink-0" />
            <span className="truncate">Developer API &amp; Contract</span>
          </h2>
          <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5 leading-snug">
            Deterministic HTTP endpoint for JSON, CSS, and SVG tokens.
          </p>
        </div>

        <span
          className="font-mono text-[9px] px-2 py-0.5 rounded-xs border font-bold uppercase self-start sm:self-center flex-shrink-0"
          style={{
            backgroundColor: 'var(--color-primary-subtle)',
            color: 'var(--color-primary-text)',
            borderColor: 'var(--color-primary-border)',
          }}
        >
          REST / GET
        </span>
      </div>

      <div
        className="w-full bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md p-3 sm:p-4 flex flex-col gap-3 shadow-xs min-w-0"
        style={{ borderRadius: 'var(--radius-md)' }}
      >
        <div className="flex flex-col gap-2 min-w-0">
          <div className="flex items-center gap-2 font-mono text-[11px] text-[var(--text-primary)] bg-[var(--bg-surface-2)] px-2.5 py-1.5 rounded-xs border border-[var(--border-subtle)] overflow-x-auto max-w-full min-w-0">
            <span className="text-emerald-400 font-bold flex-shrink-0">GET</span>
            <span className="text-[var(--text-secondary)] flex-shrink-0">/api/mesh</span>
            <span className="text-[var(--text-tertiary)] truncate">?{queryString}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-[var(--bg-surface-2)] p-0.5 rounded-xs border border-[var(--border-subtle)] flex-1 min-w-[120px]">
              {(['json', 'css', 'svg'] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setSelectedFormat(fmt)}
                  className={`flex-1 px-2 py-1 text-[10px] font-mono uppercase rounded-xs transition-colors cursor-pointer text-center ${
                    selectedFormat === fmt
                      ? 'bg-[var(--bg-surface-1)] text-[var(--text-primary)] font-bold shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleTestInBrowser}
              className="btn-secondary flex-1 min-w-[100px] justify-center"
              style={{ padding: '5px 10px', fontSize: '0.75rem' }}
              title="Open API endpoint directly in browser"
            >
              <Play size={11} className="flex-shrink-0" />
              <span>Test Endpoint</span>
            </button>
          </div>
        </div>

        {/* cURL Code Block */}
        <div className="relative bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-xs p-3 font-mono text-xs text-[var(--text-primary)] max-w-full min-w-0">
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[var(--border-subtle)] text-[10px] text-[var(--text-tertiary)] uppercase">
            <span>cURL Request</span>
            <button
              type="button"
              onClick={handleCopyCurl}
              className="flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              {hasCopiedCurl ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
              <span>{hasCopiedCurl ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="text-[10px] leading-relaxed select-all overflow-x-auto max-w-full">
            {curlSnippet}
          </pre>
        </div>
      </div>
    </section>
  );
};
