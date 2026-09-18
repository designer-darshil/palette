import { PaletteItem, ColorItem } from '../types';
import { hexToRgb, hexToHsl, hexToOklch } from './colorUtils';

export function generateCssVariablesExport(palette: PaletteItem): string {
  const lines: string[] = [];
  lines.push(`/* PaletteParadise Specimen: ${palette.title} */`);
  lines.push(`:root {`);

  palette.colors.forEach((c, idx) => {
    const slug = c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const roleSlug = c.role ? c.role.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `step-${idx + 1}`;
    lines.push(`  --color-${slug}: ${c.hex};`);
    lines.push(`  --token-${roleSlug}: ${c.hex};`);
  });

  lines.push(`}`);
  return lines.join('\n');
}

export function generateScssExport(palette: PaletteItem): string {
  const lines: string[] = [];
  lines.push(`// PaletteParadise Token System: ${palette.title}`);
  lines.push(`$palette-${palette.slug}: (`);

  palette.colors.forEach((c) => {
    const slug = c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    lines.push(`  '${slug}': ${c.hex},`);
  });

  lines.push(`);`);
  return lines.join('\n');
}

export function generateTailwindExport(palette: PaletteItem): string {
  const colorsObj: Record<string, string> = {};
  palette.colors.forEach((c) => {
    const slug = c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    colorsObj[slug] = c.hex;
  });

  return `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: ${JSON.stringify(colorsObj, null, 8).replace(/^ {8}/gm, '      ')}\n    }\n  }\n};`;
}

export function generateDtcgTokensJson(palette: PaletteItem): string {
  const tokens: Record<string, any> = {
    $schema: 'https://design-tokens.github.io/community-group/format/',
    palette: {
      name: { $value: palette.title, $type: 'string' },
      category: { $value: palette.category, $type: 'string' },
      color: {} as Record<string, any>,
    },
  };

  palette.colors.forEach((c) => {
    const slug = c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const rgb = hexToRgb(c.hex);
    const hsl = hexToHsl(c.hex);
    tokens.palette.color[slug] = {
      $value: c.hex,
      $type: 'color',
      $description: c.role || `${c.name} palette tone`,
      $extensions: {
        'com.paletteparadise': {
          rgb: rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : undefined,
          hsl: hsl ? `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` : undefined,
          oklch: hexToOklch(c.hex),
        },
      },
    };
  });

  return JSON.stringify(tokens, null, 2);
}
