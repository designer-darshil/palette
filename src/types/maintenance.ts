/**
 * PALETTEPARADISE / KROMA — SYSTEM MAINTENANCE TYPES
 */

export type MaintenanceStatus = 'online' | 'active' | 'scheduled' | 'ending_soon' | 'completed';

export interface MaintenanceState {
  enabled: boolean;
  scheduledStart: string | null; // ISO Date String (e.g. 2026-09-18T14:00:00.000Z)
  scheduledEnd: string | null;   // ISO Date String (e.g. 2026-09-18T18:00:00.000Z)
  title: string;
  message: string;
  estimatedReturn: string | null; // Human-friendly time string or ISO string
  showCountdown: boolean;
  supportUrl: string | null;
  updatedAt: string;
  updatedBy: string;
  lastChangedTimestamp: number;
}

export interface MaintenancePreset {
  id: string;
  name: string;
  tagline: string;
  title: string;
  message: string;
  defaultDurationMinutes: number;
}

export interface SystemHealthSnapshot {
  storageConnectivity: 'connected' | 'offline' | 'degraded';
  storageAdapter: 'serverless-api' | 'dev-middleware' | 'local-fallback';
  activeRole: string;
  userEmail: string;
  librarySpecimens: number;
  lastSyncTimestamp: number;
  routeGuardActive: boolean;
}

export const DEFAULT_MAINTENANCE_STATE: MaintenanceState = {
  enabled: false,
  scheduledStart: null,
  scheduledEnd: null,
  title: "We'll be back shortly",
  message: "PaletteParadise is undergoing scheduled system upgrades and performance calibration. Public access will resume momentarily.",
  estimatedReturn: null,
  showCountdown: true,
  supportUrl: "mailto:designers.scrillo@gmail.com",
  updatedAt: new Date().toISOString(),
  updatedBy: "System Default",
  lastChangedTimestamp: Date.now(),
};

export const MAINTENANCE_PRESETS: MaintenancePreset[] = [
  {
    id: 'scheduled_maintenance',
    name: 'Scheduled Maintenance',
    tagline: 'Standard maintenance window with countdown',
    title: "We'll be back shortly",
    message: "PaletteParadise is undergoing scheduled system upgrades and database calibration. All specimen data remains safe.",
    defaultDurationMinutes: 120,
  },
  {
    id: 'system_upgrade',
    name: 'Infrastructure & Studio Upgrade',
    tagline: 'Deploying new Studio engines & features',
    title: 'Upgrading PaletteParadise Studios',
    message: "We're deploying exciting new creative tooling updates and hardware-accelerated shaders. Normal operations will resume soon.",
    defaultDurationMinutes: 60,
  },
  {
    id: 'performance_calibration',
    name: 'Performance & Edge Sync',
    tagline: 'CDN edge re-indexing & cache calibration',
    title: 'Optimizing Global Performance',
    message: "We're calibrating our global distribution edge nodes and color harmony index. Service will return in a few minutes.",
    defaultDurationMinutes: 30,
  },
  {
    id: 'major_release',
    name: 'Major Version Launch',
    tagline: 'Preparing system for a major release',
    title: 'Preparing Next-Gen KROMA',
    message: "A major update to PaletteParadise is currently being finalized. Grab a coffee—we'll be live with brand new capabilities shortly.",
    defaultDurationMinutes: 180,
  },
  {
    id: 'emergency_hotfix',
    name: 'Temporary Service Interruption',
    tagline: 'Urgent maintenance hotfix',
    title: 'Temporary Service Window',
    message: "We are addressing a brief infrastructure anomaly. Our engineering team is on it and access will be restored immediately.",
    defaultDurationMinutes: 45,
  },
];
