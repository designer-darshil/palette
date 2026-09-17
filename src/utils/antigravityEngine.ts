/**
 * ANTIGRAVITY PHYSICS & MOTION ENGINE
 * Deterministic physics simulation, trajectory prediction, motion token derivation,
 * and multi-format code exporters (CSS keyframes, Vanilla JS, React/Framer Motion, DTCG JSON).
 */

export type ObjectShape =
  | 'circle'
  | 'square'
  | 'rounded'
  | 'blob'
  | 'button'
  | 'card'
  | 'notification'
  | 'badge'
  | 'icon'
  | 'panel';

export interface AntigravityConfig {
  preset: string | null;
  object: ObjectShape;
  gravityX: number; // m/s² (-20 to 20, default 0)
  gravityY: number; // m/s² (-20 to 20, default -2: subtle upward antigravity)
  velocityX: number; // px/s (-1000 to 1000, default 30)
  velocityY: number; // px/s (-1000 to 1000, default 0)
  mass: number; // kg (0.1 to 10, default 1)
  restitution: number; // bounce elasticity (0 to 1, default 0.6)
  friction: number; // surface resistance (0 to 1, default 0.1)
  damping: number; // air drag (0 to 1, default 0.02)
  rotation: boolean; // enable angular rotation
  angularVelocity: number; // deg/s (-720 to 720, default 15)
  timeScale: number; // simulation speed multiplier (0.1 to 3, default 1)
  boundaryPadding: number; // distance from stage edges in px (default 16)
  showTrajectory: boolean; // render predicted trajectory
  showVelocity: boolean; // render velocity vector arrow
  showGrid: boolean; // render subtle coordinate grid
  scaleResponse: boolean; // squash & stretch with velocity
}

export type SimulationState =
  | 'idle'
  | 'playing'
  | 'paused'
  | 'dragging'
  | 'collision'
  | 'rising'
  | 'falling'
  | 'hovering'
  | 'drifting'
  | 'settled';

export interface AntigravityPreset {
  id: string;
  name: string;
  tagline: string;
  description: string;
  config: Partial<AntigravityConfig>;
}

