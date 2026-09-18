import {
  MaintenanceState,
  MaintenanceStatus,
  DEFAULT_MAINTENANCE_STATE,
} from '../types/maintenance';

const STORAGE_KEY = 'kroma_maintenance_state_v1';
const SYNC_CHANNEL_NAME = 'kroma_maintenance_sync_channel';

/**
 * Deterministically computes if maintenance mode is currently active based on
 * explicit enabled flag or scheduled start/end timestamps.
 */
export function isMaintenanceActive(state: MaintenanceState, now = Date.now()): boolean {
  if (!state) return false;

  // 1. Explicitly enabled
  if (state.enabled) {
    // If an end time was scheduled, check if it has already expired
    if (state.scheduledEnd) {
      const endTime = new Date(state.scheduledEnd).getTime();
      if (!isNaN(endTime) && now >= endTime) {
        return false; // Automatically expired!
      }
    }
    return true;
  }

  // 2. Scheduled maintenance window (even if enabled boolean was not manually set to true)
  if (state.scheduledStart && state.scheduledEnd) {
    const startTime = new Date(state.scheduledStart).getTime();
    const endTime = new Date(state.scheduledEnd).getTime();
    if (!isNaN(startTime) && !isNaN(endTime)) {
      if (now >= startTime && now < endTime) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Computes high-level status: 'online' | 'active' | 'scheduled' | 'ending_soon' | 'completed'
 */
export function getMaintenanceStatus(state: MaintenanceState, now = Date.now()): MaintenanceStatus {
  if (!state) return 'online';

  const active = isMaintenanceActive(state, now);

  if (active) {
    if (state.scheduledEnd) {
      const endTime = new Date(state.scheduledEnd).getTime();
      if (!isNaN(endTime)) {
        const msRemaining = endTime - now;
        // Ending soon if <= 30 minutes remaining
        if (msRemaining > 0 && msRemaining <= 30 * 60 * 1000) {
          return 'ending_soon';
        }
      }
    }
    return 'active';
  }

  // Check if scheduled in the future
  if (state.scheduledStart && state.scheduledEnd) {
    const startTime = new Date(state.scheduledStart).getTime();
    const endTime = new Date(state.scheduledEnd).getTime();
    if (!isNaN(startTime) && !isNaN(endTime)) {
      if (now < startTime) {
        return 'scheduled';
      }
      if (now >= endTime && state.enabled) {
        return 'completed';
      }
    }
  }

  return 'online';
}

/**
 * Computes countdown components to scheduled end or estimated return.
 */
export function calculateRemainingTime(state: MaintenanceState, now = Date.now()): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isExpired: boolean;
} | null {
  const targetIso = state.scheduledEnd || state.estimatedReturn;
  if (!targetIso) return null;

  const targetTime = new Date(targetIso).getTime();
  if (isNaN(targetTime)) return null;

  const diffMs = targetTime - now;
  if (diffMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, isExpired: true };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / 3600) % 24;
  const days = Math.floor(totalSeconds / 86400);

  return { days, hours, minutes, seconds, totalSeconds, isExpired: false };
}

/**
 * Storage Abstraction with real-time API sync and multi-tab broadcasting
 */
class MaintenanceStoreService {
  private currentState: MaintenanceState;
  private syncChannel: BroadcastChannel | null = null;
  private listeners: Set<(state: MaintenanceState) => void> = new Set();
  private lastFetchTimestamp = 0;

  constructor() {
    this.currentState = this.loadLocalCache();

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.syncChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
        this.syncChannel.onmessage = (event) => {
          if (event.data && typeof event.data === 'object') {
            this.setInternalState(event.data, false);
          }
        };
      } catch {}
    }

    // Also listen to storage events as cross-tab fallback
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            this.setInternalState(parsed, false);
          } catch {}
        }
      });
    }
  }

  private loadLocalCache(): MaintenanceState {
    if (typeof window === 'undefined') return DEFAULT_MAINTENANCE_STATE;
    try {
      const item = localStorage.getItem(STORAGE_KEY);
      if (item) {
        const parsed = JSON.parse(item);
        return { ...DEFAULT_MAINTENANCE_STATE, ...parsed };
      }
    } catch {}
    return DEFAULT_MAINTENANCE_STATE;
  }

  private saveLocalCache(state: MaintenanceState) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }

  private setInternalState(state: MaintenanceState, broadcast = true) {
    this.currentState = state;
    this.saveLocalCache(state);

    if (broadcast && this.syncChannel) {
      try {
        this.syncChannel.postMessage(state);
      } catch {}
    }

    this.listeners.forEach((listener) => {
      try {
        listener(this.currentState);
      } catch (err) {
        console.error('[MaintenanceStore] Listener error:', err);
      }
    });
  }

  /**
   * Fetches latest shared state from the server endpoint /api/maintenance.
   * Falls back gracefully to cached local state if offline or during build.
   */
  async fetchState(): Promise<MaintenanceState> {
    if (typeof window === 'undefined') return this.currentState;

    try {
      const response = await fetch(`/api/maintenance?_t=${Date.now()}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        if (data && typeof data === 'object') {
          const merged: MaintenanceState = {
            ...DEFAULT_MAINTENANCE_STATE,
            ...data,
          };
          this.lastFetchTimestamp = Date.now();
          this.setInternalState(merged, false);
          return merged;
        }
      }
    } catch (err) {
      // Network failure or static host fallback
    }

    return this.currentState;
  }

  /**
   * Saves updated maintenance configuration to the shared backend endpoint
   * and broadcasts to all active tabs/devices.
   */
  async saveState(
    patch: Partial<MaintenanceState>,
    userEmail = 'Admin'
  ): Promise<{ success: boolean; state: MaintenanceState; error?: string }> {
    const nextState: MaintenanceState = {
      ...this.currentState,
      ...patch,
      updatedAt: new Date().toISOString(),
      updatedBy: userEmail,
      lastChangedTimestamp: Date.now(),
    };

    // 1. Update local & broadcast immediately for zero-latency UI feedback
    this.setInternalState(nextState, true);

    // 2. Persist to shared backend endpoint
    if (typeof window !== 'undefined') {
      try {
        const response = await fetch('/api/maintenance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(nextState),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          console.warn('[MaintenanceStore] Backend sync returned non-200, kept local fallback:', errData);
        }
      } catch (networkErr) {
        console.warn('[MaintenanceStore] Remote endpoint unreachable, persisted locally:', networkErr);
      }
    }

    return { success: true, state: nextState };
  }

  getState(): MaintenanceState {
    return this.currentState;
  }

  subscribe(listener: (state: MaintenanceState) => void): () => void {
    this.listeners.add(listener);
    // Initial call
    listener(this.currentState);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getLastFetchTimestamp(): number {
    return this.lastFetchTimestamp;
  }
}

export const MaintenanceStore = new MaintenanceStoreService();
