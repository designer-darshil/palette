import React, { useState } from 'react';
import { ShieldCheck, KeyRound, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { validateAdminPassword } from '../../utils/passwordPolicy';
import { KromaButton } from '../../components/common/KromaButton';

export const AdminSecurityPage: React.FC = () => {
  const { currentUser, changePassword, isSuperAdmin } = useAdminAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const validation = validateAdminPassword(newPassword);
  const hasMinLength = validation.checks.hasMinLength;
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!currentPassword) {
      setStatusMessage({ type: 'error', text: 'Current password is required.' });
      return;
    }

    if (!hasMinLength) {
      setStatusMessage({ type: 'error', text: 'Password must be at least 8 characters.' });
      return;
    }

    if (!passwordsMatch) {
      setStatusMessage({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    setLoading(true);
    const res = await changePassword(currentPassword, newPassword);
    setLoading(false);

    if (res.success) {
      setStatusMessage({
        type: 'success',
        text: 'Super Admin master credentials updated and cryptographic salt regenerated successfully.',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setStatusMessage({
        type: 'error',
        text: res.error || 'Password update failed. Verify current credentials.',
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#171717] dark:text-[#F8F8F8]">
          Security &amp; Account Control
        </h1>
        <p className="text-xs text-[#707070] dark:text-[#9DA3AF] mt-1 font-mono">
          Manage administrative credentials, cryptographic key salting, and Super Admin authorization.
        </p>
      </div>

      {/* Account Overview Capsule */}
      <div className="p-5 bg-white dark:bg-[#111216] border border-black/10 dark:border-white/10 rounded-xs flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xs bg-[#FF3B30]/10 text-[#FF3B30] flex items-center justify-center shrink-0 border border-[#FF3B30]/20">
            <ShieldCheck size={18} />
          </div>
          <div>
            <div className="font-mono text-[10px] text-[#707070] dark:text-[#9DA3AF] uppercase tracking-wider font-semibold">
              SUPER ADMIN IDENTITY
            </div>
            <div className="text-sm font-bold text-[#171717] dark:text-[#F8F8F8]">
              {currentUser?.email}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-black/5 dark:border-white/5 font-mono text-xs">
          <div className="p-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/5 dark:border-white/5 rounded-xs">
            <div className="text-[10px] text-[#707070] dark:text-[#9DA3AF] uppercase">ROLE STATUS</div>
            <div className="text-xs font-bold text-[#FF3B30] uppercase mt-0.5">
              {currentUser?.role.replace('_', ' ')}
            </div>
          </div>
          <div className="p-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/5 dark:border-white/5 rounded-xs">
            <div className="text-[10px] text-[#707070] dark:text-[#9DA3AF] uppercase">CRYPTOGRAPHIC SCHEME</div>
            <div className="text-xs font-bold text-[#34C759] mt-0.5">SHA-256 + 16B Salt</div>
          </div>
        </div>
      </div>

      {/* Change Password Form */}
      <div className="p-5 bg-white dark:bg-[#111216] border border-black/10 dark:border-white/10 rounded-xs flex flex-col gap-5">
        <div className="flex items-center gap-2 pb-3 border-b border-black/10 dark:border-white/10">
          <KeyRound size={16} className="text-[#FF9500]" />
          <h2 className="text-sm font-bold tracking-tight text-[#171717] dark:text-[#F8F8F8]">
            Change Super Admin Password
          </h2>
        </div>

        {/* Feedback Message */}
        {statusMessage && (
          <div
            role="alert"
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs rounded-xs font-mono border ${
              statusMessage.type === 'success'
                ? 'bg-[#34C759]/10 text-[#34C759] border-[#34C759]/20'
                : 'bg-[#FF3B30]/10 text-[#FF3B30] border-[#FF3B30]/20'
            }`}
          >
            {statusMessage.type === 'success' ? <Check size={14} className="shrink-0" /> : <AlertCircle size={14} className="shrink-0" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-mono font-medium text-[#707070] dark:text-[#9DA3AF] mb-1 uppercase tracking-wider">
              Current Password
            </label>
            <div className="relative flex items-center">
              <input
                type={showCurrent ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3.5 py-2 pr-10 bg-black/[0.03] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 rounded-xs text-xs text-[#171717] dark:text-[#F8F8F8] placeholder-[#707070] focus:outline-none focus:border-[#171717] dark:focus:border-[#F8F8F8]"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                aria-label={showCurrent ? 'Hide password' : 'Show password'}
                className="absolute right-3 text-[#707070] hover:text-[#171717] dark:hover:text-[#F8F8F8] p-1"
              >
                {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-mono font-medium text-[#707070] dark:text-[#9DA3AF] mb-1 uppercase tracking-wider">
              New Password
            </label>
            <div className="relative flex items-center">
              <input
                type={showNew ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2 pr-10 bg-black/[0.03] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 rounded-xs text-xs text-[#171717] dark:text-[#F8F8F8] placeholder-[#707070] focus:outline-none focus:border-[#171717] dark:focus:border-[#F8F8F8]"
                placeholder="Minimum 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                aria-label={showNew ? 'Hide password' : 'Show password'}
                className="absolute right-3 text-[#707070] hover:text-[#171717] dark:hover:text-[#F8F8F8] p-1"
              >
                {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-xs font-mono font-medium text-[#707070] dark:text-[#9DA3AF] mb-1 uppercase tracking-wider">
              Confirm New Password
            </label>
            <div className="relative flex items-center">
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2 pr-10 bg-black/[0.03] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 rounded-xs text-xs text-[#171717] dark:text-[#F8F8F8] placeholder-[#707070] focus:outline-none focus:border-[#171717] dark:focus:border-[#F8F8F8]"
                placeholder="Repeat new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
                className="absolute right-3 text-[#707070] hover:text-[#171717] dark:hover:text-[#F8F8F8] p-1"
              >
                {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Live 8-Char Policy Checklist */}
          <div className="p-3 bg-black/[0.02] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xs text-xs space-y-1.5 font-mono">
            <div
              className={`flex items-center gap-2 transition-colors ${
                hasMinLength ? 'text-[#34C759]' : 'text-[#707070] dark:text-[#9DA3AF]'
              }`}
            >
              <Check size={13} className={hasMinLength ? 'opacity-100' : 'opacity-30'} />
              <span>8 characters minimum</span>
            </div>

            {confirmPassword.length > 0 && (
              <div
                className={`flex items-center gap-2 transition-colors ${
                  passwordsMatch ? 'text-[#34C759]' : 'text-[#FF3B30]'
                }`}
              >
                <Check size={13} className={passwordsMatch ? 'opacity-100' : 'opacity-30'} />
                <span>{passwordsMatch ? 'Passwords match' : 'Passwords must match'}</span>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="pt-2">
            <KromaButton
              type="submit"
              disabled={loading || !hasMinLength || !passwordsMatch || !currentPassword}
              isLoading={loading}
              variant="filled"
              size="md"
              className="w-full"
            >
              {loading ? 'Re-salting & Updating...' : 'Update Master Password'}
            </KromaButton>
          </div>
        </form>
      </div>
    </div>
  );
};
