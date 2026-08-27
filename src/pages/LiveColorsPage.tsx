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
import { SEOHead } from '../components/seo/SEOHead';
import { generateWebApplicationSchema } from '../utils/schemaGenerator';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Link } from '../components/common/Link';
import { Analytics } from '../utils/analytics';
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

  const liveSchema = React.useMemo(() => {
    return generateWebApplicationSchema({
      name: 'Live Atmosphere Color Synthesizer',
      description:
        'Real-time chromatic synthesis engine rendering deterministic environmental color palettes from solar angles, atmospheric Rayleigh scatter, and weather conditions.',
      url: '/palettes/live',
      applicationCategory: 'DesignApplication',
    });
  }, []);

  return (
    <div className="live-page w-full max-w-7xl mx-auto flex flex-col gap-6 sm:gap-8">
      <SEOHead
        title="Live Atmosphere Colors | Real-Time Solar & Sky Palettes"
        description="Real-time environmental color palettes synthesized from live solar elevation, Rayleigh scatter, geographic coordinates, and global meteorological conditions."
        canonicalPath="/palettes/live"
        jsonLd={liveSchema}
        keywords={['live atmosphere colors', 'real time color generator', 'sky color palette', 'solar elevation color']}
      />

      <Breadcrumbs
        items={[
          { label: 'Home', to: { path: 'home' } },
          { label: 'Palettes', to: { path: 'palettes' } },
          { label: 'Live Atmosphere', isCurrent: true },
        ]}
        onNavigate={onNavigate}
      />

      {/* Editorial Header */}
      <header className="page-header mb-0">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <span className="page-category-label text-xs font-mono text-[var(--accent-gold)] uppercase tracking-wider font-semibold">
              REAL-TIME ENVIRONMENTAL SPECIMEN • SECTION 05
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mt-1 text-[var(--text-primary)]">
              Live Atmosphere Colors
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 max-w-2xl leading-relaxed">
              What does the world look like right now? Deterministic chromatic atmospheres synthesized from real-time solar elevation, Rayleigh scatter, geographic coordinates, and atmospheric temperatures.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap w-full sm:w-auto">
            <button
              className="btn-secondary text-xs px-3.5 py-2 inline-flex items-center justify-center gap-1.5 flex-1 sm:flex-initial whitespace-nowrap"
              onClick={() => updateAtmosphere(selectedLocation, simulatedHour)}
              disabled={loadingWeather}
              title="Refresh environmental data"
            >
              <RefreshCw size={13} className={loadingWeather ? 'spin-anim' : ''} />
              <span>{loadingWeather ? 'Syncing...' : 'Sync Live'}</span>
            </button>

            <button
              className="btn-secondary text-xs px-3.5 py-2 inline-flex items-center justify-center gap-1.5 flex-1 sm:flex-initial whitespace-nowrap"
              onClick={handleShare}
              title="Share Live Atmosphere URL"
            >
              <Share2 size={13} />
              <span>Share</span>
            </button>

            <button
              className="btn-secondary text-xs px-3.5 py-2 inline-flex items-center justify-center gap-1.5 w-full sm:w-auto whitespace-nowrap"
              onClick={handleSaveToWorkspace}
            >
              <Bookmark size={13} fill={isCurrentSaved ? '#E9C46A' : 'none'} color={isCurrentSaved ? '#E9C46A' : 'currentColor'} />
              <span>{isCurrentSaved ? 'Saved' : 'Save Atmosphere'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Location & Context Control Strip */}
      <section className="filter-bar flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md">
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <div className="flex items-center gap-1.5 font-mono text-xs text-[var(--text-secondary)]">
            <MapPin size={14} className="text-[var(--accent-gold)] flex-shrink-0" />
            <span className="uppercase text-[var(--text-tertiary)] font-bold">LOCATION:</span>
          </div>

          <select
            value={selectedLocation.name}
            onChange={(e) => {
              const loc = PRESET_LOCATIONS.find((l) => l.name === e.target.value) || PRESET_LOCATIONS[1];
              setSelectedLocation(loc);
              setSimulatedHour(null);
            }}
            className="bg-[var(--bg-surface-2)] border border-[var(--border-medium)] rounded-xs px-3 py-1.5 text-xs text-[var(--text-primary)] font-mono cursor-pointer flex-1 sm:flex-initial min-w-[140px]"
            aria-label="Select location"
          >
            {PRESET_LOCATIONS.map((loc) => (
              <option key={loc.name} value={loc.name}>
                {loc.name} ({loc.country})
              </option>
            ))}
          </select>

          <button
            className="filter-pill text-xs px-3 py-1.5 inline-flex items-center gap-1.5"
            onClick={handleUseDeviceLocation}
          >
            <Compass size={12} />
            <span>Use My Location</span>
          </button>
        </div>

        {/* Live Context Telemetry */}
        <div className="flex items-center gap-3 sm:gap-4 font-mono text-xs text-[var(--text-secondary)] pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border-subtle)] flex-wrap">
          <div className="flex items-center gap-1.5">
            <Clock size={13} className="text-[var(--text-tertiary)]" />
            <span>{atmosphere.localTimeFormatted}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {getPhaseIcon()}
            <span className="uppercase font-bold text-[var(--text-primary)]">
              {atmosphere.solarPhase}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Thermometer size={13} className="text-[var(--text-tertiary)]" />
            <span>{atmosphere.temperatureC}°C ({atmosphere.season})</span>
          </div>
        </div>
      </section>

      {/* Large Live Color Field Specimen */}
      <section className="detail-hero-specimen rounded-md overflow-hidden border border-[var(--border-subtle)] shadow-xl">
        <div
          className="min-h-[260px] sm:min-h-[320px] p-5 sm:p-8 flex flex-col justify-between relative transition-all duration-300"
          style={{ background: atmosphere.gradientCss }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 bg-black/55 px-2.5 py-1 rounded-xs backdrop-blur-md self-start border border-white/10 shadow-sm max-w-full">
              <span className="brand-glyph w-2 h-2 flex-shrink-0" />
              <span className="font-mono text-[10px] sm:text-xs text-white uppercase tracking-wider font-bold truncate">
                LIVE BROADCAST • {atmosphere.solarPhase.toUpperCase()} • {atmosphere.weatherSummary}
              </span>
            </div>

            <button
              onClick={handleCopyAll}
              className="bg-black/50 hover:bg-black/70 text-white px-3.5 py-1.5 rounded-xs flex items-center gap-1.5 text-xs font-bold font-mono self-start sm:self-auto shadow-sm transition-colors whitespace-nowrap"
            >
              <Copy size={12} />
              <span>COPY PALETTE</span>
            </button>
          </div>

          <div className="mt-4 sm:mt-0">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-md">
              {atmosphere.title}
            </h2>
            <p className="text-xs sm:text-sm text-white/95 max-w-2xl leading-relaxed drop-shadow-sm mt-1.5">
              {atmosphere.description}
            </p>
          </div>
        </div>

        {/* Live Swatch Strip — Horizontally scrollable on mobile */}
        <div className="w-full overflow-x-auto pb-0.5">
          <div className="h-32 sm:h-36 flex min-w-[540px] sm:min-w-0 w-full border-t border-white/10">
            {atmosphere.swatches.map((s, idx) => (
              <div
                key={idx}
                style={{ backgroundColor: s.hex }}
                className="flex-1 flex flex-col justify-between p-3 sm:p-4 cursor-pointer transition-all duration-200 min-w-0"
                onClick={() => handleCopySingleHex(s.hex, s.name)}
                title={`Click to copy ${s.name} (${s.hex})`}
              >
                <span className="font-mono text-[9px] sm:text-[10px] font-semibold text-white bg-black/45 px-1.5 py-0.5 rounded-xs w-fit shadow-sm">
                  0{idx + 1}
                </span>

                <div className="min-w-0 overflow-hidden">
                  <div className="font-mono text-[11px] sm:text-sm font-bold text-white drop-shadow-md truncate">
                    {s.hex}
                  </div>
                  <div className="text-[10px] sm:text-xs text-white drop-shadow-md opacity-90 truncate">
                    {s.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 24-Hour Solar Simulation Timeline */}
      <section className="contrast-assessment-box p-4 sm:p-6 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-md flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-[var(--text-primary)]">
              Solar Elevation &amp; Time Simulator
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
              Explore how atmospheric Rayleigh scattering and solar angles transform {selectedLocation.name} throughout the 24-hour cycle.
            </p>
          </div>

          {simulatedHour !== null && (
            <button
              className="btn-secondary text-xs px-2.5 py-1 inline-flex items-center gap-1 self-start sm:self-auto"
              onClick={() => setSimulatedHour(null)}
            >
              <RefreshCw size={11} />
              <span>Reset to Current Time</span>
            </button>
          )}
        </div>

        <div className="filter-pills flex items-center gap-1.5 overflow-x-auto pb-1 mt-1">
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
              className={`filter-pill text-xs px-2.5 py-1 whitespace-nowrap ${simulatedHour === btn.hour ? 'active' : ''}`}
              onClick={() => setSimulatedHour(btn.hour)}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </section>

      {/* Detailed Swatch Cards with Roles */}
      <section className="flex flex-col gap-3.5">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4">
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-[var(--text-primary)]">
            Atmospheric Swatch Spectrum
          </h2>
          <span className="font-mono text-[10px] sm:text-xs text-[var(--text-tertiary)] uppercase">
            CLICK ANY SWATCH TO COPY OR EXPLORE
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {atmosphere.swatches.map((s, idx) => {
            const slug = findMatchingColorSlug(s.hex);
            return (
              <div key={idx} className="detail-spec-card p-3.5 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] rounded-sm transition-all flex flex-col justify-between">
                <div>
                  <div
                    className="h-18 rounded-xs border border-[var(--border-subtle)] mb-2.5 cursor-pointer shadow-inner"
                    style={{ backgroundColor: s.hex, height: '72px' }}
                    onClick={() => handleCopySingleHex(s.hex, s.name)}
                    title="Click to copy HEX"
                  />
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-bold text-xs sm:text-sm text-[var(--text-primary)] truncate">{s.name}</span>
                    <button
                      onClick={() => handleCopySingleHex(s.hex, s.name)}
                      className="font-mono text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold flex-shrink-0"
                    >
                      {s.hex}
                    </button>
                  </div>
                  <div className="font-mono text-[10px] text-[var(--accent-gold)] uppercase mt-0.5">
                    ROLE: {s.role}
                  </div>
                  <p className="text-[11px] text-[var(--text-tertiary)] mt-1.5 leading-relaxed">
                    {s.description}
                  </p>
                </div>
                {slug && (
                  <div className="mt-3 pt-2 border-t border-[var(--border-subtle)]">
                    <button
                      onClick={() => onNavigate({ path: 'color-detail', slug })}
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-[var(--accent-gold)] hover:underline"
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
