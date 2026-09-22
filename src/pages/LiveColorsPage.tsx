import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Check,
  AlertCircle,
  CloudSun,
  Trash2,
  Sliders,
  Eye,
  Info,
  Globe,
  Radio,
  SlidersHorizontal,
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
  interpretWeatherCode,
  getLocalTimeInTimezone,
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
import { PageHeader } from '../components/common/PageHeader';
import { Button, KromaButton } from '../components/common/Button';
import { PaletteCard } from '../components/PaletteCard';
import { ComboCard } from '../components/ComboCard';
import { GradientCard } from '../components/GradientCard';
import {
  KromaCard,
  KromaCardVisual,
  KromaCardBody,
  KromaCardFooter,
} from '../components/common/KromaCard';

interface LiveColorsPageProps {
  onNavigate: (route: RouteType) => void;
}

// 24-Hour Solar Forecast Milestones
const SOLAR_FORECAST_MILESTONES = [
  { label: 'Dawn', time: '05:15', hour: 5.2, skyHex: '#3D3B5C', solarHex: '#E07A5F' },
  { label: 'Sunrise', time: '06:45', hour: 6.8, skyHex: '#E76F51', solarHex: '#F4A261' },
  { label: 'Morning', time: '09:30', hour: 9.5, skyHex: '#457B9D', solarHex: '#A8DADC' },
  { label: 'Solar Noon', time: '12:30', hour: 12.5, skyHex: '#1D3557', solarHex: '#F1FAEE' },
  { label: 'Afternoon', time: '15:45', hour: 15.8, skyHex: '#2A6F97', solarHex: '#89C2D9' },
  { label: 'Golden Hour', time: '18:15', hour: 18.2, skyHex: '#DDA15E', solarHex: '#BC6C25' },
  { label: 'Sunset', time: '19:15', hour: 19.2, skyHex: '#9B2226', solarHex: '#CA6702' },
  { label: 'Twilight', time: '20:30', hour: 20.5, skyHex: '#22223B', solarHex: '#4A4E69' },
  { label: 'Midnight', time: '00:00', hour: 0.0, skyHex: '#0B090A', solarHex: '#161A1D' },
];

