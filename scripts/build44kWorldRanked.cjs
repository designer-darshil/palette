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
  return { r: 0, g: 0, b: 0 };
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

// World Iconic Colors (Tier 1)
const WORLD_ICONIC_COLORS = [
  // Top Blues & Indigos
  ['celestial-cobalt', 'Celestial Cobalt', '#1D4ED8'],
  ['electric-royal-blue', 'Electric Royal Blue', '#2563EB'],
  ['stripe-indigo', 'Stripe Indigo', '#6366F1'],
  ['apple-system-blue', 'Apple System Blue', '#007AFF'],
  ['yves-klein-ultramarine', 'Yves Klein Ultramarine', '#002FA7'],
  ['cyberpunk-neon-cyan', 'Cyberpunk Neon Cyan', '#00F0FF'],
  ['tiffany-blue', 'Tiffany Blue', '#0ABAB5'],
  ['prussian-blue', 'Prussian Blue', '#003153'],
  ['majorelle-blue', 'Majorelle Blue', '#6050DC'],
  ['cerulean-drift', 'Cerulean Drift', '#0284C7'],
  ['sapphire-vivid', 'Sapphire Vivid', '#3B82F6'],
  ['deep-space-navy', 'Deep Space Navy', '#0F172A'],
  
  // Top Neutrals & Surfaces
  ['pure-alabaster-white', 'Pure Alabaster White', '#FFFFFF'],
  ['obsidian-jet-black', 'Obsidian Jet Black', '#000000'],
  ['zinc-dark-surface', 'Zinc Dark Surface', '#18181B'],
  ['slate-gray', 'Slate Gray', '#64748B'],
  ['graphite-carbon', 'Graphite Carbon', '#1E293B'],
  ['cool-off-white', 'Cool Off-White', '#F8FAFC'],
  ['neutral-titanium', 'Neutral Titanium', '#71717A'],
  ['pure-titanium', 'Pure Titanium', '#F9FAFB'],
  ['obsidian-carbon', 'Obsidian Carbon', '#111827'],
  
  // Top Reds & Vermilions
  ['swiss-vermilion', 'Swiss Vermilion', '#E63946'],
  ['rosso-corsa', 'Rosso Corsa', '#CC0000'],
  ['crimson-lake', 'Crimson Lake', '#DC2626'],
  ['international-orange', 'International Orange', '#BA3C0D'],
  ['bauhaus-red', 'Bauhaus Red', '#D11A2A'],
  ['bordeaux-wine', 'Bordeaux Wine', '#722F37'],
  ['vermilion-specimen', 'Vermilion Specimen', '#EF4444'],
  ['ruby-carmine', 'Ruby Carmine', '#B91C1C'],
  
  // Top Greens & Teals
  ['emerald-matrix', 'Emerald Matrix', '#059669'],
  ['british-racing-green', 'British Racing Green', '#004225'],
  ['verdant-forest', 'Verdant Forest', '#16A34A'],
  ['nordic-sage', 'Nordic Sage', '#84A98C'],
  ['apple-mint', 'Apple Mint', '#34C759'],
  ['malachite-green', 'Malachite Green', '#118C4F'],
  ['teal-lagoon', 'Teal Lagoon', '#14B8A6'],
  ['petroleum-abyss', 'Petroleum Abyss', '#0F766E'],
  
  // Top Ambers, Golds & Oranges
  ['hermes-orange', 'Hermès Orange', '#F37021'],
  ['amber-resonance', 'Amber Resonance', '#D97706'],
  ['solar-citrine', 'Solar Citrine', '#EAB308'],
  ['tuscan-terracotta', 'Tuscan Terracotta', '#EA580C'],
  ['champagne-gold', 'Champagne Gold', '#F7E7CE'],
  ['ochre-sienna', 'Ochre Sienna', '#C68642'],
  ['solar-amber', 'Solar Amber', '#F59E0B'],
  ['terracotta-earth', 'Terracotta Earth', '#C2410C'],
  
  // Top Purples, Violets & Pinks
  ['amethyst-nocturne', 'Amethyst Nocturne', '#7C3AED'],
  ['ultra-violet', 'Ultra Violet', '#5F4B8B'],
  ['millennial-pink', 'Millennial Pink', '#F3CFC6'],
  ['rose-quartz-haze', 'Rose Quartz Haze', '#DB2777'],
  ['living-coral', 'Living Coral', '#FF6F61'],
  ['shocking-fuchsia', 'Shocking Fuchsia', '#FF007F'],
  ['violet-matrix', 'Violet Matrix', '#8B5CF6']
];

const TARGET_COLORS = 44000;
const usedHexes = new Set();
const usedSlugs = new Set();
const finalTuples = [];

