import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  let body: { code?: string; course_id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  if (!body.code || !body.course_id) {
    return NextResponse.json({ error: 'code and course_id required' }, { status: 400 });
  }
  const supabase = await createClient();
  const { error } = await supabase.from('vouchers').insert({
    code: body.code.toUpperCase(),
    course_id: body.course_id,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}