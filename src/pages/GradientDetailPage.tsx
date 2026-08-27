import React, { useState } from 'react';
import { ArrowLeft, Copy, Bookmark, Sparkles, RefreshCw } from 'lucide-react';
import { RouteType } from '../types';
import { CURATED_GRADIENTS } from '../data/gradients';
import { CURATED_COLORS } from '../data/colors';
import { copyToClipboard } from '../utils/colorUtils';
import { useToast } from '../context/ToastContext';
import { useSaved } from '../context/SavedContext';
import { GradientCard } from '../components/GradientCard';
import { ColorCard } from '../components/ColorCard';

interface GradientDetailPageProps {
  slug: string;
  onNavigate: (route: RouteType) => void;
}

export const GradientDetailPage: React.FC<GradientDetailPageProps> = ({ slug, onNavigate }) => {
  const { showToast } = useToast();
  const { isSaved, saveItem } = useSaved();

  const baseGradient = CURATED_GRADIENTS.find((g) => g.slug === slug) || CURATED_GRADIENTS[0];
  const [angle, setAngle] = useState<number>(baseGradient.angle || 135);

  const saved = isSaved(baseGradient.id);

  const computedCss =
    baseGradient.type === 'linear'
      ? `linear-gradient(${angle}deg, ${baseGradient.stops
          .map((s) => `${s.color} ${s.position}%`)
          .join(', ')})`
      : baseGradient.css;

  const handleCopyCss = async () => {
    const success = await copyToClipboard(`background: ${computedCss};`);
    if (success) {
      showToast('Copied CSS Gradient', baseGradient.title, computedCss);
    }
  };

  const handleToggleSave = () => {
    saveItem({
      id: baseGradient.id,
      type: 'gradient',
      title: baseGradient.title,
      slug: baseGradient.slug,
      preview: computedCss,
      metadata: `${baseGradient.type} • ${baseGradient.category}`,
    });
    showToast(
      saved ? 'Removed gradient from saved' : 'Saved gradient to collection',
      baseGradient.title
    );
  };

  const relatedGradients = CURATED_GRADIENTS.filter(
    (g) => g.id !== baseGradient.id && g.category === baseGradient.category
  ).slice(0, 2);

  return (
    <div className="detail-container">
      {/* Navigation Breadcrumb */}
      <div>
        <button
          className="detail-back-btn"
          onClick={() => onNavigate({ path: 'gradients' })}
        >
          <ArrowLeft size={16} />
          <span>Back to Gradients Library</span>
        </button>
      </div>

      {/* Hero Gradient Stage */}
      <section className="detail-hero-specimen">
        <div
          style={{
            height: '320px',
            background: computedCss,
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: '#FFFFFF',
                background: 'rgba(0,0,0,0.5)',
                padding: '3px 8px',
                borderRadius: '3px',
                textTransform: 'uppercase',
              }}
            >
              {baseGradient.type.toUpperCase()} • {angle}° ANGLE
            </span>
            <button
              onClick={handleToggleSave}
              style={{
                background: 'rgba(0,0,0,0.5)',
                color: '#FFFFFF',
                padding: '6px 12px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              <Bookmark size={15} fill={saved ? '#E9C46A' : 'none'} color={saved ? '#E9C46A' : '#FFFFFF'} />
              <span>{saved ? 'Saved' : 'Save Gradient'}</span>
            </button>
          </div>

          <div>
            <h1
              className="specimen-title-huge"
              style={{
                color: '#FFFFFF',
                textShadow: '0 2px 8px rgba(0,0,0,0.6)',
              }}
            >
              {baseGradient.title}
            </h1>
            <p
              style={{
                color: '#FFFFFF',
                opacity: 0.9,
                fontSize: '0.95rem',
                textShadow: '0 1px 4px rgba(0,0,0,0.6)',
                marginTop: '4px',
              }}
            >
              {baseGradient.stops.length} calibrated chromatic stops in continuum
            </p>
          </div>
        </div>
      </section>

      {/* Angle & Live Adjuster */}
      {baseGradient.type === 'linear' && (
        <section className="contrast-assessment-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
                Trajectory &amp; Vector Angle: {angle}°
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Slide to recalibrate gradient angle in real-time.
              </p>
            </div>
            <button
              className="btn-secondary"
              onClick={() => setAngle(baseGradient.angle || 135)}
              style={{ padding: '6px 10px', fontSize: '0.75rem' }}
            >
              <RefreshCw size={12} />
              <span>Reset Angle</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <input
              type="range"
              min="0"
              max="360"
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              style={{ flex: 1, accentColor: '#F8F9FA' }}
            />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', width: '40px', textAlign: 'right' }}>
              {angle}°
            </span>
          </div>
        </section>
      )}

      {/* Color Stop Breakdown */}
      <section>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', letterSpacing: '-0.01em' }}>
          Gradient Stops Breakdown
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {baseGradient.stops.map((stop, idx) => (
            <div key={idx} className="detail-spec-card">
              <div
                style={{
                  height: '40px',
                  backgroundColor: stop.color,
                  borderRadius: '3px',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '8px',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{stop.name || `Stop 0${idx + 1}`}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  {stop.color}
                </span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                POSITION: {stop.position}%
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CSS Code Specimen */}
      <section className="contrast-assessment-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
            Production CSS Snippet
          </h2>
          <button className="btn-primary" onClick={handleCopyCss} style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
            <Copy size={13} />
            <span>Copy CSS</span>
          </button>
        </div>

        <div style={{ position: 'relative' }}>
          <pre
            style={{
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '16px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              color: 'var(--text-primary)',
              overflowX: 'auto',
            }}
          >
            <code>{`background: ${computedCss};`}</code>
          </pre>
        </div>
      </section>

      {/* Related Gradients */}
      {relatedGradients.length > 0 && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
              Related {baseGradient.category.toUpperCase()} Gradients
            </h2>
          </div>
          <div className="specimen-grid-gradients">
            {relatedGradients.map((g) => (
              <GradientCard key={g.id} gradient={g} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
