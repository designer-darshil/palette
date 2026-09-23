/**
 * Automated Kroma Header Architecture, Tokens & Integrity Verification Suite
 */
import fs from 'fs';
import path from 'path';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`✅ PASSED: ${message}`);
    passed++;
  } else {
    console.error(`❌ FAILED: ${message}`);
    failed++;
  }
}

console.log('\n🎨 Running Kroma Header Architectural & Integrity Test Suite...\n');

// 1. Single Source of Truth
const headerComponentPath = path.resolve('./src/components/Header.tsx');
assert(fs.existsSync(headerComponentPath), 'Header component exists at src/components/Header.tsx');

const headerContent = fs.readFileSync(headerComponentPath, 'utf-8');

// Check that there are no duplicate header files created
const pagesDir = path.resolve('./src/pages');
const allPageFiles = fs.readdirSync(pagesDir);
const duplicateHeaders = allPageFiles.filter(f => f.toLowerCase().includes('header'));
assert(duplicateHeaders.length === 0, `No page-specific duplicate headers found in src/pages (${duplicateHeaders.join(', ')})`);

// 2. React Safety & Hook rules
const hookOrderMatches = headerContent.match(/use(State|Effect|Callback|Ref|Memo)\(/g) || [];
assert(hookOrderMatches.length > 0, `Header uses ${hookOrderMatches.length} standard hooks cleanly`);

// Ensure no hooks inside conditionals
const lines = headerContent.split('\n');
let insideIf = false;
let conditionalHookViolation = false;
for (const line of lines) {
  const trimmed = line.trim();
  if (trimmed.startsWith('if (') || trimmed.startsWith('if(')) {
    if (trimmed.includes('use') && !trimmed.includes('return')) {
      // rough check
    }
    insideIf = true;
  }
  if (insideIf && (trimmed.startsWith('useState') || trimmed.startsWith('useEffect') || trimmed.startsWith('useCallback'))) {
    conditionalHookViolation = true;
  }
  if (trimmed.includes('}')) {
    insideIf = false;
  }
}
assert(!conditionalHookViolation, 'Zero conditional hook invocations in Header component');

// 3. CSS Semantic Token Verification
const indexCssPath = path.resolve('./src/index.css');
const indexCssContent = fs.readFileSync(indexCssPath, 'utf-8');

// Header section in index.css
const headerCssStart = indexCssContent.indexOf('.kroma-header {');
const headerCssEnd = indexCssContent.indexOf('/* ═══════════════════════════════════════════════════════════\n   BOTTOM NAVIGATION BAR');
assert(headerCssStart !== -1, '.kroma-header class exists in index.css');

const headerCssBlock = indexCssContent.slice(headerCssStart, headerCssEnd !== -1 ? headerCssEnd : headerCssStart + 15000);

// Check that hardcoded prohibited hex tokens are not used in the active header CSS block
const forbiddenTokens = ['#171717', '#707070', '#F8F8F8'];
let hasForbiddenToken = false;
for (const token of forbiddenTokens) {
  // Ignore lines that are comments
  const lines = headerCssBlock.split('\n');
  for (const line of lines) {
    if (!line.trim().startsWith('/*') && !line.trim().startsWith('*') && line.includes(token)) {
      hasForbiddenToken = true;
      console.error(`Found forbidden token ${token} in line: ${line.trim()}`);
    }
  }
}
assert(!hasForbiddenToken, 'Header CSS uses semantic variables instead of hardcoded hex colors (#171717, #707070, #F8F8F8)');

// Check positioning and z-index hierarchy
assert(headerCssBlock.includes('position: fixed;'), 'Header uses position: fixed for universal stability');
assert(headerCssBlock.includes('z-index: 100;'), 'Header uses established z-index: 100');
assert(headerCssBlock.includes('z-index: 120;'), 'Mobile menu drawer uses z-index: 120 (above header, below modals)');
assert(headerCssBlock.includes('backdrop-filter: blur('), 'Header uses backdrop-filter blur for background separation');
assert(headerCssBlock.includes('flex-wrap: nowrap;'), 'Header container and center use flex-wrap: nowrap to prevent unexpected height shifts');

// 4. Active Route Matching
assert(headerContent.includes("currentRoute.path === 'explore'"), 'Explore active route includes explore');
assert(headerContent.includes("currentRoute.path === 'search'"), 'Explore active route includes search');
assert(headerContent.includes("currentRoute.path === 'random'"), 'Explore active route includes random');
assert(headerContent.includes("isColorsActive"), 'Colors active route mapping present');
assert(headerContent.includes("isPalettesActive"), 'Palettes active route mapping present');
assert(headerContent.includes("isPatternsActive"), 'Patterns active route mapping present');
assert(headerContent.includes("isStudioActive"), 'Studio active route mapping present');
assert(headerContent.includes("isCommunityActive"), 'Community active route mapping present');

// 5. Build Artifact Verification
const distIndexPath = path.resolve('./dist/index.html');
assert(fs.existsSync(distIndexPath), 'Production build dist/index.html exists');

console.log(`\n========================================`);
console.log(`Header Test Results: ${passed} Passed, ${failed} Failed`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL KROMA HEADER INTEGRITY TESTS PASSED FLAWLESSLY!\n');
}
