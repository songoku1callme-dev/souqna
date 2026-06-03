const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'validation.required';
  if (!EMAIL_RE.test(email.trim())) return 'validation.emailInvalid';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'validation.required';
  if (password.length < 8) return 'validation.passwordTooShort';
  return null;
}

export function validateRequired(value: string): string | null {
  return value.trim() ? null : 'validation.required';
}
