// Service-role client. SERVER-ONLY. Never import from a client component.
// Use for admin-only RPCs (admin_create_user, etc.) that bypass RLS.
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types/database';

// Widened to `any` — see lib/supabase/server.ts for the rationale.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ServiceDatabaseClient = any;

export function createServiceClient(): ServiceDatabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createClient<any>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any;
}
