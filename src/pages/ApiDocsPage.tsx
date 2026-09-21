import React, { useState } from 'react';
import { Code, Terminal, Copy, Check, ArrowRight, ExternalLink } from 'lucide-react';
import { RouteType } from '../types';
import { copyToClipboard } from '../utils/colorUtils';
import { useToast } from '../context/ToastContext';
import { SEOHead } from '../components/seo/SEOHead';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';

interface ApiDocsPageProps {
  onNavigate: (route: RouteType) => void;
}

export const ApiDocsPage: React.FC<ApiDocsPageProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const handleCopy = async (text: string, label: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedEndpoint(label);
      showToast(`Copied ${label}`);
      setTimeout(() => setCopiedEndpoint(null), 2000);
    }
  };

  return (
    <div className="catalog-container w-full max-w-5xl mx-auto flex flex-col gap-8">
      <SEOHead
        title="Developer API &amp; Design Token Architecture"
        description="Public API endpoints and design token formats for PaletteParadise. Access deterministic OKLCH ramps, motion physics tokens, and JSON datasets."
        canonicalPath="/api"
      />

      <PageHeader
        breadcrumbs={[
          { label: 'Home', to: { path: 'home' } },
          { label: 'Developer API & Tokens', isCurrent: true },
        ]}
        onNavigate={onNavigate}
        sectionLabel="Developer platform · Deterministic endpoints"
        title="API & Token Specifications"
        description="Deterministic programmatic interfaces designed for agent consumption, CI/CD pipeline integration, and design token generators."
      />

      {/* Endpoint 1: Ramps Studio API */}
      <section className="p-5 sm:p-6 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-lg flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-xs font-mono text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
              GET
            </span>
            <span className="font-mono text-sm font-bold text-[var(--text-primary)]">
              /api/palette
            </span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            iconLeft={copiedEndpoint === 'Ramps API URL' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            onClick={() => handleCopy('https://kroma.design/api/palette?b=3d7dff&m=full', 'Ramps API URL')}
          >
            Copy URL
          </Button>
        </div>

        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          Generates a full OKLCH color ramp token system (50-950) with scheme-derived accents, contrast-enforced text mappings, and WCAG AA/AAA ratings.
        </p>

        <pre className="p-3 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-xs font-mono text-xs text-[var(--text-primary)] overflow-x-auto">
          <code>curl -s "https://kroma.design/api/palette?b=3d7dff&amp;s=complementary&amp;c=AAA"</code>
        </pre>
      </section>

      {/* Endpoint 2: Antigravity Motion Tokens API */}
      <section className="p-5 sm:p-6 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-lg flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-xs font-mono text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
              GET
            </span>
            <span className="font-mono text-sm font-bold text-[var(--text-primary)]">
              /api/antigravity
            </span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            iconLeft={copiedEndpoint === 'Antigravity API URL' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            onClick={() => handleCopy('https://kroma.design/api/antigravity?p=editorial-float', 'Antigravity API URL')}
          >
            Copy URL
          </Button>
        </div>

        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          Serializes physics parameters (gravity, mass, velocity, restitution, damping) into W3C Design Tokens Community Group (DTCG) motion specifications and Framer Motion code.
        </p>
      </section>

      {/* Endpoint 3: Mesh Gradient API */}
      <section className="p-5 sm:p-6 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-lg flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-xs font-mono text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
              GET
            </span>
            <span className="font-mono text-sm font-bold text-[var(--text-primary)]">
              /api/mesh
            </span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            iconLeft={copiedEndpoint === 'Mesh API URL' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            onClick={() => handleCopy('https://kroma.design/api/mesh?p=aurora-borealis&format=css', 'Mesh API URL')}
          >
            Copy URL
          </Button>
        </div>

        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          Returns mathematical mesh gradient coordinates serialized as raw CSS background strings, standalone SVG assets, or DTCG JSON token sets.
        </p>
      </section>
    </div>
  );
};