export const ANTIGRAVITY_PRESETS: AntigravityPreset[] = [
  {
    id: 'gentle-float',
    name: 'Gentle Float',
    tagline: 'Subtle Antigravity Drift',
    description: 'Light upward buoyancy with gentle air damping for ambient UI elements.',
    config: {
      gravityX: 0,
      gravityY: -2,
      velocityX: 25,
      velocityY: 0,
      mass: 1,
      restitution: 0.6,
      friction: 0.08,
      damping: 0.02,
      rotation: true,
      angularVelocity: 12,
      object: 'circle',
    },
  },
  {
    id: 'weightless',
    name: 'Weightless Zero-G',
    tagline: 'Pure Orbital Inertia',
    description: 'Zero downward pull with nearly frictionless elastic boundary ricochets.',
    config: {
      gravityX: 0,
      gravityY: 0,
      velocityX: 45,
      velocityY: -30,
      mass: 1.2,
      restitution: 0.95,
      friction: 0.01,
      damping: 0.004,
      rotation: true,
      angularVelocity: 20,
      object: 'circle',
    },
  },
  {
    id: 'soft-bounce',
    name: 'Soft Bounce',
    tagline: 'Cushioned Ground Energy',
    description: 'Earth-like gravity with cushioned, elastic floor landings.',
    config: {
      gravityX: 0,
      gravityY: 9.8,
      velocityX: 35,
      velocityY: -160,
      mass: 1,
      restitution: 0.68,
      friction: 0.15,
      damping: 0.025,
      rotation: false,
      angularVelocity: 0,
      object: 'rounded',
    },
  },
  {
    id: 'heavy-drop',
    name: 'Heavy Drop',
    tagline: 'High Mass Solid Impact',
    description: 'Dense mass with strong gravity and immediate non-elastic settling.',
    config: {
      gravityX: 0,
      gravityY: 18,
      velocityX: 15,
      velocityY: 0,
      mass: 4.5,
      restitution: 0.2,
      friction: 0.45,
      damping: 0.05,
      rotation: false,
      angularVelocity: 0,
      object: 'square',
    },
  },
  {
    id: 'moon-gravity',
    name: 'Lunar Hop',
    tagline: '1/6th Earth Atmosphere',
    description: 'Slow, floaty ballistic leaps with extended hang time.',
    config: {
      gravityX: 0,
      gravityY: 1.62,
      velocityX: 50,
      velocityY: -180,
      mass: 1,
      restitution: 0.8,
      friction: 0.06,
      damping: 0.01,
      rotation: true,
      angularVelocity: 15,
      object: 'circle',
    },
  },
  {
    id: 'upward-drift',
    name: 'Upward Drift',
    tagline: 'High-Altitude Helium Rise',
    description: 'Continuous upward ascent with diagonal lateral drift.',
    config: {
      gravityX: 8,
      gravityY: -7,
      velocityX: 20,
      velocityY: -40,
      mass: 0.8,
      restitution: 0.5,
      friction: 0.1,
      damping: 0.035,
      rotation: true,
      angularVelocity: -18,
      object: 'blob',
    },
  },
  {
    id: 'magnetic-hover',
    name: 'Magnetic Levitation',
    tagline: 'Equilibrium Hover Field',
    description: 'Suspended in mid-air with gentle oscillation and high damping.',
    config: {
      gravityX: 0,
      gravityY: -0.8,
      velocityX: 0,
      velocityY: -12,
      mass: 1.5,
      restitution: 0.75,
      friction: 0.05,
      damping: 0.018,
      rotation: false,
      angularVelocity: 0,
      object: 'rounded',
    },
  },
  {
    id: 'elastic-pinball',
    name: 'Elastic Collision',
    tagline: 'High Velocity Momentum',
    description: 'High restitution bouncy motion across all four bounding walls.',
    config: {
      gravityX: 3,
      gravityY: 4,
      velocityX: 280,
      velocityY: -220,
      mass: 0.5,
      restitution: 0.94,
      friction: 0.02,
      damping: 0.008,
      rotation: true,
      angularVelocity: 90,
      object: 'circle',
    },
  },
  {
    id: 'slow-orbit',
    name: 'Orbital Path',
    tagline: 'Continuous Vector Drift',
    description: 'Balanced lateral and vertical momentum creating a smooth glide.',
    config: {
      gravityX: 10,
      gravityY: -1.2,
      velocityX: 85,
      velocityY: -65,
      mass: 1,
      restitution: 0.88,
      friction: 0.03,
      damping: 0.01,
      rotation: true,
      angularVelocity: 35,
      object: 'blob',
    },
  },
  {
    id: 'button-float',
    name: 'Button Hover Elevation',
    tagline: 'Interactive UI CTA Micro-Physics',
    description: 'Tuned micro-elevation physics applied directly to a primary button.',
    config: {
      gravityX: 0,
      gravityY: -1.5,
      velocityX: 8,
      velocityY: 0,
      mass: 1,
      restitution: 0.45,
      friction: 0.2,
      damping: 0.06,
      rotation: false,
      angularVelocity: 0,
      object: 'button',
    },
  },
  {
    id: 'card-lift',
    name: 'Card Suspended Surface',
    tagline: 'Floating Content Container',
    description: 'Damped levitation calibrated for dashboard cards and modal panels.',
    config: {
      gravityX: 4,
      gravityY: -2.2,
      velocityX: 12,
      velocityY: 0,
      mass: 2.2,
      restitution: 0.4,
      friction: 0.15,
      damping: 0.045,
      rotation: false,
      angularVelocity: 0,
      object: 'card',
    },
  },
  {
    id: 'notification-drift',
    name: 'Notification Banner Drift',
    tagline: 'Subtle Alert Ambient Physics',
    description: 'Soft horizontal breeze with low vertical acceleration for toast alerts.',
    config: {
      gravityX: -6,
      gravityY: -1.2,
      velocityX: -18,
      velocityY: 0,
      mass: 0.9,
      restitution: 0.5,
      friction: 0.12,
      damping: 0.04,
      rotation: false,
      angularVelocity: 0,
      object: 'notification',
    },
  },
];

