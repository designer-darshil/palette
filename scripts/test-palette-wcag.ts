import { CURATED_PALETTES } from '../src/data/palettes';
import {
  getContrastRatio,
  getTextColorForBackground,
  getColorAccessibility,
  assessPracticalUi,
} from '../src/utils/colorUtils';
import {
  validatePalette,
  validateAllPalettes,
  findAccessibleColorReplacement,
} from '../src/utils/paletteValidation';

console.log('🧪 Running PaletteParadise WCAG AA/AAA Accessibility & Dataset Validation Test Suite...\n');

let failed = 0;
let passed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`✅ PASSED: ${message}`);
    passed++;
  } else {
    console.error(`❌ FAILED: ${message}`);
    failed++;
  }
}

// 1. PaletteParadise Primary Color Accessibility (#BFA3F0)
console.log('\n--- 1. Primary Brand Specimen (#BFA3F0) Contrast Test ---');
const primaryHex = '#BFA3F0';
const primaryWhiteRatio = getContrastRatio(primaryHex, '#FFFFFF');
const primaryBlackRatio = getContrastRatio(primaryHex, '#000000');
const primaryBestText = getTextColorForBackground(primaryHex);
const primaryAccess = getColorAccessibility(primaryHex);

assert(primaryBlackRatio >= 9.0, `Primary #BFA3F0 on #000000 contrast (${primaryBlackRatio}:1) reaches >= 9.0:1`);
assert(primaryBestText === '#000000', `Primary #BFA3F0 best text color is #000000 (pure black)`);
assert(primaryAccess.passAAA, `Primary #BFA3F0 with #000000 passes WCAG AAA (>= 7.0:1)`);
assert(primaryWhiteRatio < 4.5, `Primary #BFA3F0 with #FFFFFF fails AA (< 4.5:1, got ${primaryWhiteRatio}:1) as expected`);

// 2. Pure Black / White Text Selection Logic
console.log('\n--- 2. getTextColorForBackground & Pure Black/White Thresholds ---');
assert(getTextColorForBackground('#FFFFFF') === '#000000', 'White background selects pure black text #000000');
assert(getTextColorForBackground('#000000') === '#FFFFFF', 'Black background selects pure white text #FFFFFF');
assert(getTextColorForBackground('#111215') === '#FFFFFF', 'Dark surface #111215 selects #FFFFFF');
assert(getTextColorForBackground('#F7F6F2') === '#000000', 'Light surface #F7F6F2 selects #000000');
assert(getTextColorForBackground('#E63946') === '#000000', 'Vermilion #E63946 selects #000000 (5.04:1 on black vs 4.17:1 on white)');
assert(getTextColorForBackground('#1D4ED8') === '#FFFFFF', 'Celestial Cobalt #1D4ED8 selects #FFFFFF (7.21:1 on white vs 2.91:1 on black)');

// 3. Complete Dataset Audit (1,210 Palettes, 6,050 Swatches, 1,472 Unique Colors)
console.log('\n--- 3. Comprehensive Palette Dataset WCAG AA Audit ---');
const auditSummary = validateAllPalettes(CURATED_PALETTES);

assert(auditSummary.totalPalettes === 1210, `Audited all 1,210 curated palettes (found ${auditSummary.totalPalettes})`);
assert(auditSummary.totalSwatches === 6050, `Audited all 6,050 swatches (found ${auditSummary.totalSwatches})`);
assert(auditSummary.uniqueColors === 1472, `Found exactly 1,472 unique colors in palette dataset (found ${auditSummary.uniqueColors})`);
assert(auditSummary.aaFailCount === 0, `0 AA Failures across all 1,472 unique palette colors (found ${auditSummary.aaFailCount})`);
assert(auditSummary.aaaCapableCount === 1099, `Found exactly 1,099 AAA-capable colors (found ${auditSummary.aaaCapableCount})`);
assert(auditSummary.aaOnlyCount === 373, `Found exactly 373 AA-only colors (found ${auditSummary.aaOnlyCount})`);
assert(auditSummary.allPalettesPassAA === true, 'All 1,210 palettes pass WCAG AA with best accessible text foreground');

// 4. Color Replacement Utility for Hypothetical AA Failing Colors
console.log('\n--- 4. Color Replacement Algorithm Test ---');
// Test with a mid-tone grey that fails AA with both white and black (e.g. #777777 has ~4.48:1 with black and ~4.68:1 with white, let's test a true failure)
// #7F7F7F: contrast with black is ~4.06, with white is ~5.17 (passes with white).
// Pure middle luminance where both white and black are < 4.5:
// sqrt(1.05 * 0.05) - 0.05 = ~0.179 luminance. In sRGB, ~#727272 to #767676.
// For #747474:
const midToneHex = '#747474';
const midWhiteRatio = getContrastRatio(midToneHex, '#FFFFFF');
const midBlackRatio = getContrastRatio(midToneHex, '#000000');
const midMaxRatio = Math.max(midWhiteRatio, midBlackRatio);

if (midMaxRatio < 4.5) {
  const replacement = findAccessibleColorReplacement(midToneHex, 4.5);
  assert(replacement !== null, `Replacement algorithm found candidate for failing ${midToneHex}`);
  if (replacement) {
    assert(replacement.achievedContrast >= 4.5, `Replacement ${replacement.replacementHex} achieves >= 4.5:1 (got ${replacement.achievedContrast}:1)`);
    assert(replacement.lightnessDelta <= 10, `Lightness delta is minimal (${replacement.lightnessDelta}%)`);
  }
} else {
  // Test synthetic failing color
  const rep = findAccessibleColorReplacement('#767676', 7.0); // Target AAA
  assert(rep !== null && rep.achievedContrast >= 7.0, `Replacement algorithm elevates #767676 to AAA (${rep?.achievedContrast}:1)`);
}

// 5. Palette-level Validation Function
console.log('\n--- 5. Single Palette Validation API Test ---');
const firstPalette = CURATED_PALETTES[0];
const singlePaletteResult = validatePalette(firstPalette);
assert(singlePaletteResult.allPassAA === true, `Palette "${firstPalette.title}" passes AA validation`);
assert(singlePaletteResult.swatches.length === firstPalette.colors.length, `Validated all ${firstPalette.colors.length} swatches in palette`);
assert(singlePaletteResult.minContrast >= 4.5, `Minimum contrast in palette is >= 4.5:1 (got ${singlePaletteResult.minContrast}:1)`);

console.log(`\n========================================`);
console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
}
