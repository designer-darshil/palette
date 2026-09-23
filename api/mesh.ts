import {
  deserializeMeshConfig,
  serializeMeshConfig,
  generateMeshCss,
  generateMeshSvg,
  generateMeshTokensJson,
} from '../src/utils/meshEngine';
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
    let query = req.query || {};
    if (!req.query && req.url) {
      try {
        const urlObj = new URL(req.url, 'https://kroma.design');
        query = Object.fromEntries(urlObj.searchParams.entries());
      } catch {
        query = {};
      }
    }

    const format = typeof query.format === 'string' ? query.format.slice(0, 10) : 'json';

    const config = deserializeMeshConfig(new URLSearchParams(query));
    // Bound points count to prevent memory explosion
    if (config.points && config.points.length > 36) {
      config.points = config.points.slice(0, 36);
    }

    const qs = serializeMeshConfig(config);
    const sourceUrl = `https://kroma.design/mesh?${qs}`;

    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');

    if (format === 'css') {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
      return res.status(200).send(generateMeshCss(config));
    }

    if (format === 'svg') {
      res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
      return res.status(200).send(generateMeshSvg(config));
    }

    if (format === 'text') {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      let text = `PALETTEPARADISE MESH GRADIENT STUDIO\n`;
      text += `Source: ${sourceUrl}\n`;
      text += `Seed: ${config.seed}\n`;
      text += `Points: ${config.points.length}\n\n`;
      text += generateMeshCss(config);
      return res.status(200).send(text);
    }

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(200).send(generateMeshTokensJson(config, sourceUrl));
  } catch {
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to process mesh gradient configuration.',
    });
  }
}
