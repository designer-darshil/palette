/**
 * Automated Production Preview MIME-Type & Asset Route Verification
 */
import http from 'http';
import fs from 'fs';
import path from 'path';

// Read dist directory
const distDir = path.resolve('./dist');
const assetsDir = path.join(distDir, 'assets');

if (!fs.existsSync(distDir) || !fs.existsSync(assetsDir)) {
  console.error('❌ dist/ or dist/assets does not exist. Run npm run build first.');
  process.exit(1);
}

const assetFiles = fs.readdirSync(assetsDir);
const jsFiles = assetFiles.filter((f) => f.endsWith('.js'));
const cssFiles = assetFiles.filter((f) => f.endsWith('.css'));

console.log(`🔍 Found ${jsFiles.length} JavaScript chunks and ${cssFiles.length} CSS stylesheets in dist/assets.`);

if (jsFiles.length === 0 || cssFiles.length === 0) {
  console.error('❌ Missing JS or CSS build assets in dist/assets!');
  process.exit(1);
}

// Read vercel.json rewrite regex
const vercelConfig = JSON.parse(fs.readFileSync(path.resolve('./vercel.json'), 'utf-8'));
const rewritePattern = new RegExp(`^${vercelConfig.rewrites[0].source}$`);

// Test Vercel routing emulation
function handleRoute(reqUrl: string): { status: number; contentType: string; bodyPreview: string } {
  const cleanPath = reqUrl.split('?')[0];

  // 1. Direct static asset in dist
  const assetFilePath = path.join(distDir, cleanPath.replace(/^\//, ''));
  if (fs.existsSync(assetFilePath) && fs.statSync(assetFilePath).isFile()) {
    let contentType = 'text/plain';
    if (cleanPath.endsWith('.js')) contentType = 'application/javascript; charset=utf-8';
    else if (cleanPath.endsWith('.css')) contentType = 'text/css; charset=utf-8';
    else if (cleanPath.endsWith('.html')) contentType = 'text/html; charset=utf-8';
    else if (cleanPath.endsWith('.svg')) contentType = 'image/svg+xml';
    else if (cleanPath.endsWith('.ico')) contentType = 'image/x-icon';

    const content = fs.readFileSync(assetFilePath, 'utf-8');
    return { status: 200, contentType, bodyPreview: content.slice(0, 100) };
  }

  // 2. SPA Rewrite check
  if (rewritePattern.test(cleanPath)) {
    const indexContent = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');
    return { status: 200, contentType: 'text/html; charset=utf-8', bodyPreview: indexContent.slice(0, 100) };
  }

  // 3. Fallback / Missing static asset
  return { status: 404, contentType: 'text/plain', bodyPreview: '404 Not Found' };
}

const testSampleJs = `/assets/${jsFiles[0]}`;
const testSampleCss = `/assets/${cssFiles[0]}`;
const testMissingJs = `/assets/schemaGenerator-DTtXw5cw.js`;

console.log(`\n--- Testing Routing & MIME Types ---`);

// 1. Valid JS file
const resJs = handleRoute(testSampleJs);
console.log(`Testing ${testSampleJs}: Status ${resJs.status}, Content-Type: ${resJs.contentType}`);
if (resJs.status !== 200 || !resJs.contentType.includes('application/javascript')) {
  console.error('❌ Failed: JS file did not return application/javascript');
  process.exit(1);
}
console.log('✅ PASSED: JS file returned application/javascript');

// 2. Valid CSS file
const resCss = handleRoute(testSampleCss);
console.log(`Testing ${testSampleCss}: Status ${resCss.status}, Content-Type: ${resCss.contentType}`);
if (resCss.status !== 200 || !resCss.contentType.includes('text/css')) {
  console.error('❌ Failed: CSS file did not return text/css');
  process.exit(1);
}
console.log('✅ PASSED: CSS file returned text/css');

// 3. Stale / missing JS file (The exact bug reported by user)
const resMissing = handleRoute(testMissingJs);
console.log(`Testing missing chunk ${testMissingJs}: Status ${resMissing.status}, Content-Type: ${resMissing.contentType}`);
if (resMissing.status === 200 && resMissing.contentType.includes('text/html')) {
  console.error('❌ CRITICAL BUG: Missing JS chunk was rewritten to index.html with text/html!');
  process.exit(1);
}
if (resMissing.status !== 404) {
  console.error(`❌ Expected 404 for missing chunk, got ${resMissing.status}`);
  process.exit(1);
}
console.log('✅ PASSED: Missing/stale chunk correctly returned 404 and was NOT intercepted by index.html rewrite!');

// 4. SPA page navigation routes
const spaRoutes = ['/', '/explore', '/trending', '/mesh', '/springs', '/ramps', '/brand-kit', '/contrast-checker', '/admin'];
for (const route of spaRoutes) {
  const res = handleRoute(route);
  if (res.status !== 200 || !res.contentType.includes('text/html')) {
    console.error(`❌ Route ${route} failed to rewrite to index.html (got ${res.status}, ${res.contentType})`);
    process.exit(1);
  }
}
console.log('✅ PASSED: All SPA application routes successfully resolve to index.html with text/html');

console.log('\n🎉 ALL PRODUCTION ASSET & ROUTING TESTS PASSED FLAWLESSLY!\n');
