/**
 * MESH GRADIENT STUDIO ENGINE & DETERMINISTIC KINEMATICS
 * High-performance 2D multi-radial mesh simulation, PRNG seed generation,
 * CSS/SVG/PNG exporters, and DTCG design tokens.
 */

export interface MeshPoint {
  id: string;
  x: number; // 0 to 100 percentage
  y: number; // 0 to 100 percentage
  color: string; // Hex color (#RRGGBB)
  influence: number; // 0.2 to 2.0 radius factor
  softness?: number; // 0.1 to 2.0 falloff factor
}

export function isValidHex(hex: string): boolean {
  return /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(hex);
}

export type BackgroundMode = 'canvas' | 'transparent' | 'solid';

export interface MeshGradientConfig {
  preset: string | null;
  seed: number;
  points: MeshPoint[];
  rows: number;
  columns: number;
  softness: number; // 0.2 to 2.0 (default 1.0)
  intensity: number; // 0.2 to 2.0 (default 1.0)
  blur: number; // 0 to 80 px (default 0)
  grain: number; // 0 to 50 % (default 0)
  rotation: number; // 0 to 360 deg (default 0)
  scale: number; // 0.5 to 2.0 (default 1.0)
  background: BackgroundMode;
  solidColor: string;
}

export interface MeshPreset {
  id: string;
  name: string;
  tagline: string;
  description: string;
  colors: string[];
  config: Partial<MeshGradientConfig>;
}

// ---------------------------------------------------------------------------
// 1. CURATED PRESETS GALLERY
// ---------------------------------------------------------------------------

