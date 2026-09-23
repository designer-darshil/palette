import React, { useState, useEffect } from 'react';
import { useMaintenance } from '../../context/MaintenanceContext';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { MAINTENANCE_PRESETS, MaintenancePreset } from '../../types/maintenance';
import { MaintenancePage } from '../MaintenancePage';
import { KromaButton } from '../../components/common/KromaButton';
import { KromaInput } from '../../components/common/KromaInput';
import {
  ShieldAlert,
  Power,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Eye,
  RefreshCw,
  ExternalLink,
  Sliders,
  History,
  Activity,
  Copy,
  Check,
  Radio,
  FileText,
} from 'lucide-react';

export const AdminMaintenancePage: React.FC = () => {
  const {
    state,
    status,
    isActive,
    isEndingSoon,
    remainingTime,
    updateMaintenance,
    toggleMaintenance,
    applyPreset,
    refresh,
    systemHealth,
  } = useMaintenance();

  const { isSuperAdmin, currentUser, activityLogs } = useAdminAuth();

  // Local form state for editing configuration
  const [formData, setFormData] = useState({
    title: state.title,
    message: state.message,
    scheduledStart: state.scheduledStart || '',
    scheduledEnd: state.scheduledEnd || '',
    estimatedReturn: state.estimatedReturn || '',
    showCountdown: state.showCountdown,
    supportUrl: state.supportUrl || '',
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Confirmation Modals
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<'enable' | 'disable' | null>(null);

  // Preview Modal
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Sync form state when remote/store state changes, provided no unsaved changes
  useEffect(() => {
    if (!hasUnsavedChanges) {
      setFormData({
        title: state.title,
        message: state.message,
        scheduledStart: state.scheduledStart ? new Date(state.scheduledStart).toISOString().slice(0, 16) : '',
        scheduledEnd: state.scheduledEnd ? new Date(state.scheduledEnd).toISOString().slice(0, 16) : '',
        estimatedReturn: state.estimatedReturn ? new Date(state.estimatedReturn).toISOString().slice(0, 16) : '',
        showCountdown: state.showCountdown,
        supportUrl: state.supportUrl || '',
      });
    }
  }, [state, hasUnsavedChanges]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
    setSaveSuccess(false);
  };

  const handleApplyPreset = (preset: MaintenancePreset) => {
    const now = new Date();
    const end = new Date(now.getTime() + preset.defaultDurationMinutes * 60 * 1000);

    const startIso = now.toISOString().slice(0, 16);
    const endIso = end.toISOString().slice(0, 16);

    setFormData({
      title: preset.title,
      message: preset.message,
      scheduledStart: startIso,
      scheduledEnd: endIso,
      estimatedReturn: endIso,
      showCountdown: true,
      supportUrl: state.supportUrl || 'mailto:support@kroma.design',
    });
    setHasUnsavedChanges(true);
  };

  const handleSaveChanges = async () => {
    if (!isSuperAdmin) return;
    setIsSaving(true);

    const patch = {
      title: formData.title,
      message: formData.message,
      scheduledStart: formData.scheduledStart ? new Date(formData.scheduledStart).toISOString() : null,
      scheduledEnd: formData.scheduledEnd ? new Date(formData.scheduledEnd).toISOString() : null,
      estimatedReturn: formData.estimatedReturn ? new Date(formData.estimatedReturn).toISOString() : null,
      showCountdown: formData.showCountdown,
      supportUrl: formData.supportUrl || null,
    };

    const res = await updateMaintenance(patch);
    setIsSaving(false);

    if (res.success) {
      setHasUnsavedChanges(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  const handleDiscardChanges = () => {
    setFormData({
      title: state.title,
      message: state.message,
      scheduledStart: state.scheduledStart ? new Date(state.scheduledStart).toISOString().slice(0, 16) : '',
      scheduledEnd: state.scheduledEnd ? new Date(state.scheduledEnd).toISOString().slice(0, 16) : '',
      estimatedReturn: state.estimatedReturn ? new Date(state.estimatedReturn).toISOString().slice(0, 16) : '',
      showCountdown: state.showCountdown,
      supportUrl: state.supportUrl || '',
    });
    setHasUnsavedChanges(false);
  };

  const handleToggleClick = (enable: boolean) => {
    setPendingAction(enable ? 'enable' : 'disable');
    setShowConfirmModal(true);
  };

  const handleConfirmToggle = async () => {
    if (pendingAction) {
      await toggleMaintenance(pendingAction === 'enable');
    }
    setShowConfirmModal(false);
    setPendingAction(null);
  };

  const handleCopyPreviewLink = () => {
    const url = `${window.location.origin}/?preview=maintenance`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Filter maintenance related logs
  const maintenanceLogs = activityLogs.filter(
    (log) =>
      log.action.toLowerCase().includes('maintenance') ||
      log.details.toLowerCase().includes('maintenance')
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#E63946', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
              SYSTEM CONTROLS
            </span>
            <span style={{ color: 'var(--border-strong)' }}>•</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
              PUBLIC ROUTE GUARD
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Maintenance Mode &amp; Access Controls
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '700px' }}>
            Temporarily restrict public library and creative studio access during upgrades while preserving full administrator control.
          </p>
        </div>

        {/* Quick Top Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <KromaButton
            type="button"
            variant="outline"
            size="sm"
            onClick={refresh}
            iconLeft={<RefreshCw size={13} />}
            style={{ fontSize: '0.75rem', padding: '6px 12px' }}
            title="Force refresh state from server"
          >
            Sync
          </KromaButton>

          <KromaButton
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowPreviewModal(true)}
            iconLeft={<Eye size={13} />}
            style={{ fontSize: '0.75rem', padding: '6px 12px' }}
          >
            Preview Screen
          </KromaButton>
        </div>
      </div>

      {/* ─── LIVE STATUS HERO CARD ─── */}
      <div
        style={{
          background: isActive
            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, var(--bg-surface-1) 100%)'
            : status === 'scheduled'
            ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, var(--bg-surface-1) 100%)'
            : 'var(--bg-surface-1)',
          border: `1px solid ${isActive ? '#EF4444' : status === 'scheduled' ? '#F59E0B' : 'var(--border-medium)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          boxShadow: 'var(--shadow-subtle)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: isActive ? '#EF4444' : status === 'scheduled' ? '#F59E0B' : '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: `0 0 20px ${isActive ? 'rgba(239, 68, 68, 0.4)' : status === 'scheduled' ? 'rgba(245, 158, 11, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
              }}
            >
              <Power size={22} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: isActive ? '#EF4444' : status === 'scheduled' ? '#F59E0B' : '#10B981',
                  }}
                >
                  {isActive
                    ? isEndingSoon
                      ? '● ACTIVE (ENDING SOON)'
                      : '● ACTIVE (PUBLIC SITE RESTRICTED)'
                    : status === 'scheduled'
                    ? '● SCHEDULED MAINTENANCE'
                    : '● PUBLIC SITE ONLINE'}
                </span>
              </div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '2px 0 0 0' }}>
                {isActive
                  ? 'Maintenance Mode is currently ACTIVE'
                  : status === 'scheduled'
                  ? 'Maintenance window is SCHEDULED'
                  : 'Public Website & Studios are OPERATIONAL'}
              </h2>
            </div>
          </div>

          {/* Toggle Control Button */}
          {isSuperAdmin ? (
            <div>
              {isActive ? (
                <KromaButton
                  type="button"
                  variant="filled"
                  size="sm"
                  onClick={() => handleToggleClick(false)}
                  iconLeft={<Power size={15} />}
                  style={{
                    background: '#10B981',
                    color: '#FFFFFF',
                    borderColor: '#10B981',
                    padding: '10px 20px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                  }}
                >
                  Disable Maintenance (Go Live)
                </KromaButton>
              ) : (
                <KromaButton
                  type="button"
                  variant="filled"
                  size="sm"
                  onClick={() => handleToggleClick(true)}
                  iconLeft={<Power size={15} />}
                  style={{
                    background: '#EF4444',
                    color: '#FFFFFF',
                    borderColor: '#EF4444',
                    padding: '10px 20px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)',
                  }}
                >
                  Enable Maintenance Now
                </KromaButton>
              )}
            </div>
          ) : (
            <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
              Super Admin role required to toggle maintenance
            </div>
          )}
        </div>

        {/* Status Meta Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
              Last Changed
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
              {new Date(state.lastChangedTimestamp || state.updatedAt).toLocaleString()}
            </div>
          </div>

          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
              Changed By
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
              {state.updatedBy || 'Super Admin'}
            </div>
          </div>

          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
              Countdown Clock
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: state.showCountdown ? '#10B981' : 'var(--text-tertiary)', marginTop: '2px' }}>
              {state.showCountdown ? 'Visible to visitors' : 'Hidden'}
            </div>
          </div>

          {remainingTime && !remainingTime.isExpired && (
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                Remaining Window
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: isEndingSoon ? '#F59E0B' : 'var(--color-primary)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                {remainingTime.hours}h {remainingTime.minutes}m {remainingTime.seconds}s
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── TWO COLUMN WORKSPACE ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 340px)', gap: '24px', alignItems: 'start' }}>
        {/* Left Column: Schedule & Configuration */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Section: Maintenance Message Presets */}
          <div className="admin-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Sparkles size={16} color="var(--color-primary)" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Message &amp; Duration Presets</h3>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Select a preset to automatically populate title, explanation, and estimated time window.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
              {MAINTENANCE_PRESETS.map((p) => (
                <KromaButton
                  key={p.id}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleApplyPreset(p)}
                  className="!h-auto !p-2.5 !flex-col !items-start !text-left"
                >
                  <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)' }}>{p.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{p.tagline}</div>
                </KromaButton>
              ))}
            </div>
          </div>

          {/* Section: Scheduling & Automated Expiration */}
          <div className="admin-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Clock size={16} color="#3B82F6" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Scheduled Window &amp; Auto-Expiration</h3>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Set start and end times. The system will automatically activate maintenance at the start time and automatically restore the public website at the end time.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label className="admin-form-label" style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Scheduled Start Time (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduledStart}
                  onChange={(e) => handleInputChange('scheduledStart', e.target.value)}
                  className="admin-input"
                  style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                />
              </div>

              <div>
                <label className="admin-form-label" style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Scheduled End / Auto-Expiration Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduledEnd}
                  onChange={(e) => handleInputChange('scheduledEnd', e.target.value)}
                  className="admin-input"
                  style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                />
              </div>
            </div>

            {/* Visual Schedule Timeline Bar */}
            {formData.scheduledStart && formData.scheduledEnd && (
              <div
                style={{
                  background: 'var(--bg-surface-2)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                  <span>START: {new Date(formData.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span>{isActive ? '● IN PROGRESS' : 'TIMELINE PREVIEW'}</span>
                  <span>END: {new Date(formData.scheduledEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <div style={{ width: '100%', height: '6px', background: 'var(--bg-surface-3)', borderRadius: '3px', position: 'relative', overflow: 'hidden' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: isActive ? '50%' : '100%',
                      background: isActive ? '#EF4444' : '#3B82F6',
                      borderRadius: '3px',
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section: Visitor Page Content Editor */}
          <div className="admin-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <FileText size={16} color="var(--color-primary)" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Public Maintenance Page Content</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <KromaInput
                label="Headline Title"
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="We'll be back shortly"
                variant="surface"
              />

              <div>
                <label className="admin-form-label" style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Detailed Message for Visitors
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  rows={3}
                  placeholder="Explain what is happening and when normal operations will resume..."
                  className="admin-input"
                  style={{ width: '100%', fontSize: '0.82rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <KromaInput
                  label="Support URL / Email"
                  type="text"
                  value={formData.supportUrl}
                  onChange={(e) => handleInputChange('supportUrl', e.target.value)}
                  placeholder="mailto:support@kroma.design"
                  variant="surface"
                  className="font-mono"
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '22px' }}>
                  <input
                    type="checkbox"
                    id="chk-countdown"
                    checked={formData.showCountdown}
                    onChange={(e) => handleInputChange('showCountdown', e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)' }}
                  />
                  <label htmlFor="chk-countdown" style={{ fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                    Show live countdown clock on maintenance page
                  </label>
                </div>
              </div>

              {/* Save / Discard Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--border-subtle)',
                  marginTop: '4px',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: hasUnsavedChanges ? '#F59E0B' : 'var(--text-tertiary)' }}>
                  {hasUnsavedChanges ? '● Unsaved configuration changes' : saveSuccess ? '✓ Configuration saved successfully' : 'Configuration synced'}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {hasUnsavedChanges && (
                    <KromaButton
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleDiscardChanges}
                      style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                    >
                      Discard
                    </KromaButton>
                  )}

                  <KromaButton
                    type="button"
                    variant="filled"
                    size="sm"
                    onClick={handleSaveChanges}
                    disabled={!hasUnsavedChanges || isSaving || !isSuperAdmin}
                    isLoading={isSaving}
                    style={{
                      fontSize: '0.78rem',
                      padding: '6px 16px',
                    }}
                  >
                    {isSaving ? 'Saving...' : 'Save Configuration'}
                  </KromaButton>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: System Health & Audit History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Live System Health Snapshot */}
          <div className="admin-card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Activity size={15} color="#10B981" />
              <h3 style={{ fontSize: '0.88rem', fontWeight: 700, margin: 0 }}>System Diagnostic Health</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Storage Persistence:</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: systemHealth.storageConnectivity === 'connected' ? '#10B981' : '#EF4444' }}>
                  ● {systemHealth.storageConnectivity.toUpperCase()}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Adapter Mode:</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                  {systemHealth.storageAdapter}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Public Route Guard:</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: '#10B981' }}>
                  ACTIVE (ENFORCED)
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Admin Bypass Protocol:</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>
                  ENABLED (/admin/*)
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Protected Library:</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                  {systemHealth.librarySpecimens.toLocaleString()} specimens
                </span>
              </div>
            </div>
          </div>

          {/* Quick Share / Preview Card */}
          <div className="admin-card" style={{ padding: '18px' }}>
            <h4 style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '8px' }}>Preview &amp; Share</h4>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Inspect the public maintenance screen or copy the authorized visitor preview link.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <KromaButton
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPreviewModal(true)}
                iconLeft={<Eye size={13} />}
                className="!w-full !justify-center"
                style={{ fontSize: '0.75rem' }}
              >
                Open Screen Modal Preview
              </KromaButton>

              <KromaButton
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyPreviewLink}
                iconLeft={copiedLink ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
                className="!w-full !justify-center"
                style={{ fontSize: '0.75rem' }}
              >
                {copiedLink ? 'Copied Preview URL' : 'Copy Preview Link'}
              </KromaButton>
            </div>
          </div>

          {/* Maintenance Audit History */}
          <div className="admin-card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <History size={15} color="var(--text-secondary)" />
              <h3 style={{ fontSize: '0.88rem', fontWeight: 700, margin: 0 }}>Maintenance Audit Log</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto' }}>
              {maintenanceLogs.length === 0 ? (
                <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', fontStyle: 'italic', padding: '8px 0' }}>
                  No recent maintenance changes logged.
                </div>
              ) : (
                maintenanceLogs.slice(0, 10).map((log) => (
                  <div
                    key={log.id}
                    style={{
                      padding: '8px 10px',
                      background: 'var(--bg-surface-2)',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700 }}>
                      <span style={{ color: log.action.includes('Enabled') ? '#EF4444' : log.action.includes('Disabled') ? '#10B981' : 'var(--text-primary)' }}>
                        {log.action}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)', fontSize: '0.65rem' }}>
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{log.details}</div>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>by {log.userEmail}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── CONFIRMATION MODAL ─── */}
      {showConfirmModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            className="admin-card"
            style={{
              maxWidth: '460px',
              width: '100%',
              padding: '24px',
              border: `1px solid ${pendingAction === 'enable' ? '#EF4444' : '#10B981'}`,
              boxShadow: 'var(--shadow-elevated)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: pendingAction === 'enable' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: pendingAction === 'enable' ? '#EF4444' : '#10B981',
                }}
              >
                <AlertTriangle size={18} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                {pendingAction === 'enable' ? 'Enable Maintenance Mode?' : 'Disable Maintenance Mode?'}
              </h3>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
              {pendingAction === 'enable'
                ? 'This will immediately hide the public PaletteParadise experience, library catalogs, and creative studios from normal visitors. Admin access will remain available at /admin.'
                : 'This will immediately restore full public access to all color specimens, palettes, harmonies, and creative studios across the global site.'}
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <KromaButton
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowConfirmModal(false)}
                style={{ fontSize: '0.8rem', padding: '8px 16px' }}
              >
                Cancel
              </KromaButton>

              <KromaButton
                type="button"
                variant="filled"
                size="sm"
                onClick={handleConfirmToggle}
                style={{
                  background: pendingAction === 'enable' ? '#EF4444' : '#10B981',
                  color: '#FFFFFF',
                  borderColor: pendingAction === 'enable' ? '#EF4444' : '#10B981',
                  padding: '8px 18px',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                }}
              >
                {pendingAction === 'enable' ? 'Yes, Enable Maintenance' : 'Yes, Restore Public Site'}
              </KromaButton>
            </div>
          </div>
        </div>
      )}

      {/* ─── PREVIEW MODAL ─── */}
      {showPreviewModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Preview Header */}
          <div
            style={{
              padding: '12px 24px',
              background: 'var(--bg-surface-1)',
              borderBottom: '1px solid var(--border-medium)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-wider">
                [ VISITOR SCREEN PREVIEW ]
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                This is exactly what public visitors will see when maintenance is active.
              </span>
            </div>

            <KromaButton
              type="button"
              variant="filled"
              size="sm"
              onClick={() => setShowPreviewModal(false)}
              style={{ fontSize: '0.75rem', padding: '6px 14px' }}
            >
              Close Preview
            </KromaButton>
          </div>

          {/* Embedded Maintenance Page Preview */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <MaintenancePage
              isPreview={true}
              onExitPreview={() => setShowPreviewModal(false)}
              onNavigateAdmin={() => setShowPreviewModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
