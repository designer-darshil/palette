import { hexToHsl, hslToHex, hexToRgb, getLuminance, getContrastRatio, getColorTemperature, hexToOklch } from './colorUtils';
import { findClosestColorName } from './paletteGenerator';

export interface RelationalNode {
  type: 'complementary' | 'analogous-1' | 'analogous-2' | 'triadic-1' | 'triadic-2' | 'tetradic-1' | 'tetradic-2' | 'tetradic-3' | 'split-1' | 'split-2' | 'tint' | 'shade';
  label: string;
  angleDelta: number;
  hex: string;
  name: string;
  hsl: { h: number; s: number; l: number };
  contrastWithBase: number;
  temperature: { classification: 'Warm' | 'Cool' | 'Neutral'; kelvin: number };
}

export interface ColorRelationshipProfile {
  baseHex: string;
  baseName: string;
  baseHsl: { h: number; s: number; l: number };
  baseOklch: string;
  temperature: { kelvin: number; classification: 'Warm' | 'Cool' | 'Neutral'; score: number };
  luminance: number;
  contrastWithWhite: number;
  contrastWithBlack: number;
  nodes: RelationalNode[];
  harmonies: {
    complementary: RelationalNode[];
    analogous: RelationalNode[];
    triadic: RelationalNode[];
    tetradic: RelationalNode[];
    splitComplementary: RelationalNode[];
    monochromatic: RelationalNode[];
  };
}

export function buildColorRelationshipProfile(hex: string): ColorRelationshipProfile {
  const cleanHex = hex.startsWith('#') ? hex.toUpperCase() : `#${hex.toUpperCase()}`;
  const hsl = hexToHsl(cleanHex) || { h: 0, s: 50, l: 50 };
  const rgb = hexToRgb(cleanHex) || { r: 128, g: 128, b: 128 };
  const lum = parseFloat(getLuminance(rgb.r, rgb.g, rgb.b).toFixed(3));
  const temp = getColorTemperature(cleanHex);
  const name = findClosestColorName(cleanHex);
  const oklch = hexToOklch(cleanHex);

  const createNode = (
    type: RelationalNode['type'],
    label: string,
    hDelta: number,
    s = hsl.s,
    l = hsl.l
  ): RelationalNode => {
    const nodeHex = hslToHex(hsl.h + hDelta, s, l);
    const nodeHsl = hexToHsl(nodeHex) || { h: (hsl.h + hDelta) % 360, s, l };
    return {
      type,
      label,
      angleDelta: hDelta,
      hex: nodeHex,
      name: findClosestColorName(nodeHex),
      hsl: nodeHsl,
      contrastWithBase: getContrastRatio(cleanHex, nodeHex),
      temperature: getColorTemperature(nodeHex),
    };
  };

  const compNodes: RelationalNode[] = [
    createNode('complementary', 'Direct Complement (180°)', 180),
  ];

  const anaNodes: RelationalNode[] = [
    createNode('analogous-1', 'Adjacent Left (-30°)', -30),
    createNode('analogous-2', 'Adjacent Right (+30°)', 30),
  ];

  const triNodes: RelationalNode[] = [
    createNode('triadic-1', 'Triadic Point 1 (+120°)', 120),
    createNode('triadic-2', 'Triadic Point 2 (+240°)', 240),
  ];

  const tetNodes: RelationalNode[] = [
    createNode('tetradic-1', 'Square Step 1 (+90°)', 90),
    createNode('tetradic-2', 'Square Step 2 (+180°)', 180),
    createNode('tetradic-3', 'Square Step 3 (+270°)', 270),
  ];

  const splitNodes: RelationalNode[] = [
    createNode('split-1', 'Split Harmonic 1 (+150°)', 150),
    createNode('split-2', 'Split Harmonic 2 (+210°)', 210),
  ];

  const monoNodes: RelationalNode[] = [
    createNode('shade', 'Deep Shade (-30% L)', 0, hsl.s, Math.max(12, hsl.l - 30)),
    createNode('shade', 'Muted Tone (-15% L)', 0, hsl.s, Math.max(22, hsl.l - 15)),
    createNode('tint', 'Bright Tone (+15% L)', 0, hsl.s, Math.min(85, hsl.l + 15)),
    createNode('tint', 'Pastel Tint (+30% L)', 0, hsl.s, Math.min(94, hsl.l + 30)),
  ];

  const allNodes = [
    ...compNodes,
    ...anaNodes,
    ...triNodes,
    ...tetNodes,
    ...splitNodes,
    ...monoNodes,
  ];

  return {
    baseHex: cleanHex,
    baseName: name,
    baseHsl: hsl,
    baseOklch: oklch,
    temperature: temp,
    luminance: lum,
    contrastWithWhite: getContrastRatio(cleanHex, '#FFFFFF'),
    contrastWithBlack: getContrastRatio(cleanHex, '#000000'),
    nodes: allNodes,
    harmonies: {
      complementary: compNodes,
      analogous: anaNodes,
      triadic: triNodes,
      tetradic: tetNodes,
      splitComplementary: splitNodes,
      monochromatic: monoNodes,
    },
  };
}
