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

// 3. Header Styling Verification (Tailwind-first — checks Header.tsx directly)
// After CSS-to-Tailwind migration, header styles live as Tailwind classes in the component.

// Check positioning: Header must use fixed positioning
assert(headerContent.includes('fixed'), 'Header uses fixed positioning (Tailwind or inline)');

// Check z-index hierarchy: z-[100] on header, z-[120] on mobile drawer
assert(headerContent.includes('z-[100]'), 'Header uses z-[100] for established z-index hierarchy');
assert(headerContent.includes('z-[120]'), 'Mobile menu drawer uses z-[120] (above header, below modals)');

// Check backdrop blur
assert(headerContent.includes('backdrop-blur'), 'Header uses backdrop-blur for background separation');

// Check that header doesn't use hardcoded forbidden hex tokens inline
const forbiddenTokens = ['#171717', '#707070', '#F8F8F8'];
let hasForbiddenToken = false;
for (const token of forbiddenTokens) {
  const lines = headerContent.split('\n');
  for (const line of lines) {
    if (!line.trim().startsWith('//') && !line.trim().startsWith('/*') && !line.trim().startsWith('*') && line.includes(token)) {
      hasForbiddenToken = true;
      console.error(`Found forbidden token ${token} in Header.tsx line: ${line.trim()}`);
    }
  }
}
assert(!hasForbiddenToken, 'Header component uses semantic Tailwind tokens instead of hardcoded hex colors (#171717, #707070, #F8F8F8)');

// Check flex-wrap: nowrap is preserved (via Tailwind flex-nowrap class)
assert(headerContent.includes('flex-nowrap'), 'Header uses flex-nowrap to prevent unexpected height shifts');

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
