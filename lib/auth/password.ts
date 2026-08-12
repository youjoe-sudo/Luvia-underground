// Password rules for the temporary-password flow + change-password.
// The default password supplied by the admin (M@20252026) is a special
// case: we accept it only on the first login, then mark must_change_password.

export function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
  let out = '';
  for (let i = 0; i < 12; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export function isStrongPassword(pw: string): boolean {
  if (!pw || pw.length < 8) return false;
  if (pw.length > 72) return false; // bcrypt cap
  return (
    /[A-Z]/.test(pw) &&
    /[a-z]/.test(pw) &&
    /[0-9]/.test(pw) &&
    /[^A-Za-z0-9]/.test(pw)
  );
}
