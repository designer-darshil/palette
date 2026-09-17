import {
  deserializeMeshConfig,
  serializeMeshConfig,
  generateMeshCss,
  generateMeshSvg,
  generateMeshTokensJson,
} from '../src/utils/meshEngine';

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

  const config = deserializeMeshConfig(new URLSearchParams(query));
  const qs = serializeMeshConfig(config);
  const sourceUrl = `https://kroma.design/mesh?${qs}`;

  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
  res.setHeader('Access-Control-Allow-Origin', '*');

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
}