export const MESH_PRESETS: MeshPreset[] = [
  {
    id: 'aurora',
    name: 'Aurora Borealis',
    tagline: 'Teal & Violet Cosmic Flow',
    description: 'Ethereal ribbons of emerald teal, dark indigo, and luminous violet mimicking high-latitude auroras.',
    colors: ['#0C2534', '#00A896', '#7000FF', '#028090', '#BFA3F0', '#00E5FF'],
    config: {
      softness: 1.2,
      intensity: 1.1,
      blur: 0,
      grain: 12,
      points: [
        { id: 'p1', x: 10, y: 15, color: '#00A896', influence: 1.2 },
        { id: 'p2', x: 85, y: 20, color: '#7000FF', influence: 1.4 },
        { id: 'p3', x: 45, y: 55, color: '#BFA3F0', influence: 1.0 },
        { id: 'p4', x: 15, y: 85, color: '#0C2534', influence: 1.3 },
        { id: 'p5', x: 85, y: 85, color: '#00E5FF', influence: 1.2 },
      ],
    },
  },
  {
    id: 'sunset',
    name: 'Pacific Sunset',
    tagline: 'Amber, Coral & Magenta Horizon',
    description: 'Warm, radiant gradient blending golden daylight into deep magenta dusk and twilight purple.',
    colors: ['#FF5E36', '#FFAE33', '#D63484', '#602080', '#FF9F45'],
    config: {
      softness: 1.1,
      intensity: 1.2,
      blur: 0,
      grain: 8,
      points: [
        { id: 'p1', x: 20, y: 20, color: '#FFAE33', influence: 1.3 },
        { id: 'p2', x: 80, y: 25, color: '#FF5E36', influence: 1.1 },
        { id: 'p3', x: 50, y: 50, color: '#D63484', influence: 1.2 },
        { id: 'p4', x: 15, y: 80, color: '#602080', influence: 1.4 },
        { id: 'p5', x: 85, y: 85, color: '#FF9F45', influence: 1.0 },
      ],
    },
  },
  {
    id: 'ocean',
    name: 'Abyssal Ocean',
    tagline: 'Deep Sea Azure & Aquamarine',
    description: 'Subterranean marine depth fading from deep midnight navy to luminous aqua highlights.',
    colors: ['#031926', '#134074', '#468FAF', '#61A5C2', '#89C2D9', '#00F0FF'],
    config: {
      softness: 1.3,
      intensity: 1.0,
      blur: 0,
      grain: 10,
      points: [
        { id: 'p1', x: 15, y: 15, color: '#031926', influence: 1.4 },
        { id: 'p2', x: 85, y: 15, color: '#134074', influence: 1.2 },
        { id: 'p3', x: 50, y: 50, color: '#468FAF', influence: 1.1 },
        { id: 'p4', x: 20, y: 85, color: '#89C2D9', influence: 1.0 },
        { id: 'p5', x: 80, y: 80, color: '#00F0FF', influence: 1.3 },
      ],
    },
  },
  {
    id: 'dream',
    name: 'Pastel Dream',
    tagline: 'Soft Lavender, Mint & Peach',
    description: 'Airy, delicate aesthetic with subtle cotton-candy undertones designed for modern editorial UI.',
    colors: ['#E8DFF5', '#FCE1E4', '#FCF4DD', '#DDEDEA', '#DAEAF6', '#BFA3F0'],
    config: {
      softness: 1.4,
      intensity: 0.9,
      blur: 0,
      grain: 6,
      points: [
        { id: 'p1', x: 20, y: 20, color: '#E8DFF5', influence: 1.2 },
        { id: 'p2', x: 80, y: 20, color: '#FCE1E4', influence: 1.3 },
        { id: 'p3', x: 50, y: 50, color: '#BFA3F0', influence: 1.1 },
        { id: 'p4', x: 25, y: 80, color: '#DDEDEA', influence: 1.2 },
        { id: 'p5', x: 75, y: 80, color: '#DAEAF6', influence: 1.2 },
      ],
    },
  },
  {
    id: 'candy',
    name: 'Electric Candy',
    tagline: 'Neon Magenta, Yellow & Cyan',
    description: 'High-contrast, playful pop-art gradient bursting with vibrant saturation.',
    colors: ['#FF007F', '#FFE600', '#00F0FF', '#7928CA', '#FF4D4D'],
    config: {
      softness: 0.9,
      intensity: 1.3,
      blur: 0,
      grain: 5,
      points: [
        { id: 'p1', x: 15, y: 20, color: '#FF007F', influence: 1.1 },
        { id: 'p2', x: 85, y: 20, color: '#FFE600', influence: 1.0 },
        { id: 'p3', x: 50, y: 50, color: '#00F0FF', influence: 1.2 },
        { id: 'p4', x: 20, y: 80, color: '#7928CA', influence: 1.3 },
        { id: 'p5', x: 80, y: 80, color: '#FF4D4D', influence: 1.1 },
      ],
    },
  },
  {
    id: 'midnight',
    name: 'Cosmic Midnight',
    tagline: 'Deep Obsidian & Neon Violet',
    description: 'Sleek, dark-mode-first aesthetic with deep blacks and neon purple gravitational centers.',
    colors: ['#0A0A0C', '#1A102F', '#3B185F', '#A020F0', '#BFA3F0'],
    config: {
      softness: 1.3,
      intensity: 1.1,
      blur: 0,
      grain: 15,
      points: [
        { id: 'p1', x: 15, y: 15, color: '#0A0A0C', influence: 1.5 },
        { id: 'p2', x: 80, y: 20, color: '#1A102F', influence: 1.2 },
        { id: 'p3', x: 50, y: 50, color: '#3B185F', influence: 1.3 },
        { id: 'p4', x: 25, y: 80, color: '#A020F0', influence: 1.1 },
        { id: 'p5', x: 85, y: 85, color: '#BFA3F0', influence: 1.0 },
      ],
    },
  },
  {
    id: 'ember',
    name: 'Molten Ember',
    tagline: 'Crimson, Burnt Ochre & Gold',
    description: 'Intense thermal gradient evoking volcanic warmth, charcoal silhouettes, and glowing embers.',
    colors: ['#1A0B0B', '#670000', '#B80000', '#FF4D00', '#FFB703'],
    config: {
      softness: 1.0,
      intensity: 1.2,
      blur: 0,
      grain: 10,
      points: [
        { id: 'p1', x: 20, y: 20, color: '#1A0B0B', influence: 1.4 },
        { id: 'p2', x: 80, y: 20, color: '#670000', influence: 1.2 },
        { id: 'p3', x: 50, y: 50, color: '#B80000', influence: 1.1 },
        { id: 'p4', x: 20, y: 80, color: '#FF4D00', influence: 1.2 },
        { id: 'p5', x: 80, y: 80, color: '#FFB703', influence: 1.0 },
      ],
    },
  },
  {
    id: 'neutral',
    name: 'Soft Cashmere',
    tagline: 'Warm Sand, Oyster & Slate',
    description: 'Subtle luxury monochrome and earth-tone harmony for minimal architectural UI cards.',
    colors: ['#EAE0D5', '#C6AC8F', '#5E503F', '#22333B', '#0A0908'],
    config: {
      softness: 1.5,
      intensity: 0.9,
      blur: 0,
      grain: 12,
      points: [
        { id: 'p1', x: 20, y: 20, color: '#EAE0D5', influence: 1.2 },
        { id: 'p2', x: 80, y: 20, color: '#C6AC8F', influence: 1.2 },
        { id: 'p3', x: 50, y: 50, color: '#5E503F', influence: 1.1 },
        { id: 'p4', x: 20, y: 80, color: '#22333B', influence: 1.3 },
        { id: 'p5', x: 80, y: 80, color: '#0A0908', influence: 1.4 },
      ],
    },
  },
];

