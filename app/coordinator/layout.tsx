import { redirect } from 'next/navigation';
import { CoordinatorSidebar } from '@/components/layout/CoordinatorSidebar';
import { getSessionUser } from '@/lib/auth/session';

export default async function CoordinatorLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if (user.must_change_password) redirect('/change-password');
  if (!['coordinator', 'admin', 'super_admin'].includes(user.role)) {
    if (user.role === 'instructor') redirect('/instructor/dashboard');
    redirect('/student/dashboard');
  }
  return (
    <div className="flex min-h-screen">
      <CoordinatorSidebar />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}