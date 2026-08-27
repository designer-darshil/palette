import React, { useState, useEffect, useCallback } from 'react';
import {
  Compass,
  Sun,
  Moon,
  Sunset,
  Sunrise,
  Cloud,
  CloudRain,
  Snowflake,
  Zap,
  RefreshCw,
  Copy,
  Bookmark,
  Share2,
  MapPin,
  Clock,
  Thermometer,
  Layers,
  ArrowRight,
  ExternalLink,
  Code,
  Sparkles,
} from 'lucide-react';
import { RouteType } from '../types';
import {
  LiveLocation,
  LiveWeatherData,
  LiveAtmosphere,
  PRESET_LOCATIONS,
  fetchRealWeather,
  generateLiveAtmosphere,
  getSolarPhase,
} from '../utils/liveColorEngine';
import { CURATED_COLORS } from '../data/colors';
import { CURATED_PALETTES } from '../data/palettes';
import { CURATED_COMBOS } from '../data/combos';
import { CURATED_GRADIENTS } from '../data/gradients';
import { copyToClipboard } from '../utils/colorUtils';
import { useToast } from '../context/ToastContext';
import { useSaved } from '../context/SavedContext';
import { useLibraryData } from '../context/LibraryDataContext';
import { ColorCard } from '../components/ColorCard';
import { PaletteCard } from '../components/PaletteCard';
import { ComboCard } from '../components/ComboCard';
import { GradientCard } from '../components/GradientCard';

interface LiveColorsPageProps {
  onNavigate: (route: RouteType) => void;
}

