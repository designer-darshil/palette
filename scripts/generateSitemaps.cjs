/**
 * Programmatic XML Sitemap Generator for KROMA Digital Library
 * Generates an indexed multi-file sitemap architecture conforming to sitemaps.org standard.
 */

const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://kroma.design';
const NOW_DATE = new Date().toISOString().split('T')[0];

function extractSlugsFromTsFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const slugRegex = /"slug":\s*"([^"]+)"/g;
  const slugs = [];
  let match;
  while ((match = slugRegex.exec(content)) !== null) {
    if (match[1] && !slugs.includes(match[1])) {
      slugs.push(match[1]);
    }
  }
  return slugs;
}

function generateUrlXml(loc, changefreq = 'weekly', priority = '0.8', lastmod = NOW_DATE) {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

function buildSitemapXml(urls) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
}

function buildSitemapIndexXml(sitemaps) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps
  .map(
    (sm) => `  <sitemap>
    <loc>${sm.loc}</loc>
    <lastmod>${NOW_DATE}</lastmod>
  </sitemap>`
  )
  .join('\n')}
</sitemapindex>`;
}

function main() {
  console.log('🚀 Generating KROMA Multi-Sitemap Suite...');

  const rootDir = path.resolve(__dirname, '..');
  const publicDir = path.join(rootDir, 'public');

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // 1. Static Core & Tools URLs
  const mainUrls = [
    generateUrlXml(`${SITE_URL}/`, 'daily', '1.0'),
    generateUrlXml(`${SITE_URL}/colors`, 'daily', '0.9'),
    generateUrlXml(`${SITE_URL}/palettes`, 'daily', '0.9'),
    generateUrlXml(`${SITE_URL}/combos`, 'daily', '0.9'),
    generateUrlXml(`${SITE_URL}/gradients`, 'daily', '0.9'),
    generateUrlXml(`${SITE_URL}/palettes/live`, 'always', '0.9'),
    generateUrlXml(`${SITE_URL}/palette-generator`, 'weekly', '0.85'),
    generateUrlXml(`${SITE_URL}/contrast-checker`, 'weekly', '0.85'),
    generateUrlXml(`${SITE_URL}/color-name-finder`, 'weekly', '0.85'),
    generateUrlXml(`${SITE_URL}/extract-from-image`, 'weekly', '0.85'),
    generateUrlXml(`${SITE_URL}/brand-kit`, 'weekly', '0.85'),
  ];
  fs.writeFileSync(path.join(publicDir, 'sitemap-main.xml'), buildSitemapXml(mainUrls));
  console.log(`✅ sitemap-main.xml generated (${mainUrls.length} URLs)`);

  // 2. Colors Sitemap
  const colorsPath = path.join(rootDir, 'src/data/colors.ts');
  const colorSlugs = extractSlugsFromTsFile(colorsPath);
  const colorUrls = colorSlugs.map((slug) =>
    generateUrlXml(`${SITE_URL}/colors/${encodeURIComponent(slug)}`, 'monthly', '0.75')
  );
  fs.writeFileSync(path.join(publicDir, 'sitemap-colors.xml'), buildSitemapXml(colorUrls));
  console.log(`✅ sitemap-colors.xml generated (${colorUrls.length} URLs)`);

  // 3. Palettes Sitemap
  const palettesPath = path.join(rootDir, 'src/data/palettes.ts');
  const paletteSlugs = extractSlugsFromTsFile(palettesPath);
  const paletteUrls = paletteSlugs.map((slug) =>
    generateUrlXml(`${SITE_URL}/palettes/${encodeURIComponent(slug)}`, 'monthly', '0.75')
  );
  fs.writeFileSync(path.join(publicDir, 'sitemap-palettes.xml'), buildSitemapXml(paletteUrls));
  console.log(`✅ sitemap-palettes.xml generated (${paletteUrls.length} URLs)`);

  // 4. Combos Sitemap
  const combosPath = path.join(rootDir, 'src/data/combos.ts');
  const comboSlugs = extractSlugsFromTsFile(combosPath);
  const comboUrls = comboSlugs.map((slug) =>
    generateUrlXml(`${SITE_URL}/combos/${encodeURIComponent(slug)}`, 'monthly', '0.70')
  );
  fs.writeFileSync(path.join(publicDir, 'sitemap-combos.xml'), buildSitemapXml(comboUrls));
  console.log(`✅ sitemap-combos.xml generated (${comboUrls.length} URLs)`);

  // 5. Gradients Sitemap
  const gradientsPath = path.join(rootDir, 'src/data/gradients.ts');
  const gradientSlugs = extractSlugsFromTsFile(gradientsPath);
  const gradientUrls = gradientSlugs.map((slug) =>
    generateUrlXml(`${SITE_URL}/gradients/${encodeURIComponent(slug)}`, 'monthly', '0.70')
  );
  fs.writeFileSync(path.join(publicDir, 'sitemap-gradients.xml'), buildSitemapXml(gradientUrls));
  console.log(`✅ sitemap-gradients.xml generated (${gradientUrls.length} URLs)`);

  // 6. Root Sitemap Index
  const sitemapIndex = [
    { loc: `${SITE_URL}/sitemap-main.xml` },
    { loc: `${SITE_URL}/sitemap-colors.xml` },
    { loc: `${SITE_URL}/sitemap-palettes.xml` },
    { loc: `${SITE_URL}/sitemap-combos.xml` },
    { loc: `${SITE_URL}/sitemap-gradients.xml` },
  ];
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), buildSitemapIndexXml(sitemapIndex));
  console.log(`✅ sitemap.xml (Index) generated referencing 5 sub-sitemaps`);

  const totalIndexed =
    mainUrls.length + colorUrls.length + paletteUrls.length + comboUrls.length + gradientUrls.length;
  console.log(`🎉 Complete Sitemap suite built successfully! Total canonical URLs: ${totalIndexed}`);
}

main();
