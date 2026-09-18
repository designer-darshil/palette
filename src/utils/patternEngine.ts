import { PatternType } from '../types';

export interface PatternConfig {
  type: PatternType;
  palette: string[]; // array of hex colors
  scale: number; // 10 to 100
  density: number; // 10 to 100
  rotation: number; // 0 to 360
  strokeWidth?: number; // 1 to 10
  opacity?: number; // 0.1 to 1.0
  backgroundColor?: string;
}

export function generatePatternSvg(config: PatternConfig, width = 400, height = 400): string {
  const { type, palette, scale, density, rotation, strokeWidth = 2, opacity = 1.0 } = config;
  const bg = config.backgroundColor || palette[0] || '#111215';
  const c1 = palette[1] || '#E63946';
  const c2 = palette[2] || '#BFA3F0';
  const c3 = palette[3] || '#E9C46A';
  const c4 = palette[4] || '#8D99AE';

  const tileSize = Math.max(20, Math.round(scale * 1.5));
  const step = Math.max(8, Math.round((110 - density) * 0.5 + tileSize * 0.4));

  let defs = '';
  let content = '';

  switch (type) {
    case 'dots': {
      const r = Math.max(2, Math.round(tileSize * 0.18));
      defs = `
        <pattern id="pat-dots" width="${step}" height="${step}" patternUnits="userSpaceOnUse" patternTransform="rotate(${rotation})">
          <circle cx="${step / 2}" cy="${step / 2}" r="${r}" fill="${c1}" opacity="${opacity}" />
          <circle cx="${step}" cy="0" r="${r * 0.6}" fill="${c2}" opacity="${opacity * 0.7}" />
          <circle cx="0" cy="${step}" r="${r * 0.6}" fill="${c3}" opacity="${opacity * 0.7}" />
        </pattern>
      `;
      content = `<rect width="100%" height="100%" fill="url(#pat-dots)" />`;
      break;
    }

    case 'grid': {
      defs = `
        <pattern id="pat-grid" width="${step}" height="${step}" patternUnits="userSpaceOnUse" patternTransform="rotate(${rotation})">
          <path d="M ${step} 0 L 0 0 0 ${step}" fill="none" stroke="${c1}" stroke-width="${strokeWidth}" opacity="${opacity}" />
          <circle cx="${step}" cy="${step}" r="${Math.max(1.5, strokeWidth * 1.2)}" fill="${c2}" opacity="${opacity}" />
        </pattern>
      `;
      content = `<rect width="100%" height="100%" fill="url(#pat-grid)" />`;
      break;
    }

    case 'stripes': {
      const stripeW = Math.max(3, Math.round(step * 0.4));
      defs = `
        <pattern id="pat-stripes" width="${step}" height="${step}" patternUnits="userSpaceOnUse" patternTransform="rotate(${rotation})">
          <rect x="0" y="0" width="${stripeW}" height="${step}" fill="${c1}" opacity="${opacity}" />
          <rect x="${stripeW}" y="0" width="${Math.max(2, stripeW * 0.3)}" height="${step}" fill="${c2}" opacity="${opacity * 0.8}" />
        </pattern>
      `;
      content = `<rect width="100%" height="100%" fill="url(#pat-stripes)" />`;
      break;
    }

    case 'waves': {
      const h = step;
      const w = step * 1.5;
      defs = `
        <pattern id="pat-waves" width="${w}" height="${h}" patternUnits="userSpaceOnUse" patternTransform="rotate(${rotation})">
          <path d="M 0 ${h / 2} Q ${w / 4} 0, ${w / 2} ${h / 2} T ${w} ${h / 2}" fill="none" stroke="${c1}" stroke-width="${strokeWidth}" opacity="${opacity}" />
          <path d="M 0 ${h} Q ${w / 4} ${h / 2}, ${w / 2} ${h} T ${w} ${h}" fill="none" stroke="${c2}" stroke-width="${Math.max(1, strokeWidth * 0.7)}" opacity="${opacity * 0.6}" />
        </pattern>
      `;
      content = `<rect width="100%" height="100%" fill="url(#pat-waves)" />`;
      break;
    }

    case 'geometry': {
      const half = step / 2;
      defs = `
        <pattern id="pat-geo" width="${step}" height="${step}" patternUnits="userSpaceOnUse" patternTransform="rotate(${rotation})">
          <polygon points="${half},0 ${step},${half} ${half},${step} 0,${half}" fill="${c1}" opacity="${opacity * 0.8}" />
          <circle cx="${half}" cy="${half}" r="${half * 0.4}" fill="${c2}" opacity="${opacity}" />
          <circle cx="0" cy="0" r="${half * 0.25}" fill="${c3}" opacity="${opacity}" />
        </pattern>
      `;
      content = `<rect width="100%" height="100%" fill="url(#pat-geo)" />`;
      break;
    }

    case 'lines': {
      defs = `
        <pattern id="pat-lines" width="${step}" height="${step}" patternUnits="userSpaceOnUse" patternTransform="rotate(${rotation})">
          <line x1="0" y1="0" x2="${step}" y2="${step}" stroke="${c1}" stroke-width="${strokeWidth}" opacity="${opacity}" />
          <line x1="0" y1="${step}" x2="${step}" y2="0" stroke="${c2}" stroke-width="${Math.max(1, strokeWidth * 0.5)}" opacity="${opacity * 0.5}" />
        </pattern>
      `;
      content = `<rect width="100%" height="100%" fill="url(#pat-lines)" />`;
      break;
    }

    case 'shapes': {
      const s = step;
      defs = `
        <pattern id="pat-shapes" width="${s}" height="${s}" patternUnits="userSpaceOnUse" patternTransform="rotate(${rotation})">
          <rect x="${s * 0.1}" y="${s * 0.1}" width="${s * 0.35}" height="${s * 0.35}" rx="${s * 0.08}" fill="${c1}" opacity="${opacity}" />
          <polygon points="${s * 0.75},${s * 0.1} ${s * 0.95},${s * 0.45} ${s * 0.55},${s * 0.45}" fill="${c2}" opacity="${opacity}" />
          <circle cx="${s * 0.3}" cy="${s * 0.75}" r="${s * 0.18}" fill="${c3}" opacity="${opacity}" />
          <circle cx="${s * 0.75}" cy="${s * 0.75}" r="${s * 0.12}" fill="${c4}" opacity="${opacity}" />
        </pattern>
      `;
      content = `<rect width="100%" height="100%" fill="url(#pat-shapes)" />`;
      break;
    }

    case 'noise':
    default: {
      defs = `
        <filter id="pat-noise-filter">
          <feTurbulence type="fractalNoise" baseFrequency="${(scale * 0.015).toFixed(3)}" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${opacity} 0" />
        </filter>
      `;
      content = `
        <rect width="100%" height="100%" fill="${c1}" opacity="${opacity * 0.4}" filter="url(#pat-noise-filter)" />
      `;
      break;
    }
  }

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    ${defs}
  </defs>
  <rect width="100%" height="100%" fill="${bg}" />
  ${content}
</svg>`.trim();
}

export function generatePatternCss(config: PatternConfig): string {
  const svg = generatePatternSvg(config, 200, 200);
  const encoded = encodeURIComponent(svg)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22');
  return `background-color: ${config.backgroundColor || config.palette[0] || '#111215'};\nbackground-image: url("data:image/svg+xml,${encoded}");\nbackground-size: ${config.scale * 2}px ${config.scale * 2}px;`;
}
