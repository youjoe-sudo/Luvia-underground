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
  return { service: createServiceClient() };
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ table: string; id: string }> }
) {
  const { table, id } = await params;
  if (!['announcements', 'faqs', 'testimonials'].includes(table)) {
    return NextResponse.json({ error: 'Unknown table' }, { status: 400 });
  }
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  const update: Record<string, unknown> = {};
  if (typeof body.is_published === 'boolean') {
    update.is_published = body.is_published;
    if (table === 'announcements') {
      update.published_at = body.is_published ? new Date().toISOString() : null;
    }
  }

  const { error } = await auth.service
    .from(table as Table)
    .update(update)
    .eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ table: string; id: string }> }
) {
  const { table, id } = await params;
  if (!['announcements', 'faqs', 'testimonials'].includes(table)) {
    return NextResponse.json({ error: 'Unknown table' }, { status: 400 });
  }
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
  const { error } = await auth.service.from(table as Table).delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}