export const DEFAULT_MESH_CONFIG: MeshGradientConfig = {
  preset: 'aurora',
  seed: 48291,
  points: [
    { id: 'p1', x: 15, y: 20, color: '#00A896', influence: 1.2 },
    { id: 'p2', x: 85, y: 25, color: '#7000FF', influence: 1.3 },
    { id: 'p3', x: 50, y: 50, color: '#BFA3F0', influence: 1.1 },
    { id: 'p4', x: 20, y: 80, color: '#0C2534', influence: 1.2 },
    { id: 'p5', x: 80, y: 80, color: '#00E5FF', influence: 1.2 },
  ],
  rows: 2,
  columns: 3,
  softness: 1.2,
  intensity: 1.1,
  blur: 0,
  grain: 10,
  rotation: 0,
  scale: 1.0,
  background: 'canvas',
  solidColor: '#090A0C',
};

// ---------------------------------------------------------------------------
// 2. PSEUDO-RANDOM NUMBER GENERATOR (PRNG) & SEED SYSTEM
// ---------------------------------------------------------------------------

export function createPrng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function generateRandomMesh(seed: number, pointCount: number = 6): MeshPoint[] {
  const prng = createPrng(seed);

  // Curated harmonious base hue ranges
  const baseHue = Math.floor(prng() * 360);
  const harmonyOffsets = [0, 30, 60, 180, 210, 270, 320];

  const points: MeshPoint[] = [];

  for (let i = 0; i < pointCount; i++) {
    const offset = harmonyOffsets[i % harmonyOffsets.length];
    const hue = (baseHue + offset + Math.floor(prng() * 20 - 10) + 360) % 360;
    const sat = Math.floor(65 + prng() * 30);
    const lit = Math.floor(40 + prng() * 35);
    const hex = hslToHex(hue, sat, lit);

    // Spread coordinates evenly across canvas quadrants with jitter
    const col = i % 3;
    const row = Math.floor(i / 3);
    const baseX = col === 0 ? 15 : col === 1 ? 50 : 85;
    const baseY = row === 0 ? 25 : 75;

    const x = Math.max(5, Math.min(95, Math.round(baseX + (prng() * 24 - 12))));
    const y = Math.max(5, Math.min(95, Math.round(baseY + (prng() * 24 - 12))));
    const influence = parseFloat((0.8 + prng() * 0.7).toFixed(2));

    points.push({
      id: `p-${seed}-${i + 1}`,
      x,
      y,
      color: hex,
      influence,
    });
  }

  return points;
}

export function generateGridMesh(rows: number, cols: number, seed: number): MeshPoint[] {
  const prng = createPrng(seed);
  const baseHue = Math.floor(prng() * 360);
  const points: MeshPoint[] = [];

  const xStep = 100 / (cols + 1);
  const yStep = 100 / (rows + 1);

  let idCounter = 1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = Math.round((c + 1) * xStep + (prng() * 8 - 4));
      const y = Math.round((r + 1) * yStep + (prng() * 8 - 4));
      const hue = (baseHue + (idCounter * 45) + 360) % 360;
      const sat = Math.floor(70 + prng() * 25);
      const lit = Math.floor(45 + prng() * 30);
      const hex = hslToHex(hue, sat, lit);

      points.push({
        id: `grid-${r}-${c}-${idCounter}`,
        x: Math.max(5, Math.min(95, x)),
        y: Math.max(5, Math.min(95, y)),
        color: hex,
        influence: 1.1,
      });
      idCounter++;
    }
  }

  return points;
}