export const DEFAULT_ANTIGRAVITY_CONFIG: AntigravityConfig = {
  preset: 'gentle-float',
  object: 'circle',
  gravityX: 0,
  gravityY: -2,
  velocityX: 25,
  velocityY: 0,
  mass: 1,
  restitution: 0.6,
  friction: 0.08,
  damping: 0.02,
  rotation: true,
  angularVelocity: 12,
  timeScale: 1,
  boundaryPadding: 16,
  showTrajectory: true,
  showVelocity: false,
  showGrid: false,
  scaleResponse: false,
};

// ==========================================
// SIMULATION ENGINE & INTEGRATOR
// ==========================================

export class PhysicsSimulation {
  config: AntigravityConfig;
  stageWidth: number;
  stageHeight: number;
  objectWidth: number;
  objectHeight: number;

  // Runtime physical state
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  angularVelocity: number;
  state: SimulationState;

  // Interactive drag state
  isDragging: boolean;
  dragStartX: number;
  dragStartY: number;
  lastPointerX: number;
  lastPointerY: number;
  pointerVelocityX: number;
  pointerVelocityY: number;
  lastPointerTime: number;

  constructor(
    config: AntigravityConfig = DEFAULT_ANTIGRAVITY_CONFIG,
    stageWidth = 600,
    stageHeight = 400,
    objectWidth = 56,
    objectHeight = 56
  ) {
    this.config = { ...config };
    this.stageWidth = stageWidth;
    this.stageHeight = stageHeight;
    this.objectWidth = objectWidth;
    this.objectHeight = objectHeight;

    this.x = stageWidth / 2;
    this.y = stageHeight / 2;
    this.vx = config.velocityX;
    this.vy = config.velocityY;
    this.angle = 0;
    this.angularVelocity = config.rotation ? config.angularVelocity : 0;
    this.state = 'playing';

    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.lastPointerX = 0;
    this.lastPointerY = 0;
    this.pointerVelocityX = 0;
    this.pointerVelocityY = 0;
    this.lastPointerTime = 0;

    this.reset();
  }

  updateDimensions(stageWidth: number, stageHeight: number, objectWidth = 56, objectHeight = 56) {
    this.stageWidth = stageWidth;
    this.stageHeight = stageHeight;
    this.objectWidth = objectWidth;
    this.objectHeight = objectHeight;
    this.clampToBounds();
  }

  updateConfig(newConfig: AntigravityConfig) {
    this.config = { ...newConfig };
    if (!this.isDragging) {
      this.angularVelocity = this.config.rotation ? this.config.angularVelocity : 0;
    }
  }

  reset() {
    this.isDragging = false;
    this.x = this.stageWidth / 2;
    this.y = this.stageHeight / 2;
    this.vx = this.config.velocityX;
    this.vy = this.config.velocityY;
    this.angle = 0;
    this.angularVelocity = this.config.rotation ? this.config.angularVelocity : 0;
    this.state = 'playing';
  }

  startDrag(clientX: number, clientY: number, stageRect: DOMRect) {
    this.isDragging = true;
    this.state = 'dragging';
    const localX = clientX - stageRect.left;
    const localY = clientY - stageRect.top;

    this.x = localX;
    this.y = localY;
    this.vx = 0;
    this.vy = 0;
    this.lastPointerX = localX;
    this.lastPointerY = localY;
    this.lastPointerTime = performance.now();
    this.pointerVelocityX = 0;
    this.pointerVelocityY = 0;
  }

  dragTo(clientX: number, clientY: number, stageRect: DOMRect) {
    if (!this.isDragging) return;

    const localX = clientX - stageRect.left;
    const localY = clientY - stageRect.top;
    const now = performance.now();
    const dt = Math.max(0.001, (now - this.lastPointerTime) / 1000);

    const rawVx = (localX - this.lastPointerX) / dt;
    const rawVy = (localY - this.lastPointerY) / dt;

    // Smooth momentum tracking
    this.pointerVelocityX = this.pointerVelocityX * 0.4 + rawVx * 0.6;
    this.pointerVelocityY = this.pointerVelocityY * 0.4 + rawVy * 0.6;

    this.x = localX;
    this.y = localY;
    this.lastPointerX = localX;
    this.lastPointerY = localY;
    this.lastPointerTime = now;

    this.clampToBounds();
  }

