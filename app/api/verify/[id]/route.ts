import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServiceClient();
  const { data: cert } = await supabase
    .from('certificates')
    .select('id, issued_at, instructor_signature_name, user_id, course_id')
    .eq('id', id)
    .maybeSingle();
  if (!cert) return NextResponse.json({ certificate: null }, { status: 404 });

  const [{ data: user }, { data: course }] = await Promise.all([
    supabase.from('users').select('full_name').eq('id', cert.user_id).maybeSingle(),
    supabase.from('courses').select('title').eq('id', cert.course_id).maybeSingle(),
  ]);

  return NextResponse.json({
    certificate: {
      id: cert.id,
      studentName: user?.full_name ?? '—',
      courseTitle: course?.title ?? '—',
      instructorName: cert.instructor_signature_name ?? null,
      issuedAt: cert.issued_at,
    },
  });
}