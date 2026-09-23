import React, { useMemo } from 'react';
import { Palette, Layers, Grid, Globe, MapPin, ShieldCheck, ArrowLeft } from 'lucide-react';
import { RouteType } from '../types';
import { useCreators } from '../context/CreatorContext';
import { useLibraryData } from '../context/LibraryDataContext';
import { useCollections } from '../context/CollectionContext';
import { CURATED_PATTERNS } from '../data/patterns';
import { PaletteCard } from '../components/PaletteCard';
import { CollectionCard } from '../components/CollectionCard';
import { PatternCard } from '../components/PatternCard';
import { SEOHead } from '../components/seo/SEOHead';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { NotFoundPage } from './NotFoundPage';
import { Link } from '../components/common/Link';

interface CreatorDetailPageProps {
  username: string;
  onNavigate: (route: RouteType) => void;
}

export const CreatorDetailPage: React.FC<CreatorDetailPageProps> = ({ username, onNavigate }) => {
  const { getCreatorByUsername } = useCreators();
  const { palettes } = useLibraryData();
  const { collections } = useCollections();

  const creator = getCreatorByUsername(username);

  if (!creator) {
    return <NotFoundPage requestedUrl={`/creators/${username}`} onNavigate={onNavigate} />;
  }

  const creatorPalettes = useMemo(() => {
    return palettes.filter(
      (p) =>
        p.creator?.username.toLowerCase() === creator.username.toLowerCase() ||
        p.tags?.some((t) => t.toLowerCase() === creator.username.toLowerCase())
    );
  }, [palettes, creator]);

  const creatorCollections = useMemo(() => {
    return collections.filter(
      (c) => c.creator.username.toLowerCase() === creator.username.toLowerCase()
    );
  }, [collections, creator]);

  const creatorPatterns = useMemo(() => {
    return CURATED_PATTERNS.filter(
      (p) => p.creator?.username.toLowerCase() === creator.username.toLowerCase()
    );
  }, [creator]);

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-8">
      <SEOHead
        title={`${creator.name} (@${creator.username}) — Designer Portfolio`}
        description={creator.bio}
        canonicalPath={`/creators/${creator.username}`}
      />

      <Breadcrumbs
        items={[
          { label: 'Home', to: { path: 'home' } },
          { label: 'Creators', to: { path: 'creators' } },
          { label: creator.name, isCurrent: true },
        ]}
        onNavigate={onNavigate}
      />

      {/* Creator Profile Header */}
      <div className="p-6 sm:p-8 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <img
            src={creator.avatar}
            alt={creator.name}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-[var(--border-medium)] shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
                {creator.name}
              </h1>
              {creator.featured && (
                <ShieldCheck size={18} className="text-[var(--accent-gold)]" />
              )}
            </div>
            <div className="text-xs font-mono text-[var(--text-tertiary)] mb-2">
              @{creator.username}
            </div>

            <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-xl leading-relaxed">
              {creator.bio}
            </p>

            <div className="flex items-center gap-4 mt-3 text-xs text-[var(--text-tertiary)] font-mono flex-wrap">
              {creator.location && (
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  {creator.location}
                </span>
              )}
              {creator.website && (
                <a
                  href={creator.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[var(--color-primary)] hover:underline"
                >
                  <Globe size={12} />
                  {creator.website.replace('https://', '')}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Specialties */}
        <div className="flex flex-col sm:items-end gap-2 self-start md:self-auto">
          <span className="text-xs font-mono text-[var(--text-tertiary)] uppercase font-semibold">
            Specialties
          </span>
          <div className="flex flex-wrap gap-1.5 justify-start md:justify-end">
            {creator.specialties.map((spec, i) => (
              <span
                key={i}
                className="text-xs font-mono px-2.5 py-1 rounded-xs bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-medium"
              >
                {spec}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Creator Collections */}
      {creatorCollections.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            Curated Collections ({creatorCollections.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {creatorCollections.map((col) => (
              <CollectionCard key={col.id} collection={col} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}

      {/* Creator Patterns */}
      {creatorPatterns.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            Vector Patterns ({creatorPatterns.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {creatorPatterns.map((pat) => (
              <PatternCard key={pat.id} pattern={pat} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}

      {/* Creator Palettes */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">
          Palette Systems ({creatorPalettes.length > 0 ? creatorPalettes.length : creator.paletteCount})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(360px,1fr))] gap-4 sm:gap-6">
          {(creatorPalettes.length > 0 ? creatorPalettes : palettes.slice(0, 4)).map((p) => (
            <PaletteCard key={p.id} palette={p} onNavigate={onNavigate} />
          ))}
        </div>
      </section>
    </div>
  );
};
