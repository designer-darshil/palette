/**
 * SPRINGS PHYSICS & MOTION ENGINE
 * Real-time Hooke's Law Spring Simulation, Multi-Node Wave Dynamics,
 * Damped Harmonic Oscillators, Motion Token Derivation, and Multi-Format Exporters.
 */

export type SpringMode = 'single' | 'chain' | 'field' | 'weave';

export type SpringObjectShape = 'circle' | 'square' | 'rounded' | 'diamond' | 'badge';

export interface SpringsConfig {
  preset: string | null;
  mode: SpringMode;
  object: SpringObjectShape;
  stiffness: number; // k in N/m (40 to 800, default 220)
  damping: number; // c in N·s/m (2 to 60, default 14)
  mass: number; // m in kg (0.2 to 5.0, default 1.0)
  tension: number; // internal tension (0 to 1, default 0.5)
  friction: number; // surface friction (0 to 0.5, default 0.05)
  timeScale: number; // speed multiplier (0.2 to 2.5, default 1.0)
  showSpringLine: boolean; // render elastic connection line/coil
  showGrid: boolean; // render background coordinate grid
  showTrails: boolean; // render oscillation motion trail
  activeColor: string; // current active object color
}

export const DEFAULT_SPRINGS_CONFIG: SpringsConfig = {
  preset: 'bouncy',
  mode: 'single',
  object: 'circle',
  stiffness: 220,
  damping: 14,
  mass: 1.0,
  tension: 0.5,
  friction: 0.04,
  timeScale: 1.0,
  showSpringLine: true,
  showGrid: true,
  showTrails: true,
  activeColor: '#3D7DFF',
};

export interface SpringPreset {
  id: string;
  name: string;
  tagline: string;
  description: string;
  config: Partial<SpringsConfig>;
}

export const SPRING_PRESETS: SpringPreset[] = [
  {
    id: 'soft',
    name: 'Soft Cushion',
    tagline: 'Gentle Floating Recovery',
    description: 'Low stiffness and gentle resistance for subtle, ambient UI responses.',
    config: {
      stiffness: 90,
      damping: 10,
      mass: 1.2,
      friction: 0.02,
      activeColor: '#00AEEF',
    },
  },
  {
    id: 'bouncy',
    name: 'Bouncy Elastic',
    tagline: 'Underdamped Harmonic Oscillation',
    description: 'Energetic bounce with rhythmic reverberation before settling.',
    config: {
      stiffness: 220,
      damping: 12,
      mass: 1.0,
      friction: 0.04,
      activeColor: '#3D7DFF',
    },
  },
  {
    id: 'snappy',
    name: 'Snappy Precision',
    tagline: 'Crisp Near-Critical Settling',
    description: 'High tension and firm damping for instantaneous, tactile feedback.',
    config: {
      stiffness: 480,
      damping: 28,
      mass: 0.8,
      friction: 0.08,
      activeColor: '#FF3B30',
    },
  },
  {
    id: 'heavy',
    name: 'Heavy Inertia',
    tagline: 'High Mass Deliberate Momentum',
    description: 'Deep gravitational momentum that pulls with substantial authority.',
    config: {
      stiffness: 320,
      damping: 38,
      mass: 3.5,
      friction: 0.12,
      activeColor: '#7B2CBF',
    },
  },
  {
    id: 'elastic',
    name: 'Rubber Band',
    tagline: 'Hyper-Reactive Tension',
    description: 'Dynamic spring with low damping producing lively whip-like motion.',
    config: {
      stiffness: 360,
      damping: 7,
      mass: 0.6,
      friction: 0.03,
      activeColor: '#34C759',
    },
  },
];

export interface SpringMetrics {
  omega0: number; // natural angular frequency (rad/s)
  zeta: number; // damping ratio
  regime: 'Underdamped' | 'Critically Damped' | 'Overdamped';
  omegaD: number; // damped angular frequency
  periodMs: number; // period of oscillation in ms
  settlingTimeSec: number; // approximate 2% settling time
}

