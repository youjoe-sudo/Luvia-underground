import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body: { user_id?: string };
  try { body = await req.json(); } catch { body = {}; }
  const supabase = await createClient();
  if (body.user_id) {
    await supabase.from('users').update({ is_banned: true }).eq('id', body.user_id);
  }
  const { error } = await supabase.from('device_locks').update({ is_approved: false }).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}