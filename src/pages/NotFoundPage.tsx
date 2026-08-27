import React from 'react';
import { ArrowLeft, Palette, Layers, Wand2, Sparkles } from 'lucide-react';
import { RouteType } from '../types';
import { SEOHead } from '../components/seo/SEOHead';
import { Link } from '../components/common/Link';

interface NotFoundPageProps {
  requestedUrl?: string;
  onNavigate: (route: RouteType) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ requestedUrl, onNavigate }) => {
  return (
    <div
      style={{
        maxWidth: '680px',
        margin: '60px auto',
        padding: '48px 32px',
        background: 'var(--bg-surface-1)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-md)',
        textAlign: 'center',
      }}
    >
      <SEOHead
        title="404 — Specimen Not Found | KROMA"
        description="The requested color specimen, palette, harmony, or gradient does not exist in the curated catalog."
        canonicalPath="/404"
        noindex={true}
        nofollow={true}
      />

      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.78rem',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: '#E63946',
          background: 'rgba(230, 57, 70, 0.12)',
          border: '1px solid rgba(230, 57, 70, 0.25)',
          padding: '4px 10px',
          borderRadius: '4px',
          display: 'inline-block',
          marginBottom: '16px',
        }}
      >
        404 — SPECIMEN NOT FOUND
      </span>

      <h1
        style={{
          fontSize: '2.2rem',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          marginBottom: '12px',
        }}
      >
        Requested Resource Unavailable
      </h1>

      <p
        style={{
          fontSize: '0.95rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          marginBottom: '28px',
        }}
      >
        {requestedUrl ? (
          <>
            The specimen at <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{requestedUrl}</code> is not cataloged in the library or has been moved.
          </>
        ) : (
          'The requested color specimen, palette, harmony, or gradient does not exist in the curated catalog.'
        )}
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <Link
          to={{ path: 'colors' }}
          onNavigate={onNavigate}
          className="btn-primary"
        >
          <Palette size={15} />
          <span>Browse Colors</span>
        </Link>

        <Link
          to={{ path: 'palettes' }}
          onNavigate={onNavigate}
          className="btn-secondary"
        >
          <Layers size={15} />
          <span>Browse Palettes</span>
        </Link>

        <Link
          to={{ path: 'home' }}
          onNavigate={onNavigate}
          className="btn-secondary"
        >
          <ArrowLeft size={15} />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
};