export function calculateSpringMetrics(k: number, c: number, m: number): SpringMetrics {
  const safeM = Math.max(0.01, m);
  const safeK = Math.max(1, k);
  const safeC = Math.max(0, c);

  const omega0 = Math.sqrt(safeK / safeM);
  const criticalDamping = 2 * Math.sqrt(safeK * safeM);
  const zeta = safeC / criticalDamping;

  let regime: 'Underdamped' | 'Critically Damped' | 'Overdamped' = 'Underdamped';
  if (Math.abs(zeta - 1) < 0.05) {
    regime = 'Critically Damped';
  } else if (zeta > 1) {
    regime = 'Overdamped';
  }

  const omegaD = zeta < 1 ? omega0 * Math.sqrt(1 - zeta * zeta) : 0;
  const periodMs = omegaD > 0 ? (2 * Math.PI / omegaD) * 1000 : 0;
  const settlingTimeSec = zeta > 0 ? 4 / (zeta * omega0) : 10;

  return {
    omega0: parseFloat(omega0.toFixed(2)),
    zeta: parseFloat(zeta.toFixed(3)),
    regime,
    omegaD: parseFloat(omegaD.toFixed(2)),
    periodMs: Math.round(periodMs),
    settlingTimeSec: parseFloat(settlingTimeSec.toFixed(2)),
  };
}

export interface SpringNode {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  anchorX: number;
  anchorY: number;
  targetX?: number;
  targetY?: number;
  mass: number;
  color: string;
  radius: number;
  isDragging: boolean;
  label?: string;
}

export class SpringSimulation {
  public config: SpringsConfig;
  public width: number;
  public height: number;
  public nodes: SpringNode[] = [];
  public draggedNodeId: string | null = null;
  public trailPoints: Array<{ x: number; y: number; opacity: number; color: string }> = [];

  constructor(config: SpringsConfig, width = 800, height = 500) {
    this.config = { ...config };
    this.width = width;
    this.height = height;
    this.initializeNodes();
  }

  public updateDimensions(width: number, height: number): void {
    const oldW = this.width;
    const oldH = this.height;
    this.width = width;
    this.height = height;

    if (oldW !== width || oldH !== height) {
      this.initializeNodes();
    }
  }

  public updateConfig(patch: Partial<SpringsConfig>): void {
    const prevMode = this.config.mode;
    this.config = { ...this.config, ...patch };

    if (patch.mode && patch.mode !== prevMode) {
      this.initializeNodes();
    }
  }

  public initializeNodes(): void {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const kromaColors = ['#FF3B30', '#FF9500', '#FFD60A', '#34C759', '#00AEEF', '#7B2CBF'];

    this.trailPoints = [];

    switch (this.config.mode) {
      case 'single':
        this.nodes = [
          {
            id: 'primary',
            x: cx,
            y: cy,
            vx: 0,
            vy: 0,
            anchorX: cx,
            anchorY: cy,
            mass: this.config.mass,
            color: this.config.activeColor,
            radius: 36,
            isDragging: false,
            label: 'MASS 01',
          },
        ];
        break;

      case 'chain':
        const numChain = 4;
        const chainSpacing = 90;
        const startX = cx - ((numChain - 1) * chainSpacing) / 2;
        this.nodes = Array.from({ length: numChain }, (_, i) => ({
          id: `chain-${i}`,
          x: startX + i * chainSpacing,
          y: cy,
          vx: 0,
          vy: 0,
          anchorX: startX + i * chainSpacing,
          anchorY: cy,
          mass: this.config.mass * (1 - i * 0.15),
          color: kromaColors[i % kromaColors.length],
          radius: 28 - i * 2,
          isDragging: false,
          label: `NODE 0${i + 1}`,
        }));
        break;

      case 'field':
        const rows = 3;
        const cols = 4;
        const gapX = Math.min(140, this.width / (cols + 1));
        const gapY = Math.min(110, this.height / (rows + 1));
        const fieldNodes: SpringNode[] = [];

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const ax = cx + (c - (cols - 1) / 2) * gapX;
            const ay = cy + (r - (rows - 1) / 2) * gapY;
            fieldNodes.push({
              id: `field-${r}-${c}`,
              x: ax,
              y: ay,
              vx: 0,
              vy: 0,
              anchorX: ax,
              anchorY: ay,
              mass: this.config.mass * 0.8,
              color: kromaColors[(r * cols + c) % kromaColors.length],
              radius: 22,
              isDragging: false,
            });
          }
        }
        this.nodes = fieldNodes;
        break;