  releaseDrag() {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.state = 'playing';

    // Impart pointer velocity with mass factor
    const speedLimit = 800;
    const massFactor = Math.max(0.3, 1 / Math.sqrt(this.config.mass));
    this.vx = Math.max(-speedLimit, Math.min(speedLimit, this.pointerVelocityX * massFactor));
    this.vy = Math.max(-speedLimit, Math.min(speedLimit, this.pointerVelocityY * massFactor));
  }

  applyImpulse(ix: number, iy: number) {
    this.vx += ix / this.config.mass;
    this.vy += iy / this.config.mass;
  }

  clampToBounds() {
    const pad = this.config.boundaryPadding;
    const minX = pad + this.objectWidth / 2;
    const maxX = this.stageWidth - pad - this.objectWidth / 2;
    const minY = pad + this.objectHeight / 2;
    const maxY = this.stageHeight - pad - this.objectHeight / 2;

    this.x = Math.max(minX, Math.min(maxX, this.x));
    this.y = Math.max(minY, Math.min(maxY, this.y));
  }

  step(rawDt: number): { collided: boolean; collisionSide?: 'top' | 'bottom' | 'left' | 'right' } {
    if (this.isDragging) {
      return { collided: false };
    }

    // Fixed timestep / delta clamping to prevent numerical explosion
    const dt = Math.min(0.05, Math.max(0.001, rawDt)) * this.config.timeScale;
    const pixelsPerMeter = 40; // scaling factor for m/s² to px/s²

    // Accelerations (F = m*a => a = F/m)
    const ax = (this.config.gravityX * pixelsPerMeter);
    const ay = (this.config.gravityY * pixelsPerMeter);

    // Apply acceleration
    this.vx += ax * dt;
    this.vy += ay * dt;

    // Apply air damping decay: v = v * (1 - damping * dt * 10)
    const dampingFactor = Math.max(0, 1 - this.config.damping * dt * 12);
    this.vx *= dampingFactor;
    this.vy *= dampingFactor;

    // Update position
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Angular rotation
    if (this.config.rotation) {
      this.angle += this.angularVelocity * dt;
      // Air drag on rotation
      this.angularVelocity *= Math.max(0, 1 - this.config.damping * dt * 8);
    }

    // Boundary Collisions
    const pad = this.config.boundaryPadding;
    const minX = pad + this.objectWidth / 2;
    const maxX = this.stageWidth - pad - this.objectWidth / 2;
    const minY = pad + this.objectHeight / 2;
    const maxY = this.stageHeight - pad - this.objectHeight / 2;

    let collided = false;
    let collisionSide: 'top' | 'bottom' | 'left' | 'right' | undefined;

    const rest = this.config.restitution;
    const fric = Math.max(0, 1 - this.config.friction * 0.5);

    // Floor collision
    if (this.y > maxY) {
      this.y = maxY;
      this.vy = -this.vy * rest;
      this.vx *= fric;
      collided = true;
      collisionSide = 'bottom';
      if (Math.abs(this.vy) < 12) this.vy = 0;
    }

    // Ceiling collision (Antigravity ceiling hits)
    if (this.y < minY) {
      this.y = minY;
      this.vy = -this.vy * rest;
      this.vx *= fric;
      collided = true;
      collisionSide = 'top';
      if (Math.abs(this.vy) < 12) this.vy = 0;
    }

    // Right wall collision
    if (this.x > maxX) {
      this.x = maxX;
      this.vx = -this.vx * rest;
      this.vy *= fric;
      collided = true;
      collisionSide = 'right';
      if (Math.abs(this.vx) < 12) this.vx = 0;
    }

    // Left wall collision
    if (this.x < minX) {
      this.x = minX;
      this.vx = -this.vx * rest;
      this.vy *= fric;
      collided = true;
      collisionSide = 'left';
      if (Math.abs(this.vx) < 12) this.vx = 0;
    }

    // Semantic simulation state detection
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (collided) {
      this.state = 'collision';
    } else if (speed < 4 && Math.abs(ax) < 2 && Math.abs(ay) < 2) {
      this.state = 'settled';
    } else if (this.vy < -15) {
      this.state = 'rising';
    } else if (this.vy > 15) {
      this.state = 'falling';
    } else if (Math.abs(this.vy) <= 15 && Math.abs(this.vx) > 10) {
      this.state = 'drifting';
    } else {
      this.state = 'hovering';
    }

    return { collided, collisionSide };
  }