// ---------------------------------------------------------------------------
// 3. COLOR MATH UTILITIES (HEX, RGB, HSL)
// ---------------------------------------------------------------------------

export function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x: number) =>
    Math.round(x * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`.toUpperCase();
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

// ---------------------------------------------------------------------------
// 4. CODE EXPORTERS (CSS, SVG, DTCG TOKENS, AGENT PROMPT)
// ---------------------------------------------------------------------------

export function generateMeshCss(config: MeshGradientConfig): string {
  const radials = config.points.map((p) => {
    const size = Math.round(50 * p.influence * config.softness);
    return `radial-gradient(circle at ${p.x}% ${p.y}%, ${p.color} 0%, transparent ${size}%)`;
  });

  const baseBg = config.background === 'solid' ? config.solidColor : '#090A0C';
  const filterProps = config.blur > 0 ? `\n  filter: blur(${config.blur}px);` : '';
  const transformProps = config.rotation > 0 || config.scale !== 1.0
    ? `\n  transform: rotate(${config.rotation}deg) scale(${config.scale});`
    : '';

  return `/* PaletteParadise — Mesh Gradient */
.mesh-gradient-surface {
  background-color: ${baseBg};
  background-image: 
    ${radials.join(',\n    ')};
  background-repeat: no-repeat;
  background-size: cover;${filterProps}${transformProps}
}`;
}

export function generateMeshSvg(config: MeshGradientConfig, width = 1200, height = 800): string {
  const baseBg = config.background === 'solid' ? config.solidColor : '#090A0C';

  const defs = config.points
    .map((p, idx) => {
      const radius = Math.min(100, Math.round(55 * p.influence * config.softness));
      return `    <radialGradient id="mesh-grad-${idx}" cx="${p.x}%" cy="${p.y}%" r="${radius}%">
      <stop offset="0%" stop-color="${p.color}" stop-opacity="1" />
      <stop offset="100%" stop-color="${p.color}" stop-opacity="0" />
    </radialGradient>`;
    })
    .join('\n');

  const rects = config.points
    .map((_, idx) => `  <rect width="${width}" height="${height}" fill="url(#mesh-grad-${idx})" style="mix-blend-mode: screen;" />`)
    .join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
${defs}
  </defs>
  <rect width="${width}" height="${height}" fill="${baseBg}" />
${rects}
</svg>`;
}

export function generateMeshTokensJson(config: MeshGradientConfig, sourceUrl?: string): string {
  const pointsRecord: Record<string, any> = {};

  config.points.forEach((p, idx) => {
    pointsRecord[`point_${idx + 1}`] = {
      $type: 'color',
      $value: p.color,
      $extensions: {
        coordinates: { x: p.x, y: p.y },
        influence: p.influence,
      },
    };
  });

  const tokenTree = {
    $schema: 'https://design-tokens.github.io/community-group/format/',
    generator: 'PaletteParadise Mesh Gradient Studio',
    version: '1.0.0',
    source: sourceUrl || 'https://kroma.design/mesh',
    seed: config.seed,
    mesh: {
      softness: config.softness,
      intensity: config.intensity,
      blur: config.blur,
      grain: config.grain,
      rotation: config.rotation,
      scale: config.scale,
      background: config.background,
      points: pointsRecord,
    },
  };

  return JSON.stringify(tokenTree, null, 2);
}

export function generateMeshAgentPrompt(config: MeshGradientConfig, sourceUrl?: string): string {
  const pointsList = config.points
    .map((p, i) => `  - Point ${i + 1}: ${p.color} at (${p.x}%, ${p.y}%), influence ${p.influence}x`)
    .join('\n');

  return `System prompt / Design specification for PaletteParadise Mesh Gradient:
Seed: ${config.seed}
Softness: ${config.softness} | Intensity: ${config.intensity} | Blur: ${config.blur}px | Grain: ${config.grain}%
Points:
${pointsList}
Permanent link: ${sourceUrl || 'https://kroma.design/mesh'}`;
}

