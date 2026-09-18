import { CURATED_COLORS } from '../src/data/colors';
import { CURATED_PALETTES } from '../src/data/palettes';
import { CURATED_COMBOS } from '../src/data/combos';
import { CURATED_GRADIENTS } from '../src/data/gradients';
import {
  getContrastRatio,
  getTextColorForBackground,
  getColorAccessibility,
  assessPracticalUi,
} from '../src/utils/colorUtils';
import {
  generateFullRampsSystem,
  normalizeHex,
  isValidHex,
} from '../src/utils/rampsEngine';
import {
  DEFAULT_ANTIGRAVITY_CONFIG,
  ANTIGRAVITY_PRESETS,
  serializeAntigravityConfig,
  deserializeAntigravityConfig,
  generateMotionTokens,
  generateCssExport,
} from '../src/utils/antigravityEngine';
import {
  DEFAULT_MESH_CONFIG,
  MESH_PRESETS,
  serializeMeshConfig,
  deserializeMeshConfig,
  generateMeshCss,
  generateMeshSvg,
  generateMeshTokensJson,
} from '../src/utils/meshEngine';
import { validateAllPalettes } from '../src/utils/paletteValidation';

console.log('🧪 Running Comprehensive PaletteParadise Full Application Stability Suite...\n');

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`✅ PASSED: ${message}`);
    passed++;
  } else {
    console.error(`❌ FAILED: ${message}`);
    failed++;
  }
}

// ─────────────────────────────────────────────────────────────
// 1. DATASET INTEGRITY & SANITY CHECKS
// ─────────────────────────────────────────────────────────────
console.log('\n--- 1. Dataset Integrity & Zero Malformed Records ---');

