'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Calendar, GraduationCap, LayoutDashboard, LifeBuoy, LogOut, MessageSquare, User, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';

const NAV = [
  { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/student/sessions', label: 'Live Sessions', icon: Calendar },
  { href: '/student/lessons', label: 'Self-Paced', icon: BookOpen },
  { href: '/student/exams', label: 'Exams', icon: GraduationCap },
  { href: '/student/community', label: 'Community', icon: MessageSquare },
  { href: '/student/resources', label: 'Resources', icon: FileText },
  { href: '/student/tickets', label: 'Support', icon: LifeBuoy },
  { href: '/student/profile', label: 'Profile', icon: User },
];

export function StudentSidebar() {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();
  return (
    <aside className="flex h-screen w-64 flex-col border-r border-brand-border bg-brand-bg">
      <div className="px-6 py-5">
        <Link href="/student/dashboard" className="bg-brand-gradient bg-clip-text text-2xl font-bold text-transparent">
          Luvia
        </Link>
        <p className="mt-1 text-xs text-white/50">{profile?.full_name}</p>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname?.startsWith(href) ?? false;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                active ? 'bg-brand-gradient text-white' : 'text-white/70 hover:bg-white/5'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4">
        <Button variant="secondary" size="sm" onClick={signOut} className="w-full">
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </div>
    </aside>
  );
}
