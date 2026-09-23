import {
  deserializeAntigravityConfig,
  serializeAntigravityConfig,
  generateMotionTokens,
  generateCssExport,
  generateJsExport,
  generateFramerMotionExport,
  describeMotion,
} from '../src/utils/antigravityEngine';
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

    const config = deserializeAntigravityConfig(query);
    const qs = serializeAntigravityConfig(config);
    const sourceUrl = `https://kroma.design/antigravity?${qs}`;
    const tokens = generateMotionTokens(config);
    const description = describeMotion(config);

    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');

    if (format === 'text') {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      let text = `ANTIGRAVITY STUDIO — GENERATED MOTION SPECIFICATION\n`;
      text += `Generator: KROMA Antigravity Studio (https://kroma.design/antigravity)\n`;
      text += `Source: ${sourceUrl}\n\n`;
      text += `Semantic Behavior: ${description}\n`;
      text += `Object Shape: ${config.object}\n`;
      text += `Gravity Acceleration: X=${config.gravityX} m/s², Y=${config.gravityY} m/s²\n`;
      text += `Launch Velocity: VX=${config.velocityX} px/s, VY=${config.velocityY} px/s\n`;
      text += `Physical Mass: ${config.mass} kg\n`;
      text += `Restitution (Bounce): ${config.restitution}\n`;
      text += `Surface Friction: ${config.friction}\n`;
      text += `Atmospheric Damping: ${config.damping}\n`;
      text += `Angular Velocity: ${config.angularVelocity} deg/s\n`;
      text += `Simulation Time-Scale: ${config.timeScale}x\n\n`;
      text += `--- CSS KEYFRAMES APPROXIMATION ---\n`;
      text += generateCssExport(config, sourceUrl);
      text += `\n\n--- VANILLA JS PHYSICS ENGINE ---\n`;
      text += generateJsExport(config, sourceUrl);
      return res.status(200).send(text);
    }

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(200).json({
      version: '1.0',
      tool: 'antigravity',
      generator: 'KROMA Antigravity Studio — https://kroma.design/antigravity',
      source: sourceUrl,
      description,
      config,
      tokens,
      css: generateCssExport(config, sourceUrl),
      javascript: generateJsExport(config, sourceUrl),
      react: generateFramerMotionExport(config, sourceUrl),
    });
  } catch {
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to process motion configuration.',
    });
  }
}