export const LiveColorsPage: React.FC<LiveColorsPageProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const { isSaved, saveItem, removeItem, savedItems } = useSaved();
  const { addPalette } = useLibraryData();

  const [selectedLocation, setSelectedLocation] = useState<LiveLocation>(PRESET_LOCATIONS[1]); // Default Ahmedabad
  const [weatherData, setWeatherData] = useState<LiveWeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [atmosphere, setAtmosphere] = useState<LiveAtmosphere>(() =>
    generateLiveAtmosphere(PRESET_LOCATIONS[1], null)
  );
  const [simulatedHour, setSimulatedHour] = useState<number | null>(null);
  const [exportMode, setExportMode] = useState<'css' | 'hex' | 'tailwind' | 'json'>('css');
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // Load real meteorological data and compute atmospheric color spectrum
  const updateAtmosphere = useCallback(
    async (loc: LiveLocation, simHour: number | null = null) => {
      setWeatherError(null);
      let wData = weatherData;
      if (loc.latitude !== 0 && loc.longitude !== 0) {
        setLoadingWeather(true);
        try {
          const res = await fetchRealWeather(loc.latitude, loc.longitude);
          if (res) {
            wData = res;
            setWeatherData(res);
          }
        } catch {
          setWeatherError('Live satellite feed offline. Using deterministic astronomical calculations.');
        } finally {
          setLoadingWeather(false);
        }
      }

      const atmo = generateLiveAtmosphere({ ...loc }, wData);

      // Override solar phase if simulating time
      if (simHour !== null) {
        atmo.solarPhase = getSolarPhase(simHour, 0);
        atmo.title = `${loc.name} • ${atmo.solarPhase.toUpperCase()} (SIMULATED)`;
      }

      setAtmosphere(atmo);
    },
    [weatherData]
  );

  useEffect(() => {
    updateAtmosphere(selectedLocation, simulatedHour);
  }, [selectedLocation, simulatedHour]);

  // Request browser geolocation
  const handleUseDeviceLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser');
      return;
    }

    setLoadingWeather(true);
    setWeatherError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLoc: LiveLocation = {
          name: 'Current Device Horizon',
          country: 'Local Observatory',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        setSelectedLocation(userLoc);
        setSimulatedHour(null);
        showToast('Connected to Local Coordinates', `${pos.coords.latitude.toFixed(2)}°, ${pos.coords.longitude.toFixed(2)}°`);
      },
      () => {
        setLoadingWeather(false);
        setWeatherError('Unable to access device location. Using default coordinates.');
        showToast('Location unavailable', 'Defaulting to global preset');
      },
      { timeout: 8000 }
    );
  };

  const handleCopySingleHex = async (hex: string, name: string) => {
    const success = await copyToClipboard(hex);
    if (success) {
      setCopiedHex(hex);
      setTimeout(() => setCopiedHex(null), 1800);
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
      showToast('Weather Color link copied to clipboard', atmosphere.title);
    }
  };

  const hexHash = atmosphere.swatches.map((s) => s.hex.replace('#', '').toLowerCase()).join('-');
  const canonicalSlug = `live-${atmosphere.locationName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${atmosphere.solarPhase.toLowerCase()}-${hexHash.slice(0, 12)}`;
  const isCurrentSaved = isSaved(canonicalSlug);

  const handleSaveToWorkspace = () => {
    const title = `${atmosphere.locationName} ${atmosphere.solarPhase}`;
    const preview = atmosphere.swatches.map((s) => s.hex).join(',');

    if (isCurrentSaved) {
      removeItem(canonicalSlug);
      showToast('Removed from saved collection', atmosphere.title);
      return;
    }

    saveItem({
      id: canonicalSlug,
      type: 'palette',
      title,
      slug: canonicalSlug,
      preview,
      metadata: `${atmosphere.solarPhase} • ${atmosphere.weatherSummary}`,
    });

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
      tags: ['live', 'weather', 'atmosphere', atmosphere.solarPhase.toLowerCase()],
    });

    showToast('Saved weather atmosphere to collection', atmosphere.title);
  };

  // Astronomical Solar Elevation estimation in degrees (-90° to +90°)
  const estimatedElevation = useMemo(() => {
    const h = atmosphere.localTimeHours;
    const angle = Math.round(Math.sin(((h - 6) / 12) * Math.PI) * 72);
    return angle;
  }, [atmosphere.localTimeHours]);

  // Saved weather/atmosphere items
  const savedWeatherItems = useMemo(() => {
    return savedItems.filter(
      (item) =>
        item.id.startsWith('live-') ||
        item.slug.startsWith('live-') ||
        item.metadata?.includes('•') ||
        item.title.toLowerCase().includes('atmosphere')
    );
  }, [savedItems]);

  // Export formats
  const getCssVariables = () => {
    const lines = atmosphere.swatches.map(
      (s) => `  --kroma-weather-${s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}: ${s.hex};`
    );
    return `:root {\n  /* KROMA Weather Color Spectrum: ${atmosphere.title} */\n${lines.join('\n')}\n}`;
  };

  const getCleanHexList = () => {
    return atmosphere.swatches.map((s) => `${s.hex}  /* ${s.name} (${s.role}) */`).join('\n');
  };

  const getTailwindConfig = () => {
    const obj: Record<string, string> = {};
    atmosphere.swatches.forEach((s) => {
      obj[s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')] = s.hex;
    });
    return JSON.stringify({ colors: { weather: obj } }, null, 2);
  };

  const getJsonExport = () => {
    return JSON.stringify(
      {
        title: atmosphere.title,
        location: atmosphere.locationName,
        coordinates: {
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
        },
        solarElevationDeg: estimatedElevation,
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

  const findMatchingColorSlug = (hex: string) => {
    const match = CURATED_COLORS.find((c) => c.hex.toLowerCase() === hex.toLowerCase());
    return match ? match.slug : null;
  };

  const relatedPalettes = CURATED_PALETTES.slice(0, 3);
  const relatedCombos = CURATED_COMBOS.slice(0, 3);
  const relatedGradients = CURATED_GRADIENTS.slice(0, 3);

  // Solar Phase Icon
  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'Sunrise':
      case 'Dawn':
        return <Sunrise size={13} className="text-[#FF9500]" />;
      case 'Solar Noon':
      case 'Morning':
      case 'Afternoon':
        return <Sun size={13} className="text-[#FFD60A]" />;
      case 'Golden Hour':
      case 'Sunset':
        return <Sunset size={13} className="text-[#FF3B30]" />;
      case 'Twilight':
      case 'Midnight Abyss':
      default:
        return <Moon size={13} className="text-[#00AEEF]" />;
    }
  };

  // Weather Condition Icon
  const getWeatherIcon = () => {
    const code = weatherData?.weatherCode ?? 0;
    const { weatherType } = interpretWeatherCode(code);
    switch (weatherType) {
      case 'rain':
        return <CloudRain size={13} className="text-[#00AEEF]" />;
      case 'snow':
        return <Snowflake size={13} className="text-[#00AEEF]" />;
      case 'storm':
        return <Zap size={13} className="text-[#FF9500]" />;
      case 'cloudy':
        return <Cloud size={13} className="text-[#707070]" />;
      case 'clear':
      default:
        return <Sun size={13} className="text-[#FFD60A]" />;
    }
  };

  // Thermal position along scale (-10°C to +40°C)
  const thermalPercent = Math.max(0, Math.min(100, ((atmosphere.temperatureC - (-10)) / (40 - (-10))) * 100));

  const liveSchema = useMemo(() => {
    return generateWebApplicationSchema({
      name: 'KROMA Weather Color Synthesizer',
      description:
        'Real-time chromatic synthesis engine rendering deterministic environmental color palettes from solar angles, atmospheric Rayleigh scatter, and weather conditions.',
      url: '/weather',
      applicationCategory: 'DesignApplication',
    });
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-8 pb-16 px-4 sm:px-6">
      <SEOHead
        title="Weather Color | Real-Time Atmospheric & Solar Palettes | Kroma"
        description="Real-time environmental color palettes synthesized from live solar elevation, Rayleigh scatter, geographic coordinates, and global meteorological observations."
        canonicalPath="/weather"
        jsonLd={liveSchema}
        keywords={['weather color', 'atmospheric color', 'sky palette', 'solar elevation color', 'environmental color system']}
      />

      <PageHeader
        breadcrumbs={[
          { label: 'Home', to: { path: 'home' } },
          { label: 'Studios', to: { path: 'create' } },
          { label: 'Weather Color', isCurrent: true },
        ]}
        onNavigate={onNavigate}
        sectionLabel="08 • REAL-TIME CHROMATIC OBSERVATORY"
        title="Atmospheric Weather Color"
        description="What does the world look like right now? Deterministic chromatic atmospheres synthesized from real-time solar elevation, Rayleigh scatter, geographic coordinates, and atmospheric temperatures."
        actions={
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap w-full sm:w-auto">
            <Button
              variant="secondary"
              size="sm"
              iconLeft={<RefreshCw size={13} className={loadingWeather ? 'animate-spin' : ''} />}
              onClick={() => updateAtmosphere(selectedLocation, simulatedHour)}
              disabled={loadingWeather}
              title="Refresh environmental data"
            >
              {loadingWeather ? 'Syncing...' : 'Sync Live'}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              iconLeft={<Share2 size={13} />}
              onClick={handleShare}
              title="Share Weather Color URL"
            >
              Share
            </Button>

            <Button
              variant="primary"
              size="sm"
              iconLeft={<Bookmark size={13} fill={isCurrentSaved ? 'currentColor' : 'none'} />}
              onClick={handleSaveToWorkspace}
              title="Save to Personal Workspace"
            >
              {isCurrentSaved ? 'Saved' : 'Save System'}
            </Button>
          </div>
        }
      />

      {/* Error / Offline Alert banner */}
      {weatherError && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-[4px] text-xs font-mono text-[#FF3B30]">
          <AlertCircle size={14} className="shrink-0" />
          <span>{weatherError}</span>
        </div>
      )}

      {/* ─── 01. OBSERVATORY TELEMETRY & PARAMETER CARD ─────────────── */}
      <KromaCard as="section" interactive={false} variant="default">
        <KromaCardBody className="p-4 sm:p-5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Location Selector Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 font-mono text-xs text-[#707070]">
              <MapPin size={14} className="text-[#FF9500] shrink-0" />
              <span className="uppercase font-semibold tracking-wider">OBSERVATORY:</span>
            </div>

            <select
              value={selectedLocation.name}
              onChange={(e) => {
                const loc = PRESET_LOCATIONS.find((l) => l.name === e.target.value) || PRESET_LOCATIONS[1];
                setSelectedLocation(loc);
                setSimulatedHour(null);
              }}
              className="bg-white dark:bg-[#1C1D22] border border-black/15 dark:border-white/15 rounded-[3px] px-3 py-1.5 text-xs text-[#171717] dark:text-white font-sans font-semibold cursor-pointer outline-none transition-colors hover:border-black/30 dark:hover:border-white/30"
              aria-label="Select observatory location"
            >
              {PRESET_LOCATIONS.map((loc) => (
                <option key={loc.name} value={loc.name}>
                  {loc.name} ({loc.country})
                </option>
              ))}
            </select>

            <KromaButton
              variant="outline"
              size="sm"
              onClick={handleUseDeviceLocation}
              disabled={loadingWeather}
              iconLeft={<Compass size={12} className={loadingWeather ? 'animate-spin' : ''} />}
            >
              Use My GPS
            </KromaButton>
          </div>

          {/* Meteorological Telemetry Readout Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-5 pt-3 lg:pt-0 border-t lg:border-t-0 border-black/[0.08] dark:border-white/[0.08]">
            {/* Metric 1: Local Time Card */}
            <div className="p-2.5 bg-white dark:bg-[#1C1D22] border border-black/[0.06] dark:border-white/[0.06] rounded-[3px] flex flex-col gap-0.5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#707070] flex items-center gap-1">
                <Clock size={11} /> LOCAL TIME
              </span>
              <span className="font-mono text-xs sm:text-[13px] font-bold text-[#171717] dark:text-white">
                {atmosphere.localTimeFormatted}
              </span>
            </div>

            {/* Metric 2: Solar Phase Card */}
            <div className="p-2.5 bg-white dark:bg-[#1C1D22] border border-black/[0.06] dark:border-white/[0.06] rounded-[3px] flex flex-col gap-0.5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#707070] flex items-center gap-1">
                {getPhaseIcon(atmosphere.solarPhase)} SOLAR PHASE
              </span>
              <span className="font-sans text-xs sm:text-[13px] font-bold text-[#171717] dark:text-white truncate">
                {atmosphere.solarPhase}
              </span>
            </div>

            {/* Metric 3: Weather Condition Card */}
            <div className="p-2.5 bg-white dark:bg-[#1C1D22] border border-black/[0.06] dark:border-white/[0.06] rounded-[3px] flex flex-col gap-0.5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#707070] flex items-center gap-1">
                {getWeatherIcon()} WEATHER
              </span>
              <span className="font-sans text-xs sm:text-[13px] font-bold text-[#171717] dark:text-white truncate">
                {atmosphere.temperatureC}°C • {atmosphere.season}
              </span>
            </div>

            {/* Metric 4: Solar Elevation Angle Card */}
            <div className="p-2.5 bg-white dark:bg-[#1C1D22] border border-black/[0.06] dark:border-white/[0.06] rounded-[3px] flex flex-col gap-0.5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#707070] flex items-center gap-1">
                <Sun size={11} /> SOLAR ANGLE
              </span>
              <span className="font-mono text-xs sm:text-[13px] font-bold text-[#00AEEF]">
                {estimatedElevation > 0 ? `+${estimatedElevation}°` : `${estimatedElevation}°`}
              </span>
            </div>
          </div>
        </KromaCardBody>
      </KromaCard>

      {/* ─── 02. ATMOSPHERIC TEMPERATURE & OPTICAL SCATTER CARD ─────── */}
      <KromaCard as="section" interactive={false} variant="default">
        <KromaCardBody className="p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
          {/* Temperature & Thermal Chromatic Band */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[10.5px] font-semibold tracking-[0.1em] uppercase text-[#707070] flex items-center gap-1.5">
                <Thermometer size={12} className="text-[#FF9500]" />
                <span>THERMAL CHROMATIC INDEX</span>
              </span>
              <span className="font-mono text-xs font-bold text-[#171717] dark:text-white">
                {atmosphere.temperatureC}°C / {Math.round(atmosphere.temperatureC * 1.8 + 32)}°F
              </span>
            </div>

            {/* Visual Thermal Scale Bar */}
            <div className="relative w-full h-3 rounded-[2px] overflow-hidden bg-black/10 dark:bg-white/10">
              <div
                className="w-full h-full"
                style={{
                  background: 'linear-gradient(90deg, #00AEEF 0%, #007AFF 25%, #34C759 50%, #FF9500 75%, #FF3B30 100%)',
                }}
              />
              {/* Pointer indicator */}
              <div
                className="absolute top-0 bottom-0 w-1.5 bg-white shadow-[0_0_4px_rgba(0,0,0,0.6)] -ml-[3px]"
                style={{ left: `${thermalPercent}%` }}
                title={`Ambient reading: ${atmosphere.temperatureC}°C`}
              />
            </div>

            <div className="flex justify-between font-mono text-[9.5px] text-[#707070] uppercase">
              <span>-10°C (Glacial)</span>
              <span>15°C (Temperate)</span>
              <span>+40°C (Arid Solar)</span>
            </div>
          </div>

          {/* Rayleigh Scatter & Light Density Narrative */}
          <div className="md:w-1/2 md:border-l md:border-black/[0.08] dark:md:border-white/[0.08] md:pl-6 flex flex-col justify-center">
            <div className="flex items-center gap-1.5 font-mono text-[10.5px] text-[#707070] uppercase font-semibold mb-1">
              <SlidersHorizontal size={11} className="text-[#00AEEF]" />
              <span>ATMOSPHERIC RAYLEIGH SCATTERING</span>
            </div>
            <p className="font-sans text-xs text-[#707070] dark:text-[#A0A0A0] leading-relaxed m-0">
              Solar elevation of <strong className="text-[#171717] dark:text-white font-mono">{estimatedElevation}°</strong> produces an optical air mass factor that shifts ambient horizon wavelengths toward{' '}
              <strong className="text-[#171717] dark:text-white">{atmosphere.swatches[0]?.name}</strong> while sustaining zenith depth in <strong className="text-[#171717] dark:text-white">{atmosphere.swatches[3]?.name}</strong>.
            </p>
          </div>
        </KromaCardBody>
      </KromaCard>

      {/* ─── 03. OBSERVATORY GLOBAL LOCATIONS GRID ─────────────────── */}
      <section className="flex flex-col gap-3.5">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4">
          <div>
            <span className="font-mono text-[10.5px] font-semibold tracking-[0.1em] uppercase text-[#707070] flex items-center gap-2">
              <span>01</span>
              <span>•</span>
              <span>GLOBAL OBSERVATORIES</span>
            </span>
            <h2 className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-[#171717] dark:text-white uppercase m-0">
              World Atmospheric Conditions
            </h2>
          </div>
          <span className="font-mono text-[10px] sm:text-xs text-[#707070] uppercase">
            SELECT TO SYNTHESIZE LOCAL SKY SPECTRUM
          </span>
        </div>

        {/* 9 Preset Location Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {PRESET_LOCATIONS.filter((loc) => loc.name !== 'Local Device').map((loc) => {
            const isCurrent = selectedLocation.name === loc.name;
            const local = getLocalTimeInTimezone(loc.timezone);
            const phase = getSolarPhase(local.hours, local.minutes);

            return (
              <KromaCard
                key={loc.name}
                variant="default"
                className={`cursor-pointer transition-all ${
                  isCurrent ? 'ring-2 ring-[#00AEEF] border-[#00AEEF]' : ''
                }`}
                onClick={() => {
                  setSelectedLocation(loc);
                  setSimulatedHour(null);
                }}
                role="button"
                tabIndex={0}
              >
                <div className="p-3 flex flex-col justify-between h-full gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-[#707070] uppercase">
                      {local.formatted}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[9px] uppercase text-[#FF9500]">
                      {getPhaseIcon(phase)}
                    </span>
                  </div>

                  <div>
                    <div className="font-sans text-xs sm:text-sm font-bold text-[#171717] dark:text-white truncate">
                      {loc.name}
                    </div>
                    <div className="font-sans text-[11px] text-[#707070] truncate">
                      {loc.country}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1.5 border-t border-black/[0.06] dark:border-white/[0.06]">
                    <span className="font-mono text-[9px] text-[#707070] truncate">
                      {loc.latitude > 0 ? `${loc.latitude.toFixed(0)}°N` : `${Math.abs(loc.latitude).toFixed(0)}°S`}
                    </span>
                    <span className="font-mono text-[9px] font-semibold uppercase text-[#00AEEF] truncate">
                      {phase}
                    </span>
                  </div>
                </div>
              </KromaCard>
            );
          })}
        </div>
      </section>

      {/* ─── 04. COLOR-OF-WEATHER MAIN VISUALIZATION HERO CARD ──────── */}
      <KromaCard as="section" interactive={false} variant="featured" className="overflow-hidden">
        <KromaCardVisual heightClass="min-h-[280px] sm:min-h-[380px] w-full relative">
          <div
            className="w-full h-full min-h-[280px] sm:min-h-[380px] p-6 sm:p-10 flex flex-col justify-between relative transition-all duration-300"
            style={{ background: atmosphere.gradientCss }}
          >
            {/* Top Bar: Broadcast Pill & Copy Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
              <div className="inline-flex items-center gap-2 bg-black/60 px-3 py-1 rounded-[3px] backdrop-blur-md border border-white/15 self-start">
                <span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse" />
                <span className="font-mono text-[11px] text-white uppercase tracking-wider font-semibold">
                  LIVE ATMOSPHERIC BROADCAST • {atmosphere.solarPhase.toUpperCase()} • {atmosphere.weatherSummary}
                </span>
              </div>

              <button
                onClick={handleCopyAll}
                className="bg-black/60 hover:bg-black/85 text-white px-3.5 py-1.5 rounded-[3px] border border-white/15 inline-flex items-center gap-2 text-xs font-mono font-medium backdrop-blur-md transition-all self-start sm:self-auto cursor-pointer"
              >
                <Copy size={12} />
                <span>COPY SPECTRUM</span>
              </button>
            </div>

            {/* Bottom Hero Description */}
            <div className="relative z-10 mt-6 sm:mt-0">
              <div className="font-mono text-[11px] tracking-[0.14em] uppercase text-white/80 mb-1">
                CHROMATIC HORIZON CAPTURE
              </div>
              <h2 className="font-sans text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white m-0">
                {atmosphere.title}
              </h2>
              <p className="font-sans text-xs sm:text-sm text-white/90 max-w-2xl leading-relaxed mt-2 m-0">
                {atmosphere.description}
              </p>
            </div>
          </div>
        </KromaCardVisual>

        {/* 5-Band Weather-Generated Palette Strip */}
        <div className="w-full overflow-x-auto border-t border-black/[0.08] dark:border-white/[0.08]">
          <div className="h-32 sm:h-36 flex min-w-[540px] sm:min-w-0 w-full">
            {atmosphere.swatches.map((s, idx) => (
              <div
                key={idx}
                style={{ backgroundColor: s.hex }}
                className="group/swatch flex-1 flex flex-col justify-between p-3.5 sm:p-4 cursor-pointer transition-[flex] duration-200 hover:flex-[1.4]"
                onClick={() => handleCopySingleHex(s.hex, s.name)}
                title={`Click to copy ${s.name} (${s.hex})`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-semibold text-white bg-black/60 px-1.5 py-0.5 rounded-[2px] w-fit">
                    0{idx + 1}
                  </span>
                  {copiedHex === s.hex && (
                    <span className="font-mono text-[10px] text-[#34C759] bg-black/80 px-1.5 py-0.5 rounded-[2px]">
                      COPIED
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="font-mono text-xs sm:text-[13px] font-bold text-white drop-shadow-sm truncate">
                    {s.hex}
                  </div>
                  <div className="font-sans text-[11px] sm:text-xs text-white/95 font-medium truncate">
                    {s.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </KromaCard>

      {/* ─── 05. 24-HOUR SOLAR CHROMA & FORECAST TIMELINE ─────────── */}
      <section className="flex flex-col gap-3.5">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4">
          <div>
            <span className="font-mono text-[10.5px] font-semibold tracking-[0.1em] uppercase text-[#707070] flex items-center gap-2">
              <span>02</span>
              <span>•</span>
              <span>SOLAR TRAJECTORY</span>
            </span>
            <h2 className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-[#171717] dark:text-white uppercase m-0">
              24-Hour Solar Chromatic Forecast
            </h2>
          </div>
          {simulatedHour !== null && (
            <button
              className="inline-flex items-center gap-1.5 font-mono text-xs text-[#FF3B30] hover:underline cursor-pointer bg-transparent border-0 p-0"
              onClick={() => setSimulatedHour(null)}
            >
              <RefreshCw size={11} />
              <span>Reset to Real-Time</span>
            </button>
          )}
        </div>

        {/* Forecast Cards Row */}
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2.5 sm:gap-3">
          {SOLAR_FORECAST_MILESTONES.map((mile) => {
            const isSelected = simulatedHour === mile.hour;
            return (
              <KromaCard
                key={mile.label}
                variant="default"
                className={`cursor-pointer transition-all ${
                  isSelected ? 'ring-2 ring-[#00AEEF] border-[#00AEEF]' : ''
                }`}
                onClick={() => setSimulatedHour(mile.hour)}
                role="button"
                tabIndex={0}
              >
                {/* Visual mini dual split */}
                <div className="w-full h-12 flex overflow-hidden border-b border-black/[0.08] dark:border-white/[0.08]">
                  <div className="flex-1 h-full" style={{ backgroundColor: mile.skyHex }} />
                  <div className="flex-1 h-full" style={{ backgroundColor: mile.solarHex }} />
                </div>
                <div className="p-2.5 flex flex-col gap-0.5">
                  <span className="font-sans text-[11.5px] font-bold text-[#171717] dark:text-white truncate">
                    {mile.label}
                  </span>
                  <span className="font-mono text-[10px] text-[#707070]">
                    {mile.time}
                  </span>
                </div>
              </KromaCard>
            );
          })}
        </div>
      </section>

      {/* ─── 06. DETAILED ATMOSPHERIC SWATCH SPECTRUM CARDS ────────── */}
      <section className="flex flex-col gap-3.5">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4">
          <div>
            <span className="font-mono text-[10.5px] font-semibold tracking-[0.1em] uppercase text-[#707070] flex items-center gap-2">
              <span>03</span>
              <span>•</span>
              <span>CALIBRATED SWATCHES</span>
            </span>
            <h2 className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-[#171717] dark:text-white uppercase m-0">
              Atmospheric Swatch Spectrum
            </h2>
          </div>
          <span className="font-mono text-[10px] sm:text-xs text-[#707070] uppercase">
            CLICK TO COPY HEX • {atmosphere.swatches.length} CALIBRATED TONES
          </span>
        </div>

        {/* 5 Swatch Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {atmosphere.swatches.map((s, idx) => {
            const slug = findMatchingColorSlug(s.hex);
            return (
              <KromaCard key={idx} variant="default" className="flex flex-col justify-between">
                <div>
                  {/* Full-bleed color swatch hero */}
                  <KromaCardVisual heightClass="h-28 relative">
                    <div
                      className="w-full h-full cursor-pointer flex items-end justify-between p-3"
                      style={{ backgroundColor: s.hex }}
                      onClick={() => handleCopySingleHex(s.hex, s.name)}
                      title={`Click to copy ${s.hex}`}
                    >
                      <span className="font-mono text-[10px] font-semibold text-white bg-black/60 px-1.5 py-0.5 rounded-[2px]">
                        0{idx + 1}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopySingleHex(s.hex, s.name);
                        }}
                        className="opacity-0 group-hover/card:opacity-100 transition-opacity bg-black/75 hover:bg-black text-white text-[10px] font-mono px-2 py-0.5 rounded-[2px] inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Copy size={10} />
                        <span>{s.hex}</span>
                      </button>
                    </div>
                  </KromaCardVisual>

                  <KromaCardBody className="p-3.5 flex flex-col gap-1.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-sans font-bold text-xs sm:text-[13px] text-[#171717] dark:text-white truncate">
                        {s.name}
                      </span>
                      <button
                        onClick={() => handleCopySingleHex(s.hex, s.name)}
                        className="font-mono text-xs text-[#707070] hover:text-[#171717] dark:hover:text-white font-semibold cursor-pointer shrink-0"
                      >
                        {s.hex}
                      </button>
                    </div>

                    <div className="font-mono text-[10px] text-[#FF9500] uppercase font-medium">
                      ROLE: {s.role}
                    </div>

                    <p className="font-sans text-[11px] text-[#707070] leading-relaxed m-0 mt-0.5">
                      {s.description}
                    </p>
                  </KromaCardBody>
                </div>

                {slug && (
                  <KromaCardFooter className="px-3.5 py-2.5 border-t border-black/[0.08] dark:border-white/[0.08]">
                    <button
                      onClick={() => onNavigate({ path: 'color-detail', slug })}
                      className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-[#171717] dark:text-white hover:text-[#00AEEF] dark:hover:text-[#00AEEF] transition-colors cursor-pointer bg-transparent border-0 p-0"
                    >
                      <span>View Specimen</span>
                      <ExternalLink size={10} />
                    </button>
                  </KromaCardFooter>
                )}
              </KromaCard>
            );
          })}
        </div>
      </section>

      {/* ─── 07. PRODUCTION DESIGN TOKEN EXPORT CARD ──────────────── */}
      <KromaCard as="section" interactive={false} variant="default">
        <KromaCardBody className="p-5 sm:p-6 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-mono text-[10.5px] font-semibold tracking-[0.1em] uppercase text-[#707070] flex items-center gap-2">
                <span>04</span>
                <span>•</span>
                <span>PRODUCTION TOKENS</span>
              </span>
              <h2 className="font-sans text-lg sm:text-xl font-bold tracking-tight text-[#171717] dark:text-white uppercase m-0">
                Export Atmospheric Tokens
              </h2>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {(['css', 'hex', 'tailwind', 'json'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setExportMode(mode)}
                  className={`px-3 py-1 rounded-[3px] font-mono text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    exportMode === mode
                      ? 'bg-[#171717] text-white dark:bg-white dark:text-[#171717]'
                      : 'bg-black/[0.05] dark:bg-white/[0.06] text-[#707070] hover:text-[#171717] dark:hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <pre className="p-4 bg-white dark:bg-[#121316] border border-black/[0.08] dark:border-white/[0.08] rounded-[3px] font-mono text-xs text-[#171717] dark:text-white/90 overflow-x-auto leading-relaxed m-0">
              <code>{currentExportCode}</code>
            </pre>

            <div className="absolute top-3 right-3">
              <KromaButton
                variant="outline"
                size="sm"
                onClick={handleCopyTokens}
                iconLeft={<Copy size={12} />}
              >
                Copy Tokens
              </KromaButton>
            </div>
          </div>
        </KromaCardBody>
      </KromaCard>

      {/* ─── 08. SAVED WEATHER-COLOR ITEMS ─────────────────────────── */}
      <section className="flex flex-col gap-3.5">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4">
          <div>
            <span className="font-mono text-[10.5px] font-semibold tracking-[0.1em] uppercase text-[#707070] flex items-center gap-2">
              <span>05</span>
              <span>•</span>
              <span>PERSONAL WORKSPACE</span>
            </span>
            <h2 className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-[#171717] dark:text-white uppercase m-0">
              Saved Atmospheric Items
            </h2>
          </div>
          {savedWeatherItems.length > 0 && (
            <span className="font-mono text-xs text-[#707070]">
              {savedWeatherItems.length} SAVED SPECTRA
            </span>
          )}
        </div>

        {savedWeatherItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedWeatherItems.map((item) => {
              const hexList = item.preview ? item.preview.split(',') : [];
              return (
                <KromaCard key={item.id} variant="default" className="flex flex-col justify-between">
                  <div>
                    {/* Swatch strip visual */}
                    <div className="w-full h-16 flex overflow-hidden border-b border-black/[0.08] dark:border-white/[0.08]">
                      {hexList.map((hex, i) => (
                        <div
                          key={i}
                          className="flex-1 h-full transition-[flex] duration-200 hover:flex-[1.5]"
                          style={{ backgroundColor: hex }}
                          title={hex}
                        />
                      ))}
                    </div>

                    <div className="p-3.5 flex flex-col gap-1">
                      <div className="font-sans font-bold text-sm text-[#171717] dark:text-white truncate">
                        {item.title}
                      </div>
                      {item.metadata && (
                        <div className="font-mono text-[10px] text-[#707070] truncate">
                          {item.metadata}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-3.5 pt-0 flex items-center justify-between border-t border-black/[0.06] dark:border-white/[0.06] mt-2">
                    <button
                      onClick={() => {
                        copyToClipboard(hexList.join(', '));
                        showToast('Copied saved palette hexes', item.title);
                      }}
                      className="inline-flex items-center gap-1 font-mono text-[11px] text-[#707070] hover:text-[#171717] dark:hover:text-white cursor-pointer bg-transparent border-0 p-0"
                    >
                      <Copy size={11} />
                      <span>Copy Hexes</span>
                    </button>

                    <button
                      onClick={() => {
                        removeItem(item.id);
                        showToast('Removed saved atmosphere', item.title);
                      }}
                      className="inline-flex items-center gap-1 font-mono text-[11px] text-[#FF3B30] hover:underline cursor-pointer bg-transparent border-0 p-0"
                    >
                      <Trash2 size={11} />
                      <span>Remove</span>
                    </button>
                  </div>
                </KromaCard>
              );
            })}
          </div>
        ) : (
          /* Empty State Card */
          <KromaCard interactive={false} variant="default">
            <KromaCardBody className="p-8 sm:p-12 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-[#707070]">
                <Bookmark size={18} />
              </div>
              <div className="font-mono text-xs font-semibold tracking-[0.08em] uppercase text-[#171717] dark:text-white">
                NO SAVED ATMOSPHERES YET
              </div>
              <p className="font-sans text-xs text-[#707070] max-w-md leading-relaxed m-0">
                Capture the unique lighting of dawn, solar noon, or stormy twilights from any observatory and archive them directly to your personal palette library.
              </p>
              <div className="mt-2">
                <KromaButton
                  variant="filled"
                  size="sm"
                  onClick={handleSaveToWorkspace}
                  iconLeft={<Bookmark size={12} />}
                >
                  Save Current Atmosphere
                </KromaButton>
              </div>
            </KromaCardBody>
          </KromaCard>
        )}
      </section>

      {/* ─── 09. CONNECTED LIBRARY DISCOVERY ──────────────────────── */}
      {relatedPalettes.length > 0 && (
        <section className="flex flex-col gap-3.5">
          <div>
            <span className="font-mono text-[10.5px] font-semibold tracking-[0.1em] uppercase text-[#707070] flex items-center gap-2">
              <span>06</span>
              <span>•</span>
              <span>HARMONIC SPECIMENS</span>
            </span>
            <h2 className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-[#171717] dark:text-white uppercase m-0">
              Palettes Harmonizing with {atmosphere.solarPhase}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {relatedPalettes.map((p) => (
              <PaletteCard key={p.id} palette={p} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}

      {relatedCombos.length > 0 && (
        <section className="flex flex-col gap-3.5">
          <div>
            <span className="font-mono text-[10.5px] font-semibold tracking-[0.1em] uppercase text-[#707070] flex items-center gap-2">
              <span>07</span>
              <span>•</span>
              <span>DUAL HARMONIES</span>
            </span>
            <h2 className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-[#171717] dark:text-white uppercase m-0">
              Relational Duos in this Atmosphere
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {relatedCombos.map((cb) => (
              <ComboCard key={cb.id} combo={cb} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}

      {relatedGradients.length > 0 && (
        <section className="flex flex-col gap-3.5">
          <div>
            <span className="font-mono text-[10.5px] font-semibold tracking-[0.1em] uppercase text-[#707070] flex items-center gap-2">
              <span>08</span>
              <span>•</span>
              <span>ATMOSPHERIC GRADIENTS</span>
            </span>
            <h2 className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-[#171717] dark:text-white uppercase m-0">
              Gradients Matching Current Sky Clarity
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {relatedGradients.map((g) => (
              <GradientCard key={g.id} gradient={g} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
