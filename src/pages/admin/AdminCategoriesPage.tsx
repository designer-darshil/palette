import React from 'react';
import { FolderTree, CheckCircle2, Tag } from 'lucide-react';

export const AdminCategoriesPage: React.FC = () => {
  const taxonomies = [
    {
      title: 'Color Spectrum Groups (16 Groups)',
      items: ['Red', 'Orange', 'Yellow', 'Green', 'Teal', 'Cyan', 'Blue', 'Indigo', 'Purple', 'Pink', 'Brown', 'Beige', 'Cream', 'Gray', 'White', 'Black'],
      count: '2,288 Associated Specimens',
    },
    {
      title: 'Palette Aesthetics (8 Disciplines)',
      items: ['Editorial', 'Minimal', 'Nature', 'Architectural', 'Vintage', 'Vibrant', 'Monochrome', 'Dark Mode'],
      count: '1,210 Associated Palettes',
    },
    {
      title: 'Relational Harmonies (8 Geometric Types)',
      items: ['Complementary', 'Analogous', 'Triadic', 'Split Complementary', 'Monochromatic', 'Warm & Cool', 'High Contrast', 'Editorial Balance'],
      count: '810 Associated Pairings',
    },
    {
      title: 'Continuous Atmospheres (7 Categories)',
      items: ['Atmospheric', 'Sunset', 'Holographic', 'Deep Space', 'Organic', 'Editorial Metal', 'Minimal'],
      count: '810 Associated Spectra',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
          Controlled Classification Vocabulary
        </h1>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          Manage taxonomy boundaries, mood classifications, and architectural categorizations.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {taxonomies.map((tax) => (
          <div
            key={tax.title}
            style={{
              background: 'var(--bg-surface-1)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h2 style={{ fontSize: '0.98rem', fontWeight: 700 }}>{tax.title}</h2>
              <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>
                {tax.count}
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
              {tax.items.map((item) => (
                <span
                  key={item}
                  style={{
                    background: 'var(--bg-surface-2)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-xs)',
                    padding: '4px 10px',
                    fontSize: '0.78rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-primary)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Tag size={10} color="#E9C46A" />
                  <span>{item}</span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
