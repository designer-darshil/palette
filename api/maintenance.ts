/**
 * PALETTEPARADISE / KROMA — HARDENED PRODUCTION MAINTENANCE API
 * Serverless / Edge Function for shared maintenance state & HTTP 503 semantics.
 */

import { checkRateLimit } from './_rateLimit';

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
  message:
    'PaletteParadise is undergoing scheduled system upgrades and performance calibration. Public access will resume momentarily.',
  estimatedReturn: null,
  showCountdown: true,
  supportUrl: 'mailto:designers.scrillo@gmail.com',
  updatedAt: new Date().toISOString(),
  updatedBy: 'System Default',
  lastChangedTimestamp: Date.now(),
};

function sanitizeString(str: any, maxLength: number): string {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, maxLength);
}

export default function handler(req: any, res: any) {
  // Production security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Handle POST (Update Maintenance State - Protected Endpoint)
  if (req.method === 'POST') {
    // 1. Rate limit writes: max 20 requests per minute
    if (!checkRateLimit(req, res, { limit: 20, windowMs: 60 * 1000 })) {
      return;
    }

    // 2. Authorization check
    const authHeader = req.headers?.authorization || '';
    const adminSecret = process.env.ADMIN_API_SECRET;

    if (adminSecret) {
      if (authHeader !== `Bearer ${adminSecret}`) {
        return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or missing administrative secret token.' });
      }
    } else {
      // If server environment secret is not configured, enforce that a Bearer session signature is present
      if (!authHeader.startsWith('Bearer ') || authHeader.length < 15) {
        return res.status(401).json({ error: 'Unauthorized', message: 'Administrative authentication token required.' });
      }
    }

    // 3. Strict Input Validation & Prototype Pollution Defense
    try {
      const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        return res.status(400).json({ error: 'Bad Request', message: 'Payload must be a valid JSON object.' });
      }

      // Block prototype pollution
      if ('__proto__' in payload || 'constructor' in payload || 'prototype' in payload) {
        return res.status(400).json({ error: 'Bad Request', message: 'Malformed payload properties.' });
      }

      const sanitizedPatch: Partial<ServerMaintenanceState> = {};

      if (typeof payload.enabled === 'boolean') {
        sanitizedPatch.enabled = payload.enabled;
      }

      if (typeof payload.title === 'string') {
        sanitizedPatch.title = sanitizeString(payload.title, 200) || globalMaintenanceState.title;
      }

      if (typeof payload.message === 'string') {
        sanitizedPatch.message = sanitizeString(payload.message, 2000) || globalMaintenanceState.message;
      }

      if (typeof payload.showCountdown === 'boolean') {
        sanitizedPatch.showCountdown = payload.showCountdown;
      }

      if (payload.scheduledStart !== undefined) {
        sanitizedPatch.scheduledStart = payload.scheduledStart ? sanitizeString(payload.scheduledStart, 100) : null;
      }

      if (payload.scheduledEnd !== undefined) {
        sanitizedPatch.scheduledEnd = payload.scheduledEnd ? sanitizeString(payload.scheduledEnd, 100) : null;
      }

      if (payload.estimatedReturn !== undefined) {
        sanitizedPatch.estimatedReturn = payload.estimatedReturn ? sanitizeString(payload.estimatedReturn, 100) : null;
      }

      if (payload.supportUrl !== undefined) {
        const rawUrl = sanitizeString(payload.supportUrl, 300);
        if (!rawUrl || rawUrl.startsWith('http://') || rawUrl.startsWith('https://') || rawUrl.startsWith('mailto:')) {
          sanitizedPatch.supportUrl = rawUrl || null;
        }
      }

      if (payload.updatedBy && typeof payload.updatedBy === 'string') {
        sanitizedPatch.updatedBy = sanitizeString(payload.updatedBy, 100);
      }

      globalMaintenanceState = {
        ...globalMaintenanceState,
        ...sanitizedPatch,
        updatedAt: new Date().toISOString(),
        lastChangedTimestamp: Date.now(),
      };

      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      return res.status(200).json({
        success: true,
        state: globalMaintenanceState,
      });
    } catch {
      return res.status(400).json({ error: 'Bad Request', message: 'Failed to parse JSON request body.' });
    }
  }

  // Handle GET (Read Maintenance State)
  if (req.method === 'GET') {
    // Rate limit reads: max 120 per minute
    if (!checkRateLimit(req, res, { limit: 120, windowMs: 60 * 1000 })) {
      return;
    }

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

  res.setHeader('Allow', 'GET, POST, OPTIONS');
  return res.status(405).json({ error: 'Method Not Allowed' });
}
