/**
 * KROMA Color Picker — Verification & Conversion Test Suite
 */
import {
  hexToRgb,
  rgbToHex,
  hexToHsl,
  hslToHex,
  hexToHsv,
  hsvToHex,
  hexToOklch,
  hexToOklchNumbers,
  oklchToHex,
  parseOklch,
  calculateHarmonies,
  generateShadesAndTints,
  getContrastRatio,
  getTextColorForBackground,
  getColorAccessibility,
  getColorTemperature,
} from '../src/utils/colorUtils';
import { routeToUrl } from '../src/utils/routes';

console.log('🧪 Running KROMA Precision Color Picker & Mathematical Colorimetry Test Suite...\n');

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

// ── 1. HEX <-> RGB Roundtrip & Parsing ───────────────────────────────
console.log('--- 1. HEX <-> RGB Conversions ---');
const rgb1 = hexToRgb('#3D7DFF');
assert(rgb1 !== null && rgb1.r === 61 && rgb1.g === 125 && rgb1.b === 255, 'hexToRgb correctly parses #3D7DFF to (61, 125, 255)');

const hex1 = rgbToHex(61, 125, 255);
assert(hex1 === '#3D7DFF', 'rgbToHex converts (61, 125, 255) back to #3D7DFF');

// Short 3-char hex support
const rgbShort = hexToRgb('#FFF');
assert(rgbShort !== null && rgbShort.r === 255 && rgbShort.g === 255 && rgbShort.b === 255, 'hexToRgb correctly parses 3-character hex #FFF');

// Invalid hex handling
const rgbInvalid = hexToRgb('invalid');
assert(rgbInvalid === null, 'hexToRgb returns null on invalid hex string');

// ── 2. HEX <-> HSL Conversions ────────────────────────────────────────
console.log('\n--- 2. HEX <-> HSL Conversions ---');
const hsl = hexToHsl('#3D7DFF');
assert(hsl !== null && Math.abs(hsl.h - 220) <= 2, `hexToHsl calculates hue ~220 deg for blue (got ${hsl?.h})`);
assert(hsl !== null && Math.abs(hsl.s - 100) <= 1, `hexToHsl calculates saturation ~100% (got ${hsl?.s}%)`);
assert(hsl !== null && Math.abs(hsl.l - 62) <= 2, `hexToHsl calculates lightness ~62% (got ${hsl?.l}%)`);

if (hsl) {
  const hexFromHsl = hslToHex(hsl.h, hsl.s, hsl.l);
  assert(hexFromHsl.length === 7 && hexFromHsl.startsWith('#'), `hslToHex produces valid hex: ${hexFromHsl}`);
}

// ── 3. HEX <-> HSV Conversions ────────────────────────────────────────
console.log('\n--- 3. HEX <-> HSV Conversions ---');
const hsv = hexToHsv('#3D7DFF');
assert(Math.abs(hsv.h - 220) <= 2, `hexToHsv hue is ~220 deg (got ${hsv.h})`);
assert(Math.abs(hsv.s - 76) <= 2, `hexToHsv saturation is ~76% (got ${hsv.s}%)`);
assert(hsv.v === 100, `hexToHsv value is 100% (got ${hsv.v}%)`);

const hexFromHsv = hsvToHex(hsv.h, hsv.s, hsv.v);
const rgbOrig = hexToRgb('#3D7DFF')!;
const rgbFromHsv = hexToRgb(hexFromHsv)!;
assert(
  Math.abs(rgbOrig.r - rgbFromHsv.r) <= 1 &&
  Math.abs(rgbOrig.g - rgbFromHsv.g) <= 1 &&
  Math.abs(rgbOrig.b - rgbFromHsv.b) <= 1,
  `hsvToHex roundtrip is accurate within 8-bit quantization (${hexFromHsv} vs #3D7DFF)`
);

// ── 4. OKLCH Conversions & Gamut Fitting ──────────────────────────────
console.log('\n--- 4. OKLCH Color Space & Parsing ---');
const oklchStr = hexToOklch('#3D7DFF');
assert(oklchStr.startsWith('oklch('), `hexToOklch formats CSS string: ${oklchStr}`);

const oklchNums = hexToOklchNumbers('#3D7DFF');
assert(oklchNums.l > 0.5 && oklchNums.l < 0.7, `OKLCH lightness is around ~0.62 (got ${oklchNums.l})`);
assert(oklchNums.c > 0.15 && oklchNums.c < 0.3, `OKLCH chroma is around ~0.22 (got ${oklchNums.c})`);
assert(oklchNums.h >= 250 && oklchNums.h <= 275, `OKLCH hue angle is around ~265 deg (got ${oklchNums.h})`);

