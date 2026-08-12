import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  let body: { title?: string; description?: string; is_active?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  if (!body.title) return NextResponse.json({ error: 'Title required' }, { status: 400 });
  const supabase = await createClient();
  const { error } = await supabase.from('courses').insert({
    title: body.title,
    description: body.description ?? null,
    is_active: body.is_active ?? false,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}