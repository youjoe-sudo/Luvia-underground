/**
 * Credential message helpers (spec §53).
 * Returns the rendered message text; does NOT log the password anywhere.
 */

export const DEFAULT_TEMP_PASSWORD = '12345678';
export const LOGIN_URL_FALLBACK = 'https://luvia.example.com/login';

export function buildCredentialMessage(args: {
  fullName: string;
  email: string;
  tempPassword: string;
  loginUrl?: string;
}): string {
  const loginUrl = args.loginUrl ?? LOGIN_URL_FALLBACK;
  return [
    `Welcome to Luvia, ${args.fullName}.`,
    '',
    'Your account has been created.',
    '',
    `Email: ${args.email}`,
    `Temporary Password: ${args.tempPassword}`,
    `Login: ${loginUrl}`,
    '',
    'For security, you will be required to change your password when you log in for the first time.',
  ].join('\n');
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  // Strip non-digit characters except '+' for the wa.me URL.
  const cleaned = phone.replace(/[^\d+]/g, '');
  return `https://wa.me/${cleaned.replace(/^\+/, '')}?text=${encodeURIComponent(message)}`;
}

export function buildMailtoUrl(email: string, subject: string, body: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}