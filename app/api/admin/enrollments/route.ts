import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  let body: { user_id?: string; course_id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  if (!body.user_id || !body.course_id) {
    return NextResponse.json({ error: 'user_id and course_id required' }, { status: 400 });
  }
  const supabase = await createClient();
  const { error } = await supabase.from('enrollments').insert({
    user_id: body.user_id,
    course_id: body.course_id,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}