  getTrajectoryPoints(numSteps = 30, timeStep = 0.06): Array<{ x: number; y: number }> {
    const points: Array<{ x: number; y: number }> = [];
    let simX = this.x;
    let simY = this.y;
    let simVx = this.vx;
    let simVy = this.vy;

    const pad = this.config.boundaryPadding;
    const minX = pad + this.objectWidth / 2;
    const maxX = this.stageWidth - pad - this.objectWidth / 2;
    const minY = pad + this.objectHeight / 2;
    const maxY = this.stageHeight - pad - this.objectHeight / 2;
    const pixelsPerMeter = 40;
    const ax = this.config.gravityX * pixelsPerMeter;
    const ay = this.config.gravityY * pixelsPerMeter;
    const rest = this.config.restitution;

    for (let i = 0; i < numSteps; i++) {
      simVx += ax * timeStep;
      simVy += ay * timeStep;
      simVx *= Math.max(0, 1 - this.config.damping * timeStep * 12);
      simVy *= Math.max(0, 1 - this.config.damping * timeStep * 12);

      simX += simVx * timeStep;
      simY += simVy * timeStep;

      if (simX < minX || simX > maxX) {
        simX = Math.max(minX, Math.min(maxX, simX));
        simVx = -simVx * rest;
      }
      if (simY < minY || simY > maxY) {
        simY = Math.max(minY, Math.min(maxY, simY));
        simVy = -simVy * rest;
      }

      points.push({ x: simX, y: simY });
    }

    return points;
  }
}

// ==========================================
// SEMANTIC MOTION DESCRIPTION GENERATOR
// ==========================================

export function describeMotion(config: AntigravityConfig): string {
  const parts: string[] = [];

  // Gravity intent
  if (config.gravityY < -5) {
    parts.push('High-buoyancy upward acceleration');
  } else if (config.gravityY < 0) {
    parts.push('Gentle antigravity upward lift');
  } else if (config.gravityY === 0) {
    parts.push('Weightless zero-G orbital drift');
  } else if (config.gravityY > 10) {
    parts.push('Heavy downward gravitational pull');
  } else {
    parts.push('Subtle downward ballistic curve');
  }

  // Elasticity / Bounce
  if (config.restitution >= 0.85) {
    parts.push('highly elastic boundary ricochet');
  } else if (config.restitution >= 0.5) {
    parts.push('cushioned kinetic bounce');
  } else {
    parts.push('damped non-elastic surface impact');
  }

  // Damping / Friction
  if (config.damping < 0.01) {
    parts.push('perpetual frictionless momentum');
  } else if (config.damping < 0.04) {
    parts.push('low atmospheric air resistance');
  } else {
    parts.push('rapid velocity dissipation');
  }

  return `${parts.join(' with ')}.`;
}

// ==========================================
// DESIGN TOKEN DERIVATION (DTCG STANDARD)
// ==========================================

export interface AntigravityMotionTokens {
  motion: {
    physics: {
      gravityX: { value: number; unit: 'm/s²'; description: string };
      gravityY: { value: number; unit: 'm/s²'; description: string };
      initialVelocityX: { value: number; unit: 'px/s'; description: string };
      initialVelocityY: { value: number; unit: 'px/s'; description: string };
      mass: { value: number; unit: 'kg'; description: string };
      restitution: { value: number; unit: 'ratio'; description: string };
      friction: { value: number; unit: 'ratio'; description: string };
      damping: { value: number; unit: 'ratio'; description: string };
      angularVelocity: { value: number; unit: 'deg/s'; description: string };
    };
    semantic: {
      behavior: string;
      objectShape: string;
      presetId: string | null;
    };
  };
}

