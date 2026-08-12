import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  let body: { group_name?: string; course_id?: string; coordinator_id?: string | null; instructor_id?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  if (!body.group_name || !body.course_id) {
    return NextResponse.json({ error: 'group_name and course_id required' }, { status: 400 });
  }
  const supabase = await createClient();
  const { error } = await supabase.from('cohorts').insert({
    group_name: body.group_name,
    course_id: body.course_id,
    coordinator_id: body.coordinator_id ?? null,
    instructor_id: body.instructor_id ?? null,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}