      case 'weave':
        const numWeave = 6;
        const weaveRadius = Math.min(160, Math.min(cx, cy) * 0.7);
        this.nodes = Array.from({ length: numWeave }, (_, i) => {
          const angle = (i / numWeave) * Math.PI * 2;
          const ax = cx + Math.cos(angle) * weaveRadius;
          const ay = cy + Math.sin(angle) * weaveRadius;
          return {
            id: `weave-${i}`,
            x: ax,
            y: ay,
            vx: 0,
            vy: 0,
            anchorX: ax,
            anchorY: ay,
            mass: this.config.mass,
            color: kromaColors[i],
            radius: 26,
            isDragging: false,
            label: kromaColors[i],
          };
        });
        break;
    }
  }

  public step(dt: number): void {
    const k = this.config.stiffness;
    const c = this.config.damping;
    const friction = this.config.friction;
    const timeScale = this.config.timeScale;
    const effectiveDt = Math.min(0.04, dt * timeScale);

    // Update Physics for each node
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      if (node.isDragging) continue;

      let forceX = 0;
      let forceY = 0;

      // 1. Hooke's Law Spring Force towards equilibrium anchor
      const dispX = node.x - node.anchorX;
      const dispY = node.y - node.anchorY;
      forceX += -k * dispX;
      forceY += -k * dispY;

      // 2. Inter-node spring forces for Chain and Weave modes
      if (this.config.mode === 'chain') {
        if (i > 0) {
          const prev = this.nodes[i - 1];
          const dx = node.x - prev.x;
          const dy = node.y - prev.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const restLength = 90;
          const stretch = dist - restLength;
          const f = -k * 0.65 * stretch;
          forceX += (dx / dist) * f;
          forceY += (dy / dist) * f;
        }
        if (i < this.nodes.length - 1) {
          const next = this.nodes[i + 1];
          const dx = node.x - next.x;
          const dy = node.y - next.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const restLength = 90;
          const stretch = dist - restLength;
          const f = -k * 0.65 * stretch;
          forceX += (dx / dist) * f;
          forceY += (dy / dist) * f;
        }
      } else if (this.config.mode === 'weave') {
        const next = this.nodes[(i + 1) % this.nodes.length];
        const dx = node.x - next.x;
        const dy = node.y - next.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const restLength = 150;
        const stretch = dist - restLength;
        const f = -k * 0.45 * stretch;
        forceX += (dx / dist) * f;
        forceY += (dy / dist) * f;
      }

      // 3. Damping force (proportional to velocity)
      forceX += -c * node.vx;
      forceY += -c * node.vy;

      // 4. Acceleration (F = ma => a = F/m)
      const ax = forceX / node.mass;
      const ay = forceY / node.mass;

      // 5. Integrate velocity & position (Semi-implicit Euler)
      node.vx += ax * effectiveDt;
      node.vy += ay * effectiveDt;

      // 6. Surface friction decay
      node.vx *= Math.pow(1 - friction, effectiveDt * 30);
      node.vy *= Math.pow(1 - friction, effectiveDt * 30);

      node.x += node.vx * effectiveDt;
      node.y += node.vy * effectiveDt;

      // Stage boundary bounce
      const padding = node.radius + 8;
      if (node.x < padding) {
        node.x = padding;
        node.vx = -node.vx * 0.5;
      } else if (node.x > this.width - padding) {
        node.x = this.width - padding;
        node.vx = -node.vx * 0.5;
      }
      if (node.y < padding) {
        node.y = padding;
        node.vy = -node.vy * 0.5;
      } else if (node.y > this.height - padding) {
        node.y = this.height - padding;
        node.vy = -node.vy * 0.5;
      }
    }

    // Update trail
    if (this.config.showTrails && this.nodes[0]) {
      const p = this.nodes[0];
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed > 5 || p.isDragging) {
        this.trailPoints.unshift({
          x: p.x,
          y: p.y,
          opacity: 0.6,
          color: p.color,
        });
        if (this.trailPoints.length > 20) this.trailPoints.pop();
      }
      for (const pt of this.trailPoints) {
        pt.opacity *= 0.94;
      }
      this.trailPoints = this.trailPoints.filter((pt) => pt.opacity > 0.04);
    }
  }

  public startDrag(nodeId: string, clientX: number, clientY: number, rect: DOMRect): void {
    const node = this.nodes.find((n) => n.id === nodeId);
    if (!node) return;
    this.draggedNodeId = nodeId;
    node.isDragging = true;
    node.vx = 0;
    node.vy = 0;
    node.x = Math.max(node.radius, Math.min(this.width - node.radius, clientX - rect.left));
    node.y = Math.max(node.radius, Math.min(this.height - node.radius, clientY - rect.top));
  }

  public dragTo(clientX: number, clientY: number, rect: DOMRect): void {
    if (!this.draggedNodeId) return;
    const node = this.nodes.find((n) => n.id === this.draggedNodeId);
    if (!node) return;
    const nextX = Math.max(node.radius, Math.min(this.width - node.radius, clientX - rect.left));
    const nextY = Math.max(node.radius, Math.min(this.height - node.radius, clientY - rect.top));
    node.vx = (nextX - node.x) * 15;
    node.vy = (nextY - node.y) * 15;
    node.x = nextX;
    node.y = nextY;
  }

  public releaseDrag(): void {
    if (!this.draggedNodeId) return;
    const node = this.nodes.find((n) => n.id === this.draggedNodeId);
    if (node) {
      node.isDragging = false;
    }
    this.draggedNodeId = null;
  }

  public applyImpulse(x: number, y: number, strength = 450): void {
    for (const node of this.nodes) {
      const dx = node.x - x;
      const dy = node.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const factor = Math.max(0, 1 - dist / 300);
      node.vx += (dx / dist) * strength * factor;
      node.vy += (dy / dist) * strength * factor;
    }
  }

  public reset(): void {
    this.initializeNodes();
  }
}

