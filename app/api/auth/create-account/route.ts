import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      full_name,
      email,
      password,
      phone,
      role = 'student',
    } = body;

    if (!full_name || !email || !password) {
      return NextResponse.json(
        { error: 'الاسم والإيميل والباسورد مطلوبين.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'الباسورد لازم يكون 6 أحرف على الأقل.' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // إنشاء الحساب في Supabase Auth
    const {
      data: authData,
      error: authError,
    } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
        phone: phone ?? '',
      },
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'فشل إنشاء الحساب.' },
        { status: 500 }
      );
    }

    // إضافة المستخدم لجدول users
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        full_name,
        phone: phone ?? null,
        role,
        is_banned: false,
        must_change_password: false,
      });

    if (profileError) {
      // لو إنشاء الـ profile فشل، نحاول نحذف حساب Auth
      await supabase.auth.admin.deleteUser(authData.user.id);

      return NextResponse.json(
        { error: profileError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        full_name,
      },
    });
  } catch (error) {
    console.error('CREATE ACCOUNT ERROR:', error);

    return NextResponse.json(
      { error: 'حدث خطأ غير متوقع أثناء إنشاء الحساب.' },
      { status: 500 }
    );
  }
}