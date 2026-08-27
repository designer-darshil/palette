import React, { useState } from 'react';
import { Network, Sparkles, ArrowRight, ExternalLink } from 'lucide-react';
import { CURATED_COLORS } from '../../data/colors';
import { CURATED_PALETTES } from '../../data/palettes';
import { CURATED_COMBOS } from '../../data/combos';
import { CURATED_GRADIENTS } from '../../data/gradients';

export const AdminRelationshipsPage: React.FC = () => {
  const [selectedColor, setSelectedColor] = useState(CURATED_COLORS[0]);

  // Find connections
  const relatedPalettes = CURATED_PALETTES.filter((p) =>
    p.colors.some((c) => c.hex.toLowerCase() === selectedColor.hex.toLowerCase())
  ).slice(0, 4);

  const relatedCombos = CURATED_COMBOS.filter((cb) =>
    cb.colors.some((c) => c.hex.toLowerCase() === selectedColor.hex.toLowerCase())
  ).slice(0, 4);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
          Resource Relationship Network
        </h1>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          Inspect the cross-referencing loop connecting Colors ↔ Palettes ↔ Combos ↔ Gradients.
        </p>
      </div>

      {/* Selector */}
      <div
        style={{
          background: 'var(--bg-surface-1)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>
          FOCAL COLOR SPECIMEN:
        </span>
        <select
          value={selectedColor.id}
          onChange={(e) => {
            const found = CURATED_COLORS.find((c) => c.id === e.target.value);
            if (found) setSelectedColor(found);
          }}
          style={{
            background: 'var(--bg-surface-2)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-xs)',
            padding: '8px 12px',
            fontSize: '0.85rem',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {CURATED_COLORS.slice(0, 30).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.hex})
            </option>
          ))}
        </select>
      </div>

      {/* Network Graph Card */}
      <div
        style={{
          background: 'var(--bg-surface-1)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '28px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '6px',
              backgroundColor: selectedColor.hex,
              border: '1px solid var(--border-medium)',
            }}
          />
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{selectedColor.name}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {selectedColor.hex} • {selectedColor.oklch}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {/* Calculated Harmonies */}
          <div style={{ background: 'var(--bg-surface-2)', padding: '16px', borderRadius: 'var(--radius-xs)' }}>
            <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-gold)', marginBottom: '8px', textTransform: 'uppercase' }}>
              MATHEMATICAL HARMONIES (CALCULATED)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem' }}>
              <div>Complementary: <code style={{ fontFamily: 'var(--font-mono)' }}>{selectedColor.complementaryHex}</code></div>
              <div>Analogous: <code style={{ fontFamily: 'var(--font-mono)' }}>{selectedColor.analogousHexes.join(', ')}</code></div>
              <div>Triadic: <code style={{ fontFamily: 'var(--font-mono)' }}>{selectedColor.triadicHexes.join(', ')}</code></div>
            </div>
          </div>

          {/* Connected Palettes */}
          <div style={{ background: 'var(--bg-surface-2)', padding: '16px', borderRadius: 'var(--radius-xs)' }}>
            <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#3B82F6', marginBottom: '8px', textTransform: 'uppercase' }}>
              CONNECTED PALETTES ({relatedPalettes.length})
            </div>
            {relatedPalettes.length === 0 ? (
              <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>No direct palette assignments</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.78rem' }}>
                {relatedPalettes.map((p) => (
                  <div key={p.id} style={{ fontWeight: 600 }}>• {p.title}</div>
                ))}
              </div>
            )}
          </div>

          {/* Connected Combos */}
          <div style={{ background: 'var(--bg-surface-2)', padding: '16px', borderRadius: 'var(--radius-xs)' }}>
            <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#E63946', marginBottom: '8px', textTransform: 'uppercase' }}>
              CONNECTED COMBOS ({relatedCombos.length})
            </div>
            {relatedCombos.length === 0 ? (
              <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>No direct combo pairings</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.78rem' }}>
                {relatedCombos.map((cb) => (
                  <div key={cb.id} style={{ fontWeight: 600 }}>• {cb.title}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
