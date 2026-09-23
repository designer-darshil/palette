/**
 * Centralized Administrative Password Policy & Cryptographic Validation
 * Enforces strict 8+ character minimum across all admin authentication flows.
 */

export interface PasswordPolicyConfig {
  minLength: number;
}

export const PASSWORD_POLICY: PasswordPolicyConfig = {
  minLength: 8,
};

export interface PasswordChecks {
  hasMinLength: boolean;
}

export interface PasswordValidationResult {
  isValid: boolean;
  checks: PasswordChecks;
  errors: string[];
  firstError: string | null;
}

/**
 * Validates an administrative password against the centralized policy (min 8 characters).
 * Returns detailed check statuses and descriptive human-readable errors.
 */
export function validateAdminPassword(password: string): PasswordValidationResult {
  const isString = typeof password === 'string';
  const hasMinLength = isString && password.trim().length >= PASSWORD_POLICY.minLength;

  const checks: PasswordChecks = {
    hasMinLength,
  };

  const errors: string[] = [];

  if (!hasMinLength) {
    errors.push('Password must be at least 8 characters.');
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    checks,
    errors,
    firstError: errors.length > 0 ? errors[0] : null,
  };
}
