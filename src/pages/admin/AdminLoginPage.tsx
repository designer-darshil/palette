import React, { useState } from 'react';
import { Eye, EyeOff, Check, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { RouteType } from '../../types';
import { SEOHead } from '../../components/seo/SEOHead';
import { KromaButton } from '../../components/common/KromaButton';
import { validateAdminPassword, PASSWORD_POLICY } from '../../utils/passwordPolicy';

interface AdminLoginPageProps {
  returnTab?: string;
  onNavigatePublic: (route: RouteType) => void;
  onLoginSuccess: (returnTab?: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  returnTab,
  onNavigatePublic,
  onLoginSuccess,
}) => {
  const { login, needsInitialSetup, setupInitialMasterPassword } = useAdminAuth();
  const [email, setEmail] = useState('darshilbhuva4322@gmail.com');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Mode: if system needs setup, defaults to setup; otherwise standard sign in
  const [isSetupMode, setIsSetupMode] = useState(needsInitialSetup);

  const validation = validateAdminPassword(password);
  const hasMinLength = validation.checks.hasMinLength;
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isSetupMode) {
      if (!hasMinLength) {
        setError('Password must be at least 8 characters.');
        return;
      }
      if (!passwordsMatch) {
        setError('Passwords do not match.');
        return;
      }

      setLoading(true);
      try {
        const setupRes = await setupInitialMasterPassword(password);
        if (!setupRes.success) {
          setError(setupRes.error || 'Unable to set up your password. Please try again.');
          setLoading(false);
          return;
        }

        const loginRes = await login(password, email);
        setLoading(false);
        if (loginRes.success) {
          onLoginSuccess(returnTab);
        } else {
          setError(loginRes.error || 'Setup completed, please sign in.');
        }
      } catch {
        setLoading(false);
        setError('Unable to set up your password. Please try again.');
      }
      return;
    }

    if (password.length < PASSWORD_POLICY.minLength) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(password, email);
      setLoading(false);

      if (res.success) {
        onLoginSuccess(returnTab);
      } else {
        setError(res.error || 'Unable to sign in. Check your credentials and try again.');
      }
    } catch {
      setLoading(false);
      setError('Unable to sign in. Check your credentials and try again.');
    }
  };

  return (
    <div className="admin-login-wrapper min-h-[100dvh] w-full flex flex-col lg:flex-row bg-[#F8F8F8] dark:bg-[#090A0C] text-[#171717] dark:text-[#F8F8F8]">
      <SEOHead
        title={isSetupMode ? 'Set Password | Kroma Admin Studio' : 'Sign In | Kroma Admin Studio'}
        description="Restricted administrative studio for Kroma Color Operations."
        canonicalPath="/admin"
        noindex={true}
        nofollow={true}
      />

      {/* LEFT: Architectural Kroma Color Study Composition */}
      <section
        className="relative lg:w-1/2 min-h-[280px] lg:min-h-[100dvh] p-6 lg:p-14 flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-black/10 dark:border-white/10"
        style={{ backgroundColor: '#111216' }}
        aria-label="Kroma Color Study"
      >
        {/* Top Studio Label */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF3B30]" />
            <span className="font-mono text-xs uppercase tracking-[0.16em] text-white/80 font-medium">
              Kroma Color Operations
            </span>
          </div>
          <span className="font-mono text-xs text-white/40 tracking-wider">
            STUDY · 06 SPECTRUM
          </span>
        </div>

        {/* Chromatic Grid Composition (Solid Color Blocks, no gradient wash) */}
        <div className="relative z-10 my-8 lg:my-auto grid grid-cols-3 gap-3 max-w-[420px] w-full mx-auto">
          <div className="group flex flex-col gap-2">
            <div
              className="h-28 lg:h-36 rounded-xs transition-transform duration-300 motion-reduce:transform-none hover:scale-[1.02]"
              style={{ backgroundColor: '#FF3B30' }}
            />
            <div className="flex justify-between font-mono text-xs text-white/60">
              <span>RED</span>
              <span>#FF3B30</span>
            </div>
          </div>

          <div className="group flex flex-col gap-2">
            <div
              className="h-28 lg:h-36 rounded-xs transition-transform duration-300 motion-reduce:transform-none hover:scale-[1.02]"
              style={{ backgroundColor: '#FF9500' }}
            />
            <div className="flex justify-between font-mono text-xs text-white/60">
              <span>ORANGE</span>
              <span>#FF9500</span>
            </div>
          </div>

          <div className="group flex flex-col gap-2">
            <div
              className="h-28 lg:h-36 rounded-xs transition-transform duration-300 motion-reduce:transform-none hover:scale-[1.02]"
              style={{ backgroundColor: '#FFD60A' }}
            />
            <div className="flex justify-between font-mono text-xs text-white/60">
              <span>YELLOW</span>
              <span>#FFD60A</span>
            </div>
          </div>

          <div className="group flex flex-col gap-2">
            <div
              className="h-28 lg:h-36 rounded-xs transition-transform duration-300 motion-reduce:transform-none hover:scale-[1.02]"
              style={{ backgroundColor: '#34C759' }}
            />
            <div className="flex justify-between font-mono text-xs text-white/60">
              <span>GREEN</span>
              <span>#34C759</span>
            </div>
          </div>

          <div className="group flex flex-col gap-2">
            <div
              className="h-28 lg:h-36 rounded-xs transition-transform duration-300 motion-reduce:transform-none hover:scale-[1.02]"
              style={{ backgroundColor: '#00AEEF' }}
            />
            <div className="flex justify-between font-mono text-xs text-white/60">
              <span>BLUE</span>
              <span>#00AEEF</span>
            </div>
          </div>

          <div className="group flex flex-col gap-2">
            <div
              className="h-28 lg:h-36 rounded-xs transition-transform duration-300 motion-reduce:transform-none hover:scale-[1.02]"
              style={{ backgroundColor: '#7B2CBF' }}
            />
            <div className="flex justify-between font-mono text-xs text-white/60">
              <span>PURPLE</span>
              <span>#7B2CBF</span>
            </div>
          </div>
        </div>

        {/* Footer Technical Note */}
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center text-white/50 text-xs font-mono gap-2 pt-4 border-t border-white/10">
          <span>CHROMATIC SPECIMEN WORKSPACE</span>
          <span>CALIBRATED SRGB / OKLCH GAMUT</span>
        </div>
      </section>

      {/* RIGHT: Studio Access Workspace (Sign In / Set Password) */}
      <section className="lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-16 xl:p-20 overflow-y-auto">
        {/* Top Status & Public Link */}
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-2 text-xs font-mono text-[#707070] dark:text-[#9DA3AF]">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#34C759]" />
            <span>OPERATIONAL</span>
          </div>

          <KromaButton
            variant="ghost"
            size="sm"
            onClick={() => onNavigatePublic({ path: 'home' })}
            iconLeft={<ArrowLeft size={13} />}
            className="!text-xs text-[#707070] hover:text-[#171717] dark:hover:text-[#F8F8F8]"
          >
            Public Library
          </KromaButton>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-[400px] mx-auto my-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="text-xs font-mono font-semibold uppercase tracking-[0.14em] text-[#707070] dark:text-[#9DA3AF] mb-1.5">
              Kroma Admin Studio
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171717] dark:text-[#F8F8F8]">
              {isSetupMode ? 'Set Password' : 'Sign In'}
            </h1>
            <p className="text-sm text-[#707070] dark:text-[#9DA3AF] mt-2 leading-relaxed">
              {isSetupMode
                ? 'Create a secure password for your Kroma admin account.'
                : 'Authenticate with verified administrative credentials to enter the workspace.'}
            </p>
          </div>

          {/* Compact Inline Error Feedback */}
          {error && (
            <div
              role="alert"
              className="flex items-center gap-2 px-3 py-2.5 mb-6 text-xs text-[#FF3B30] bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-xs"
            >
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email Field */}
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-mono font-medium text-[#707070] dark:text-[#9DA3AF] mb-1.5 uppercase tracking-wider"
              >
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                disabled={isSetupMode && needsInitialSetup}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-[#111216] border border-black/15 dark:border-white/15 rounded-xs text-sm text-[#171717] dark:text-[#F8F8F8] placeholder-[#707070] focus:outline-none focus:border-[#171717] dark:focus:border-[#F8F8F8] transition-colors"
                placeholder="admin@kroma.design"
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-mono font-medium text-[#707070] dark:text-[#9DA3AF] uppercase tracking-wider"
                >
                  {isSetupMode ? 'New Password' : 'Password'}
                </label>
              </div>
              <div className="relative flex items-center">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete={isSetupMode ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 pr-10 bg-white dark:bg-[#111216] border border-black/15 dark:border-white/15 rounded-xs text-sm text-[#171717] dark:text-[#F8F8F8] placeholder-[#707070] focus:outline-none focus:border-[#171717] dark:focus:border-[#F8F8F8] transition-colors"
                  placeholder={isSetupMode ? 'At least 8 characters' : 'Enter password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 text-[#707070] hover:text-[#171717] dark:hover:text-[#F8F8F8] transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Set Password Mode: Confirm Password & 8-Char Live Indicator */}
            {isSetupMode && (
              <>
                <div>
                  <label
                    htmlFor="admin-confirm-password"
                    className="block text-xs font-mono font-medium text-[#707070] dark:text-[#9DA3AF] mb-1.5 uppercase tracking-wider"
                  >
                    Confirm Password
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="admin-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 pr-10 bg-white dark:bg-[#111216] border border-black/15 dark:border-white/15 rounded-xs text-sm text-[#171717] dark:text-[#F8F8F8] placeholder-[#707070] focus:outline-none focus:border-[#171717] dark:focus:border-[#F8F8F8] transition-colors"
                      placeholder="Repeat new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      className="absolute right-3 text-[#707070] hover:text-[#171717] dark:hover:text-[#F8F8F8] transition-colors p-1"
                    >
                      {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Live Policy Validation Indicator */}
                <div className="p-3 bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xs text-xs space-y-1.5 font-mono">
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
              </>
            )}

            {/* Action Button */}
            <div className="pt-2">
              <KromaButton
                type="submit"
                disabled={loading || (isSetupMode && (!hasMinLength || !passwordsMatch))}
                isLoading={loading}
                variant="filled"
                size="md"
                className="w-full"
              >
                {loading
                  ? 'Processing...'
                  : isSetupMode
                  ? 'Set Password'
                  : 'Sign In'}
              </KromaButton>
            </div>
          </form>

          {/* Toggle between Sign In and Set Password if not strictly forced by first-time setup */}
          {!needsInitialSetup && (
            <div className="text-center mt-6 pt-5 border-t border-black/10 dark:border-white/10">
              <button
                type="button"
                onClick={() => {
                  setIsSetupMode(!isSetupMode);
                  setError(null);
                  setPassword('');
                  setConfirmPassword('');
                }}
                className="text-xs font-mono text-[#707070] dark:text-[#9DA3AF] hover:text-[#171717] dark:hover:text-[#F8F8F8] transition-colors underline-offset-4 hover:underline"
              >
                {isSetupMode ? 'Already have password? Sign In' : 'Reset / Set Admin Password'}
              </button>
            </div>
          )}
        </div>

        {/* Footer System Info */}
        <div className="text-center text-xs font-mono text-[#707070] dark:text-[#9DA3AF] mt-10">
          KROMA COLOR OPERATIONS · INTERNAL SYSTEM v2.4
        </div>
      </section>
    </div>
  );
};
