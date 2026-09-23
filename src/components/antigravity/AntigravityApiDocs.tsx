import React, { useState } from 'react';
import {
  AntigravityConfig,
  serializeAntigravityConfig,
  generateMotionTokens,
  describeMotion,
} from '../../utils/antigravityEngine';
import { Terminal, Copy, Check, ExternalLink, Play, BookOpen } from 'lucide-react';
import { KromaButton } from '../common/KromaButton';

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
    <section id="api-docs" className="w-full flex flex-col gap-3.5 min-w-0">
      <div className="flex flex-col gap-2 min-w-0">
        <div className="min-w-0">
          <h2 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5 tracking-tight">
            <Terminal size={15} className="text-[var(--text-secondary)] flex-shrink-0" />
            <span>Developer Motion API &amp; Contract</span>
          </h2>
          <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5 leading-snug">
            Deterministic HTTP endpoint accessible by agents, scripts, and CI pipelines without JavaScript execution.
          </p>
        </div>

        <a
          href="/llms.txt"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary w-full justify-center sm:w-auto self-start"
          style={{ padding: '5px 10px', fontSize: '0.75rem' }}
        >
          <BookOpen size={12} style={{ color: 'var(--color-primary-text)' }} />
          <span>View /llms.txt Contract</span>
          <ExternalLink size={10} className="text-[var(--text-tertiary)]" />
        </a>
      </div>

      <div className="flex flex-col gap-3 min-w-0">
        {/* Parameters Specification Table */}
        <div
          className="w-full bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md p-3 sm:p-4 flex flex-col gap-2.5 shadow-xs min-w-0"
          style={{ borderRadius: 'var(--radius-md)' }}
        >
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h3 className="text-xs font-bold font-mono text-[var(--text-primary)]">
              GET /api/antigravity
            </h3>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              200 OK · Deterministic
            </span>
          </div>

          <div className="overflow-x-auto max-w-full -mx-1 px-1">
            <table className="w-full text-left border-collapse min-w-[360px]">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-[9px] font-mono text-[var(--text-tertiary)] uppercase tracking-wider">
                  <th className="py-1.5 pr-2">Query Key</th>
                  <th className="py-1.5 px-2">Type</th>
                  <th className="py-1.5 px-2">Default</th>
                  <th className="py-1.5 pl-2">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] text-[11px] font-mono">
                {params.map((p) => (
                  <tr key={p.param} className="hover:bg-[var(--bg-surface-2)]/40 transition-colors">
                    <td className="py-2 pr-2 font-bold text-[var(--text-primary)]">
                      {p.param}
                    </td>
                    <td className="py-2 px-2 text-[10px] text-[var(--text-tertiary)]">
                      {p.type}
                    </td>
                    <td className="py-2 px-2 text-[10px] text-[var(--text-secondary)]">
                      {p.default}
                    </td>
                    <td className="py-2 pl-2 text-[10px] font-sans text-[var(--text-secondary)] leading-tight">
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
          className="w-full bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md p-3 sm:p-4 flex flex-col gap-2.5 shadow-xs min-w-0"
          style={{ borderRadius: 'var(--radius-md)' }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold font-mono text-[var(--text-primary)] flex items-center gap-1.5">
              <span>Terminal Query</span>
            </h3>
            <div className="flex items-center gap-1 bg-[var(--bg-surface-2)] p-0.5 rounded-xs border border-[var(--border-subtle)]">
              <KromaButton
                size="sm"
                variant={apiFormat === 'json' ? 'filled' : 'ghost'}
                onClick={() => setApiFormat('json')}
                className="text-[10px] font-mono h-6 px-2"
              >
                JSON
              </KromaButton>
              <KromaButton
                size="sm"
                variant={apiFormat === 'text' ? 'filled' : 'ghost'}
                onClick={() => setApiFormat('text')}
                className="text-[10px] font-mono h-6 px-2"
              >
                Text
              </KromaButton>
            </div>
          </div>

          {/* Curl Command Box */}
          <div className="relative p-2.5 rounded-xs bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] font-mono text-[10px] text-[var(--text-secondary)] break-all max-w-full overflow-hidden">
            <code>{curlCommand}</code>
            <div className="absolute top-1.5 right-1.5">
              <KromaButton
                size="icon"
                variant="ghost"
                onClick={handleCopyCurl}
                title="Copy curl command"
                aria-label="Copy curl command"
                className="h-6 w-6"
                iconLeft={copiedCurl ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
              />
            </div>
          </div>

          <KromaButton
            variant="filled"
            size="sm"
            onClick={handleTestEndpoint}
            disabled={isLoadingApi}
            isLoading={isLoadingApi}
            iconLeft={<Play size={11} className="text-emerald-400 flex-shrink-0" />}
            className="w-full justify-center"
          >
            <span>{isLoadingApi ? 'Evaluating Response...' : 'Execute Request in Browser'}</span>
          </KromaButton>

          {/* Response Box */}
          {apiOutput && (
            <div className="max-h-48 overflow-y-auto p-2.5 rounded-xs bg-[var(--bg-canvas)] border border-[var(--border-subtle)] font-mono text-[10px] text-[var(--text-secondary)] leading-relaxed max-w-full overflow-x-auto">
              <pre className="whitespace-pre">{apiOutput}</pre>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
