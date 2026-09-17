import {
  DEFAULT_MESH_CONFIG,
  MESH_PRESETS,
  serializeMeshConfig,
  deserializeMeshConfig,
  generateRandomMesh,
  generateGridMesh,
  generateMeshCss,
  generateMeshSvg,
  generateMeshTokensJson,
} from '../src/utils/meshEngine';

console.log('🧪 Running Mesh Gradient Studio Engine & Serialization Test Suite...\n');

let failed = 0;
let passed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`✅ PASSED: ${message}`);
    passed++;
  } else {
    console.error(`❌ FAILED: ${message}`);
    failed++;
  }
}

// 1. Test Seed Reproducibility
const seedA = 48291;
const mesh1 = generateRandomMesh(seedA, 6);
const mesh2 = generateRandomMesh(seedA, 6);

assert(mesh1.length === 6, 'Generated 6 mesh points');
assert(mesh1[0].x === mesh2[0].x, 'Deterministic X coordinate preserved');
assert(mesh1[0].y === mesh2[0].y, 'Deterministic Y coordinate preserved');
assert(mesh1[0].color === mesh2[0].color, 'Deterministic Hex color preserved');
assert(mesh1[0].influence === mesh2[0].influence, 'Deterministic Influence preserved');

// 2. Test Grid Generation
const gridMesh = generateGridMesh(3, 3, 12345);
assert(gridMesh.length === 9, 'Grid generator created 9 points for 3x3 layout');

// 3. Test Serialization & Deserialization Round-Trip
const testConfig = {
  ...DEFAULT_MESH_CONFIG,
  preset: 'sunset',
  seed: 99123,
  softness: 1.4,
  intensity: 1.2,
  blur: 20,
  grain: 15,
};

const qs = serializeMeshConfig(testConfig);
const params = new URLSearchParams(qs);
const deserialized = deserializeMeshConfig(params);

assert(deserialized.preset === 'sunset', 'Preset preserved in serialization');
assert(deserialized.seed === 99123, 'Seed preserved in serialization');
assert(deserialized.softness === 1.4, 'Softness preserved in serialization');
assert(deserialized.intensity === 1.2, 'Intensity preserved in serialization');
assert(deserialized.blur === 20, 'Blur preserved in serialization');
assert(deserialized.grain === 15, 'Grain preserved in serialization');
assert(deserialized.points.length >= 2, 'Points parsed correctly from URL');

// 4. Test CSS Generation
const css = generateMeshCss(testConfig);
assert(css.includes('radial-gradient('), 'CSS includes radial-gradient definitions');
assert(css.includes('background-image:'), 'CSS has background-image property');

// 5. Test SVG Generation
const svg = generateMeshSvg(testConfig, 1200, 800);
assert(svg.includes('<svg'), 'SVG has valid root tag');
assert(svg.includes('<radialGradient'), 'SVG includes radialGradient definitions');

// 6. Test DTCG JSON Generation
const json = generateMeshTokensJson(testConfig);
const parsedTokens = JSON.parse(json);
assert(parsedTokens.generator === 'PaletteParadise Mesh Gradient Studio', 'DTCG JSON metadata generator present');
assert(parsedTokens.mesh.softness === 1.4, 'DTCG JSON retains softness');

console.log(`\n🎉 ALL ${passed} MESH GRADIENT TEST SUITES PASSED FLAWLESSLY!\n`);
if (failed > 0) process.exit(1);
