const fs = require('fs');
const path = require('path');

function hexToRgb(hex) {
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    return {
      r: parseInt(clean[0] + clean[0], 16),
      g: parseInt(clean[1] + clean[1], 16),
      b: parseInt(clean[2] + clean[2], 16),
    };
  }
  if (clean.length === 6) {
    return {
      r: parseInt(clean.substring(0, 2), 16),
      g: parseInt(clean.substring(2, 4), 16),
      b: parseInt(clean.substring(4, 6), 16),
    };
  }
  return null;
}

function rgbToHex(r, g, b) {
  const toHex = (c) => {
    const hex = Math.max(0, Math.min(255, Math.round(c))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function hexToHsl(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return { h: 0, s: 0, l: 0 };
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) { r = c; g = x; b = 0; }
  else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
  else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
  else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
  else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
  else if (300 <= h && h < 360) { r = c; g = 0; b = x; }

  return rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255);
}

function getLuminance(r, g, b) {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getContrastRatio(hex1, hex2) {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return 1;

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return parseFloat(((brightest + 0.05) / (darkest + 0.05)).toFixed(2));
}

function hexToOklch(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 'oklch(0.5 0.1 0)';
  const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
  const lr = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  const lg = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  const lb = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  const l_ = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m_ = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s_ = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);

  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const b_ = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

  const C = Math.sqrt(a * a + b_ * b_);
  let H = Math.atan2(b_, a) * (180 / Math.PI);
  if (H < 0) H += 360;

  return `oklch(${L.toFixed(2)} ${C.toFixed(2)} ${H.toFixed(1)})`;
}

function classifyHueGroup(h, s) {
  if (s < 10) return 'neutral';
  if (h >= 345 || h < 15) return 'red';
  if (h >= 15 && h < 45) return 'orange';
  if (h >= 45 && h < 70) return 'yellow';
  if (h >= 70 && h < 160) return 'green';
  if (h >= 160 && h < 190) return 'teal';
  if (h >= 190 && h < 210) return 'cyan';
  if (h >= 210 && h < 240) return 'blue';
  if (h >= 240 && h < 270) return 'indigo';
  if (h >= 270 && h < 315) return 'purple';
  return 'pink';
}

function classifyFamily(hueGroup, s, l) {
  if (s < 12) return 'neutral';
  if (l < 22) return 'deep';
  if (l > 82 && s < 45) return 'pastel';
  if (s > 75 && l > 35 && l < 65) return 'vibrant';
  if (['red', 'orange', 'yellow'].includes(hueGroup)) {
    if (s < 50 && l < 50) return 'earth';
    return 'warm';
  }
  if (['teal', 'cyan', 'blue', 'indigo'].includes(hueGroup)) return 'cool';
  return 'warm';
}

function classifyTone(l, s) {
  if (s < 20) return 'muted';
  if (l > 70) return 'light';
  if (l < 30) return 'dark';
  return 'medium';
}

function generateShades(h, s) {
  return [
    { level: '50', hex: hslToHex(h, Math.min(s, 40), 96) },
    { level: '100', hex: hslToHex(h, Math.min(s, 50), 90) },
    { level: '200', hex: hslToHex(h, Math.min(s, 60), 80) },
    { level: '300', hex: hslToHex(h, Math.min(s, 70), 70) },
    { level: '400', hex: hslToHex(h, Math.min(s, 75), 60) },
    { level: '500', hex: hslToHex(h, s, 50) },
    { level: '600', hex: hslToHex(h, s, 42) },
    { level: '700', hex: hslToHex(h, s, 34) },
    { level: '800', hex: hslToHex(h, Math.min(s, 70), 24) },
    { level: '900', hex: hslToHex(h, Math.min(s, 60), 16) },
    { level: '950', hex: hslToHex(h, Math.min(s, 50), 9) },
  ];
}

const HUE_ADJECTIVES = {
  red: ['Crimson', 'Vermilion', 'Scarlet', 'Ruby', 'Carmine', 'Garnet', 'Brick', 'Mahogany', 'Cherry', 'Coral', 'Cinnabar', 'Venetian', 'Cardinal', 'Oxblood', 'Mars', 'Cerise', 'Burgundy', 'Bordeaux', 'Merlot', 'Sangria'],
  orange: ['Amber', 'Terracotta', 'Tangerine', 'Sienna', 'Rust', 'Copper', 'Saffron', 'Apricot', 'Marigold', 'Paprika', 'Ochre', 'Persimmon', 'Cinnamon', 'Almandine', 'Cantaloupe', 'Topaz', 'Ginger', 'Bronze', 'Clay', 'Onyx Amber'],
  yellow: ['Ochre', 'Solar', 'Canary', 'Citrine', 'Aureolin', 'Flax', 'Mustard', 'Parchment', 'Blonde', 'Sandstone', 'Topaz', 'Mimosa', 'Daffodil', 'Champagne', 'Gilded', 'Buttercup', 'Maize', 'Sulphur', 'Beryl', 'Honey'],
  green: ['Emerald', 'Forest', 'Verdant', 'Sage', 'Moss', 'Olive', 'Celadon', 'Pine', 'Botanical', 'Jade', 'Laurel', 'Eucalyptus', 'Clover', 'Cypress', 'Basil', 'Fern', 'Viridian', 'Mint', 'Chartreuse', 'Juniper'],
  teal: ['Petroleum', 'Aegean', 'Caspian', 'Beryl', 'Lagoon', 'Juniper', 'Spruce', 'Malachite', 'Tide', 'Glacial', 'Abyssal', 'Mineral', 'Verdigris', 'Baltic', 'Oceanic', 'Fjord', 'Deep Aqua', 'Refraction', 'Seaspray', 'Coriolis'],
  cyan: ['Cerulean', 'Aqua', 'Turquoise', 'Ethereal', 'Cyan', 'Capri', 'Vapor', 'Glacier', 'Alpine', 'Arctic', 'Polar', 'Zephyr', 'Laguna', 'Crystal', 'Ozone', 'Atmosphere', 'Aero', 'Prism', 'Stratosphere', 'Horizon'],
  blue: ['Cobalt', 'Ultramarine', 'Sapphire', 'Prussian', 'Azure', 'Celestial', 'Maritime', 'Denim', 'Atlantic', 'Pacific', 'Adriatic', 'Kashmir', 'Majorelle', 'Lapis', 'Royal', 'Deep Sea', 'Nordic', 'Biscay', 'Triton', 'Marina'],
  indigo: ['Indigo', 'Midnight', 'Nocturne', 'Abyss', 'Deep Space', 'Astral', 'Cosmic', 'Navy', 'Velvet', 'Ink', 'Tanzanite', 'Eclipse', 'Twilight', 'Starlight', 'Galactic', 'Nebula', 'Obsidian Blue', 'Zenith', 'Orion', 'Vesper'],
  purple: ['Amethyst', 'Violet', 'Mauve', 'Iris', 'Mulberry', 'Heliotrope', 'Plum', 'Aubergine', 'Byzantine', 'Thistle', 'Lavender', 'Orchid', 'Wisteria', 'Belladonna', 'Lilac', 'Hydrangea', 'Imperial', 'Majesty', 'Sovereign', 'Petal'],
  pink: ['Blush', 'Rose', 'Magenta', 'Fuchsia', 'Flamingo', 'Ballet', 'Quartz', 'Carnation', 'Peony', 'Dusty Rose', 'Camellia', 'Cerise', 'Sakura', 'Coral Rose', 'Azalea', 'Begonia', 'Magnolia', 'Lotus', 'Rosaline', 'Flora'],
  neutral: ['Titanium', 'Obsidian', 'Graphite', 'Charcoal', 'Alabaster', 'Basalt', 'Linen', 'Parchment', 'Flint', 'Sumi', 'Chalk', 'Pewter', 'Slate', 'Porcelain', 'Marble', 'Concrete', 'Ash', 'Quartzite', 'Hematite', 'Granite'],
};

const NOUN_MODIFIERS = [
  'Specimen', 'Tone', 'Mineral', 'Atmosphere', 'Horizon', 'Essence', 'Field', 'Structure', 'Loom', 'Pigment',
  'Matrix', 'Canopy', 'Drift', 'Veneer', 'Arch', 'Grain', 'Prism', 'Gradient', 'Element', 'Wash',
  'Facet', 'Cast', 'Haze', 'Luster', 'Sheen', 'Resin', 'Vein', 'Wave', 'Ridge', 'Nexus',
  'Aura', 'Beacon', 'Cipher', 'Domain', 'Echo', 'Form', 'Gleam', 'Halo', 'Impression', 'Junction'
];

const TARGET_COLORS = 44000;
const usedHexes = new Set();
const usedSlugs = new Set();
const allColors = [];
let colorCounter = 1;

// Load baseline curated seed colors if available in memory
const SEED_COLORS = [
  { slug: "celestial-cobalt", name: "Celestial Cobalt", hex: "#1D4ED8" },
  { slug: "vermilion-specimen", name: "Vermilion Specimen", hex: "#E63946" },
  { slug: "emerald-matrix", name: "Emerald Matrix", hex: "#059669" },
  { slug: "amber-resonance", name: "Amber Resonance", hex: "#D97706" },
  { slug: "amethyst-nocturne", name: "Amethyst Nocturne", hex: "#7C3AED" },
  { slug: "cerulean-drift", name: "Cerulean Drift", hex: "#0284C7" },
  { slug: "rose-quartz-haze", name: "Rose Quartz Haze", hex: "#DB2777" },
  { slug: "obsidian-carbon", name: "Obsidian Carbon", hex: "#111827" },
  { slug: "pure-titanium", name: "Pure Titanium", hex: "#F9FAFB" },
  { slug: "terracotta-earth", name: "Terracotta Earth", hex: "#EA580C" }
];

for (const s of SEED_COLORS) {
  usedHexes.add(s.hex.toUpperCase());
  usedSlugs.add(s.slug);
}

// Generate systematically to reach exactly TARGET_COLORS
outerLoop:
for (let s = 4; s <= 100; s += 2) {
  for (let l = 4; l <= 96; l += 2) {
    for (let h = 0; h < 360; h += 1) {
      const hex = hslToHex(h, s, l);
      if (usedHexes.has(hex)) continue;
      usedHexes.add(hex);

      const hueGroup = classifyHueGroup(h, s);
      const adjectives = HUE_ADJECTIVES[hueGroup] || HUE_ADJECTIVES.blue;
      const adj = adjectives[(h + s + l) % adjectives.length];
      const mod = NOUN_MODIFIERS[(h * 2 + l * 3) % NOUN_MODIFIERS.length];
      const name = `${adj} ${mod} ${h}°·${s}·${l}`;
      let slug = `${adj.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${mod.toLowerCase()}-${h}-${s}-${l}`;
      if (usedSlugs.has(slug)) {
        slug = `${slug}-${colorCounter}`;
      }
      usedSlugs.add(slug);

      const rgb = hexToRgb(hex);
      const rgbStr = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      const hslStr = `hsl(${h}, ${s}%, ${l}%)`;
      const oklchStr = hexToOklch(hex);
      const family = classifyFamily(hueGroup, s, l);
      const tone = classifyTone(l, s);

      const contrastW = getContrastRatio(hex, '#FFFFFF');
      const contrastB = getContrastRatio(hex, '#000000');
      const bestTextColor = contrastW >= 4.5 ? '#FFFFFF' : '#000000';

      const compHex = hslToHex((h + 180) % 360, s, l);
      const an1 = hslToHex((h + 30) % 360, s, l);
      const an2 = hslToHex((h + 330) % 360, s, l);
      const tri1 = hslToHex((h + 120) % 360, s, l);
      const tri2 = hslToHex((h + 240) % 360, s, l);

      const shades = generateShades(h, s);

      allColors.push({
        id: `c${colorCounter++}`,
        slug,
        name,
        hex,
        rgb: rgbStr,
        hsl: hslStr,
        oklch: oklchStr,
        family,
        hueGroup,
        tone,
        description: `A calibrated ${tone} ${family} specimen in the ${hueGroup} spectrum, engineered for digital interfaces and architectural palettes.`,
        usageNotes: `Optimized for ${bestTextColor === '#FFFFFF' ? 'dark-ground contrast' : 'light-ground contrast'} and UI hierarchy.`,
        tags: [hueGroup, family, tone, 'calibrated'],
        contrastWithWhite: contrastW,
        contrastWithBlack: contrastB,
        bestTextColor,
        complementaryHex: compHex,
        analogousHexes: [an1, an2],
        triadicHexes: [tri1, tri2],
        shades,
      });

      if (allColors.length >= TARGET_COLORS) {
        break outerLoop;
      }
    }
  }
}

console.log(`Total generated colors: ${allColors.length}`);
console.log(`Unique Hex count: ${usedHexes.size}`);

// Write JSON dataset
const jsonPath = path.join(__dirname, '../src/data/colors.json');
fs.writeFileSync(jsonPath, JSON.stringify(allColors), 'utf8');

// Write lean TypeScript wrapper that imports JSON cleanly
const tsPath = path.join(__dirname, '../src/data/colors.ts');
const tsContent = `import { ColorItem } from '../types';
import rawColors from './colors.json';

export const CURATED_COLORS: ColorItem[] = rawColors as unknown as ColorItem[];
`;
fs.writeFileSync(tsPath, tsContent, 'utf8');

console.log(`✅ Successfully saved ${allColors.length} colors to colors.json and created typed wrapper in colors.ts!`);
