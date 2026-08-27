// Real-Time Environmental Color Engine for KROMA / Palette Paradise
import { hslToHex, hexToRgb, getContrastRatio, getTextColorForBackground } from './colorUtils';

export interface LiveLocation {
  name: string;
  country: string;
  timezone: string;
  latitude: number;
  longitude: number;
}

export interface LiveWeatherData {
  temperatureC: number;
  weatherCode: number; // WMO Weather code
  conditionName: string;
  isDay: boolean;
  cloudCover?: number;
  source: 'open-meteo' | 'time-solar-estimate';
  retrievedAt: number;
}

export interface LiveColorSwatch {
  name: string;
  hex: string;
  role: 'Horizon / Sky' | 'Solar Light' | 'Atmospheric Tone' | 'Terrain & Shadow' | 'Dynamic Accent';
  description: string;
}

export interface LiveAtmosphere {
  locationName: string;
  localTimeFormatted: string;
  localTimeHours: number;
  solarPhase: 'Dawn' | 'Sunrise' | 'Morning' | 'Solar Noon' | 'Afternoon' | 'Golden Hour' | 'Sunset' | 'Twilight' | 'Midnight Abyss';
  season: 'Spring' | 'Summer' | 'Autumn' | 'Winter';
  weatherSummary: string;
  temperatureC: number;
  title: string;
  description: string;
  swatches: LiveColorSwatch[];
  gradientCss: string;
  updatedAt: number;
}

