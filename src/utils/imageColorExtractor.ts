import { findClosestColorName } from './paletteGenerator';
import { hexToRgb, rgbToHex, hexToHsl, getContrastRatio } from './colorUtils';
import { calculatePerceptualDistance, findClosestColorMatches } from './colorNameFinder';

export interface ExtractedSwatch {
  id: string;
  hex: string;
  name: string;
  role: string;
  locked: boolean;
  frequency: number; // 0 - 100 percentage in image
  luminance: number;
}

export interface ImagePreset {
  id: string;
  title: string;
  category: string;
  thumbnail: string;
  url: string;
  description: string;
}

// Built-in high-quality specimen photography presets for instant exploration
export const IMAGE_PRESETS: ImagePreset[] = [
  {
    id: 'preset-botanical',
    title: 'Kyoto Moss Garden & Bamboo',
    category: 'Nature & Organic',
    thumbnail: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=300&q=80',
    url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1000&q=85',
    description: 'Deep verdant moss, bamboo emeralds, earthen slate, and morning mist highlights.',
  },
  {
    id: 'preset-architecture',
    title: 'Modernist Cobalt Pavilion',
    category: 'Architecture & Minimal',
    thumbnail: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=300&q=80',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1000&q=85',
    description: 'Ultramarine structural beams, warm terracotta tiles, and clean concrete neutral tones.',
  },
  {
    id: 'preset-sunset',
    title: 'Sahara Twilight Dunes',
    category: 'Atmosphere & Sky',
    thumbnail: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=300&q=80',
    url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1000&q=85',
    description: 'Warm ochre sand, burning coral sunset horizon, violet dusk shadows, and amber glow.',
  },
  {
    id: 'preset-cyberpunk',
    title: 'Shinjuku Neon Rain',
    category: 'Cyber & High-Chroma',
    thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&q=80',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1000&q=85',
    description: 'Electric magenta signage, cyan reflection pools, deep obsidian wet asphalt, and amber glows.',
  },
];

// Fast client-side image color quantization using perceptual clustering
export async function extractColorsFromImage(
  imageSource: string | File,
  targetCount: number = 5,
  lockedColors: ExtractedSwatch[] = []
): Promise<ExtractedSwatch[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          reject(new Error('Canvas 2D rendering context not available'));
          return;
        }

        // Scale down to max 200px for lightning-fast sub-second processing
        const maxDim = 200;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const imgData = ctx.getImageData(0, 0, width, height).data;
        const totalPixels = width * height;
        const colorBuckets = new Map<string, { r: number; g: number; b: number; count: number }>();

        // Sample pixels with 5-bit quantization step
        const step = 1;
        for (let i = 0; i < imgData.length; i += 4 * step) {
          const a = imgData[i + 3];
          if (a < 128) continue; // Skip transparent

          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];

          // 5-bit quantization key (0-31)
          const qr = (r >> 3) << 3;
          const qg = (g >> 3) << 3;
          const qb = (b >> 3) << 3;
          const key = `${qr},${qg},${qb}`;

          const existing = colorBuckets.get(key);
          if (existing) {
            existing.count += 1;
            existing.r += r;
            existing.g += g;
            existing.b += b;
          } else {
            colorBuckets.set(key, { r, g, b, count: 1 });
          }
        }

        // Convert buckets to average RGB list
        const rawSwatches: { hex: string; count: number; freq: number }[] = [];
        for (const bucket of colorBuckets.values()) {
          const avgR = Math.round(bucket.r / bucket.count);
          const avgG = Math.round(bucket.g / bucket.count);
          const avgB = Math.round(bucket.b / bucket.count);
          const hex = rgbToHex(avgR, avgG, avgB).toUpperCase();
          const freq = (bucket.count / totalPixels) * 100;
          rawSwatches.push({ hex, count: bucket.count, freq });
        }

        // Sort by frequency
        rawSwatches.sort((a, b) => b.count - a.count);

        // Filter for perceptual distinctness
        const selectedHexes: { hex: string; freq: number }[] = [];

        // First, retain all locked colors
        lockedColors.forEach((locked) => {
          selectedHexes.push({ hex: locked.hex, freq: locked.frequency || 10 });
        });

        // Add distinct tones until target count is met
        const minDistanceThreshold = 35; // Perceptual Redmean distance

        for (const candidate of rawSwatches) {
          if (selectedHexes.length >= targetCount) break;

          const isTooClose = selectedHexes.some((sel) => {
            return calculatePerceptualDistance(sel.hex, candidate.hex) < minDistanceThreshold;
          });

          if (!isTooClose) {
            selectedHexes.push({ hex: candidate.hex, freq: parseFloat(candidate.freq.toFixed(1)) });
          }
        }

        // If still under count (e.g. monochromatic image), relax distance
        if (selectedHexes.length < targetCount) {
          for (const candidate of rawSwatches) {
            if (selectedHexes.length >= targetCount) break;
            if (!selectedHexes.some((sel) => sel.hex === candidate.hex)) {
              selectedHexes.push({ hex: candidate.hex, freq: parseFloat(candidate.freq.toFixed(1)) });
            }
          }
        }

        // Assign semantic roles based on HSL & relative luminance
        const swatchesWithMetrics = selectedHexes.map((s, idx) => {
          const hsl = hexToHsl(s.hex) || { h: 0, s: 50, l: 50 };
          const lum = hsl.l;
          const chroma = hsl.s;

          // Check if this hex was locked before
          const previouslyLocked = lockedColors.find((l) => l.hex.toUpperCase() === s.hex.toUpperCase());

          return {
            id: `swatch-${idx}-${s.hex.replace('#', '')}`,
            hex: s.hex,
            name: findClosestColorName(s.hex),
            role: previouslyLocked?.role || '',
            locked: !!previouslyLocked?.locked,
            frequency: s.freq,
            luminance: lum,
            chroma: chroma,
          };
        });

        // Determine recommended semantic roles
        const sortedByLuminance = [...swatchesWithMetrics].sort((a, b) => a.luminance - b.luminance);
        const sortedByChroma = [...swatchesWithMetrics].sort((a, b) => b.chroma - a.chroma);

        const darkest = sortedByLuminance[0];
        const lightest = sortedByLuminance[sortedByLuminance.length - 1];
        const mostVibrant = sortedByChroma[0];

        const finalSwatches: ExtractedSwatch[] = swatchesWithMetrics.map((item, i) => {
          if (item.role) return item; // Preserve manual/locked role

          let assignedRole = 'Accent';
          if (item.hex === darkest?.hex) {
            assignedRole = item.luminance < 20 ? 'Dark Canvas' : 'Primary Dominant';
          } else if (item.hex === lightest?.hex) {
            assignedRole = item.luminance > 80 ? 'Light Background' : 'Surface / Highlight';
          } else if (item.hex === mostVibrant?.hex && mostVibrant.chroma > 45) {
            assignedRole = 'Vibrant Accent';
          } else if (item.chroma < 25) {
            assignedRole = 'Neutral Muted';
          } else if (i === 1) {
            assignedRole = 'Secondary';
          } else {
            assignedRole = `Tone 0${i + 1}`;
          }

          return {
            id: item.id,
            hex: item.hex,
            name: item.name,
            role: assignedRole,
            locked: item.locked,
            frequency: item.frequency,
            luminance: item.luminance,
          };
        });

        resolve(finalSwatches);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image. Please check the format or image URL.'));
    };

    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string;
        } else {
          reject(new Error('Failed to read image file.'));
        }
      };
      reader.onerror = () => reject(new Error('FileReader error.'));
      reader.readAsDataURL(imageSource);
    }
  });
}
