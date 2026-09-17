import {
  deserializeAntigravityConfig,
  serializeAntigravityConfig,
  generateMotionTokens,
  generateCssExport,
  generateJsExport,
  generateFramerMotionExport,
  describeMotion,
} from '../src/utils/antigravityEngine';

export default function handler(req: any, res: any) {
  let query = req.query || {};
  if (!req.query && req.url) {
    try {
      const urlObj = new URL(req.url, 'https://kroma.design');
      query = Object.fromEntries(urlObj.searchParams.entries());
    } catch {
      query = {};
    }
  }

  const format = (query.format as string) || 'json';

  const config = deserializeAntigravityConfig(query);
  const qs = serializeAntigravityConfig(config);
  const sourceUrl = `https://kroma.design/antigravity?${qs}`;
  const tokens = generateMotionTokens(config);
  const description = describeMotion(config);

  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
  res.setHeader('Access-Control-Allow-Origin', '*');

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
}
