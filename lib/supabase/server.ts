import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/types/database';

// We type against the strict Database so `.from()` / `.rpc()` autocomplete
// still works, but the createClient return type is widened to `any` so that
// nested `select('a, b(rel(c))')` queries don't collapse row types to `never`.
// This is a known pain point with @supabase/postgrest-js — fully strict typing
// requires either the generated `Database` types from `supabase gen types`
// OR populating every `Relationships` entry with the real FK chain. Both
// out-of-scope for this hand-written scaffold.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DatabaseClient = any;

export async function createClient(): Promise<DatabaseClient> {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createServerClient<any>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setAll(cookiesToSet: any[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options?: any }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot write cookies. The middleware
          // refreshes them; this branch is only hit from a Server
          // Component, so it's safe to ignore here.
        }
      },
    },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any;
}