// 1. Add all Tier 1 Iconic Colors
for (const item of WORLD_ICONIC_COLORS) {
  const [slug, name, hex] = item;
  const normHex = hex.toUpperCase();
  if (!usedHexes.has(normHex)) {
    usedHexes.add(normHex);
    usedSlugs.add(slug);
    finalTuples.push([slug, name, normHex]);
  }
}

// 2. Systematic Generation Order:
// Group A: World-dominant UI Blue spectrum (H: 200° to 240°)
// Group B: Modern Tech Neutrals & Slates (S: 4% to 14%, All L)
// Group C: Emerald, Forest & Mint Greens (H: 120° to 160°)
// Group D: Swiss Reds, Crimsons & Corals (H: 345° to 20°)
// Group E: Ambers, Solar Golds & Warm Oranges (H: 25° to 55°)
// Group F: Royal Indigos & Amethyst Purples (H: 245° to 300°)
// Group G: Cyans, Glacial Teals & Aquas (H: 165° to 195°)
// Group H: Blush Pinks & Pop Magentas (H: 305° to 340°)
// Group I: Remaining spectrum
const hueGroupsPriority = [
  // High utility Blues
  { hMin: 200, hMax: 240, stepH: 1 },
  // High utility Neutrals
  { neutralOnly: true },
  // High utility Greens
  { hMin: 120, hMax: 160, stepH: 1 },
  // High utility Reds
  { hMin: 345, hMax: 360, stepH: 1 },
  { hMin: 0, hMax: 25, stepH: 1 },
  // High utility Ambers/Oranges
  { hMin: 25, hMax: 55, stepH: 1 },
  // High utility Indigos/Purples
  { hMin: 245, hMax: 300, stepH: 1 },
  // High utility Cyans/Teals
  { hMin: 165, hMax: 195, stepH: 1 },
  // High utility Pinks
  { hMin: 305, hMax: 345, stepH: 1 },
  // Full remaining sweep
  { hMin: 0, hMax: 360, stepH: 1 }
];

let globalColorCounter = finalTuples.length + 1;

outerGenerator:
for (const group of hueGroupsPriority) {
  if (group.neutralOnly) {
    for (let s = 2; s <= 12; s += 2) {
      for (let l = 4; l <= 98; l += 1) {
        for (let h = 0; h < 360; h += 20) {
          const hex = hslToHex(h, s, l);
          if (usedHexes.has(hex)) continue;
          usedHexes.add(hex);

          const hueGroup = classifyHueGroup(h, s);
          const adjectives = HUE_ADJECTIVES[hueGroup] || HUE_ADJECTIVES.neutral;
          const adj = adjectives[(h + s + l) % adjectives.length];
          const mod = NOUN_MODIFIERS[(h * 2 + l * 3) % NOUN_MODIFIERS.length];
          const name = `${adj} ${mod} ${h}°·${s}·${l}`;
          let slug = `${adj.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${mod.toLowerCase()}-${h}-${s}-${l}`;
          if (usedSlugs.has(slug)) slug = `${slug}-${globalColorCounter}`;
          usedSlugs.add(slug);

          finalTuples.push([slug, name, hex]);
          globalColorCounter++;
          if (finalTuples.length >= TARGET_COLORS) break outerGenerator;
        }
      }
    }
  } else {
    for (let s = 14; s <= 98; s += 2) {
      for (let l = 10; l <= 90; l += 2) {
        for (let h = group.hMin; h < group.hMax; h += group.stepH) {
          const hex = hslToHex(h, s, l);
          if (usedHexes.has(hex)) continue;
          usedHexes.add(hex);

          const hueGroup = classifyHueGroup(h, s);
          const adjectives = HUE_ADJECTIVES[hueGroup] || HUE_ADJECTIVES.blue;
          const adj = adjectives[(h + s + l) % adjectives.length];
          const mod = NOUN_MODIFIERS[(h * 2 + l * 3) % NOUN_MODIFIERS.length];
          const name = `${adj} ${mod} ${h}°·${s}·${l}`;
          let slug = `${adj.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${mod.toLowerCase()}-${h}-${s}-${l}`;
          if (usedSlugs.has(slug)) slug = `${slug}-${globalColorCounter}`;
          usedSlugs.add(slug);

          finalTuples.push([slug, name, hex]);
          globalColorCounter++;
          if (finalTuples.length >= TARGET_COLORS) break outerGenerator;
        }
      }
    }
  }
}

console.log(`Generated exactly ${finalTuples.length} colors.`);
console.log(`Unique Hex count: ${usedHexes.size}`);
console.log(`Unique Slugs: ${usedSlugs.size}`);

// Save to compact storage
const compactPath = path.join(__dirname, '../src/data/colorsCompact.json');
fs.writeFileSync(compactPath, JSON.stringify(finalTuples), 'utf8');

console.log('\n🌟 Top 30 World-Ranked Colors:');
finalTuples.slice(0, 30).forEach((t, i) => {
  console.log(`  #${i + 1}: ${t[1]} (${t[2]}) -> ${t[0]}`);
});
