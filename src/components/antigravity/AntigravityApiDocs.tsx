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

  const queryString = serializeAntigravityConfig(config);
  const curlCommand = `curl -s "https://kroma.design/api/antigravity?${queryString}&format=${apiFormat}"`;

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 1500);
  };

  const handleTestEndpoint = () => {
    setIsLoadingApi(true);
    setTimeout(() => {
      if (apiFormat === 'json') {
        const tokens = generateMotionTokens(config);
        setApiOutput(
          JSON.stringify(
            {
              version: '1.0',
              tool: 'antigravity',
              source: `https://kroma.design/antigravity?${queryString}`,
              config,
              tokens,
              description: describeMotion(config),
            },
            null,
            2
          )
        );
      } else {
        let text = `ANTIGRAVITY STUDIO — GENERATED MOTION SPECIFICATION\n`;
        text += `Source: https://kroma.design/antigravity?${queryString}\n\n`;
        text += `Behavior: ${describeMotion(config)}\n`;
        text += `Object: ${config.object}\n`;
        text += `Gravity: gx=${config.gravityX} m/s², gy=${config.gravityY} m/s²\n`;
        text += `Velocity: vx=${config.velocityX} px/s, vy=${config.velocityY} px/s\n`;
        text += `Inertia & Bounce: mass=${config.mass} kg, restitution=${config.restitution}, friction=${config.friction}, damping=${config.damping}\n`;
        setApiOutput(text);
      }
      setIsLoadingApi(false);
    }, 200);
  };

  const params = [
    { param: 'p', default: 'gentle-float', type: 'preset-id', desc: 'Preset baseline: gentle-float, weightless, soft-bounce, moon-gravity, etc.' },
    { param: 'o', default: 'circle', type: 'enum', desc: 'Object shape: circle, square, rounded, blob, button, card, notification, badge.' },
    { param: 'gy', default: '-2', type: 'number (-20..20)', desc: 'Vertical gravity in m/s² (negative = upward antigravity lift).' },
    { param: 'gx', default: '0', type: 'number (-20..20)', desc: 'Horizontal gravity / wind acceleration.' },
    { param: 'vx', default: '25', type: 'number (-1000..1000)', desc: 'Initial launch velocity on X axis in px/s.' },
    { param: 'vy', default: '0', type: 'number (-1000..1000)', desc: 'Initial launch velocity on Y axis in px/s.' },
    { param: 'm', default: '1', type: 'number (0.1..10)', desc: 'Inertial mass in kilograms.' },
    { param: 'r', default: '0.6', type: 'number (0..1)', desc: 'Restitution coefficient (collision elasticity / bounce).' },
    { param: 'd', default: '0.02', type: 'number (0..1)', desc: 'Fluid air damping and drag decay rate.' },
    { param: 'f', default: '0.08', type: 'number (0..1)', desc: 'Surface kinetic friction on boundary contact.' },
    { param: 'format', default: 'json', type: 'json | text', desc: 'Output payload format.' },
  ];

  return (
    <section id="api-docs" className="w-full flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] flex items-center gap-2 tracking-tight">
            <Terminal size={18} className="text-[var(--text-secondary)]" />
            <span>Developer API &amp; Machine Contract</span>
          </h2>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            Deterministic HTTP endpoint accessible by coding agents, CLI scripts, and automated motion pipelines.
          </p>
        </div>

        <a
          href="/llms.txt"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-primary)] hover:bg-[var(--bg-surface-3)] transition-all"
        >
          <BookOpen size={13} className="text-blue-400" />
          <span>View /llms.txt Specification</span>
          <ExternalLink size={11} className="text-[var(--text-tertiary)]" />
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Parameters Specification Table */}
        <div className="lg:col-span-7 bg-[var(--bg-surface-1)] border border-[var(--border-medium)] rounded-xl p-4 sm:p-5 flex flex-col gap-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold font-mono text-[var(--text-primary)]">
              GET /api/antigravity
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
              v1.0 · Deterministic
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[460px]">
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
        <div className="lg:col-span-5 bg-[var(--bg-surface-1)] border border-[var(--border-medium)] rounded-xl p-4 sm:p-5 flex flex-col gap-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold font-mono text-[var(--text-primary)]">
              Terminal Query Preview
            </h3>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setApiFormat('json')}
                className={`px-2 py-0.5 rounded text-[10px] font-mono ${apiFormat === 'json' ? 'bg-[var(--text-primary)] text-[var(--text-inverse)]' : 'text-[var(--text-tertiary)]'}`}
              >
                JSON
              </button>
              <button
                type="button"
                onClick={() => setApiFormat('text')}
                className={`px-2 py-0.5 rounded text-[10px] font-mono ${apiFormat === 'text' ? 'bg-[var(--text-primary)] text-[var(--text-inverse)]' : 'text-[var(--text-tertiary)]'}`}
              >
                Text
              </button>
            </div>
          </div>

          {/* Curl Command Box */}
          <div className="relative p-3 rounded-md bg-[var(--bg-canvas)] border border-[var(--border-subtle)] font-mono text-[11px] text-[var(--text-secondary)] break-all">
            <code>{curlCommand}</code>
            <button
              type="button"
              onClick={handleCopyCurl}
              className="absolute top-2 right-2 p-1.5 rounded bg-[var(--bg-surface-2)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              title="Copy curl command"
            >
              {copiedCurl ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            </button>
          </div>

          <button
            type="button"
            onClick={handleTestEndpoint}
            disabled={isLoadingApi}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-md bg-[var(--bg-surface-2)] border border-[var(--border-medium)] font-mono text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-surface-3)] transition-all active:scale-[0.99]"
          >
            <Play size={13} className="text-blue-400" />
            <span>{isLoadingApi ? 'Evaluating Endpoint...' : 'Execute Request in Browser'}</span>
          </button>

          {/* Response Box */}
          {apiOutput && (
            <div className="max-h-48 overflow-y-auto p-3 rounded bg-[var(--bg-canvas)] border border-[var(--border-subtle)] font-mono text-[10px] text-[var(--text-secondary)] leading-relaxed">
              <pre className="whitespace-pre">{apiOutput}</pre>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