export function generateMotionTokens(config: AntigravityConfig): AntigravityMotionTokens {
  return {
    motion: {
      physics: {
        gravityX: { value: config.gravityX, unit: 'm/s²', description: 'Horizontal directional acceleration' },
        gravityY: { value: config.gravityY, unit: 'm/s²', description: 'Vertical gravitational acceleration (negative = lift)' },
        initialVelocityX: { value: config.velocityX, unit: 'px/s', description: 'Horizontal launch velocity' },
        initialVelocityY: { value: config.velocityY, unit: 'px/s', description: 'Vertical launch velocity' },
        mass: { value: config.mass, unit: 'kg', description: 'Inertial resistance to momentum transfer' },
        restitution: { value: config.restitution, unit: 'ratio', description: 'Coefficient of restitution (collision elasticity)' },
        friction: { value: config.friction, unit: 'ratio', description: 'Surface energy dissipation upon contact' },
        damping: { value: config.damping, unit: 'ratio', description: 'Atmospheric fluid drag and velocity decay' },
        angularVelocity: { value: config.angularVelocity, unit: 'deg/s', description: 'Rotational spin velocity' },
      },
      semantic: {
        behavior: describeMotion(config),
        objectShape: config.object,
        presetId: config.preset,
      },
    },
  };
}

// ==========================================
// CODE EXPORTERS (CSS, JS, React, JSON)
// ==========================================

export function generateCssExport(config: AntigravityConfig, sourceUrl: string): string {
  const liftHeight = Math.round(Math.abs(config.gravityY) * 6 + 12);
  const driftX = Math.round(config.velocityX * 0.2);
  const duration = (2.2 / config.timeScale).toFixed(2);
  const rotAngle = config.rotation ? Math.round(config.angularVelocity * 0.4) : 0;

  let css = `/* Antigravity CSS Animation Approximation */\n`;
  css += `/* Source: ${sourceUrl} */\n`;
  css += `/* Behavior: ${describeMotion(config)} */\n\n`;

  css += `.antigravity-element {\n`;
  css += `  animation: antigravity-float ${duration}s cubic-bezier(0.25, 0.8, 0.25, 1) infinite alternate;\n`;
  css += `  will-change: transform;\n`;
  css += `}\n\n`;

  css += `@keyframes antigravity-float {\n`;
  css += `  0% {\n`;
  css += `    transform: translate3d(0, 0, 0) rotate(0deg);\n`;
  css += `  }\n`;
  css += `  50% {\n`;
  const yOffset = config.gravityY < 0 ? -liftHeight : liftHeight;
  css += `    transform: translate3d(${driftX}px, ${yOffset}px, 0) rotate(${rotAngle}deg);\n`;
  css += `  }\n`;
  css += `  100% {\n`;
  css += `    transform: translate3d(${driftX * 0.4}px, ${yOffset * 0.3}px, 0) rotate(${rotAngle * -0.5}deg);\n`;
  css += `  }\n`;
  css += `}\n\n`;

  css += `/* Accessibility: Respect Reduced-Motion Preferences */\n`;
  css += `@media (prefers-reduced-motion: reduce) {\n`;
  css += `  .antigravity-element {\n`;
  css += `    animation: none !important;\n`;
  css += `    transform: none !important;\n`;
  css += `  }\n`;
  css += `}\n`;

  return css;
}