export const PRESET_LOCATIONS: LiveLocation[] = [
  { name: 'Local Device', country: 'Current Timezone', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC', latitude: 0, longitude: 0 },
  { name: 'Ahmedabad', country: 'India', timezone: 'Asia/Kolkata', latitude: 23.0225, longitude: 72.5714 },
  { name: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo', latitude: 35.6762, longitude: 139.6503 },
  { name: 'London', country: 'United Kingdom', timezone: 'Europe/London', latitude: 51.5074, longitude: -0.1278 },
  { name: 'New York', country: 'United States', timezone: 'America/New_York', latitude: 40.7128, longitude: -74.0060 },
  { name: 'Reykjavik', country: 'Iceland', timezone: 'Atlantic/Reykjavik', latitude: 64.1466, longitude: -21.9426 },
  { name: 'Cairo', country: 'Egypt', timezone: 'Africa/Cairo', latitude: 30.0444, longitude: 31.2357 },
  { name: 'São Paulo', country: 'Brazil', timezone: 'America/Sao_Paulo', latitude: -23.5505, longitude: -46.6333 },
  { name: 'Sydney', country: 'Australia', timezone: 'Australia/Sydney', latitude: -33.8688, longitude: 151.2093 },
  { name: 'Paris', country: 'France', timezone: 'Europe/Paris', latitude: 48.8566, longitude: 2.3522 },
];

export function getLocalTimeInTimezone(tz: string): { hours: number; minutes: number; formatted: string; month: number } {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
      month: 'numeric',
    });
    const parts = formatter.formatToParts(now);
    const h = parseInt(parts.find((p) => p.type === 'hour')?.value || '12', 10);
    const m = parseInt(parts.find((p) => p.type === 'minute')?.value || '00', 10);
    const mo = parseInt(parts.find((p) => p.type === 'month')?.value || '1', 10);

    const timeStr = new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(now);

    return { hours: h, minutes: m, formatted: timeStr, month: mo };
  } catch {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    return {
      hours: h,
      minutes: m,
      formatted: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`,
      month: now.getMonth() + 1,
    };
  }
}

export function getSeason(month: number, latitude: number): 'Spring' | 'Summer' | 'Autumn' | 'Winter' {
  const isNorthern = latitude >= 0;
  if (isNorthern) {
    if (month >= 3 && month <= 5) return 'Spring';
    if (month >= 6 && month <= 8) return 'Summer';
    if (month >= 9 && month <= 11) return 'Autumn';
    return 'Winter';
  } else {
    if (month >= 9 && month <= 11) return 'Spring';
    if (month >= 12 || month <= 2) return 'Summer';
    if (month >= 3 && month <= 5) return 'Autumn';
    return 'Winter';
  }
}

export function getSolarPhase(hours: number, minutes: number): 'Dawn' | 'Sunrise' | 'Morning' | 'Solar Noon' | 'Afternoon' | 'Golden Hour' | 'Sunset' | 'Twilight' | 'Midnight Abyss' {
  const time = hours + minutes / 60;
  if (time >= 4.5 && time < 6.0) return 'Dawn';
  if (time >= 6.0 && time < 7.5) return 'Sunrise';
  if (time >= 7.5 && time < 11.5) return 'Morning';
  if (time >= 11.5 && time < 14.5) return 'Solar Noon';
  if (time >= 14.5 && time < 17.5) return 'Afternoon';
  if (time >= 17.5 && time < 18.8) return 'Golden Hour';
  if (time >= 18.8 && time < 19.8) return 'Sunset';
  if (time >= 19.8 && time < 21.5) return 'Twilight';
  return 'Midnight Abyss';
}

export function interpretWeatherCode(code: number): { condition: string; weatherType: 'clear' | 'cloudy' | 'rain' | 'storm' | 'snow' } {
  if (code === 0) return { condition: 'Clear Sky', weatherType: 'clear' };
  if (code === 1 || code === 2) return { condition: 'Partly Cloudy', weatherType: 'cloudy' };
  if (code === 3) return { condition: 'Overcast Atmospheric', weatherType: 'cloudy' };
  if ([45, 48].includes(code)) return { condition: 'Fog & Mist', weatherType: 'cloudy' };
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return { condition: 'Rain & Precipitation', weatherType: 'rain' };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { condition: 'Snowfall & Frost', weatherType: 'snow' };
  if ([95, 96, 99].includes(code)) return { condition: 'Thunderstorm & High Contrast', weatherType: 'storm' };
  return { condition: 'Atmospheric Daylight', weatherType: 'clear' };
}

export async function fetchRealWeather(lat: number, lon: number): Promise<LiveWeatherData | null> {
  if (lat === 0 && lon === 0) return null;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&current=temperature_2m,weather_code,is_day&timezone=auto`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.current) {
      const { condition } = interpretWeatherCode(data.current.weather_code ?? 0);
      return {
        temperatureC: Math.round(data.current.temperature_2m ?? 22),
        weatherCode: data.current.weather_code ?? 0,
        conditionName: condition,
        isDay: data.current.is_day === 1,
        source: 'open-meteo',
        retrievedAt: Date.now(),
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Deterministic Environmental Color Synthesizer
 * Computes exact calibrated hues based on solar trajectory, atmospheric scatter, and thermal vectors.
 */
export function generateLiveAtmosphere(
  location: LiveLocation,
  weatherData?: LiveWeatherData | null
): LiveAtmosphere {
  const local = getLocalTimeInTimezone(location.timezone);
  const phase = getSolarPhase(local.hours, local.minutes);
  const season = getSeason(local.month, location.latitude);

  const temp = weatherData?.temperatureC ?? (phase === 'Midnight Abyss' ? 14 : phase === 'Solar Noon' ? 28 : 22);
  const weatherType = weatherData ? interpretWeatherCode(weatherData.weatherCode).weatherType : 'clear';
  const weatherSummary = weatherData ? `${weatherData.conditionName} • ${temp}°C` : `${phase} Light • ${temp}°C (Estimated)`;

  // Seasonal thermal nudge (degrees in HSL)
  let seasonHueNudge = 0;
  let seasonSatNudge = 0;
  if (season === 'Spring') { seasonHueNudge = 8; seasonSatNudge = 6; }
  if (season === 'Summer') { seasonHueNudge = 0; seasonSatNudge = 10; }
  if (season === 'Autumn') { seasonHueNudge = -12; seasonSatNudge = 4; }
  if (season === 'Winter') { seasonHueNudge = 15; seasonSatNudge = -8; }

  // Temperature warmth factor (-10°C to +40°C mapped to thermal hue tweak)
  const thermalShift = Math.max(-10, Math.min(10, (temp - 20) * 0.5));

  let swatches: LiveColorSwatch[] = [];
  let atmosphereDesc = '';

  switch (phase) {
    case 'Dawn': {
      const h1 = (220 + seasonHueNudge) % 360; // Deep cold twilight sky
      const h2 = (28 + seasonHueNudge + thermalShift) % 360; // First soft horizon amber
      const h3 = (345 + seasonHueNudge) % 360; // Pale rose atmospheric dust
      const h4 = (235 + seasonHueNudge) % 360; // Obsidian terrain shadow
      const h5 = (185 + seasonHueNudge) % 360; // Ethereal cyan mist

      swatches = [
        { name: 'First Light Amber', hex: hslToHex(h2, 65 + seasonSatNudge, 68), role: 'Solar Light', description: 'Emerging solar warmth along the eastern horizon' },
        { name: 'Dawn Mist Cyan', hex: hslToHex(h5, 45, 78), role: 'Atmospheric Tone', description: 'Sub-zero vapor scatter in early dawn' },
        { name: 'Pale Rose Atmosphere', hex: hslToHex(h3, 50, 62), role: 'Horizon / Sky', description: 'Diffused chromatic twilight glow' },
        { name: 'Residual Night Slate', hex: hslToHex(h1, 35, 24), role: 'Dynamic Accent', description: 'Lingering astronomical shadow' },
        { name: 'Obsidian Earth', hex: hslToHex(h4, 25, 9), role: 'Terrain & Shadow', description: 'Grounded terrain anchor before sunrise' },
      ];
      atmosphereDesc = `Early celestial awakening in ${location.name}. Soft atmospheric scatter with subtle warmth emerging against cool residual night tones.`;
      break;
    }

    case 'Sunrise': {
      const h1 = (24 + seasonHueNudge + thermalShift) % 360; // Radiant solar gold
      const h2 = (5 + seasonHueNudge) % 360; // Vermilion horizon edge
      const h3 = (205 + seasonHueNudge) % 360; // Clear morning cobalt
      const h4 = (42 + seasonHueNudge) % 360; // Parchment morning warmth
      const h5 = (220 + seasonHueNudge) % 360; // Deep morning silhouette

      swatches = [
        { name: 'Solar Crest Gold', hex: hslToHex(h1, 88 + seasonSatNudge, 62), role: 'Solar Light', description: 'Direct unscattered solar disc wavelength' },
        { name: 'Horizon Vermilion', hex: hslToHex(h2, 75, 54), role: 'Horizon / Sky', description: 'Atmospheric refraction at zero elevation' },
        { name: 'Morning Parchment', hex: hslToHex(h4, 50, 90), role: 'Atmospheric Tone', description: 'Reflective sunlit ground surface' },
        { name: 'Upper Sky Azure', hex: hslToHex(h3, 60, 48), role: 'Dynamic Accent', description: 'Zenith atmospheric sky contrast' },
        { name: 'Dawn Basalt Anchor', hex: hslToHex(h5, 30, 14), role: 'Terrain & Shadow', description: 'Long low-angle shadow anchor' },
      ];
      atmosphereDesc = `High dynamic range sunrise over ${location.name}. Intense golden-orange solar crests framed by crisp azure morning skies.`;
      break;
    }

    case 'Morning': {
      const h1 = (212 + seasonHueNudge) % 360; // Fresh clear sky blue
      const h2 = (45 + seasonHueNudge + thermalShift) % 360; // Crisp sunlight yellow
      const h3 = (150 + seasonHueNudge) % 360; // Botanical foliage midtone
      const h4 = (210 + seasonHueNudge) % 360; // Light paper ground
      const h5 = (225 + seasonHueNudge) % 360; // Architectural slate

      swatches = [
        { name: 'Cerulean Daylight', hex: hslToHex(h1, 75 + seasonSatNudge, 52), role: 'Horizon / Sky', description: 'High-clarity morning Rayleigh scatter' },
        { name: 'Crisp Solar Ray', hex: hslToHex(h2, 78, 68), role: 'Solar Light', description: 'Clean daylight luminance' },
        { name: 'Alabaster Canvas', hex: hslToHex(h4, 20, 96), role: 'Atmospheric Tone', description: 'Clean architectural light reflection' },
        { name: 'Verdant Earth Tone', hex: hslToHex(h3, 40, 44), role: 'Dynamic Accent', description: 'Illuminated botanical chlorophyll' },
        { name: 'Structural Navy Slate', hex: hslToHex(h5, 35, 18), role: 'Terrain & Shadow', description: 'Mid-morning architectural shadow' },
      ];
      atmosphereDesc = `Pure, energetic daylight across ${location.name}. High optical clarity with saturated cerulean skies and crisp solar luminance.`;
      break;
    }

    case 'Solar Noon': {
      const h1 = (218 + seasonHueNudge) % 360; // Ultramarine high noon
      const h2 = (50 + seasonHueNudge + thermalShift) % 360; // Brilliant solar white-gold
      const h3 = (200 + seasonHueNudge) % 360; // Glacial cyan zenith
      const h4 = (40 + seasonHueNudge) % 360; // Travertine bleached stone
      const h5 = (230 + seasonHueNudge) % 360; // Sharp midday ink shadow

      swatches = [
        { name: 'Peak Solar Luminance', hex: hslToHex(h2, 85, 76), role: 'Solar Light', description: 'Maximum vertical solar irradiance' },
        { name: 'Ultramarine Zenith', hex: hslToHex(h1, 80 + seasonSatNudge, 48), role: 'Horizon / Sky', description: 'Deepest midday atmospheric blue' },
        { name: 'Bleached Travertine', hex: hslToHex(h4, 22, 94), role: 'Atmospheric Tone', description: 'Sun-bleached structural ground' },
        { name: 'High-Noon Cyan', hex: hslToHex(h3, 90, 42), role: 'Dynamic Accent', description: 'Electric skylight reflection' },
        { name: 'Direct Sun Shadow', hex: hslToHex(h5, 35, 11), role: 'Terrain & Shadow', description: 'Short, high-contrast black shadow' },
      ];
      atmosphereDesc = `Peak solar zenith in ${location.name}. Surgical contrast, vibrant ultramarine heavens, and sun-bleached environmental surfaces.`;
      break;
    }

    case 'Afternoon': {
      const h1 = (35 + seasonHueNudge + thermalShift) % 360; // Warm amber transition
      const h2 = (215 + seasonHueNudge) % 360; // Softening sky cobalt
      const h3 = (15 + seasonHueNudge) % 360; // Terracotta brick warmth
      const h4 = (45 + seasonHueNudge) % 360; // Parchment sand
      const h5 = (230 + seasonHueNudge) % 360; // Lengthening shadow indigo

      swatches = [
        { name: 'Afternoon Amber Glow', hex: hslToHex(h1, 74 + seasonSatNudge, 62), role: 'Solar Light', description: 'Warm oblique solar illumination' },
        { name: 'Soft Cobalt Sky', hex: hslToHex(h2, 60, 46), role: 'Horizon / Sky', description: 'Mellowing afternoon atmospheric canopy' },
        { name: 'Terracotta Mineral', hex: hslToHex(h3, 58, 50), role: 'Dynamic Accent', description: 'Warm architectural clay and masonry' },
        { name: 'Dune Parchment', hex: hslToHex(h4, 30, 88), role: 'Atmospheric Tone', description: 'Warm reflective ground plane' },
        { name: 'Lengthening Indigo Shadow', hex: hslToHex(h5, 40, 16), role: 'Terrain & Shadow', description: 'Elongating afternoon shadow tones' },
      ];
      atmosphereDesc = `Late afternoon warmth descending on ${location.name}. The sharp midday glare gives way to rich earthen amber and lengthening indigo contours.`;
      break;
    }

    case 'Golden Hour': {
      const h1 = (32 + seasonHueNudge + thermalShift) % 360; // Rich molten amber
      const h2 = (12 + seasonHueNudge + thermalShift) % 360; // Saturated copper crimson
      const h3 = (275 + seasonHueNudge) % 360; // Twilight violet transition
      const h4 = (48 + seasonHueNudge) % 360; // Golden honey highlight
      const h5 = (235 + seasonHueNudge) % 360; // Deep twilight abyss

      swatches = [
        { name: 'Molten Amber Horizon', hex: hslToHex(h1, 92 + seasonSatNudge, 58), role: 'Solar Light', description: 'Low-angle golden hour solar transmission' },
        { name: 'Sunset Copper Crimson', hex: hslToHex(h2, 80, 50), role: 'Horizon / Sky', description: 'Dense Rayleigh aerosol scattering' },
        { name: 'Honeyed Parchment', hex: hslToHex(h4, 75, 82), role: 'Atmospheric Tone', description: 'Warm ambient glow on architectural surfaces' },
        { name: 'Atmospheric Violet Tension', hex: hslToHex(h3, 55, 42), role: 'Dynamic Accent', description: 'Anti-solar twilight arc' },
        { name: 'Evening Maritime Navy', hex: hslToHex(h5, 50, 13), role: 'Terrain & Shadow', description: 'Rich dark ground silhouette' },
      ];
      atmosphereDesc = `The definitive Golden Hour in ${location.name}. Long sweeping golden rays, copper-crimson horizon flares, and cooling violet twilight shadows.`;
      break;
    }

    case 'Sunset': {
      const h1 = (4 + seasonHueNudge + thermalShift) % 360; // Intense burning vermilion
      const h2 = (285 + seasonHueNudge) % 360; // Saturated twilight magenta/purple
      const h3 = (38 + seasonHueNudge) % 360; // Flare gold
      const h4 = (220 + seasonHueNudge) % 360; // Upper sky deep blue
      const h5 = (250 + seasonHueNudge) % 360; // Pitch twilight obsidian

      swatches = [
        { name: 'Horizon Blaze Vermilion', hex: hslToHex(h1, 86 + seasonSatNudge, 52), role: 'Solar Light', description: 'Solar disc setting beneath horizon line' },
        { name: 'Twilight Mauve Sky', hex: hslToHex(h2, 68, 44), role: 'Horizon / Sky', description: 'Belt of Venus chromatic twilight scatter' },
        { name: 'Residual Solar Gold', hex: hslToHex(h3, 85, 66), role: 'Atmospheric Tone', description: 'Final solar flare at cloud base' },
        { name: 'Deep Twilight Cobalt', hex: hslToHex(h4, 60, 28), role: 'Dynamic Accent', description: 'Eastward nightfall gradient' },
        { name: 'Obsidian Night Anchor', hex: hslToHex(h5, 45, 8), role: 'Terrain & Shadow', description: 'Total landscape shadow envelope' },
      ];
      atmosphereDesc = `Chromatic sunset over ${location.name}. High-energy vermilion fire bleeding into deep twilight violet and obsidian nightfall.`;
      break;
    }

    case 'Twilight': {
      const h1 = (270 + seasonHueNudge) % 360; // Atmospheric violet
      const h2 = (225 + seasonHueNudge) % 360; // Deep indigo void
      const h3 = (15 + seasonHueNudge) % 360; // Faint horizon ember
      const h4 = (210 + seasonHueNudge) % 360; // Pale moonlit cloud slate
      const h5 = (240 + seasonHueNudge) % 360; // Midnight sumi ink

      swatches = [
        { name: 'Twilight Mauve Arc', hex: hslToHex(h1, 55 + seasonSatNudge, 46), role: 'Horizon / Sky', description: 'Atmospheric blue hour chromatic canopy' },
        { name: 'Deep Indigo Void', hex: hslToHex(h2, 65, 22), role: 'Solar Light', description: 'Ascending night sky gradient' },
        { name: 'Faint Horizon Ember', hex: hslToHex(h3, 60, 48), role: 'Dynamic Accent', description: 'Final fading solar glow in western quadrant' },
        { name: 'Moonlit Cloud Slate', hex: hslToHex(h4, 25, 70), role: 'Atmospheric Tone', description: 'Soft celestial lunar illumination' },
        { name: 'Abyss Obsidian Base', hex: hslToHex(h5, 40, 7), role: 'Terrain & Shadow', description: 'Nighttime landmass silhouette' },
      ];
      atmosphereDesc = `Blue hour twilight in ${location.name}. Serene indigo stillness punctuated by faint western embers and cool celestial tones.`;
      break;
    }

    case 'Midnight Abyss':
    default: {
      const h1 = (228 + seasonHueNudge) % 360; // Deep maritime midnight blue
      const h2 = (265 + seasonHueNudge) % 360; // Cyber violet/starlight shimmer
      const h3 = (195 + seasonHueNudge) % 360; // Glacial starlight beacon
      const h4 = (215 + seasonHueNudge) % 360; // Deep titanium slate
      const h5 = (235 + seasonHueNudge) % 360; // Pitch black void

      swatches = [
        { name: 'Deep Maritime Midnight', hex: hslToHex(h1, 60 + seasonSatNudge, 16), role: 'Horizon / Sky', description: 'Boundless nighttime celestial dome' },
        { name: 'Glacial Starlight Cyan', hex: hslToHex(h3, 85, 62), role: 'Dynamic Accent', description: 'Crisp stellar point illumination' },
        { name: 'Nocturnal Violet Haze', hex: hslToHex(h2, 45, 30), role: 'Solar Light', description: 'City lights and atmospheric nightglow' },
        { name: 'Dark Titanium Slate', hex: hslToHex(h4, 20, 22), role: 'Atmospheric Tone', description: 'Moonlit building contours' },
        { name: 'Pitch Abyss Sumi', hex: hslToHex(h5, 30, 6), role: 'Terrain & Shadow', description: 'Unlit midnight ground anchor' },
      ];
      atmosphereDesc = `Deep nocturnal stillness in ${location.name}. An abyss of midnight blue and slate anchored by sharp glacial starlight accents.`;
      break;
    }
  }

  // Weather modifier adjustments (applied with discipline, not cartoonish)
  if (weatherType === 'cloudy') {
    swatches = swatches.map((s, idx) => {
      if (idx === 0 || idx === 1) return s;
      const rgb = hexToRgb(s.hex);
      if (!rgb) return s;
      // Gently blend with overcast grey
      return {
        ...s,
        hex: hslToHex(210, 18, 55 + (idx * 6)),
        description: `${s.description} (Overcast cloud filtration)`,
      };
    });
  } else if (weatherType === 'rain') {
    swatches = swatches.map((s) => ({
      ...s,
      description: `${s.description} (Rain-slicked surface reflection)`,
    }));
  }

  const gradientCss = `linear-gradient(135deg, ${swatches[4].hex} 0%, ${swatches[0].hex} 45%, ${swatches[1].hex} 80%, ${swatches[2].hex} 100%)`;

  return {
    locationName: `${location.name}, ${location.country}`,
    localTimeFormatted: `${local.formatted} ${location.timezone.split('/')[1]?.replace(/_/g, ' ') || 'LOCAL'}`,
    localTimeHours: local.hours,
    solarPhase: phase,
    season,
    weatherSummary,
    temperatureC: temp,
    title: `${location.name} • ${phase.toUpperCase()} ATMOSPHERE`,
    description: atmosphereDesc,
    swatches,
    gradientCss,
    updatedAt: Date.now(),
  };
}
