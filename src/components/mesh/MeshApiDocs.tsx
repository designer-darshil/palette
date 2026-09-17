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
    <section id="mesh-api-docs" className="w-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] flex items-center gap-2 tracking-tight">
            <Terminal size={18} style={{ color: 'var(--color-primary-text)' }} />
            <span>Developer Machine Contract &amp; API</span>
          </h2>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            Query deterministic mesh gradient calculations programmatically via JSON, CSS, or SVG endpoints.
          </p>
        </div>

        <span
          className="font-mono text-[10px] px-2 py-0.5 rounded-xs border font-bold uppercase"
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
        className="w-full bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md p-4 sm:p-5 flex flex-col gap-4 shadow-xs"
        style={{ borderRadius: 'var(--radius-md)' }}
      >
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 font-mono text-xs text-[var(--text-primary)] bg-[var(--bg-surface-2)] px-3 py-1.5 rounded-xs border border-[var(--border-subtle)] overflow-x-auto max-w-full">
            <span className="text-emerald-400 font-bold">GET</span>
            <span className="text-[var(--text-secondary)]">/api/mesh</span>
            <span className="text-[var(--text-tertiary)]">?{queryString}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[var(--bg-surface-2)] p-1 rounded-xs border border-[var(--border-subtle)]">
              {(['json', 'css', 'svg'] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setSelectedFormat(fmt)}
                  className={`px-2.5 py-1 text-xs font-mono uppercase rounded-xs transition-colors cursor-pointer ${
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
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.78rem' }}
              title="Open API endpoint directly in browser"
            >
              <Play size={12} />
              <span>Test Endpoint</span>
            </button>
          </div>
        </div>

        {/* cURL Code Block */}
        <div className="relative bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-xs p-3.5 font-mono text-xs text-[var(--text-primary)] overflow-x-auto">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--border-subtle)] text-[10px] text-[var(--text-tertiary)] uppercase">
            <span>cURL Request</span>
            <button
              type="button"
              onClick={handleCopyCurl}
              className="flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              {hasCopiedCurl ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
              <span>{hasCopiedCurl ? 'Copied' : 'Copy cURL'}</span>
            </button>
          </div>
          <pre className="text-[11px] leading-relaxed select-all">
            {curlSnippet}
          </pre>
        </div>
      </div>
    </section>
  );
};
