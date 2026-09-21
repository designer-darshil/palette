import React, { useMemo } from 'react';
import { ArrowLeft, Sparkles, Copy, ExternalLink, Layers, Wand2 } from 'lucide-react';
import { RouteType } from '../types';
import { useLibraryData } from '../context/LibraryDataContext';
import { buildColorRelationshipProfile } from '../utils/colorRelationshipEngine';
import { ColorRelationshipDiagram } from '../components/ColorRelationshipDiagram';
import { findSimilarPalettes } from '../utils/similarityEngine';
import { PaletteCard } from '../components/PaletteCard';
import { SEOHead } from '../components/seo/SEOHead';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { NotFoundPage } from './NotFoundPage';
import { Link } from '../components/common/Link';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';

interface ColorRelationshipsPageProps {
  slug: string;
  onNavigate: (route: RouteType) => void;
}

export const ColorRelationshipsPage: React.FC<ColorRelationshipsPageProps> = ({ slug, onNavigate }) => {
  const { colors, palettes } = useLibraryData();

  const color = useMemo(() => {
    const clean = slug.toLowerCase();
    // 1. match by slug or id
    const match = colors.find((c) => c.slug.toLowerCase() === clean || c.id.toLowerCase() === clean);
    if (match) return match;

    // 2. match if slug is raw hex (e.g. bfa3f0 or #bfa3f0)
    const rawHex = clean.startsWith('#') ? clean : `#${clean}`;
    if (/^#[0-9a-f]{6}$/i.test(rawHex)) {
      return {
        id: `custom_${clean}`,
        slug: clean.replace('#', ''),
        name: `Custom (${rawHex.toUpperCase()})`,
        hex: rawHex.toUpperCase(),
        rgb: 'rgb(128, 128, 128)',
        hsl: 'hsl(0, 50%, 50%)',
        oklch: 'oklch(0.5 0.1 0)',
        family: 'Custom',
        hueGroup: 'Custom',
        tone: 'Balanced',
        description: `Custom color specimen at ${rawHex.toUpperCase()}`,
        usageNotes: 'Dynamic coordinate calculation',
        tags: ['custom', 'relational'],
        contrastWithWhite: 4.5,
        contrastWithBlack: 4.5,
        bestTextColor: '#FFFFFF',
        complementaryHex: '#FFFFFF',
        analogousHexes: ['#FFFFFF', '#FFFFFF'] as [string, string],
        triadicHexes: ['#FFFFFF', '#FFFFFF'] as [string, string],
        shades: [],
      };
    }
    return null;
  }, [slug, colors]);

  if (!color) {
    return <NotFoundPage requestedUrl={`/colors/${slug}/relationships`} onNavigate={onNavigate} />;
  }

  const profile = useMemo(() => {
    return buildColorRelationshipProfile(color.hex);
  }, [color.hex]);

  // Find palettes that utilize this or close colors
  const relatedPalettes = useMemo(() => {
    return palettes
      .filter((p) => p.colors.some((c) => c.hex.toLowerCase() === color.hex.toLowerCase()))
      .slice(0, 4);
  }, [palettes, color.hex]);

  return (
    <div className="detail-container w-full max-w-7xl mx-auto flex flex-col gap-6 sm:gap-8">
      <SEOHead
        title={`${color.name} (${color.hex}) — Harmonic Color Relationships &amp; Theory`}
        description={`Interactive relational map for ${color.name} (${color.hex}). Analyze complementary, analogous, triadic, tetradic, and split-harmonic color coordinates.`}
        canonicalPath={`/colors/${color.slug}/relationships`}
      />

      <PageHeader
        breadcrumbs={[
          { label: 'Home', to: { path: 'home' } },
          { label: 'Colors', to: { path: 'colors' } },
          { label: color.name, to: { path: 'color-detail', slug: color.slug } },
          { label: 'Relationship Map', isCurrent: true },
        ]}
        onNavigate={onNavigate}
        sectionLabel={`Relational theory engine · ${profile.baseOklch}`}
        title={`${color.name} (${color.hex})`}
        description="Mathematical harmonic nodes, angular deltas, color temperature, and luminance curves mapped from base coordinates."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              iconLeft={<ArrowLeft size={13} />}
              onClick={() => onNavigate({ path: 'color-detail', slug: color.slug })}
            >
              Color Specimen
            </Button>
            <Button
              variant="primary"
              size="sm"
              iconLeft={<Sparkles size={13} />}
              onClick={() => onNavigate({ path: 'palette-generator', colors: color.hex.replace('#', '') })}
            >
              Generate Palette
            </Button>
          </div>
        }
      />

      {/* Interactive Color Relationship Diagram */}
      <ColorRelationshipDiagram profile={profile} onNavigate={onNavigate} />

      {/* Palettes Featuring this Color */}
      {relatedPalettes.length > 0 && (
        <section className="flex flex-col gap-4 pt-4 border-t border-[var(--border-subtle)]">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            Palette Systems Featuring {color.name}
          </h2>
          <div className="specimen-grid-palettes">
            {relatedPalettes.map((p) => (
              <PaletteCard key={p.id} palette={p} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