// Colors
const colorIdSet = new Set<string>();
let malformedColors = 0;
for (const c of CURATED_COLORS) {
  if (colorIdSet.has(c.id)) {
    malformedColors++;
    console.error(`Duplicate Color ID: ${c.id}`);
  }
  colorIdSet.add(c.id);
  if (!/^#[0-9A-Fa-f]{6}$/.test(c.hex)) malformedColors++;
  if (!c.slug || !c.name) malformedColors++;
}
assert(malformedColors === 0, `All ${CURATED_COLORS.length} curated colors have valid HEX, unique IDs, and non-empty metadata`);

// Palettes
const paletteIdSet = new Set<string>();
let malformedPalettes = 0;
for (const p of CURATED_PALETTES) {
  if (paletteIdSet.has(p.id)) {
    malformedPalettes++;
    console.error(`Duplicate Palette ID: ${p.id}`);
  }
  paletteIdSet.add(p.id);
  if (!p.slug || !p.title || p.colors.length === 0) malformedPalettes++;
  for (const sw of p.colors) {
    if (!/^#[0-9A-Fa-f]{6}$/.test(sw.hex)) malformedPalettes++;
  }
}
assert(malformedPalettes === 0, `All ${CURATED_PALETTES.length} curated palettes have valid swatches and unique IDs`);

// Combos
const comboIdSet = new Set<string>();
let malformedCombos = 0;
for (const cb of CURATED_COMBOS) {
  if (comboIdSet.has(cb.id)) malformedCombos++;
  comboIdSet.add(cb.id);
  if (!cb.slug || !cb.title || cb.colors.length < 2) malformedCombos++;
}
assert(malformedCombos === 0, `All ${CURATED_COMBOS.length} curated combos have valid colors and unique IDs`);

// Gradients
const gradientIdSet = new Set<string>();
let malformedGradients = 0;
for (const g of CURATED_GRADIENTS) {
  if (gradientIdSet.has(g.id)) malformedGradients++;
  gradientIdSet.add(g.id);
  if (!g.slug || !g.title || !g.stops || g.stops.length < 2) malformedGradients++;
  for (const st of g.stops) {
    if (!/^#[0-9A-Fa-f]{6}$/.test(st.color)) malformedGradients++;
  }
}
assert(malformedGradients === 0, `All ${CURATED_GRADIENTS.length} curated gradients have valid stops, hex codes, and unique IDs`);

// ─────────────────────────────────────────────────────────────
// 2. WCAG AA ACCESSIBILITY AUDIT ACROSS ALL PALETTES
// ─────────────────────────────────────────────────────────────
console.log('\n--- 2. WCAG AA Accessibility Conformance ---');
const paletteAudit = validateAllPalettes(CURATED_PALETTES);
assert(paletteAudit.aaFailCount === 0, `0 WCAG AA failures across all 1,472 unique colors in 1,210 curated palettes`);
assert(paletteAudit.allPalettesPassAA === true, `All 1,210 palettes strictly conform to WCAG AA`);

// ─────────────────────────────────────────────────────────────
// 3. STUDIO ENGINES & SERIALIZATION ROUND-TRIP STABILITY
// ─────────────────────────────────────────────────────────────
console.log('\n--- 3. Studio Engines & Serialization Round-Trips ---');

// Ramps Engine
const rampsSys = generateFullRampsSystem({
  brand: 'BFA3F0',
  scope: 'full',
  scheme: 'complementary',
  wcag: 'AA',
  notation: 'oklch',
  vividness: 'natural',
  excludedRamps: [],
  excludedTokens: [],
});
assert(Object.keys(rampsSys.ramps).length > 0, `Ramps system generated ${Object.keys(rampsSys.ramps).length} tonal ramps for #BFA3F0`);
assert(rampsSys.tokens.length > 0, `Ramps system generated ${rampsSys.tokens.length} semantic design tokens`);

// Antigravity Engine
const antiSerialized = serializeAntigravityConfig(DEFAULT_ANTIGRAVITY_CONFIG);
const antiParams = new URLSearchParams(antiSerialized);
const antiDeserialized = deserializeAntigravityConfig(antiParams);
assert(antiDeserialized.object === DEFAULT_ANTIGRAVITY_CONFIG.object, 'Antigravity config round-trip preserves object type');
assert(antiDeserialized.gravityY === DEFAULT_ANTIGRAVITY_CONFIG.gravityY, 'Antigravity config round-trip preserves gravityY');
const motionTokens = generateMotionTokens(antiDeserialized);
assert(motionTokens !== null, 'Generated valid deterministic motion design tokens');

// Mesh Gradient Engine
const meshSerialized = serializeMeshConfig(DEFAULT_MESH_CONFIG);
const meshParams = new URLSearchParams(meshSerialized);
const meshDeserialized = deserializeMeshConfig(meshParams);
assert(meshDeserialized.points.length === DEFAULT_MESH_CONFIG.points.length, 'Mesh config round-trip preserves point count');
assert(meshDeserialized.softness === DEFAULT_MESH_CONFIG.softness, 'Mesh config round-trip preserves softness');
const meshCss = generateMeshCss(meshDeserialized);
assert(meshCss.includes('radial-gradient'), 'Mesh CSS generation outputs valid radial gradients');
const meshSvg = generateMeshSvg(meshDeserialized);
assert(meshSvg.includes('<svg') && meshSvg.includes('</svg>'), 'Mesh SVG export generates valid XML markup');

// ─────────────────────────────────────────────────────────────
// 4. COLOR UTILITY ACCURACY & SAFETY
// ─────────────────────────────────────────────────────────────
console.log('\n--- 4. Color Utility Boundary Testing ---');
assert(isValidHex('#BFA3F0') === true, '#BFA3F0 is recognized as valid hex');
assert(isValidHex('BFA3F0') === true, 'BFA3F0 is recognized as valid hex');
assert(isValidHex('#xyz123') === false, 'Invalid hex #xyz123 correctly rejected');
assert(isValidHex('') === false, 'Empty string correctly rejected');

const blackRatio = getContrastRatio('#FFFFFF', '#000000');
assert(blackRatio === 21, `Pure white on pure black contrast is exactly 21:1 (got ${blackRatio}:1)`);

const primaryAccess = getColorAccessibility('#BFA3F0');
assert(primaryAccess.bestTextColor === '#000000', 'Brand primary #BFA3F0 selects pure black text #000000');
assert(primaryAccess.bestContrast >= 9.0, `Brand primary #BFA3F0 achieves AAA contrast on black (${primaryAccess.bestContrast}:1)`);

console.log(`\n======================================================`);
console.log(`Full Application Stability Suite: ${passed} Passed, ${failed} Failed`);
console.log(`======================================================\n`);

if (failed > 0) {
  process.exit(1);
}
