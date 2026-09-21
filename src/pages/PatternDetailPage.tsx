import React, { useMemo, useState } from 'react';
import { ArrowLeft, Copy, Download, Sliders, Share2, Bookmark, Check } from 'lucide-react';
import { RouteType } from '../types';
import { CURATED_PATTERNS } from '../data/patterns';
import { generatePatternSvg, generatePatternCss } from '../utils/patternEngine';
import { copyToClipboard } from '../utils/colorUtils';
import { useToast } from '../context/ToastContext';
import { useSaved } from '../context/SavedContext';
import { SEOHead } from '../components/seo/SEOHead';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { NotFoundPage } from './NotFoundPage';
import { Link } from '../components/common/Link';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';

interface PatternDetailPageProps {
  slug: string;
  onNavigate: (route: RouteType) => void;
}

export const PatternDetailPage: React.FC<PatternDetailPageProps> = ({ slug, onNavigate }) => {
  const { showToast } = useToast();
  const { isSaved, saveItem } = useSaved();
  const [copiedCss, setCopiedCss] = useState(false);

  const pattern = useMemo(() => {
    const clean = slug.toLowerCase();
    return CURATED_PATTERNS.find((p) => p.slug.toLowerCase() === clean || p.id.toLowerCase() === clean);
  }, [slug]);

  if (!pattern) {
    return <NotFoundPage requestedUrl={`/patterns/${slug}`} onNavigate={onNavigate} />;
  }

  const saved = isSaved(pattern.id);

  const svgCode = useMemo(() => {
    return generatePatternSvg({
      type: pattern.type,
      palette: pattern.palette,
      scale: pattern.scale,
      density: pattern.density,
      rotation: pattern.rotation,
      strokeWidth: pattern.strokeWidth,
      opacity: pattern.opacity,
    }, 800, 500);
  }, [pattern]);

  const cssCode = useMemo(() => {
    return generatePatternCss({
      type: pattern.type,
      palette: pattern.palette,
      scale: pattern.scale,
      density: pattern.density,
      rotation: pattern.rotation,
      strokeWidth: pattern.strokeWidth,
      opacity: pattern.opacity,
    });
  }, [pattern]);

  const handleCopyCss = async () => {
    const success = await copyToClipboard(cssCode);
    if (success) {
      setCopiedCss(true);
      showToast('Copied Pattern CSS', pattern.title);
      setTimeout(() => setCopiedCss(false), 2000);
    }
  };

  const handleDownloadSvg = () => {
    const blob = new Blob([svgCode], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${pattern.slug}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Downloaded Pattern SVG', pattern.title);
  };

  const handleToggleSave = () => {
    saveItem({
      id: pattern.id,
      type: 'pattern',
      title: pattern.title,
      slug: pattern.slug,
      preview: pattern.palette.join(','),
      metadata: `${pattern.type.toUpperCase()} • Scale ${pattern.scale}%`,
    });
    showToast(saved ? 'Removed from saved' : 'Saved pattern specimen', pattern.title);
  };

  return (
    <div className="detail-container w-full max-w-7xl mx-auto flex flex-col gap-8">
      <SEOHead
        title={`${pattern.title} — Vector Pattern Specimen`}
        description={pattern.description}
        canonicalPath={`/patterns/${pattern.slug}`}
      />

      <PageHeader
        breadcrumbs={[
          { label: 'Home', to: { path: 'home' } },
          { label: 'Patterns', to: { path: 'patterns' } },
          { label: pattern.title, isCurrent: true },
        ]}
        onNavigate={onNavigate}
        sectionLabel={`${pattern.type} pattern · ${pattern.category}`}
        title={pattern.title}
        description={pattern.description}
        actions={
          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            <Button
              variant="primary"
              size="sm"
              iconLeft={<Sliders size={13} />}
              onClick={() =>
                onNavigate({
                  path: 'pattern-studio',
                  palette: pattern.palette.map((c) => c.replace('#', '')).join('-'),
                  type: pattern.type,
                  scale: String(pattern.scale),
                  density: String(pattern.density),
                  rotation: String(pattern.rotation),
                })
              }
            >
              Open in Studio
            </Button>
            <Button
              variant="secondary"
              size="sm"
              iconLeft={<Download size={13} />}
              onClick={handleDownloadSvg}
            >
              Download SVG
            </Button>
            <Button
              variant="secondary"
              size="sm"
              iconLeft={<Bookmark size={13} fill={saved ? '#E9C46A' : 'none'} color={saved ? '#E9C46A' : 'currentColor'} />}
              onClick={handleToggleSave}
            >
              {saved ? 'Saved' : 'Save'}
            </Button>
          </div>
        }
      />

      {/* Hero Pattern Stage */}
      <div
        className="w-full h-80 sm:h-96 rounded-md overflow-hidden border border-[var(--border-subtle)] shadow-xl"
        dangerouslySetInnerHTML={{ __html: svgCode }}
      />

      {/* Code Export */}
      <section className="p-5 sm:p-6 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[var(--text-primary)]">
            CSS Background Implementation
          </h3>
          <Button
            variant="secondary"
            size="sm"
            iconLeft={copiedCss ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            onClick={handleCopyCss}
          >
            {copiedCss ? 'Copied' : 'Copy CSS'}
          </Button>
        </div>

        <pre className="p-4 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-xs font-mono text-xs text-[var(--text-primary)] overflow-x-auto">
          <code>{cssCode}</code>
        </pre>
      </section>
    </div>
  );
};
