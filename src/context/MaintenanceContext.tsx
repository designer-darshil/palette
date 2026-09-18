import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  MaintenanceState,
  MaintenanceStatus,
  DEFAULT_MAINTENANCE_STATE,
  MAINTENANCE_PRESETS,
  SystemHealthSnapshot,
} from '../types/maintenance';
import {
  MaintenanceStore,
  isMaintenanceActive,
  getMaintenanceStatus,
  calculateRemainingTime,
} from '../services/maintenanceStore';
import { useAdminAuth } from './AdminAuthContext';
import { useLibraryData } from './LibraryDataContext';

interface MaintenanceContextType {
  state: MaintenanceState;
  status: MaintenanceStatus;
  isActive: boolean;
  isEndingSoon: boolean;
  remainingTime: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
    isExpired: boolean;
  } | null;
  previewMode: boolean;
  setPreviewMode: (val: boolean) => void;
  updateMaintenance: (patch: Partial<MaintenanceState>) => Promise<{ success: boolean; error?: string }>;
  toggleMaintenance: (enable: boolean) => Promise<{ success: boolean; error?: string }>;
  applyPreset: (presetId: string) => void;
  refresh: () => Promise<void>;
  systemHealth: SystemHealthSnapshot;
}

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined);

export const MaintenanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<MaintenanceState>(() => MaintenanceStore.getState());
  const [now, setNow] = useState<number>(Date.now());
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [adapterStatus, setAdapterStatus] = useState<'connected' | 'offline' | 'degraded'>('connected');

  // Safely consume admin context if available
  const adminAuth = useAdminAuth?.();
  const libraryData = useLibraryData?.();

  // Subscribe to MaintenanceStore updates across tabs / devices
  useEffect(() => {
    const unsubscribe = MaintenanceStore.subscribe((newState) => {
      setState(newState);
    });

    // Initial server fetch
    MaintenanceStore.fetchState()
      .then((s) => {
        setState(s);
        setAdapterStatus('connected');
      })
      .catch(() => {
        setAdapterStatus('degraded');
      });

    return () => {
      unsubscribe();
    };
  }, []);

  // 1-second interval to keep live countdown accurate
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Periodic revalidation against server endpoint (every 30 seconds)
  useEffect(() => {
    const pollTimer = setInterval(() => {
      MaintenanceStore.fetchState()
        .then((s) => {
          setState(s);
          setAdapterStatus('connected');
        })
        .catch(() => {
          setAdapterStatus('degraded');
        });
    }, 30000);

    return () => clearInterval(pollTimer);
  }, []);

  const isActive = useMemo(() => isMaintenanceActive(state, now), [state, now]);
  const status = useMemo(() => getMaintenanceStatus(state, now), [state, now]);
  const isEndingSoon = status === 'ending_soon';
  const remainingTime = useMemo(() => calculateRemainingTime(state, now), [state, now]);

  const updateMaintenance = useCallback(
    async (patch: Partial<MaintenanceState>) => {
      const userEmail = adminAuth?.currentUser?.email || 'Super Admin';
      const result = await MaintenanceStore.saveState(patch, userEmail);

      if (result.success) {
        setState(result.state);
        // Log action to admin activity history
        if (adminAuth?.logActivity) {
          if (patch.enabled !== undefined) {
            adminAuth.logActivity(
              patch.enabled ? 'Maintenance Enabled' : 'Maintenance Disabled',
              patch.enabled
                ? `Maintenance mode activated by ${userEmail}. Public site hidden.`
                : `Maintenance mode deactivated by ${userEmail}. Public site restored.`
            );
          } else if (patch.scheduledStart || patch.scheduledEnd) {
            adminAuth.logActivity(
              'Maintenance Scheduled',
              `Maintenance window configured: Start ${patch.scheduledStart || 'None'} to End ${patch.scheduledEnd || 'None'}`
            );
          } else {
            adminAuth.logActivity(
              'Maintenance Config Updated',
              `Updated maintenance message parameters: "${patch.title || state.title}"`
            );
          }
        }
      }

      return { success: result.success, error: result.error };
    },
    [adminAuth, state.title]
  );

  const toggleMaintenance = useCallback(
    async (enable: boolean) => {
      return updateMaintenance({ enabled: enable });
    },
    [updateMaintenance]
  );

  const applyPreset = useCallback(
    (presetId: string) => {
      const preset = MAINTENANCE_PRESETS.find((p) => p.id === presetId);
      if (!preset) return;

      const durationMs = preset.defaultDurationMinutes * 60 * 1000;
      const targetEnd = new Date(Date.now() + durationMs).toISOString();

      updateMaintenance({
        title: preset.title,
        message: preset.message,
        scheduledStart: new Date().toISOString(),
        scheduledEnd: targetEnd,
        estimatedReturn: targetEnd,
        showCountdown: true,
      });
    },
    [updateMaintenance]
  );

  const refresh = useCallback(async () => {
    try {
      const s = await MaintenanceStore.fetchState();
      setState(s);
      setAdapterStatus('connected');
    } catch {
      setAdapterStatus('degraded');
    }
  }, []);

  const systemHealth: SystemHealthSnapshot = useMemo(() => {
    const totalSpecimens =
      (libraryData?.colors?.length || 0) +
      (libraryData?.palettes?.length || 0) +
      (libraryData?.combos?.length || 0) +
      (libraryData?.gradients?.length || 0);

    return {
      storageConnectivity: adapterStatus,
      storageAdapter: typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'dev-middleware' : 'serverless-api',
      activeRole: adminAuth?.currentUser?.role || 'anonymous',
      userEmail: adminAuth?.currentUser?.email || 'Guest',
      librarySpecimens: totalSpecimens,
      lastSyncTimestamp: MaintenanceStore.getLastFetchTimestamp() || Date.now(),
      routeGuardActive: true,
    };
  }, [adapterStatus, adminAuth, libraryData]);

  return (
    <MaintenanceContext.Provider
      value={{
        state,
        status,
        isActive,
        isEndingSoon,
        remainingTime,
        previewMode,
        setPreviewMode,
        updateMaintenance,
        toggleMaintenance,
        applyPreset,
        refresh,
        systemHealth,
      }}
    >
      {children}
    </MaintenanceContext.Provider>
  );
};

export const useMaintenance = (): MaintenanceContextType => {
  const context = useContext(MaintenanceContext);
  if (!context) {
    throw new Error('useMaintenance must be used within a MaintenanceProvider');
  }
  return context;
};
