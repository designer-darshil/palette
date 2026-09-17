import {
  PhysicsSimulation,
  DEFAULT_ANTIGRAVITY_CONFIG,
  serializeAntigravityConfig,
  deserializeAntigravityConfig,
  generateCssExport,
  generateJsExport,
  generateMotionTokens,
  describeMotion,
  ANTIGRAVITY_PRESETS,
} from '../src/utils/antigravityEngine';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${msg}`);
}

console.log('🧪 Running Antigravity Physics Engine & Tool Verification Suite...\n');

// 1. Positive Gravity Accelerates Downward
{
  const sim = new PhysicsSimulation(
    {
      ...DEFAULT_ANTIGRAVITY_CONFIG,
      gravityY: 10,
      gravityX: 0,
      velocityX: 0,
      velocityY: 0,
      damping: 0,
    },
    1000,
    1000,
    50,
    50
  );
  const initialY = sim.y;
  sim.step(0.05); // 50ms
  assert(sim.vy > 0, 'Positive gravity induces positive (downward) velocity');
  assert(sim.y > initialY, 'Positive gravity moves object downward');
}

// 2. Negative Gravity Accelerates Upward (Antigravity)
{
  const sim = new PhysicsSimulation(
    {
      ...DEFAULT_ANTIGRAVITY_CONFIG,
      gravityY: -10,
      gravityX: 0,
      velocityX: 0,
      velocityY: 0,
      damping: 0,
    },
    1000,
    1000,
    50,
    50
  );
  const initialY = sim.y;
  sim.step(0.05); // 50ms
  assert(sim.vy < 0, 'Negative gravity induces negative (upward) velocity');
  assert(sim.y < initialY, 'Negative gravity moves object upward');
}

// 3. Zero Gravity
{
  const sim = new PhysicsSimulation(
    {
      ...DEFAULT_ANTIGRAVITY_CONFIG,
      gravityY: 0,
      gravityX: 0,
      velocityX: 0,
      velocityY: 0,
      damping: 0,
    },
    1000,
    1000,
    50,
    50
  );
  const initialY = sim.y;
  sim.step(0.05);
  assert(sim.vy === 0, 'Zero gravity maintains zero vertical velocity');
  assert(sim.y === initialY, 'Zero gravity maintains vertical position when stationary');
}

// 4. Restitution & Bounce
{
  // Restitution 0 (Dead stop)
  const simDead = new PhysicsSimulation(
    {
      ...DEFAULT_ANTIGRAVITY_CONFIG,
      gravityY: 0,
      gravityX: 0,
      velocityX: 0,
      velocityY: 500,
      restitution: 0,
      damping: 0,
      friction: 0,
    },
    400,
    400,
    50,
    50
  );
  simDead.y = 358; // Close to bottom (400 - 16 - 25 = 359)
  simDead.step(0.02);
  assert(simDead.vy === 0, 'Restitution 0 stops vertical bounce on collision');

  // Restitution 1 (Elastic bounce)
  const simElastic = new PhysicsSimulation(
    {
      ...DEFAULT_ANTIGRAVITY_CONFIG,
      gravityY: 0,
      gravityX: 0,
      velocityX: 0,
      velocityY: 500,
      restitution: 1.0,
      damping: 0,
      friction: 0,
    },
    400,
    400,
    50,
    50
  );
  simElastic.y = 358;
  simElastic.step(0.02);
  assert(simElastic.vy < 0, 'Restitution 1.0 reflects velocity upward after bottom collision');
}

// 5. Damping
{
  const simLow = new PhysicsSimulation(
    {
      ...DEFAULT_ANTIGRAVITY_CONFIG,
      gravityY: 0,
      velocityX: 200,
      velocityY: 0,
      damping: 0.01,
    },
    1000,
    1000,
    50,
    50
  );
  const simHigh = new PhysicsSimulation(
    {
      ...DEFAULT_ANTIGRAVITY_CONFIG,
      gravityY: 0,
      velocityX: 200,
      velocityY: 0,
      damping: 0.2,
    },
    1000,
    1000,
    50,
    50
  );
  simLow.step(0.05);
  simHigh.step(0.05);
  assert(
    simHigh.vx < simLow.vx,
    'Higher damping reduces velocity more quickly than lower damping'
  );
}

// 6. Boundary Containment
{
  const sim = new PhysicsSimulation(
    {
      ...DEFAULT_ANTIGRAVITY_CONFIG,
      gravityY: 100, // extreme downward gravity
      velocityX: 1000,
      velocityY: 1000,
    },
    500,
    400,
    50,
    50
  );
  for (let i = 0; i < 50; i++) {
    sim.step(0.016);
  }
  const minX = sim.config.boundaryPadding + sim.objectWidth / 2;
  const maxX = sim.stageWidth - sim.config.boundaryPadding - sim.objectWidth / 2;
  const minY = sim.config.boundaryPadding + sim.objectHeight / 2;
  const maxY = sim.stageHeight - sim.config.boundaryPadding - sim.objectHeight / 2;
  assert(
    sim.x >= minX - 0.1 && sim.x <= maxX + 0.1,
    `Object X position (${sim.x}) remains strictly within horizontal bounds [${minX}, ${maxX}]`
  );
  assert(
    sim.y >= minY - 0.1 && sim.y <= maxY + 0.1,
    `Object Y position (${sim.y}) remains strictly within vertical bounds [${minY}, ${maxY}]`
  );
}

// 7. URL Serialization Round-Trip
{
  const config = {
    ...DEFAULT_ANTIGRAVITY_CONFIG,
    preset: 'moon-gravity',
    object: 'card' as const,
    gravityY: -1.6,
    gravityX: 1.2,
    velocityX: 45,
    velocityY: -30,
    mass: 2.5,
    restitution: 0.75,
    friction: 0.2,
    damping: 0.04,
    angularVelocity: 3.5,
    timeScale: 1.2,
  };
  const searchParams = new URLSearchParams(serializeAntigravityConfig(config));
  const reconstructed = deserializeAntigravityConfig(searchParams);

  assert(reconstructed.preset === config.preset, 'Serialization round-trip preserves preset');
  assert(reconstructed.object === config.object, 'Serialization round-trip preserves object');
  assert(Math.abs(reconstructed.gravityY - config.gravityY) < 0.001, 'Serialization preserves gravityY');
  assert(Math.abs(reconstructed.gravityX - config.gravityX) < 0.001, 'Serialization preserves gravityX');
  assert(Math.abs(reconstructed.velocityX - config.velocityX) < 0.001, 'Serialization preserves velocityX');
  assert(Math.abs(reconstructed.velocityY - config.velocityY) < 0.001, 'Serialization preserves velocityY');
  assert(Math.abs(reconstructed.mass - config.mass) < 0.001, 'Serialization preserves mass');
  assert(Math.abs(reconstructed.restitution - config.restitution) < 0.001, 'Serialization preserves restitution');
  assert(Math.abs(reconstructed.damping - config.damping) < 0.001, 'Serialization preserves damping');
}

// 8. Deterministic Output Generation
{
  const preset = ANTIGRAVITY_PRESETS.find((p) => p.id === 'gentle-float')!;
  const config = { ...DEFAULT_ANTIGRAVITY_CONFIG, ...preset.config };
  const sourceUrl = 'https://kroma.design/antigravity?p=gentle-float';
  const css1 = generateCssExport(config, sourceUrl);
  const css2 = generateCssExport(config, sourceUrl);
  assert(css1 === css2 && css1.length > 50, 'Deterministic CSS generation produces identical output');

  const js1 = generateJsExport(config, sourceUrl);
  const js2 = generateJsExport(config, sourceUrl);
  assert(js1 === js2 && js1.includes('createAntigravityMotion'), 'Deterministic JS engine generation');

  const dtcg1 = JSON.stringify(generateMotionTokens(config));
  const dtcg2 = JSON.stringify(generateMotionTokens(config));
  assert(dtcg1 === dtcg2, 'Deterministic DTCG JSON token generation');

  const desc = describeMotion(config);
  assert(typeof desc === 'string' && desc.length > 10, 'Deterministic motion description generated');
}

console.log('\n🎉 ALL 8 PHYSICS & SERIALIZATION TEST SUITES PASSED FLAWLESSLY!\n');
