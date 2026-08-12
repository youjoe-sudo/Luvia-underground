import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const PUBLIC_PATHS = new Set([
  '/',
  '/login',
  '/access',
  '/verify',
  '/verify-certificate',
  '/register-secret',
  '/change-password',
  '/course',
  '/faq',
  '/about',
  '/how-it-works',
]);

const ALLOW_PREFIX = ['/verify/', '/verify-certificate/'];

export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.next();
  }

  const path = request.nextUrl.pathname;

  // لا نحمي APIs الخاصة بالـ authentication
  if (path.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  // الصفحات العامة
  if (
    PUBLIC_PATHS.has(path) ||
    ALLOW_PREFIX.some((prefix) => path.startsWith(prefix))
  ) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },

      setAll(
        cookiesToSet: Array<{
          name: string;
          value: string;
          options?: Parameters<NextResponse['cookies']['set']>[2];
        }>
      ) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);

          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // المستخدم غير مسجل
  if (!user) {
    return NextResponse.redirect(
      new URL('/login', request.url)
    );
  }

  // بيانات المستخدم
  const { data: profile } = await supabase
    .from('users')
    .select('role, must_change_password, is_banned')
    .eq('id', user.id)
    .single();

  // الحساب محظور
  if (profile?.is_banned) {
    return NextResponse.redirect(
      new URL('/login?banned=1', request.url)
    );
  }

  // إجبار المستخدم على تغيير كلمة المرور
  if (
    profile?.must_change_password &&
    path !== '/change-password'
  ) {
    return NextResponse.redirect(
      new URL('/change-password', request.url)
    );
  }

  // حماية صفحات الأدمن
  if (path.startsWith('/admin')) {
    const allowedRoles = ['admin', 'super_admin'];

    if (!allowedRoles.includes(profile?.role ?? '')) {
      return NextResponse.redirect(
        new URL('/student/dashboard', request.url)
      );
    }
  }

  // حماية صفحات الطلاب
  if (path.startsWith('/student')) {
    const allowedRoles = [
      'student',
      'admin',
      'super_admin',
    ];

    if (!allowedRoles.includes(profile?.role ?? '')) {
      if (profile?.role === 'instructor') {
        return NextResponse.redirect(
          new URL('/instructor/dashboard', request.url)
        );
      }
      if (profile?.role === 'coordinator') {
        return NextResponse.redirect(
          new URL('/coordinator/dashboard', request.url)
        );
      }
      return NextResponse.redirect(
        new URL('/admin/dashboard', request.url)
      );
    }
  }

  // حماية صفحات المدرّبين
  if (path.startsWith('/instructor')) {
    const allowedRoles = ['instructor', 'admin', 'super_admin'];

    if (!allowedRoles.includes(profile?.role ?? '')) {
      if (profile?.role === 'coordinator') {
        return NextResponse.redirect(
          new URL('/coordinator/dashboard', request.url)
        );
      }
      return NextResponse.redirect(
        new URL('/student/dashboard', request.url)
      );
    }
  }

  // حماية صفحات المنسّقين
  if (path.startsWith('/coordinator')) {
    const allowedRoles = ['coordinator', 'admin', 'super_admin'];

    if (!allowedRoles.includes(profile?.role ?? '')) {
      if (profile?.role === 'instructor') {
        return NextResponse.redirect(
          new URL('/instructor/dashboard', request.url)
        );
      }
      return NextResponse.redirect(
        new URL('/student/dashboard', request.url)
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons.svg).*)',
  ],
};