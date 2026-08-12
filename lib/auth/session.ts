// Server-side single-session helpers.
import { createClient } from '@/lib/supabase/server';

export type UserRole = 'student' | 'instructor' | 'coordinator' | 'admin' | 'super_admin';

export interface SessionUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_banned: boolean;
  must_change_password: boolean;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('users')
    .select('id, email, full_name, role, is_banned, must_change_password')
    .eq('id', user.id)
    .single();
  return data ?? null;
}

export function isAdminRole(role: UserRole): boolean {
  return role === 'admin' || role === 'super_admin';
}

export function isStaffRole(role: UserRole): boolean {
  return role === 'instructor' || role === 'coordinator' || isAdminRole(role);
}
