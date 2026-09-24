import React, { useState, useEffect } from 'react';
import { useMaintenance } from '../../context/MaintenanceContext';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { MAINTENANCE_PRESETS } from '../../types/maintenance';
import { MaintenancePage } from '../MaintenancePage';
import { KromaButton } from '../../components/common/KromaButton';
import { KromaInput } from '../../components/common/KromaInput';
import {
  Power,
  AlertTriangle,
  Eye,
  Copy,
  Check,
  ShieldCheck,
  Globe,
  Lock,
  Unlock,
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
  } = useMaintenance();

  const { isSuperAdmin, currentUser } = useAdminAuth();

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

  // Confirmation & Preview modals
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'enable' | 'disable' | null>(null);
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

  const handleApplyPreset = (preset: typeof MAINTENANCE_PRESETS[number]) => {
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
      supportUrl: state.supportUrl || '',
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

  return (
    <div className="flex flex-col gap-10 max-w-2xl">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary leading-tight">
          Maintenance &amp; Access Controls
        </h1>
        <p className="text-sm text-text-secondary mt-2 max-w-lg leading-relaxed">
          Manage system maintenance states, configure public route guard behavior, and inspect administrator access rules.
        </p>
      </div>

      {/* ── Status & Primary Action ── */}
      <section className="pb-8 border-b border-border-subtle">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-tertiary mb-2">
              SYSTEM STATUS
            </div>
            <div className="flex items-center gap-2.5">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  isActive ? 'bg-kroma-red' : 'bg-kroma-green'
                }`}
              />
              <span className="text-lg font-bold text-text-primary tracking-tight">
                {isActive
                  ? isEndingSoon
                    ? 'Maintenance Active — Ending Soon'
                    : 'Maintenance Active'
                  : status === 'scheduled'
                  ? 'Scheduled'
                  : 'Online — Public Accessible'}
              </span>
            </div>

            {/* Remaining time */}
            {isActive && remainingTime && !remainingTime.isExpired && (
              <div className="text-xs text-text-tertiary font-mono mt-1.5">
                {remainingTime.hours}h {remainingTime.minutes}m {remainingTime.seconds}s remaining
              </div>
            )}

            {/* Last changed info */}
            <div className="text-xs text-text-tertiary mt-2">
              Last modified {new Date(state.lastChangedTimestamp || state.updatedAt).toLocaleString()}
              {state.updatedBy && ` by ${state.updatedBy}`}
            </div>
          </div>

          {/* Toggle Button */}
          {isSuperAdmin ? (
            <div className="shrink-0">
              {isActive ? (
                <KromaButton
                  variant="filled"
                  size="md"
                  onClick={() => handleToggleClick(false)}
                  iconLeft={<Power size={15} />}
                  className="!bg-kroma-green !border-kroma-green !text-white"
                >
                  Restore Public Site
                </KromaButton>
              ) : (
                <KromaButton
                  variant="filled"
                  size="md"
                  onClick={() => handleToggleClick(true)}
                  iconLeft={<Power size={15} />}
                  className="!bg-kroma-red !border-kroma-red !text-white"
                >
                  Enable Maintenance
                </KromaButton>
              )}
            </div>
          ) : (
            <div className="text-xs text-text-tertiary italic">
              Super Admin role required to toggle
            </div>
          )}
        </div>
      </section>

      {/* ── Access Controls & Route Guard ── */}
      <section className="flex flex-col gap-4 pb-8 border-b border-border-subtle">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-tertiary">
          ACCESS CONTROLS &amp; ROUTE GUARD
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Public Traffic Guard */}
          <div className="p-3.5 bg-surface-2 border border-border-subtle rounded-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono font-medium text-text-primary flex items-center gap-1.5">
                  <Globe size={13} className="text-text-tertiary" />
                  Public Traffic Guard
                </span>
                <span className={`text-xs font-mono px-2 py-0.5 rounded-xs uppercase tracking-wider font-semibold ${
                  isActive
                    ? 'bg-kroma-red/10 text-kroma-red border border-kroma-red/20'
                    : 'bg-kroma-green/10 text-kroma-green border border-kroma-green/20'
                }`}>
                  {isActive ? 'Restricted' : 'Open'}
                </span>
              </div>
              <p className="text-xs text-text-tertiary leading-relaxed">
                {isActive
                  ? 'All public endpoints redirect to maintenance holding screen.'
                  : 'Public library, palettes, and studio surfaces are open to all visitors.'}
              </p>
            </div>
          </div>

          {/* Admin Bypass Rule */}
          <div className="p-3.5 bg-surface-2 border border-border-subtle rounded-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono font-medium text-text-primary flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-text-tertiary" />
                  Admin Route Bypass
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-xs uppercase tracking-wider font-semibold bg-surface-3 text-text-primary border border-border-subtle">
                  Always Active
                </span>
              </div>
              <p className="text-xs text-text-tertiary leading-relaxed">
                <span className="font-mono text-xs">/admin/*</span> routes remain accessible for authenticated staff.
              </p>
            </div>
          </div>
        </div>

        {/* Current Authorization Status */}
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-surface-2 border border-border-subtle rounded-xs text-xs">
          <div className="flex items-center gap-2 text-text-secondary truncate">
            {isSuperAdmin ? (
              <Unlock size={13} className="text-kroma-green shrink-0" />
            ) : (
              <Lock size={13} className="text-kroma-orange shrink-0" />
            )}
            <span className="truncate">
              Signed in as <span className="font-mono text-text-primary font-medium">{currentUser?.email || 'Staff'}</span>
            </span>
          </div>
          <span className="text-[11px] font-mono text-text-tertiary shrink-0 ml-3">
            {isSuperAdmin ? 'Full Edit & Toggle' : 'View Only'}
          </span>
        </div>
      </section>

      {/* ── Configuration ── */}
      <section className="flex flex-col gap-6">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-tertiary mb-3">
            PRESETS
          </div>

          {/* Presets */}
          <div className="flex flex-wrap gap-1.5 mb-6">
            {MAINTENANCE_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="px-2.5 py-1.5 text-xs text-text-secondary hover:text-text-primary bg-surface-2 hover:bg-surface-3 border border-border-subtle rounded-xs transition-colors"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Form Fields */}
        <div className="flex flex-col gap-5">
          <KromaInput
            label="Headline Title"
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="We'll be back shortly"
            variant="surface"
          />

          <div className="flex flex-col gap-1.5">
            <label className="block text-xs font-mono font-medium text-text-secondary uppercase tracking-wider select-none">
              Message
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              rows={3}
              placeholder="Explain what is happening and when normal operations will resume..."
              className="w-full px-3.5 py-2.5 text-sm bg-surface-2 border border-border-medium text-text-primary placeholder:text-text-tertiary rounded-xs focus:outline-none focus:border-text-primary focus:ring-1 focus:ring-text-primary/20 resize-vertical"
            />
          </div>

          <KromaInput
            label="Support URL / Email"
            type="text"
            value={formData.supportUrl}
            onChange={(e) => handleInputChange('supportUrl', e.target.value)}
            placeholder="mailto:designers.scrillo@gmail.com"
            variant="surface"
            className="font-mono"
          />
        </div>

        {/* Schedule */}
        <div className="pt-4 border-t border-border-subtle">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-tertiary mb-3">
            SCHEDULE
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="block text-xs font-mono font-medium text-text-secondary uppercase tracking-wider select-none">
                Start Time
              </label>
              <input
                type="datetime-local"
                value={formData.scheduledStart}
                onChange={(e) => handleInputChange('scheduledStart', e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono bg-surface-2 border border-border-medium text-text-primary rounded-xs focus:outline-none focus:border-text-primary"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="block text-xs font-mono font-medium text-text-secondary uppercase tracking-wider select-none">
                End Time
              </label>
              <input
                type="datetime-local"
                value={formData.scheduledEnd}
                onChange={(e) => handleInputChange('scheduledEnd', e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono bg-surface-2 border border-border-medium text-text-primary rounded-xs focus:outline-none focus:border-text-primary"
              />
            </div>
          </div>

          <label className="flex items-center gap-2.5 mt-4 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={formData.showCountdown}
              onChange={(e) => handleInputChange('showCountdown', e.target.checked)}
              className="w-4 h-4 rounded-xs accent-kroma-red"
            />
            <span className="text-sm text-text-secondary">
              Show live countdown on maintenance page
            </span>
          </label>
        </div>
      </section>

      {/* ── Preview & Bypass Link ── */}
      <section className="flex items-center gap-3 pt-6 border-t border-border-subtle">
        <KromaButton
          variant="outline"
          size="sm"
          onClick={() => setShowPreviewModal(true)}
          iconLeft={<Eye size={14} />}
        >
          Preview Screen
        </KromaButton>
        <KromaButton
          variant="outline"
          size="sm"
          onClick={handleCopyPreviewLink}
          iconLeft={copiedLink ? <Check size={14} className="text-kroma-green" /> : <Copy size={14} />}
        >
          {copiedLink ? 'Copied' : 'Copy Preview Link'}
        </KromaButton>
      </section>

      {/* ── Save / Discard Bar ── */}
      <section className="flex items-center justify-between pt-6 border-t border-border-subtle">
        <div className="text-xs text-text-tertiary">
          {hasUnsavedChanges
            ? <span className="text-kroma-orange font-medium">● Unsaved changes</span>
            : saveSuccess
            ? <span className="text-kroma-green font-medium">✓ Saved</span>
            : 'Configuration synced'}
        </div>
        <div className="flex gap-2">
          {hasUnsavedChanges && (
            <KromaButton variant="outline" size="sm" onClick={handleDiscardChanges}>
              Discard
            </KromaButton>
          )}
          <KromaButton
            variant="filled"
            size="sm"
            onClick={handleSaveChanges}
            disabled={!hasUnsavedChanges || isSaving || !isSuperAdmin}
            isLoading={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </KromaButton>
        </div>
      </section>

      {/* ── Confirmation Modal ── */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-1 border border-border-medium rounded-xs max-w-md w-full p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle
                size={20}
                className={pendingAction === 'enable' ? 'text-kroma-red' : 'text-kroma-green'}
              />
              <h3 className="text-lg font-bold text-text-primary">
                {pendingAction === 'enable' ? 'Enable Maintenance Mode?' : 'Disable Maintenance Mode?'}
              </h3>
            </div>

            <p className="text-sm text-text-secondary leading-relaxed mb-6">
              {pendingAction === 'enable'
                ? 'This will immediately hide the public website from visitors. Admin access at /admin will remain available.'
                : 'This will immediately restore full public access to the website.'}
            </p>

            <div className="flex justify-end gap-2">
              <KromaButton
                variant="outline"
                size="sm"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </KromaButton>
              <KromaButton
                variant="filled"
                size="sm"
                onClick={handleConfirmToggle}
                className={
                  pendingAction === 'enable'
                    ? '!bg-kroma-red !border-kroma-red !text-white'
                    : '!bg-kroma-green !border-kroma-green !text-white'
                }
              >
                {pendingAction === 'enable' ? 'Enable Maintenance' : 'Restore Public Site'}
              </KromaButton>
            </div>
          </div>
        </div>
      )}

      {/* ── Preview Modal ── */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex flex-col">
          <div className="shrink-0 flex items-center justify-between px-5 py-3 bg-surface-1 border-b border-border-medium">
            <span className="text-xs font-mono font-semibold text-kroma-orange uppercase tracking-wider">
              Visitor Preview
            </span>
            <KromaButton
              variant="filled"
              size="sm"
              onClick={() => setShowPreviewModal(false)}
            >
              Close Preview
            </KromaButton>
          </div>
          <div className="flex-1 overflow-y-auto">
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
