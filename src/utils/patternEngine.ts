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

    case 'orbital': {
      const s = Math.max(30, step * 1.6);
      const half = s / 2;
      const r1 = s * 0.42;
      const r2 = s * 0.28;
      const r3 = s * 0.14;
      defs = `
        <pattern id="pat-orbital" width="${s}" height="${s}" patternUnits="userSpaceOnUse" patternTransform="rotate(${rotation})">
          <circle cx="${half}" cy="${half}" r="${r1}" fill="none" stroke="${c1}" stroke-width="${strokeWidth}" stroke-dasharray="${s * 0.2} ${s * 0.08}" opacity="${opacity}" />
          <circle cx="${half}" cy="${half}" r="${r2}" fill="none" stroke="${c2}" stroke-width="${strokeWidth * 0.9}" opacity="${opacity * 0.9}" />
          <circle cx="${half}" cy="${half}" r="${r3}" fill="none" stroke="${c3}" stroke-width="${strokeWidth * 0.75}" opacity="${opacity * 0.8}" />
          <circle cx="${half + r2}" cy="${half}" r="${Math.max(2, strokeWidth * 1.6)}" fill="${c2}" opacity="${opacity}" />
          <circle cx="${half - r1 * 0.7}" cy="${half - r1 * 0.7}" r="${Math.max(1.5, strokeWidth * 1.2)}" fill="${c1}" opacity="${opacity}" />
          <circle cx="0" cy="0" r="${r2 * 0.8}" fill="none" stroke="${c4}" stroke-width="${strokeWidth * 0.6}" opacity="${opacity * 0.6}" />
          <circle cx="${s}" cy="${s}" r="${r2 * 0.8}" fill="none" stroke="${c4}" stroke-width="${strokeWidth * 0.6}" opacity="${opacity * 0.6}" />
          <circle cx="${half}" cy="${half}" r="${Math.max(2, strokeWidth * 1.2)}" fill="${c3}" opacity="${opacity}" />
        </pattern>
      `;
      content = `<rect width="100%" height="100%" fill="url(#pat-orbital)" />`;
      break;
    }

    case 'liquid-grid': {
      const s = Math.max(24, step * 1.2);
      const off1 = s * 0.25;
      const off2 = s * 0.75;
      defs = `
        <pattern id="pat-liquid-grid" width="${s}" height="${s}" patternUnits="userSpaceOnUse" patternTransform="rotate(${rotation})">
          <path d="M 0 ${off1} C ${s * 0.3} 0, ${s * 0.7} ${s * 0.45}, ${s} ${off1}" fill="none" stroke="${c1}" stroke-width="${strokeWidth}" opacity="${opacity}" />
          <path d="M 0 ${off2} C ${s * 0.25} ${s}, ${s * 0.75} ${s * 0.55}, ${s} ${off2}" fill="none" stroke="${c2}" stroke-width="${strokeWidth * 0.9}" opacity="${opacity * 0.85}" />
          <path d="M ${off1} 0 C 0 ${s * 0.3}, ${s * 0.45} ${s * 0.7}, ${off1} ${s}" fill="none" stroke="${c3}" stroke-width="${strokeWidth}" opacity="${opacity * 0.9}" />
          <path d="M ${off2} 0 C ${s} ${s * 0.25}, ${s * 0.55} ${s * 0.75}, ${off2} ${s}" fill="none" stroke="${c1}" stroke-width="${strokeWidth * 0.8}" opacity="${opacity * 0.75}" />
          <circle cx="${s * 0.5}" cy="${s * 0.5}" r="${Math.max(1.5, strokeWidth * 1.4)}" fill="${c4}" opacity="${opacity * 0.9}" />
        </pattern>
      `;
      content = `<rect width="100%" height="100%" fill="url(#pat-liquid-grid)" />`;
      break;
    }

    case 'micro-dot': {
      const s = Math.max(10, Math.round(step * 0.45));
      const r = Math.max(1, Math.min(2.5, strokeWidth * 0.7));
      defs = `
        <pattern id="pat-micro-dot" width="${s}" height="${s}" patternUnits="userSpaceOnUse" patternTransform="rotate(${rotation})">
          <circle cx="${s / 2}" cy="${s / 2}" r="${r}" fill="${c1}" opacity="${opacity}" />
          <circle cx="0" cy="0" r="${r * 0.75}" fill="${c2}" opacity="${opacity * 0.7}" />
          <circle cx="${s}" cy="0" r="${r * 0.75}" fill="${c2}" opacity="${opacity * 0.7}" />
          <circle cx="0" cy="${s}" r="${r * 0.75}" fill="${c2}" opacity="${opacity * 0.7}" />
          <circle cx="${s}" cy="${s}" r="${r * 0.75}" fill="${c2}" opacity="${opacity * 0.7}" />
        </pattern>
      `;
      content = `<rect width="100%" height="100%" fill="url(#pat-micro-dot)" />`;
      break;
    }

    case 'offset-block': {
      const w = Math.max(28, step * 1.4);
      const h = Math.max(14, step * 0.7);
      const gap = Math.max(1.5, strokeWidth * 0.8);
      defs = `
        <pattern id="pat-offset-block" width="${w}" height="${h * 2}" patternUnits="userSpaceOnUse" patternTransform="rotate(${rotation})">
          <rect x="0" y="0" width="${w * 0.6 - gap}" height="${h - gap}" fill="${c1}" opacity="${opacity * 0.9}" rx="1" />
          <rect x="${w * 0.6}" y="0" width="${w * 0.4 - gap}" height="${h - gap}" fill="${c2}" opacity="${opacity * 0.85}" rx="1" />
          <rect x="${w * 0.25}" y="${h}" width="${w * 0.5 - gap}" height="${h - gap}" fill="${c3}" opacity="${opacity * 0.9}" rx="1" />
          <rect x="${w * 0.75}" y="${h}" width="${w * 0.25 - gap}" height="${h - gap}" fill="${c1}" opacity="${opacity * 0.7}" rx="1" />
          <rect x="0" y="${h}" width="${w * 0.25 - gap}" height="${h - gap}" fill="${c4}" opacity="${opacity * 0.8}" rx="1" />
        </pattern>
      `;
      content = `<rect width="100%" height="100%" fill="url(#pat-offset-block)" />`;
      break;
    }

    case 'ribbon': {
      const s = Math.max(32, step * 1.5);
      const ribW = Math.max(4, strokeWidth * 2.8);
      defs = `
        <pattern id="pat-ribbon" width="${s}" height="${s}" patternUnits="userSpaceOnUse" patternTransform="rotate(${rotation})">
          <path d="M 0 0 C ${s * 0.35} ${s * 0.15}, ${s * 0.65} ${s * 0.85}, ${s} ${s}" fill="none" stroke="${c1}" stroke-width="${ribW}" stroke-linecap="round" opacity="${opacity * 0.85}" />
          <path d="M 0 ${s * 0.5} C ${s * 0.5} 0, ${s * 0.5} ${s}, ${s} ${s * 0.5}" fill="none" stroke="${c2}" stroke-width="${ribW * 0.8}" stroke-linecap="round" opacity="${opacity * 0.75}" />
          <path d="M 0 ${s} C ${s * 0.35} ${s * 0.85}, ${s * 0.65} ${s * 0.15}, ${s} 0" fill="none" stroke="${c3}" stroke-width="${ribW * 0.6}" stroke-linecap="round" opacity="${opacity * 0.7}" />
        </pattern>
      `;
      content = `<rect width="100%" height="100%" fill="url(#pat-ribbon)" />`;
      break;
    }

    case 'cellular': {
      const s = Math.max(28, step * 1.3);
      const half = s / 2;
      defs = `
        <pattern id="pat-cellular" width="${s}" height="${s}" patternUnits="userSpaceOnUse" patternTransform="rotate(${rotation})">
          <polygon points="${s * 0.3},${s * 0.15} ${s * 0.7},${s * 0.15} ${s * 0.85},${s * 0.5} ${s * 0.7},${s * 0.85} ${s * 0.3},${s * 0.85} ${s * 0.15},${s * 0.5}" fill="${c1}" stroke="${bg}" stroke-width="${strokeWidth}" opacity="${opacity * 0.85}" />
          <circle cx="${half}" cy="${half}" r="${s * 0.12}" fill="${c2}" opacity="${opacity}" />
          <circle cx="0" cy="0" r="${s * 0.18}" fill="${c3}" stroke="${bg}" stroke-width="${strokeWidth * 0.8}" opacity="${opacity * 0.8}" />
          <circle cx="${s}" cy="0" r="${s * 0.18}" fill="${c3}" stroke="${bg}" stroke-width="${strokeWidth * 0.8}" opacity="${opacity * 0.8}" />
          <circle cx="0" cy="${s}" r="${s * 0.18}" fill="${c4}" stroke="${bg}" stroke-width="${strokeWidth * 0.8}" opacity="${opacity * 0.8}" />
          <circle cx="${s}" cy="${s}" r="${s * 0.18}" fill="${c4}" stroke="${bg}" stroke-width="${strokeWidth * 0.8}" opacity="${opacity * 0.8}" />
        </pattern>
      `;
      content = `<rect width="100%" height="100%" fill="url(#pat-cellular)" />`;
      break;
    }

    case 'wave-field': {
      const w = Math.max(36, step * 1.8);
      const h = Math.max(24, step * 1.2);
      const lines = 4;
      const dy = h / lines;
      let wavePaths = '';
      for (let i = 0; i < lines; i++) {
        const y = i * dy + dy / 2;
        const color = i % 3 === 0 ? c1 : i % 3 === 1 ? c2 : c3;
        const amp = dy * 0.45;
        wavePaths += `<path d="M 0 ${y} Q ${w * 0.25} ${y - amp}, ${w * 0.5} ${y} T ${w} ${y}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" opacity="${opacity * (0.6 + (i / lines) * 0.4)}" />`;
      }
      defs = `
        <pattern id="pat-wave-field" width="${w}" height="${h}" patternUnits="userSpaceOnUse" patternTransform="rotate(${rotation})">
          ${wavePaths}
        </pattern>
      `;
      content = `<rect width="100%" height="100%" fill="url(#pat-wave-field)" />`;
      break;
    }

    case 'checker-flux': {
      const s = Math.max(24, step * 1.2);
      const half = s / 2;
      const rx = s * 0.12;
      defs = `
        <pattern id="pat-checker-flux" width="${s}" height="${s}" patternUnits="userSpaceOnUse" patternTransform="rotate(${rotation})">
          <rect x="0" y="0" width="${half}" height="${half}" rx="${rx}" fill="${c1}" opacity="${opacity}" />
          <circle cx="${half / 2}" cy="${half / 2}" r="${half * 0.22}" fill="${c2}" opacity="${opacity * 0.85}" />
          <rect x="${half}" y="${half}" width="${half}" height="${half}" rx="${rx}" fill="${c1}" opacity="${opacity * 0.9}" />
          <circle cx="${half + half / 2}" cy="${half + half / 2}" r="${half * 0.22}" fill="${c3}" opacity="${opacity * 0.85}" />
          <polygon points="${half},0 ${s},0 ${half},${half}" fill="${c2}" opacity="${opacity * 0.7}" />
          <polygon points="0,${half} 0,${s} ${half},${half}" fill="${c3}" opacity="${opacity * 0.7}" />
        </pattern>
      `;
      content = `<rect width="100%" height="100%" fill="url(#pat-checker-flux)" />`;
      break;
    }

    case 'linear-noise': {
      const s = Math.max(20, step);
      defs = `
        <pattern id="pat-linear-noise" width="${s}" height="${s}" patternUnits="userSpaceOnUse" patternTransform="rotate(${rotation})">
          <line x1="0" y1="${s * 0.15}" x2="${s * 0.8}" y2="${s * 0.15}" stroke="${c1}" stroke-width="${strokeWidth}" opacity="${opacity}" stroke-linecap="round" />
          <line x1="${s * 0.85}" y1="${s * 0.15}" x2="${s}" y2="${s * 0.15}" stroke="${c2}" stroke-width="${strokeWidth * 0.8}" opacity="${opacity * 0.6}" stroke-linecap="round" />
          <line x1="${s * 0.2}" y1="${s * 0.4}" x2="${s}" y2="${s * 0.4}" stroke="${c2}" stroke-width="${strokeWidth * 0.9}" opacity="${opacity * 0.85}" stroke-linecap="round" />
          <line x1="0" y1="${s * 0.65}" x2="${s * 0.45}" y2="${s * 0.65}" stroke="${c3}" stroke-width="${strokeWidth}" opacity="${opacity * 0.9}" stroke-linecap="round" />
          <line x1="${s * 0.55}" y1="${s * 0.65}" x2="${s * 0.95}" y2="${s * 0.65}" stroke="${c1}" stroke-width="${strokeWidth * 0.7}" opacity="${opacity * 0.7}" stroke-linecap="round" />
          <line x1="${s * 0.1}" y1="${s * 0.9}" x2="${s * 0.7}" y2="${s * 0.9}" stroke="${c4}" stroke-width="${strokeWidth}" opacity="${opacity * 0.8}" stroke-linecap="round" />
        </pattern>
      `;
      content = `<rect width="100%" height="100%" fill="url(#pat-linear-noise)" />`;
      break;
    }

    case 'color-weave': {
      const s = Math.max(30, step * 1.5);
      const bW = s * 0.28;
      const gap = s * 0.05;
      defs = `
        <pattern id="pat-color-weave" width="${s}" height="${s}" patternUnits="userSpaceOnUse" patternTransform="rotate(${rotation})">
          <rect x="0" y="${gap}" width="${s}" height="${bW}" fill="${c1}" opacity="${opacity * 0.9}" />
          <rect x="${gap}" y="0" width="${bW}" height="${s}" fill="${c2}" opacity="${opacity * 0.85}" />
          <rect x="${gap}" y="${gap}" width="${bW}" height="${bW}" fill="${c2}" opacity="${opacity}" />
          <rect x="0" y="${s * 0.5 + gap}" width="${s}" height="${bW}" fill="${c3}" opacity="${opacity * 0.85}" />
          <rect x="${s * 0.5 + gap}" y="0" width="${bW}" height="${s}" fill="${c4}" opacity="${opacity * 0.8}" />
          <rect x="${s * 0.5 + gap}" y="${s * 0.5 + gap}" width="${bW}" height="${bW}" fill="${c3}" opacity="${opacity}" />
        </pattern>
      `;
      content = `<rect width="100%" height="100%" fill="url(#pat-color-weave)" />`;
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
