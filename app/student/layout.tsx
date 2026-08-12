import { redirect } from 'next/navigation';
import { StudentSidebar } from '@/components/layout/StudentSidebar';
import { getSessionUser, isAdminRole } from '@/lib/auth/session';

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if (user.must_change_password) redirect('/change-password');
  // Admins viewing as student is allowed.
  return (
    <div className="flex min-h-screen">
      <StudentSidebar />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}