export function generateJsExport(config: AntigravityConfig, sourceUrl: string): string {
  let js = `// Antigravity Physics Engine (Production Standalone Implementation)\n`;
  js += `// Source: ${sourceUrl}\n`;
  js += `// Behavior: ${describeMotion(config)}\n\n`;

  js += `export function createAntigravityMotion(targetElement, options = {}) {\n`;
  js += `  // Check for reduced motion preference\n`;
  js += `  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\n`;
  js += `  if (prefersReducedMotion) return () => {};\n\n`;

  js += `  const config = {\n`;
  js += `    gravityX: ${config.gravityX},\n`;
  js += `    gravityY: ${config.gravityY},\n`;
  js += `    velocityX: ${config.velocityX},\n`;
  js += `    velocityY: ${config.velocityY},\n`;
  js += `    mass: ${config.mass},\n`;
  js += `    restitution: ${config.restitution},\n`;
  js += `    friction: ${config.friction},\n`;
  js += `    damping: ${config.damping},\n`;
  js += `    rotation: ${config.rotation},\n`;
  js += `    angularVelocity: ${config.angularVelocity},\n`;
  js += `    timeScale: ${config.timeScale},\n`;
  js += `    ...options,\n`;
  js += `  };\n\n`;

  js += `  let x = 0, y = 0;\n`;
  js += `  let vx = config.velocityX;\n`;
  js += `  let vy = config.velocityY;\n`;
  js += `  let angle = 0;\n`;
  js += `  let lastTime = performance.now();\n`;
  js += `  let animationFrameId = null;\n\n`;

  js += `  function step(now) {\n`;
  js += `    const dt = Math.min(0.05, (now - lastTime) / 1000) * config.timeScale;\n`;
  js += `    lastTime = now;\n\n`;

  js += `    // Apply acceleration\n`;
  js += `    vx += config.gravityX * 40 * dt;\n`;
  js += `    vy += config.gravityY * 40 * dt;\n\n`;

  js += `    // Apply air drag damping\n`;
  js += `    const damp = Math.max(0, 1 - config.damping * dt * 12);\n`;
  js += `    vx *= damp;\n`;
  js += `    vy *= damp;\n\n`;

  js += `    // Update displacement\n`;
  js += `    x += vx * dt;\n`;
  js += `    y += vy * dt;\n`;
  js += `    if (config.rotation) angle += config.angularVelocity * dt;\n\n`;

  js += `    targetElement.style.transform = \`translate3d(\${x.toFixed(2)}px, \${y.toFixed(2)}px, 0) rotate(\${angle.toFixed(1)}deg)\`;\n`;
  js += `    animationFrameId = requestAnimationFrame(step);\n`;
  js += `  }\n\n`;

  js += `  animationFrameId = requestAnimationFrame(step);\n\n`;
  js += `  // Return cleanup teardown function\n`;
  js += `  return () => {\n`;
  js += `    if (animationFrameId) cancelAnimationFrame(animationFrameId);\n`;
  js += `  };\n`;
  js += `}\n`;

  return js;
}

export function generateFramerMotionExport(config: AntigravityConfig, sourceUrl: string): string {
  const liftHeight = Math.round(Math.abs(config.gravityY) * 6 + 12);
  const driftX = Math.round(config.velocityX * 0.2);
  const duration = (2.2 / config.timeScale).toFixed(2);
  const yTarget = config.gravityY < 0 ? -liftHeight : liftHeight;
  const rotAngle = config.rotation ? Math.round(config.angularVelocity * 0.4) : 0;

  let tsx = `import React from 'react';\n`;
  tsx += `import { motion, useReducedMotion } from 'framer-motion';\n\n`;
  tsx += `// Source: ${sourceUrl}\n`;
  tsx += `// Behavior: ${describeMotion(config)}\n\n`;

  tsx += `export const AntigravityMotionElement: React.FC<{ children: React.ReactNode }> = ({ children }) => {\n`;
  tsx += `  const shouldReduceMotion = useReducedMotion();\n\n`;

  tsx += `  return (\n`;
  tsx += `    <motion.div\n`;
  tsx += `      animate={shouldReduceMotion ? {} : {\n`;
  tsx += `        x: [0, ${driftX}, ${Math.round(driftX * 0.4)}, 0],\n`;
  tsx += `        y: [0, ${yTarget}, ${Math.round(yTarget * 0.3)}, 0],\n`;
  tsx += `        rotate: [0, ${rotAngle}, ${Math.round(rotAngle * -0.5)}, 0],\n`;
  tsx += `      }}\n`;
  tsx += `      transition={{\n`;
  tsx += `        duration: ${duration},\n`;
  tsx += `        repeat: Infinity,\n`;
  tsx += `        repeatType: 'reverse',\n`;
  tsx += `        ease: 'easeInOut',\n`;
  tsx += `      }}\n`;
  tsx += `    >\n`;
  tsx += `      {children}\n`;
  tsx += `    </motion.div>\n`;
  tsx += `  );\n`;
  tsx += `};\n`;

  return tsx;
}