// ---------------------------------------------------------------------------
// 5. URL STATE SERIALIZATION & DESERIALIZATION
// ---------------------------------------------------------------------------

export function serializeMeshConfig(config: MeshGradientConfig): string {
  const params = new URLSearchParams();

  if (config.preset) params.set('p', config.preset);
  if (config.seed !== DEFAULT_MESH_CONFIG.seed) params.set('s', config.seed.toString());
  if (config.softness !== 1.0) params.set('sf', config.softness.toString());
  if (config.intensity !== 1.0) params.set('in', config.intensity.toString());
  if (config.blur !== 0) params.set('bl', config.blur.toString());
  if (config.grain !== 0) params.set('gr', config.grain.toString());
  if (config.rotation !== 0) params.set('rot', config.rotation.toString());
  if (config.scale !== 1.0) params.set('sc', config.scale.toString());
  if (config.background !== 'canvas') params.set('bg', config.background);
  if (config.background === 'solid' && config.solidColor) {
    params.set('scol', config.solidColor.replace('#', ''));
  }

  // Compact points string: x,y,hex,influence;x,y,hex,influence...
  const ptsString = config.points
    .map((p) => `${p.x},${p.y},${p.color.replace('#', '')},${p.influence}`)
    .join(';');
  params.set('pts', ptsString);

  return params.toString();
}

export function deserializeMeshConfig(searchParams: URLSearchParams | Record<string, string | undefined>): MeshGradientConfig {
  const get = (key: string) => {
    if (searchParams instanceof URLSearchParams) return searchParams.get(key);
    return searchParams[key] ?? null;
  };

  const presetId = get('p');
  const matchedPreset = presetId ? MESH_PRESETS.find((p) => p.id === presetId) : null;

  const base: MeshGradientConfig = matchedPreset
    ? { ...DEFAULT_MESH_CONFIG, ...matchedPreset.config, preset: presetId }
    : { ...DEFAULT_MESH_CONFIG };

  const seed = get('s');
  if (seed && !isNaN(parseInt(seed, 10))) base.seed = parseInt(seed, 10);

  const sf = get('sf');
  if (sf && !isNaN(parseFloat(sf))) base.softness = parseFloat(sf);

  const intensity = get('in');
  if (intensity && !isNaN(parseFloat(intensity))) base.intensity = parseFloat(intensity);

  const bl = get('bl');
  if (bl && !isNaN(parseFloat(bl))) base.blur = parseFloat(bl);

  const gr = get('gr');
  if (gr && !isNaN(parseFloat(gr))) base.grain = parseFloat(gr);

  const rot = get('rot');
  if (rot && !isNaN(parseFloat(rot))) base.rotation = parseFloat(rot);

  const sc = get('sc');
  if (sc && !isNaN(parseFloat(sc))) base.scale = parseFloat(sc);

  const bg = get('bg');
  if (bg === 'canvas' || bg === 'transparent' || bg === 'solid') base.background = bg;

  const scol = get('scol');
  if (scol && isValidHex(scol)) base.solidColor = scol.startsWith('#') ? scol : `#${scol}`;

  const ptsParam = get('pts');
  if (ptsParam) {
    const rawChunks = ptsParam.split(';');
    const parsedPoints: MeshPoint[] = [];

    rawChunks.forEach((chunk, idx) => {
      const [xStr, yStr, hexStr, infStr] = chunk.split(',');
      const x = parseFloat(xStr);
      const y = parseFloat(yStr);
      const hex = hexStr ? `#${hexStr}` : '#BFA3F0';
      const inf = infStr ? parseFloat(infStr) : 1.0;

      if (!isNaN(x) && !isNaN(y)) {
        parsedPoints.push({
          id: `url-point-${idx + 1}`,
          x: Math.max(0, Math.min(100, x)),
          y: Math.max(0, Math.min(100, y)),
          color: hex,
          influence: !isNaN(inf) ? inf : 1.0,
        });
      }
    });

    if (parsedPoints.length >= 2) {
      base.points = parsedPoints;
    }
  }

  return base;
}
