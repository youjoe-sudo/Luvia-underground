import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PHONE_RE = /^[+0-9 ()-]{6,30}$/;

export async function POST(req: Request) {
  let body: {
    full_name?: string;
    email?: string;
    phone?: string;
    whatsapp?: string;
    notes?: string | null;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const full_name = body.full_name?.trim() ?? '';
  const email = body.email?.trim().toLowerCase() ?? '';
  const phone = body.phone?.trim() ?? '';
  const whatsapp = body.whatsapp?.trim() ?? '';
  const notes = body.notes?.trim() ?? null;

  if (full_name.length < 2 || full_name.length > 200) {
    return NextResponse.json({ error: 'Please enter your full name.' }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }
  if (!PHONE_RE.test(phone)) {
    return NextResponse.json({ error: 'Please enter a valid phone number.' }, { status: 400 });
  }
  if (whatsapp && !PHONE_RE.test(whatsapp)) {
    return NextResponse.json({ error: 'Please enter a valid WhatsApp number.' }, { status: 400 });
  }
  if (notes && notes.length > 1000) {
    return NextResponse.json({ error: 'Message is too long.' }, { status: 400 });
  }

  const supabase = await createClient();

  // Duplicate-pending detection — fail fast with a friendly message
  // instead of relying on the DB to raise.
  const { data: existing } = await supabase
    .from('enrollment_requests')
    .select('id')
    .eq('email', email)
    .eq('status', 'pending')
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: 'A pending request with this email already exists.' },
      { status: 409 }
    );
  }

  const { error } = await supabase.from('enrollment_requests').insert({
    full_name,
    email,
    phone,
    whatsapp: whatsapp || phone,
    notes,
    status: 'pending',
  });

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'A pending request with this email already exists.' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}