// ─── Multi-Format Code & Token Exporters ───────────────────────────

export function generateCssSpringExport(config: SpringsConfig, sourceUrl = 'https://kroma.design/springs'): string {
  const m = calculateSpringMetrics(config.stiffness, config.damping, config.mass);
  const durationSec = Math.max(0.4, Math.min(3.0, (m.periodMs * 1.8) / 1000)).toFixed(2);

  return `/* ─── KROMA SPRING MOTION SPECIMEN ─── */
/* Configuration Source: ${sourceUrl} */
/* Natural Frequency: ${m.omega0} rad/s · Damping Ratio (ζ): ${m.zeta} (${m.regime}) */

.kroma-spring-element {
  /* Physical Spring: stiffness ${config.stiffness} N/m, damping ${config.damping}, mass ${config.mass}kg */
  animation: kroma-spring-bounce ${durationSec}s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  will-change: transform;
}

@keyframes kroma-spring-bounce {
  0% {
    transform: scale(0.7) translate3d(0, 60px, 0);
    opacity: 0;
  }
  45% {
    transform: scale(1.08) translate3d(0, -12px, 0);
    opacity: 1;
  }
  70% {
    transform: scale(0.97) translate3d(0, 4px, 0);
  }
  88% {
    transform: scale(1.01) translate3d(0, -1px, 0);
  }
  100% {
    transform: scale(1) translate3d(0, 0, 0);
    opacity: 1;
  }
}
`;
}

export function generateJsSpringExport(config: SpringsConfig, sourceUrl = 'https://kroma.design/springs'): string {
  return `/**
 * Kroma Spring Physics Loop (Vanilla JavaScript)
 * Source: ${sourceUrl}
 */
export function createSpring({
  stiffness = ${config.stiffness},
  damping = ${config.damping},
  mass = ${config.mass},
  onUpdate,
}) {
  let position = 0;
  let target = 1;
  let velocity = 0;
  let lastTime = performance.now();
  let animId = null;

  function loop(now) {
    const dt = Math.min(0.04, (now - lastTime) / 1000);
    lastTime = now;

    // F = -k*(x - x_target) - c*v
    const force = -stiffness * (position - target) - damping * velocity;
    const accel = force / mass;
    velocity += accel * dt;
    position += velocity * dt;

    if (onUpdate) onUpdate(position, velocity);

    // Stop condition when near-equilibrium
    if (Math.abs(position - target) > 0.001 || Math.abs(velocity) > 0.001) {
      animId = requestAnimationFrame(loop);
    }
  }

  animId = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(animId);
}
`;
}

