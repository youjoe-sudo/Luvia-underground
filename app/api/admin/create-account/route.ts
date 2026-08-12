import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const TEMP_PASSWORD = '12345678';
const MIN_PASSWORD_LEN = 8;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function POST(req: Request) {
  let body: {
    full_name?: string;
    email?: string;
    phone?: string;
    role?: 'student' | 'instructor' | 'coordinator' | 'admin';
    enrollment_request_id?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const full_name = body.full_name?.trim() ?? '';
  const email = body.email?.trim().toLowerCase() ?? '';
  const phone = body.phone?.trim() ?? '';
  const role = body.role ?? 'student';
  const enrollment_request_id = body.enrollment_request_id ?? null;

  if (!full_name) {
    return NextResponse.json({ error: 'Full name is required.' }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email.' }, { status: 400 });
  }
  if (TEMP_PASSWORD.length < MIN_PASSWORD_LEN) {
    return NextResponse.json({ error: 'Temporary password too short.' }, { status: 500 });
  }

  const supabase = await createClient();

  // Caller must be authenticated.
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  // Caller must be admin (server-side — do not trust client).
  const { data: caller } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();
  if (!caller || (caller.role !== 'admin' && caller.role !== 'super_admin')) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }

  // Use the SECURITY DEFINER RPC. must_change_password is set to true
  // inside the RPC. The frontend never sees the service-role key.
  const { data: newId, error: rpcError } = await supabase.rpc('admin_create_user', {
    p_email: email,
    p_full_name: full_name,
    p_phone: phone,
    p_role: role,
    p_temp_password: TEMP_PASSWORD,
  });

  if (rpcError || !newId) {
    const code = (rpcError as any)?.message ?? 'Could not create account.';
    return NextResponse.json({ error: code }, { status: 400 });
  }

  // If this came from an enrollment request, mark it converted + enrolled.
  if (enrollment_request_id) {
    await supabase
      .from('enrollment_requests')
      .update({
        status: 'enrolled',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', enrollment_request_id);
  }

  // Return only the safe info — never the plaintext password.
  return NextResponse.json({
    ok: true,
    user: { id: newId, email, full_name, role },
    temporary_password: TEMP_PASSWORD,
    must_change_password: true,
  });
}
