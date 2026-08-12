import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { createClient } from '@/lib/supabase/server';
import { generateTempPassword } from '@/lib/auth/password';

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Authenticate caller as admin.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data: caller } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();
  if (!caller || (caller.role !== 'admin' && caller.role !== 'super_admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const service = createServiceClient();
  const { data: req } = await service
    .from('enrollment_requests')
    .select('id, full_name, email, phone')
    .eq('id', id)
    .maybeSingle();

  if (!req) return NextResponse.json({ error: 'Request not found' }, { status: 404 });

  if (req.email == null) {
    return NextResponse.json({ error: 'Request missing email' }, { status: 400 });
  }

  const tempPassword = generateTempPassword();

  let newUserId: string;
  try {
    const result = await service.rpc('admin_create_user', {
      p_email: req.email,
      p_full_name: req.full_name,
      p_phone: req.phone,
      p_role: 'student',
      p_temp_password: tempPassword,
    });
    newUserId = result.data as unknown as string;
    if (!newUserId) throw new Error('admin_create_user returned no id');
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }

  await service
    .from('enrollment_requests')
    .update({
      status: 'enrolled',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id);

  return NextResponse.json({
    ok: true,
    newUserId,
    tempPassword,
    email: req.email,
    fullName: req.full_name,
  });
}