import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  let body: { email?: string; password?: string; fingerprint?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  const { email, password, fingerprint } = body;
  if (!email || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user || !data.session) {
    return NextResponse.json({ error: error?.message ?? 'Sign-in failed' }, { status: 401 });
  }

  // Mint a server-side session. The user is now authenticated, so we
  // can call the SECURITY DEFINER RPC directly on the user-scoped
  // client. If this fails, the client will retry on mount.
  let sessionId: string | null = null;
  try {
    const { data: sid } = await supabase.rpc('start_session', {
      p_fingerprint: fingerprint ?? 'unknown',
    });
    sessionId = (sid as unknown as string) ?? null;
  } catch {
    sessionId = null;
  }

  const mustChangePassword = data.user.user_metadata?.must_change_password === true;

  return NextResponse.json({
    user: { id: data.user.id, email: data.user.email },
    sessionId,
    mustChangePassword,
  });
}