import React from 'react';
import { ArrowLeft, Palette, Layers } from 'lucide-react';
import { RouteType } from '../types';
import { SEOHead } from '../components/seo/SEOHead';
import { Button } from '../components/common/Button';

interface NotFoundPageProps {
  requestedUrl?: string;
  onNavigate: (route: RouteType) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ requestedUrl, onNavigate }) => {
  return (
    <div className="w-full max-w-xl mx-auto my-16 p-8 sm:p-12 text-center flex flex-col items-center bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-lg shadow-sm">
      <SEOHead
        title="404 — Specimen Not Found | KROMA"
        description="The requested color specimen, palette, harmony, or gradient does not exist in the curated catalog."
        canonicalPath="/404"
        noindex={true}
        nofollow={true}
      />

      <span className="text-xs font-medium text-[var(--accent-ruby)] bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-xs mb-4">
        404 · Specimen not cataloged
      </span>

      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)] mb-2">
        Requested Resource Unavailable
      </h1>

      <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-md mb-8">
        {requestedUrl ? (
          <>
            The specimen at <code className="font-mono text-[var(--text-primary)] bg-[var(--bg-surface-2)] px-1.5 py-0.5 rounded-xs">{requestedUrl}</code> is not cataloged in the library or has been moved.
          </>
        ) : (
          'The requested color specimen, palette, harmony, or gradient does not exist in the curated catalog.'
        )}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="primary"
          size="md"
          iconLeft={<Palette size={15} />}
          onClick={() => onNavigate({ path: 'colors' })}
        >
          Browse Colors
        </Button>
        <Button
          variant="secondary"
          size="md"
          iconLeft={<Layers size={15} />}
          onClick={() => onNavigate({ path: 'palettes' })}
        >
          Browse Palettes
        </Button>
        <Button
          variant="ghost"
          size="md"
          iconLeft={<ArrowLeft size={15} />}
          onClick={() => onNavigate({ path: 'home' })}
        >
          Return Home
        </Button>
      </div>
    </div>
  );
};
