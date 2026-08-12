import { redirect } from 'next/navigation';
import { InstructorSidebar } from '@/components/layout/InstructorSidebar';
import { getSessionUser } from '@/lib/auth/session';

export default async function InstructorLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if (user.must_change_password) redirect('/change-password');
  if (!['instructor', 'admin', 'super_admin'].includes(user.role)) {
    if (user.role === 'coordinator') redirect('/coordinator/dashboard');
    redirect('/student/dashboard');
  }
  return (
    <div className="flex min-h-screen">
      <InstructorSidebar />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}