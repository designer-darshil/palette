import React, { useState } from 'react';
import {
  AntigravityConfig,
  serializeAntigravityConfig,
  generateMotionTokens,
  describeMotion,
} from '../../utils/antigravityEngine';
import { Terminal, Copy, Check, ExternalLink, Play, BookOpen } from 'lucide-react';

interface AntigravityApiDocsProps {
  config: AntigravityConfig;
}

export const AntigravityApiDocs: React.FC<AntigravityApiDocsProps> = ({ config }) => {
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [apiFormat, setApiFormat] = useState<'json' | 'text'>('json');
  const [apiOutput, setApiOutput] = useState<string | null>(null);
  const [isLoadingApi, setIsLoadingApi] = useState(false);

  const qs = serializeAntigravityConfig(config);
  const curlCommand = `curl -s "https://kroma.design/api/antigravity?${qs}&format=${apiFormat}"`;

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 1500);
  };

  const handleTestEndpoint = () => {
    setIsLoadingApi(true);
    setTimeout(() => {
      if (apiFormat === 'json') {
        setApiOutput(
          JSON.stringify(
            {
              version: '1.0',
              tool: 'antigravity',
              config,
              tokens: generateMotionTokens(config),
              behavior: describeMotion(config),
            },
            null,
            2
          )
        );
      } else {
        let text = `ANTIGRAVITY STUDIO — MOTION SPECIFICATION\n`;
        text += `Behavior: ${describeMotion(config)}\n`;
        text += `Object: ${config.object}\n`;
        text += `Gravity: gx=${config.gravityX} m/s², gy=${config.gravityY} m/s²\n`;
        text += `Velocity: vx=${config.velocityX} px/s, vy=${config.velocityY} px/s\n`;
        text += `Mass: ${config.mass} kg, Restitution: ${config.restitution}, Damping: ${config.damping}\n`;
        setApiOutput(text);
      }
      setIsLoadingApi(false);
    }, 200);
  };

  const params = [
    { param: 'p', default: 'custom', type: 'preset id', desc: 'Curated physics baseline preset.' },
    { param: 'o', default: 'circle', type: 'shape / UI', desc: 'Object model: circle, square, rounded, blob, button, card, etc.' },
    { param: 'gy', default: '-2', type: 'float (m/s²)', desc: 'Vertical gravity / antigravity acceleration vector.' },
    { param: 'gx', default: '0', type: 'float (m/s²)', desc: 'Horizontal wind / drift gravity acceleration vector.' },
    { param: 'r', default: '0.6', type: '0.0..1.0', desc: 'Coefficient of restitution (collision elasticity).' },
    { param: 'd', default: '0.02', type: '0.0..0.2', desc: 'Fluid drag and atmospheric damping resistance.' },
    { param: 'f', default: '0.08', type: '0.0..1.0', desc: 'Boundary surface kinetic friction.' },
    { param: 'm', default: '1.0', type: '0.1..10.0', desc: 'Inertial mass in kilograms.' },
    { param: 'format', default: 'json', type: 'json | text', desc: 'Output payload format.' },
  ];

  return (
    <section id="api-docs" className="w-full flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] flex items-center gap-2 tracking-tight">
            <Terminal size={18} className="text-[var(--text-secondary)]" />
            <span>Developer Motion API &amp; Machine Contract</span>
          </h2>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            Deterministic HTTP endpoint accessible by agents, scripts, and CI pipelines without JavaScript execution.
          </p>
        </div>

        <a
          href="/llms.txt"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary"
          style={{ padding: '6px 12px', fontSize: '0.78rem' }}
        >
          <BookOpen size={13} className="text-[var(--accent-blue)]" />
          <span>View /llms.txt Contract</span>
          <ExternalLink size={11} className="text-[var(--text-tertiary)]" />
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Parameters Specification Table */}
        <div
          className="lg:col-span-7 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md p-4 sm:p-5 flex flex-col gap-3 shadow-xs"
          style={{ borderRadius: 'var(--radius-md)' }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold font-mono text-[var(--text-primary)]">
              GET /api/antigravity
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              200 OK · Deterministic
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[440px]">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-[10px] font-mono text-[var(--text-tertiary)] uppercase tracking-wider">
                  <th className="py-2 pr-3">Query Key</th>
                  <th className="py-2 px-3">Type</th>
                  <th className="py-2 px-3">Default</th>
                  <th className="py-2 pl-3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] text-xs font-mono">
                {params.map((p) => (
                  <tr key={p.param} className="hover:bg-[var(--bg-surface-2)]/40 transition-colors">
                    <td className="py-2.5 pr-3 font-bold text-[var(--text-primary)]">
                      {p.param}
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-[var(--text-tertiary)]">
                      {p.type}
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-[var(--text-secondary)]">
                      {p.default}
                    </td>
                    <td className="py-2.5 pl-3 text-[11px] font-sans text-[var(--text-secondary)]">
                      {p.desc}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Interactive Terminal Tester */}
        <div
          className="lg:col-span-5 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md p-4 sm:p-5 flex flex-col gap-3 shadow-xs"
          style={{ borderRadius: 'var(--radius-md)' }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold font-mono text-[var(--text-primary)] flex items-center gap-1.5">
              <span>Terminal Query</span>
            </h3>
            <div className="flex items-center gap-1 bg-[var(--bg-surface-2)] p-0.5 rounded-xs border border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => setApiFormat('json')}
                className={`px-2 py-0.5 rounded-xs text-[10px] font-mono cursor-pointer ${apiFormat === 'json' ? 'bg-[var(--text-primary)] text-[var(--text-inverse)] font-bold' : 'text-[var(--text-tertiary)]'}`}
              >
                JSON
              </button>
              <button
                type="button"
                onClick={() => setApiFormat('text')}
                className={`px-2 py-0.5 rounded-xs text-[10px] font-mono cursor-pointer ${apiFormat === 'text' ? 'bg-[var(--text-primary)] text-[var(--text-inverse)] font-bold' : 'text-[var(--text-tertiary)]'}`}
              >
                Text
              </button>
            </div>
          </div>

          {/* Curl Command Box */}
          <div className="relative p-3 rounded-xs bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] font-mono text-[11px] text-[var(--text-secondary)] break-all">
            <code>{curlCommand}</code>
            <button
              type="button"
              onClick={handleCopyCurl}
              className="absolute top-2 right-2 p-1.5 rounded-xs bg-[var(--bg-surface-3)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              title="Copy curl command"
            >
              {copiedCurl ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            </button>
          </div>

          <button
            type="button"
            onClick={handleTestEndpoint}
            disabled={isLoadingApi}
            className="btn-secondary w-full justify-center"
            style={{ padding: '8px 12px', fontSize: '0.78rem' }}
          >
            <Play size={13} className="text-emerald-400" />
            <span>{isLoadingApi ? 'Evaluating Response...' : 'Execute Request in Browser'}</span>
          </button>

          {/* Response Box */}
          {apiOutput && (
            <div className="max-h-48 overflow-y-auto p-3 rounded-xs bg-[var(--bg-canvas)] border border-[var(--border-subtle)] font-mono text-[10px] text-[var(--text-secondary)] leading-relaxed">
              <pre className="whitespace-pre">{apiOutput}</pre>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
