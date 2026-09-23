import {
  generateFullRampsSystem,
  normalizeHex,
  isValidHex,
  RampsScope,
  RampsScheme,
  RampsWcag,
  RampsNotation,
  RampsVividness,
} from '../src/utils/rampsEngine';
import { checkRateLimit } from './_rateLimit';

export default function handler(req: any, res: any) {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Rate Limiting: 120 req / min per IP
  if (!checkRateLimit(req, res, { limit: 120, windowMs: 60 * 1000 })) {
    return;
  }

  try {
    const query = req.query || {};

    const rawB = typeof query.b === 'string' ? query.b.slice(0, 10) : '3d7dff';
    const rawA = typeof query.a === 'string' ? query.a.slice(0, 10) : null;
    const rawA2 = typeof query.a2 === 'string' ? query.a2.slice(0, 10) : null;
    const m = (typeof query.m === 'string' ? query.m.slice(0, 10) : 'full') as RampsScope;
    const s = (typeof query.s === 'string' ? query.s.slice(0, 20) : 'complementary') as RampsScheme;
    const c = (typeof query.c === 'string' ? query.c.slice(0, 10) : 'AA') as RampsWcag;
    const f = (typeof query.f === 'string' ? query.f.slice(0, 10) : 'oklch') as RampsNotation;
    const v = (typeof query.v === 'string' ? query.v.slice(0, 10) : 'natural') as RampsVividness;
    const xr = (typeof query.xr === 'string' ? query.xr.slice(0, 100) : '').split('.').filter(Boolean).slice(0, 20);
    const xt = (typeof query.xt === 'string' ? query.xt.slice(0, 100) : '').split('.').filter(Boolean).slice(0, 20);
    const format = (typeof query.format === 'string' ? query.format.slice(0, 10) : 'json');

    const normalizedBrand = normalizeHex(rawB);
    if (!isValidHex(normalizedBrand)) {
      return res.status(400).json({
        error: 'Invalid brand hex value. Provide a 6-character hex without # (e.g. ?b=3d7dff)',
        status: 400,
      });
    }

    const result = generateFullRampsSystem({
      brand: normalizedBrand,
      accent: rawA && isValidHex(rawA) ? normalizeHex(rawA) : null,
      accent2: rawA2 && isValidHex(rawA2) ? normalizeHex(rawA2) : null,
      scope: m === 'basic' ? 'basic' : 'full',
      scheme: ['complementary', 'analogous', 'triadic', 'split', 'monochromatic'].includes(s) ? s : 'complementary',
      wcag: c === 'AAA' ? 'AAA' : 'AA',
      notation: ['oklch', 'hex', 'rgb', 'hsl'].includes(f) ? f : 'oklch',
      vividness: v === 'bold' ? 'bold' : 'natural',
      excludedRamps: xr,
      excludedTokens: xt,
    });

    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');

    if (format === 'text') {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.status(200).send(result.rawPlainText);
    }

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(200).json(result.rawJson);
  } catch {
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to generate ramps system.',
    });
  }
}
