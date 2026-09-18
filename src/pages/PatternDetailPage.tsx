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

      <Breadcrumbs
        items={[
          { label: 'Home', to: { path: 'home' } },
          { label: 'Patterns', to: { path: 'patterns' } },
          { label: pattern.title, isCurrent: true },
        ]}
        onNavigate={onNavigate}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
        <div>
          <span className="page-category-label text-xs font-mono text-[var(--accent-gold)] uppercase tracking-wider font-semibold">
            {pattern.type.toUpperCase()} PATTERN · {pattern.category.toUpperCase()}
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mt-1 text-[var(--text-primary)]">
            {pattern.title}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 max-w-2xl leading-relaxed">
            {pattern.description}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          <Link
            to={{
              path: 'pattern-studio',
              palette: pattern.palette.map((c) => c.replace('#', '')).join('-'),
              type: pattern.type,
              scale: String(pattern.scale),
              density: String(pattern.density),
              rotation: String(pattern.rotation),
            }}
            onNavigate={onNavigate}
            className="btn-primary text-xs px-3.5 py-2 flex items-center gap-1.5"
          >
            <Sliders size={13} />
            <span>Open in Studio</span>
          </Link>
          <button
            onClick={handleDownloadSvg}
            className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5"
          >
            <Download size={13} />
            <span>Download SVG</span>
          </button>
          <button
            onClick={handleToggleSave}
            className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5"
          >
            <Bookmark size={13} fill={saved ? '#E9C46A' : 'none'} color={saved ? '#E9C46A' : 'currentColor'} />
            <span>{saved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

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
          <button
            onClick={handleCopyCss}
            className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
          >
            {copiedCss ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span>{copiedCss ? 'Copied' : 'Copy CSS'}</span>
          </button>
        </div>

        <pre className="p-4 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-xs font-mono text-xs text-[var(--text-primary)] overflow-x-auto">
          <code>{cssCode}</code>
        </pre>
      </section>
    </div>
  );
};