export function generateAgentPrompt(config: AntigravityConfig, sourceUrl: string): string {
  return `I have generated a physics-driven UI motion profile using Antigravity Studio.

Motion Spec & Parameters:
- Behavior: ${describeMotion(config)}
- Gravity: X=${config.gravityX} m/s², Y=${config.gravityY} m/s² (Antigravity lift)
- Velocity: VX=${config.velocityX} px/s, VY=${config.velocityY} px/s
- Physical Properties: Mass=${config.mass} kg, Restitution (Bounce)=${config.restitution}, Friction=${config.friction}, Damping=${config.damping}
- Target Object: ${config.object}

Permalinks: ${sourceUrl}
Machine Contract: https://kroma.design/llms.txt

Please use this configuration to animate our UI element with real physics simulation while respecting reduced motion preferences.`;
}

// ==========================================
// URL SERIALIZATION & DESERIALIZATION
// ==========================================

export function serializeAntigravityConfig(config: AntigravityConfig): string {
  const p = new URLSearchParams();

  if (config.preset) p.set('p', config.preset);
  if (config.object !== 'circle') p.set('o', config.object);
  if (config.gravityX !== 0) p.set('gx', config.gravityX.toString());
  if (config.gravityY !== -2) p.set('gy', config.gravityY.toString());
  if (config.velocityX !== 25) p.set('vx', config.velocityX.toString());
  if (config.velocityY !== 0) p.set('vy', config.velocityY.toString());
  if (config.mass !== 1) p.set('m', config.mass.toString());
  if (config.restitution !== 0.6) p.set('r', config.restitution.toString());
  if (config.friction !== 0.08) p.set('f', config.friction.toString());
  if (config.damping !== 0.02) p.set('d', config.damping.toString());
  if (!config.rotation) p.set('rot', '0');
  if (config.angularVelocity !== 12) p.set('av', config.angularVelocity.toString());
  if (config.timeScale !== 1) p.set('ts', config.timeScale.toString());
  if (!config.showTrajectory) p.set('tr', '0');
  if (config.showVelocity) p.set('vv', '1');
  if (config.showGrid) p.set('grid', '1');
  if (config.scaleResponse) p.set('sr', '1');

  return p.toString();
}

export function deserializeAntigravityConfig(params: URLSearchParams | Record<string, string>): AntigravityConfig {
  const get = (key: string) => {
    if (params instanceof URLSearchParams) return params.get(key);
    return params[key] || null;
  };

  const presetId = get('p');
  let baseConfig = { ...DEFAULT_ANTIGRAVITY_CONFIG };

  if (presetId) {
    const matched = ANTIGRAVITY_PRESETS.find((pr) => pr.id === presetId);
    if (matched) {
      baseConfig = { ...baseConfig, ...matched.config, preset: presetId };
    }
  }

  const parseNum = (val: string | null, fallback: number) => {
    if (!val) return fallback;
    const n = parseFloat(val);
    return isNaN(n) ? fallback : n;
  };

  const obj = get('o') as ObjectShape | null;
  const validObjects: ObjectShape[] = [
    'circle', 'square', 'rounded', 'blob', 'button', 'card', 'notification', 'badge', 'icon', 'panel'
  ];

  return {
    preset: presetId,
    object: obj && validObjects.includes(obj) ? obj : baseConfig.object,
    gravityX: parseNum(get('gx'), baseConfig.gravityX),
    gravityY: parseNum(get('gy'), baseConfig.gravityY),
    velocityX: parseNum(get('vx'), baseConfig.velocityX),
    velocityY: parseNum(get('vy'), baseConfig.velocityY),
    mass: Math.max(0.1, Math.min(10, parseNum(get('m'), baseConfig.mass))),
    restitution: Math.max(0, Math.min(1, parseNum(get('r'), baseConfig.restitution))),
    friction: Math.max(0, Math.min(1, parseNum(get('f'), baseConfig.friction))),
    damping: Math.max(0, Math.min(1, parseNum(get('d'), baseConfig.damping))),
    rotation: get('rot') === '0' ? false : baseConfig.rotation,
    angularVelocity: parseNum(get('av'), baseConfig.angularVelocity),
    timeScale: Math.max(0.1, Math.min(3, parseNum(get('ts'), baseConfig.timeScale))),
    boundaryPadding: baseConfig.boundaryPadding,
    showTrajectory: get('tr') === '0' ? false : true,
    showVelocity: get('vv') === '1' ? true : false,
    showGrid: get('grid') === '1' ? true : false,
    scaleResponse: get('sr') === '1' ? true : false,
  };
}
