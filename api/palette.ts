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

export default function handler(req: any, res: any) {
  const query = req.query || {};

  const b = (query.b as string) || '3d7dff';
  const a = (query.a as string) || null;
  const a2 = (query.a2 as string) || null;
  const m = ((query.m as string) || 'full') as RampsScope;
  const s = ((query.s as string) || 'complementary') as RampsScheme;
  const c = ((query.c as string) || 'AA') as RampsWcag;
  const f = ((query.f as string) || 'oklch') as RampsNotation;
  const v = ((query.v as string) || 'natural') as RampsVividness;
  const xr = ((query.xr as string) || '').split('.').filter(Boolean);
  const xt = ((query.xt as string) || '').split('.').filter(Boolean);
  const format = (query.format as string) || 'json';

  const normalizedBrand = normalizeHex(b);
  if (!isValidHex(normalizedBrand)) {
    return res.status(400).json({
      error: 'Invalid brand hex value. Provide a 6-character hex without # (e.g. ?b=3d7dff)',
      status: 400,
    });
  }

  const result = generateFullRampsSystem({
    brand: normalizedBrand,
    accent: a && isValidHex(a) ? normalizeHex(a) : null,
    accent2: a2 && isValidHex(a2) ? normalizeHex(a2) : null,
    scope: m === 'basic' ? 'basic' : 'full',
    scheme: ['complementary', 'analogous', 'triadic', 'split', 'monochromatic'].includes(s) ? s : 'complementary',
    wcag: c === 'AAA' ? 'AAA' : 'AA',
    notation: ['oklch', 'hex', 'rgb', 'hsl'].includes(f) ? f : 'oklch',
    vividness: v === 'bold' ? 'bold' : 'natural',
    excludedRamps: xr,
    excludedTokens: xt,
  });

  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (format === 'text') {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send(result.rawPlainText);
  }

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.status(200).json(result.rawJson);
}