export function generateFramerMotionSpringExport(config: SpringsConfig): string {
  return `// Framer Motion Spring Transition Configuration
export const springTransition = {
  type: "spring",
  stiffness: ${config.stiffness},
  damping: ${config.damping},
  mass: ${config.mass},
  restDelta: 0.001,
  restSpeed: 0.001,
};

// Usage Example:
// <motion.div animate={{ scale: 1 }} transition={springTransition} />
`;
}

export function generateDtcgSpringTokens(config: SpringsConfig): Record<string, any> {
  const m = calculateSpringMetrics(config.stiffness, config.damping, config.mass);
  return {
    $schema: 'https://design-tokens.github.io/community-group/format/',
    motion: {
      spring: {
        stiffness: {
          $type: 'number',
          $value: config.stiffness,
          $description: 'Spring constant k in Newtons per meter.',
        },
        damping: {
          $type: 'number',
          $value: config.damping,
          $description: 'Viscous damping resistance c in N·s/m.',
        },
        mass: {
          $type: 'number',
          $value: config.mass,
          $description: 'Inertial mass m in kilograms.',
        },
        dampingRatio: {
          $type: 'number',
          $value: m.zeta,
          $description: 'Damping ratio zeta (underdamped < 1, critically damped = 1).',
        },
        naturalFrequency: {
          $type: 'number',
          $value: m.omega0,
          $description: 'Natural angular frequency omega_0 in rad/s.',
        },
        periodMs: {
          $type: 'duration',
          $value: `${m.periodMs}ms`,
        },
      },
    },
  };
}

export function serializeSpringsConfig(config: SpringsConfig): string {
  const p = new URLSearchParams();
  if (config.preset) p.set('p', config.preset);
  if (config.mode !== 'single') p.set('mode', config.mode);
  if (config.object !== 'circle') p.set('o', config.object);
  if (config.stiffness !== 220) p.set('k', config.stiffness.toString());
  if (config.damping !== 14) p.set('c', config.damping.toString());
  if (config.mass !== 1.0) p.set('m', config.mass.toString());
  if (config.friction !== 0.04) p.set('f', config.friction.toString());
  return p.toString();
}

export function deserializeSpringsConfig(params: URLSearchParams): SpringsConfig {
  const preset = params.get('p') || 'bouncy';
  const foundPreset = SPRING_PRESETS.find((pr) => pr.id === preset);
  const base = foundPreset ? { ...DEFAULT_SPRINGS_CONFIG, ...foundPreset.config } : { ...DEFAULT_SPRINGS_CONFIG };

  const mode = (params.get('mode') || base.mode) as SpringMode;
  const object = (params.get('o') || base.object) as SpringObjectShape;
  const stiffness = params.has('k') ? parseFloat(params.get('k')!) : base.stiffness;
  const damping = params.has('c') ? parseFloat(params.get('c')!) : base.damping;
  const mass = params.has('m') ? parseFloat(params.get('m')!) : base.mass;
  const friction = params.has('f') ? parseFloat(params.get('f')!) : base.friction;

  return {
    ...base,
    preset: foundPreset ? preset : null,
    mode: ['single', 'chain', 'field', 'weave'].includes(mode) ? mode : 'single',
    object: ['circle', 'square', 'rounded', 'diamond', 'badge'].includes(object) ? object : 'circle',
    stiffness: isNaN(stiffness) ? 220 : Math.max(40, Math.min(800, stiffness)),
    damping: isNaN(damping) ? 14 : Math.max(2, Math.min(60, damping)),
    mass: isNaN(mass) ? 1.0 : Math.max(0.2, Math.min(5.0, mass)),
    friction: isNaN(friction) ? 0.04 : Math.max(0, Math.min(0.5, friction)),
  };
}
