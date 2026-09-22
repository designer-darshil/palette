import {
  calculateWcagRatio,
  formatContrastRatio,
  evaluateWcagRating,
  hexToOklch,
  oklchToHex,
  oklchToCssString,
  getSmartForeground,
  adjustColorForContrast,
  auditBrandKitIntelligence,
  mapPaletteToSemanticRoles,
} from '../src/utils/oklchColorSystem';

console.log('🧪 Running KROMA WCAG 2.2 + OKLCH Brand Kit Color System Verification Suite...\n');

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`✅ PASSED: ${msg}`);
    passed++;
  } else {
    console.error(`❌ FAILED: ${msg}`);
    failed++;
  }
}

// ── 1. Exact WCAG 2.2 Calculations & No Premature Rounding ────────
console.log('--- 1. WCAG 2.2 Exact Calculations & Thresholds ---');
const blackWhiteRatio = calculateWcagRatio('#000000', '#FFFFFF');
assert(Math.abs(blackWhiteRatio - 21) < 0.01, 'Black vs White ratio is 21:1');

const rating = evaluateWcagRating('#171717', '#F8F8F8');
assert(rating.normalTextAA && rating.normalTextAAA, '#171717 on #F8F8F8 passes AA and AAA');
assert(parseFloat(rating.formattedRatio) >= 12.0, 'Formatted ratio is exact without false rounding');

// ── 2. Smart Foreground Selection ─────────────────────────────────
console.log('\n--- 2. Smart Foreground Selection ---');
const orangeBg = '#FF9500';
const fgForOrange = getSmartForeground(orangeBg, 4.5);
assert(fgForOrange.passAA, 'Smart foreground on vibrant orange satisfies AA (>= 4.5:1)');
assert(fgForOrange.color === '#171717' || fgForOrange.color === '#000000', 'Smart foreground on orange chooses dark contrast');

const darkNavyBg = '#0B132B';
const fgForNavy = getSmartForeground(darkNavyBg, 4.5);
assert(fgForNavy.passAA, 'Smart foreground on dark navy satisfies AA');
assert(fgForNavy.color === '#F8F8F8' || fgForNavy.color === '#FFFFFF', 'Smart foreground on navy chooses light contrast');

// ── 3. OKLCH Perceptual Adjustments & Hue Preservation ─────────────
console.log('\n--- 3. OKLCH Perceptual Adjustment & Hue Preservation ---');
const failingOrange = '#FF6B35';
const whiteBg = '#FFFFFF';
const initialRatio = calculateWcagRatio(failingOrange, whiteBg);
assert(initialRatio < 4.5, `Original orange on white fails normal text AA (got ${initialRatio.toFixed(2)}:1)`);

const adjustedOrange = adjustColorForContrast(failingOrange, whiteBg, 4.5);
assert(adjustedOrange.adjusted, 'Color was adjusted to satisfy contrast');
assert(adjustedOrange.ratio >= 4.5, `Adjusted color achieves >= 4.5:1 (got ${adjustedOrange.ratio.toFixed(2)}:1)`);

const origOklch = hexToOklch(failingOrange);
const adjOklch = hexToOklch(adjustedOrange.accessibleHex);
const hueDiff = Math.abs(origOklch.H - adjOklch.H);
assert(hueDiff < 5.0, `Hue preserved within 5 degrees (orig H: ${origOklch.H.toFixed(1)}, adj H: ${adjOklch.H.toFixed(1)})`);
assert(adjOklch.L < origOklch.L, 'Lightness decreased to achieve contrast against light background');

// ── 4. Semantic Roles Audit & Separation of Original vs Accessible ──
console.log('\n--- 4. Semantic Roles & Non-Destructive Model ---');
const rawRoles = {
  primary: '#FF6B35',
  secondary: '#3A86FF',
  accent: '#FFBE0B',
  background: '#FFFFFF',
  surface: '#F8F9FA',
  text: '#718096', // Low contrast gray text
  buttonText: '#FFFFFF',
};

const audit = auditBrandKitIntelligence(rawRoles);
assert(audit.originalRoles.text === '#718096', 'Original roles are preserved without permanent mutation');
assert(audit.accessibleRoles.text !== '#718096', 'Accessible roles holds contrast-safe UI variant');
const accessibleTextRatio = calculateWcagRatio(audit.accessibleRoles.text, audit.accessibleRoles.background);
assert(accessibleTextRatio >= 4.5, `Accessible text ratio meets AA (got ${accessibleTextRatio.toFixed(2)}:1)`);

// ── 5. Intelligent Preset Palette Mapping ─────────────────────────
console.log('\n--- 5. Intelligent Preset Mapping ---');
const sampleColors = ['#264653', '#2A9D8F', '#E76F51', '#F4A261', '#E9C46A'];
const mapped = mapPaletteToSemanticRoles(sampleColors);
assert(!!mapped.original.primary, 'Primary role assigned');
assert(!!mapped.original.background, 'Background role assigned');
assert(calculateWcagRatio(mapped.accessible.buttonText, mapped.accessible.button) >= 4.5, 'Mapped button text passes AA');
assert(calculateWcagRatio(mapped.accessible.text, mapped.accessible.background) >= 4.5, 'Mapped body text passes AA');

console.log(`\n========================================`);
console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL WCAG 2.2 + OKLCH SYSTEM TESTS PASSED FLAWLESSLY!\n');
}
