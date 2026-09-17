/**
 * Centralized Administrative Password Policy & Cryptographic Validation
 * Enforces strict 12+ character NIST SP 800-63B aligned complexity.
 */

export interface PasswordPolicyConfig {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumber: boolean;
  requireSpecialCharacter: boolean;
}

export const PASSWORD_POLICY: PasswordPolicyConfig = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialCharacter: true,
};

// Robust single regex equivalent to all 5 requirements
export const PASSWORD_POLICY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/;

export interface PasswordChecks {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export interface PasswordValidationResult {
  isValid: boolean;
  checks: PasswordChecks;
  errors: string[];
  firstError: string | null;
}

/**
 * Validates a password against the administrative policy.
 * Returns detailed check statuses and descriptive human-readable errors.
 */
export function validateAdminPassword(password: string): PasswordValidationResult {
  const checks: PasswordChecks = {
    hasMinLength: typeof password === 'string' && password.length >= PASSWORD_POLICY.minLength,
    hasUppercase: /[A-Z]/.test(password || ''),
    hasLowercase: /[a-z]/.test(password || ''),
    hasNumber: /[0-9]/.test(password || ''),
    hasSpecial: /[^A-Za-z0-9]/.test(password || ''),
  };

  const errors: string[] = [];

  if (!checks.hasMinLength) {
    const currentLen = password ? password.length : 0;
    errors.push(`Password must contain at least ${PASSWORD_POLICY.minLength} characters (currently ${currentLen}).`);
  }
  if (!checks.hasUppercase) {
    errors.push('Password must contain at least one uppercase letter (A-Z).');
  }
  if (!checks.hasLowercase) {
    errors.push('Password must contain at least one lowercase letter (a-z).');
  }
  if (!checks.hasNumber) {
    errors.push('Password must contain at least one number (0-9).');
  }
  if (!checks.hasSpecial) {
    errors.push('Password must contain at least one special character (!@#$%^&* etc.).');
  }

  const isValid = errors.length === 0 && PASSWORD_POLICY_REGEX.test(password || '');

  return {
    isValid,
    checks,
    errors,
    firstError: errors.length > 0 ? errors[0] : null,
  };
}
