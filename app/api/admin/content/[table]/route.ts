import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { createClient } from '@/lib/supabase/server';

type Table = 'announcements' | 'faqs' | 'testimonials';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  const { data: caller } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();
  if (!caller || (caller.role !== 'admin' && caller.role !== 'super_admin')) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return { supabase, user, service: createServiceClient() };
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ table: string }> }
) {
  const { table } = await params;
  if (!['announcements', 'faqs', 'testimonials'].includes(table)) {
    return NextResponse.json({ error: 'Unknown table' }, { status: 400 });
  }
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  const payload: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) {
    if (typeof v === 'string') {
      if ((v as string).length > 5000) {
        return NextResponse.json({ error: `Field too long: ${k}` }, { status: 400 });
      }
    }
    payload[k] = v;
  }

  if (table === 'announcements') {
    payload.created_by = auth.user.id;
    if (payload.is_published && !payload.published_at) {
      payload.published_at = new Date().toISOString();
    }
  }

  const { error } = await auth.service.from(table as Table).insert(payload);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}