// OKLCH to Hex
const hexFromOklch = oklchToHex(oklchNums.l, oklchNums.c, oklchNums.h);
assert(/^#[0-9A-Fa-f]{6}$/.test(hexFromOklch), `oklchToHex produces valid hex: ${hexFromOklch}`);

// OKLCH string parser
const parsedOklch = parseOklch('oklch(62% 0.22 265)');
assert(parsedOklch !== null, 'parseOklch parses percentage lightness format');
assert(parsedOklch !== null && Math.abs(parsedOklch.l - 0.62) < 0.01, 'Parsed L is 0.62');
assert(parsedOklch !== null && parsedOklch.c === 0.22, 'Parsed C is 0.22');
assert(parsedOklch !== null && parsedOklch.h === 265, 'Parsed H is 265');

const parsedDecimalOklch = parseOklch('oklch(0.62 0.22 265deg)');
assert(parsedDecimalOklch !== null, 'parseOklch parses decimal lightness with deg unit');

const invalidOklch = parseOklch('invalid-string');
assert(invalidOklch === null, 'parseOklch returns null on invalid string');

// ── 5. Color Harmonies ───────────────────────────────────────────────
console.log('\n--- 5. Algorithmic Harmonies Generation ---');
const harmonies = calculateHarmonies('#3D7DFF');
assert(Boolean(harmonies.complementary) && harmonies.complementary.startsWith('#'), 'Harmonies has valid complementary color');
assert(harmonies.analogous.length === 2, 'Harmonies has 2 analogous colors');
assert(harmonies.triadic.length === 2, 'Harmonies has 2 triadic colors');
assert(harmonies.tetradic.length === 3, 'Harmonies has 3 tetradic colors');
assert(harmonies.splitComplementary.length === 2, 'Harmonies has 2 split-complementary colors');
assert(harmonies.monochromatic.length === 4, 'Harmonies has 4 monochromatic colors');

// ── 6. Tints, Shades & Tones ──────────────────────────────────────────
console.log('\n--- 6. Tints, Shades & Tones ---');
const variations = generateShadesAndTints('#3D7DFF');
assert(variations.tints.length === 6, 'Generated 6 tints');
assert(variations.shades.length === 6, 'Generated 6 shades');
assert(variations.tones.length === 6, 'Generated 6 tones');

// Verify that tints get progressively lighter
const rgbTint1 = hexToRgb(variations.tints[0])!;
const rgbTintLast = hexToRgb(variations.tints[variations.tints.length - 1])!;
assert(rgbTintLast.r >= rgbTint1.r && rgbTintLast.g >= rgbTint1.g, 'Tints scale towards white');

// ── 7. WCAG Contrast & Accessible Text ────────────────────────────────
console.log('\n--- 7. WCAG Contrast & Foreground Selection ---');
const whiteContrast = getContrastRatio('#FFFFFF', '#000000');
assert(whiteContrast === 21, 'White vs Black contrast is exactly 21:1');

const textOnWhite = getTextColorForBackground('#FFFFFF');
assert(textOnWhite === '#000000', 'Pure white background selects pure black text');

const textOnBlack = getTextColorForBackground('#000000');
assert(textOnBlack === '#FFFFFF', 'Pure black background selects pure white text');

const textOnPrimary = getTextColorForBackground('#3D7DFF');
assert(textOnPrimary === '#000000', 'Vibrant light-blue #3D7DFF selects #000000 for maximum contrast (5.58:1 on black vs 3.77:1 on white)');

const textOnNavy = getTextColorForBackground('#1D4ED8');
assert(textOnNavy === '#FFFFFF', 'Deep cobalt navy #1D4ED8 selects #FFFFFF for contrast (7.21:1 on white vs 2.91:1 on black)');

const access = getColorAccessibility('#3D7DFF');
assert(access.contrastWithWhite > 1, `Calculated contrast with white: ${access.contrastWithWhite}:1`);
assert(access.contrastWithBlack > 1, `Calculated contrast with black: ${access.contrastWithBlack}:1`);
assert(access.bestTextColor === textOnPrimary, 'Accessibility bestTextColor matches getTextColorForBackground');

// ── 8. Color Temperature ──────────────────────────────────────────────
console.log('\n--- 8. Color Temperature ---');
const warmTemp = getColorTemperature('#FF3B30');
assert(warmTemp.classification === 'Warm', 'Red #FF3B30 is classified as Warm');

const coolTemp = getColorTemperature('#00AEEF');
assert(coolTemp.classification === 'Cool', 'Cyan #00AEEF is classified as Cool');

// ── 9. URL Routing & Serialization ───────────────────────────────────
console.log('\n--- 9. Color Picker URL Route Serialization ---');
const pickerUrl1 = routeToUrl({ path: 'color-picker' });
assert(pickerUrl1 === '/color-picker', 'Route { path: "color-picker" } maps to /color-picker');

const pickerUrl2 = routeToUrl({ path: 'color-picker', hex: '3D7DFF' });
assert(pickerUrl2 === '/color-picker?hex=3D7DFF', 'Route with hex query param serializes to /color-picker?hex=3D7DFF');

console.log(`\n========================================`);
console.log(`Color Picker Test Results: ${passed} Passed, ${failed} Failed`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL KROMA COLOR PICKER & COLORIMETRY TESTS PASSED FLAWLESSLY!\n');
}
