/**
 * PALETTEPARADISE / KROMA — PRODUCTION MAINTENANCE API
 * Serverless / Edge Function for shared maintenance state & HTTP 503 semantics.
 */

interface ServerMaintenanceState {
  enabled: boolean;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  title: string;
  message: string;
  estimatedReturn: string | null;
  showCountdown: boolean;
  supportUrl: string | null;
  updatedAt: string;
  updatedBy: string;
  lastChangedTimestamp: number;
}

// In-memory module cache for serverless container lifecycle
let globalMaintenanceState: ServerMaintenanceState = {
  enabled: false,
  scheduledStart: null,
  scheduledEnd: null,
  title: "We'll be back shortly",
  message: "PaletteParadise is undergoing scheduled system upgrades and performance calibration. Public access will resume momentarily.",
  estimatedReturn: null,
  showCountdown: true,
  supportUrl: "mailto:support@kroma.design",
  updatedAt: new Date().toISOString(),
  updatedBy: "System Default",
  lastChangedTimestamp: Date.now(),
};

export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Handle POST (Update Maintenance State)
  if (req.method === 'POST') {
    try {
      const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!payload || typeof payload !== 'object') {
        return res.status(400).json({ error: 'Invalid payload' });
      }

      globalMaintenanceState = {
        ...globalMaintenanceState,
        ...payload,
        updatedAt: new Date().toISOString(),
        lastChangedTimestamp: Date.now(),
      };

      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      return res.status(200).json({
        success: true,
        state: globalMaintenanceState,
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to update state', details: err?.message });
    }
  }

  // Handle GET (Read Maintenance State)
  const now = Date.now();
  let isActive = globalMaintenanceState.enabled;

  if (globalMaintenanceState.enabled && globalMaintenanceState.scheduledEnd) {
    const end = new Date(globalMaintenanceState.scheduledEnd).getTime();
    if (!isNaN(end) && now >= end) {
      isActive = false; // Auto-expired
    }
  } else if (!globalMaintenanceState.enabled && globalMaintenanceState.scheduledStart && globalMaintenanceState.scheduledEnd) {
    const start = new Date(globalMaintenanceState.scheduledStart).getTime();
    const end = new Date(globalMaintenanceState.scheduledEnd).getTime();
    if (!isNaN(start) && !isNaN(end) && now >= start && now < end) {
      isActive = true; // Scheduled active
    }
  }

  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  // If requested by an external API consumer that expects 503 during active maintenance
  const isApiRequest = req.headers?.['x-requested-with'] === 'api' || req.query?.format === 'status';
  if (isActive && isApiRequest) {
    if (globalMaintenanceState.scheduledEnd || globalMaintenanceState.estimatedReturn) {
      const targetTime = new Date(globalMaintenanceState.scheduledEnd || globalMaintenanceState.estimatedReturn!).getTime();
      if (!isNaN(targetTime)) {
        const secondsRemaining = Math.max(1, Math.round((targetTime - now) / 1000));
        res.setHeader('Retry-After', secondsRemaining.toString());
      }
    }
    return res.status(503).json({
      status: 'maintenance',
      active: true,
      message: globalMaintenanceState.message,
      title: globalMaintenanceState.title,
      estimatedReturn: globalMaintenanceState.estimatedReturn,
    });
  }

  return res.status(200).json(globalMaintenanceState);
}