export const LiveColorsPage: React.FC<LiveColorsPageProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const { isSaved, saveItem } = useSaved();
  const { addPalette } = useLibraryData();

  const [selectedLocation, setSelectedLocation] = useState<LiveLocation>(PRESET_LOCATIONS[1]); // Default Ahmedabad
  const [weatherData, setWeatherData] = useState<LiveWeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [atmosphere, setAtmosphere] = useState<LiveAtmosphere>(() =>
    generateLiveAtmosphere(PRESET_LOCATIONS[1], null)
  );
  const [simulatedHour, setSimulatedHour] = useState<number | null>(null);
  const [exportMode, setExportMode] = useState<'css' | 'hex' | 'tailwind' | 'json'>('css');

  // Load weather and compute atmosphere
  const updateAtmosphere = useCallback(async (loc: LiveLocation, simHour: number | null = null) => {
    let wData = weatherData;
    if (loc.latitude !== 0 && loc.longitude !== 0) {
      setLoadingWeather(true);
      const res = await fetchRealWeather(loc.latitude, loc.longitude);
      if (res) {
        wData = res;
        setWeatherData(res);
      }
      setLoadingWeather(false);
    }

    let effectiveLocation = { ...loc };
    const atmo = generateLiveAtmosphere(effectiveLocation, wData);

    // Override solar phase if user manually simulates a time of day
    if (simHour !== null) {
      atmo.solarPhase = getSolarPhase(simHour, 0);
      atmo.title = `${loc.name} • ${atmo.solarPhase.toUpperCase()} (SIMULATED)`;
    }

    setAtmosphere(atmo);
  }, [weatherData]);

  useEffect(() => {
    updateAtmosphere(selectedLocation, simulatedHour);
  }, [selectedLocation, simulatedHour]);

  // Request real browser geolocation on demand
  const handleUseDeviceLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser');
      return;
    }

    setLoadingWeather(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLoc: LiveLocation = {
          name: 'Current Device Location',
          country: 'Local Horizon',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        setSelectedLocation(userLoc);
        setSimulatedHour(null);
        showToast('Connected to Local Satellite Data', `${pos.coords.latitude.toFixed(2)}°, ${pos.coords.longitude.toFixed(2)}°`);
      },
      () => {
        setLoadingWeather(false);
        showToast('Unable to retrieve location', 'Using preset observatory data');
      },
      { timeout: 8000 }
    );
  };

  const handleCopySingleHex = async (hex: string, name: string) => {
    const success = await copyToClipboard(hex);
    if (success) {
      showToast(`Copied ${hex}`, name, hex);
    }
  };

  const handleCopyAll = async () => {
    const all = atmosphere.swatches.map((s) => `${s.hex} /* ${s.name} - ${s.role} */`).join('\n');
    const success = await copyToClipboard(all);
    if (success) {
      showToast('Copied Live Atmosphere Palette', atmosphere.locationName);
    }
  };

  const handleShare = async () => {
    const success = await copyToClipboard(window.location.href);
    if (success) {
      showToast('Live link copied to clipboard', atmosphere.title);
    }
  };

  const hexHash = atmosphere.swatches.map((s) => s.hex.replace('#', '').toLowerCase()).join('-');
  const canonicalSlug = `live-${atmosphere.locationName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${atmosphere.solarPhase.toLowerCase()}-${hexHash.slice(0, 12)}`;
  const isCurrentSaved = isSaved(canonicalSlug);

  const handleSaveToWorkspace = () => {
    const title = `${atmosphere.locationName} ${atmosphere.solarPhase}`;
    const preview = atmosphere.swatches.map((s) => s.hex).join(',');

    saveItem({
      id: canonicalSlug,
      type: 'palette',
      title,
      slug: canonicalSlug,
      preview,
      metadata: `${atmosphere.solarPhase} • ${atmosphere.weatherSummary}`,
    });

    // Also persist as canonical Palette in Library Data
    addPalette({
      id: canonicalSlug,
      slug: canonicalSlug,
      title: `${title} Atmosphere`,
      category: 'Live Atmosphere',
      description: `Atmospheric color spectrum captured from ${atmosphere.locationName} during ${atmosphere.solarPhase}. ${atmosphere.weatherSummary}.`,
      colors: atmosphere.swatches.map((s, i) => ({
        name: s.name,
        hex: s.hex,
        role: s.role || (i === 0 ? 'Background Anchor' : i === 1 ? 'Primary Dominant' : i === 2 ? 'Accent Focus' : 'Surface / Highlight'),
      })),
      tags: ['live', 'atmosphere', atmosphere.solarPhase.toLowerCase()],
    });

    showToast(
      isCurrentSaved ? 'Removed from saved' : 'Saved live atmosphere to collection',
      atmosphere.title
    );
  };

  const getCssVariables = () => {
    const lines = atmosphere.swatches.map(
      (s) => `  --live-${s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}: ${s.hex};`
    );
    return `:root {\n  /* Generated Live Atmosphere: ${atmosphere.title} */\n${lines.join('\n')}\n}`;
  };

  const getCleanHexList = () => {
    return atmosphere.swatches.map((s) => `${s.hex}  /* ${s.name} */`).join('\n');
  };

  const getTailwindConfig = () => {
    const obj: Record<string, string> = {};
    atmosphere.swatches.forEach((s) => {
      obj[s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')] = s.hex;
    });
    return JSON.stringify({ colors: { live: obj } }, null, 2);
  };

  const getJsonExport = () => {
    return JSON.stringify(
      {
        title: atmosphere.title,
        location: atmosphere.locationName,
        solarPhase: atmosphere.solarPhase,
        weather: atmosphere.weatherSummary,
        temperatureC: atmosphere.temperatureC,
        swatches: atmosphere.swatches,
      },
      null,
      2
    );
  };

  const currentExportCode =
    exportMode === 'css'
      ? getCssVariables()
      : exportMode === 'hex'
      ? getCleanHexList()
      : exportMode === 'tailwind'
      ? getTailwindConfig()
      : getJsonExport();

  const handleCopyTokens = async () => {
    const success = await copyToClipboard(currentExportCode);
    if (success) {
      showToast(`Copied ${exportMode.toUpperCase()} tokens`, atmosphere.title);
    }
  };

  // Match closest curated items for connected discovery
  const findMatchingColorSlug = (hex: string) => {
    const match = CURATED_COLORS.find((c) => c.hex.toLowerCase() === hex.toLowerCase());
    return match ? match.slug : null;
  };

  const relatedPalettes = CURATED_PALETTES.slice(0, 2);
  const relatedCombos = CURATED_COMBOS.slice(0, 2);
  const relatedGradients = CURATED_GRADIENTS.slice(0, 2);

  // Solar icon helper
  const getPhaseIcon = () => {
    switch (atmosphere.solarPhase) {
      case 'Sunrise':
      case 'Dawn':
        return <Sunrise size={16} color="#E9C46A" />;
      case 'Solar Noon':
      case 'Morning':
      case 'Afternoon':
        return <Sun size={16} color="#E9C46A" />;
      case 'Golden Hour':
      case 'Sunset':
        return <Sunset size={16} color="#E63946" />;
      case 'Twilight':
      case 'Midnight Abyss':
      default:
        return <Moon size={16} color="#93C5FD" />;
    }
  };

  return (
    <div className="live-page" style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
      {/* Editorial Header */}
      <header className="page-header" style={{ marginBottom: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="page-category-label">
              REAL-TIME ENVIRONMENTAL SPECIMEN • SECTION 05
            </span>
            <h1 className="page-title">Live Atmosphere Colors</h1>
            <p className="page-description">
              What does the world look like right now? Deterministic chromatic atmospheres synthesized from real-time solar elevation, Rayleigh scatter, geographic coordinates, and atmospheric temperatures.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              className="btn-secondary"
              onClick={() => updateAtmosphere(selectedLocation, simulatedHour)}
              disabled={loadingWeather}
              style={{ padding: '8px 14px', fontSize: '0.8rem' }}
              title="Refresh environmental data"
            >
              <RefreshCw size={13} className={loadingWeather ? 'spin-anim' : ''} />
              <span>{loadingWeather ? 'Syncing...' : 'Sync Live'}</span>
            </button>

            <button
              className="btn-secondary"
              onClick={handleShare}
              style={{ padding: '8px 12px', fontSize: '0.8rem' }}
              title="Share Live Atmosphere URL"
            >
              <Share2 size={13} />
              <span>Share</span>
            </button>

            <button
              className="btn-secondary"
              onClick={handleSaveToWorkspace}
              style={{ padding: '8px 14px', fontSize: '0.8rem' }}
            >
              <Bookmark size={13} fill={isCurrentSaved ? '#E9C46A' : 'none'} color={isCurrentSaved ? '#E9C46A' : 'currentColor'} />
              <span>{isCurrentSaved ? 'Saved' : 'Save Atmosphere'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Location & Context Control Strip */}
      <section className="filter-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            <MapPin size={14} color="#E9C46A" />
            <span style={{ textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>LOCATION:</span>
          </div>

          <select
            value={selectedLocation.name}
            onChange={(e) => {
              const loc = PRESET_LOCATIONS.find((l) => l.name === e.target.value) || PRESET_LOCATIONS[1];
              setSelectedLocation(loc);
              setSimulatedHour(null);
            }}
            style={{
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-xs)',
              padding: '6px 12px',
              fontSize: '0.82rem',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
            }}
            aria-label="Select location"
          >
            {PRESET_LOCATIONS.map((loc) => (
              <option key={loc.name} value={loc.name}>
                {loc.name} ({loc.country})
              </option>
            ))}
          </select>

          <button
            className="filter-pill"
            onClick={handleUseDeviceLocation}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <Compass size={12} />
            <span>Use My Location</span>
          </button>
        </div>

        {/* Live Context Telemetry */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={13} color="var(--text-tertiary)" />
            <span>{atmosphere.localTimeFormatted}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {getPhaseIcon()}
            <span style={{ textTransform: 'uppercase', fontWeight: 600, color: 'var(--text-primary)' }}>
              {atmosphere.solarPhase}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Thermometer size={13} color="var(--text-tertiary)" />
            <span>{atmosphere.temperatureC}°C ({atmosphere.season})</span>
          </div>
        </div>
      </section>

      {/* Large Live Color Field Specimen */}
      <section className="detail-hero-specimen">
        <div
          style={{
            height: '320px',
            background: atmosphere.gradientCss,
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            transition: 'background 400ms ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.5)', padding: '4px 10px', borderRadius: '4px', backdropFilter: 'blur(8px)' }}>
              <span className="brand-glyph" style={{ width: 8, height: 8 }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                LIVE BROADCAST • {atmosphere.solarPhase.toUpperCase()} • {atmosphere.weatherSummary}
              </span>
            </div>

            <button
              onClick={handleCopyAll}
              style={{
                background: 'rgba(0,0,0,0.5)',
                color: '#FFFFFF',
                padding: '6px 12px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.78rem',
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
              }}
            >
              <Copy size={12} />
              <span>COPY PALETTE</span>
            </button>
          </div>

          <div>
            <h2
              className="specimen-title-huge"
              style={{
                color: '#FFFFFF',
                textShadow: '0 2px 8px rgba(0,0,0,0.6)',
              }}
            >
              {atmosphere.title}
            </h2>
            <p
              style={{
                color: '#FFFFFF',
                opacity: 0.92,
                fontSize: '0.95rem',
                maxWidth: '640px',
                lineHeight: 1.6,
                textShadow: '0 1px 4px rgba(0,0,0,0.6)',
                marginTop: '6px',
              }}
            >
              {atmosphere.description}
            </p>
          </div>
        </div>

        {/* Live Swatch Strip */}
        <div style={{ height: '140px', display: 'flex', width: '100%' }}>
          {atmosphere.swatches.map((s, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: s.hex,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '16px',
                cursor: 'pointer',
                transition: 'flex 200ms ease',
              }}
              onClick={() => handleCopySingleHex(s.hex, s.name)}
              title={`Click to copy ${s.name} (${s.hex})`}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                  background: 'rgba(0,0,0,0.45)',
                  padding: '2px 6px',
                  borderRadius: '2px',
                  width: 'fit-content',
                }}
              >
                0{idx + 1}
              </span>

              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                  }}
                >
                  {s.hex}
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#FFFFFF',
                    textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                    opacity: 0.9,
                  }}
                >
                  {s.name}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 24-Hour Solar Simulation Timeline */}
      <section className="contrast-assessment-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
              Solar Elevation &amp; Time Simulator
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Explore how atmospheric Rayleigh scattering and solar angles transform {selectedLocation.name} throughout the 24-hour cycle.
            </p>
          </div>

          {simulatedHour !== null && (
            <button
              className="btn-secondary"
              onClick={() => setSimulatedHour(null)}
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
            >
              <RefreshCw size={11} />
              <span>Reset to Current Time</span>
            </button>
          )}
        </div>

        <div className="filter-pills" style={{ marginTop: '4px' }}>
          {[
            { label: 'Dawn 05:15', hour: 5.2 },
            { label: 'Sunrise 06:45', hour: 6.8 },
            { label: 'Morning 09:30', hour: 9.5 },
            { label: 'Solar Noon 12:30', hour: 12.5 },
            { label: 'Afternoon 15:45', hour: 15.8 },
            { label: 'Golden Hour 18:15', hour: 18.2 },
            { label: 'Sunset 19:15', hour: 19.2 },
            { label: 'Twilight 20:30', hour: 20.5 },
            { label: 'Midnight 00:00', hour: 0.0 },
          ].map((btn) => (
            <button
              key={btn.label}
              className={`filter-pill ${simulatedHour === btn.hour ? 'active' : ''}`}
              onClick={() => setSimulatedHour(btn.hour)}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </section>

      {/* Detailed Swatch Cards with Roles */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
            Atmospheric Swatch Spectrum
          </h2>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
            CLICK ANY SWATCH TO COPY OR EXPLORE
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {atmosphere.swatches.map((s, idx) => {
            const slug = findMatchingColorSlug(s.hex);
            return (
              <div key={idx} className="detail-spec-card">
                <div
                  style={{
                    height: '70px',
                    backgroundColor: s.hex,
                    borderRadius: '3px',
                    border: '1px solid var(--border-subtle)',
                    marginBottom: '8px',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleCopySingleHex(s.hex, s.name)}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{s.name}</span>
                  <button
                    onClick={() => handleCopySingleHex(s.hex, s.name)}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}
                  >
                    {s.hex}
                  </button>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--accent-gold)', marginTop: '2px' }}>
                  ROLE: {s.role}
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '4px', lineHeight: 1.4 }}>
                  {s.description}
                </p>
                {slug && (
                  <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)' }}>
                    <button
                      onClick={() => onNavigate({ path: 'color-detail', slug })}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.72rem',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <span>View Color Specimen</span>
                      <ExternalLink size={10} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Production Token Export */}
      <section className="contrast-assessment-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
              Export Live Atmosphere Tokens
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Ready for immediate integration into your design tokens, CSS stylesheets, or Tailwind theme.
            </p>
          </div>

          <div className="filter-pills">
            <button
              className={`filter-pill ${exportMode === 'css' ? 'active' : ''}`}
              onClick={() => setExportMode('css')}
            >
              CSS Variables
            </button>
            <button
              className={`filter-pill ${exportMode === 'hex' ? 'active' : ''}`}
              onClick={() => setExportMode('hex')}
            >
              HEX List
            </button>
            <button
              className={`filter-pill ${exportMode === 'tailwind' ? 'active' : ''}`}
              onClick={() => setExportMode('tailwind')}
            >
              Tailwind
            </button>
            <button
              className={`filter-pill ${exportMode === 'json' ? 'active' : ''}`}
              onClick={() => setExportMode('json')}
            >
              JSON
            </button>
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <pre
            style={{
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '16px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.82rem',
              color: 'var(--text-primary)',
              overflowX: 'auto',
            }}
          >
            <code>{currentExportCode}</code>
          </pre>

          <button
            className="btn-secondary"
            onClick={handleCopyTokens}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              padding: '6px 10px',
              fontSize: '0.75rem',
            }}
          >
            <Copy size={12} />
            <span>Copy</span>
          </button>
        </div>
      </section>

      {/* Connected Library Resource Network */}
      {relatedPalettes.length > 0 && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
              Curated Palettes Harmonizing with {atmosphere.solarPhase}
            </h2>
          </div>
          <div className="specimen-grid-palettes">
            {relatedPalettes.map((p) => (
              <PaletteCard key={p.id} palette={p} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}

      {relatedCombos.length > 0 && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
              Relational Harmonies in this Atmosphere
            </h2>
          </div>
          <div className="specimen-grid-combos">
            {relatedCombos.map((cb) => (
              <ComboCard key={cb.id} combo={cb} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}

      {relatedGradients.length > 0 && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
              Atmospheric Gradients
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
