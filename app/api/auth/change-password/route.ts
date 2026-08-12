import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  let body: {
    current?: string;
    next?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid body' },
      { status: 400 }
    );
  }

  const current = body.current?.trim();
  const next = body.next?.trim();

  if (!current || !next) {
    return NextResponse.json(
      { error: 'Missing fields' },
      { status: 400 }
    );
  }

  if (current === next) {
    return NextResponse.json(
      { error: 'New password must be different from the current password' },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // Get currently authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user?.email) {
    return NextResponse.json(
      { error: 'You must be signed in' },
      { status: 401 }
    );
  }

  // Verify the current password
  const { error: verifyError } =
    await supabase.auth.signInWithPassword({
      email: user.email,
      password: current,
    });

  if (verifyError) {
    return NextResponse.json(
      { error: 'Current password is incorrect' },
      { status: 400 }
    );
  }

  // Update password
  const { error: updateError } =
    await supabase.auth.updateUser({
      password: next,
    });

  if (updateError) {
    return NextResponse.json(
      { error: updateError.message },
      { status: 400 }
    );
  }

  // Remove forced password-change flag
  const { error: profileError } = await supabase
    .from('users')
    .update({
      must_change_password: false,
    })
    .eq('id', user.id);

  if (profileError) {
    console.error(
      'Failed to update must_change_password:',
      profileError
    );
  }

  return NextResponse.json({
    ok: true,
    message: 'Password changed successfully',
  });
}