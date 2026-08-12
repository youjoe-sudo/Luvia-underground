'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Calendar,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Users,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';

const NAV = [
  { href: '/coordinator/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/coordinator/cohorts', label: 'My Cohorts', icon: Users },
  { href: '/coordinator/sessions', label: 'Sessions', icon: Calendar },
  { href: '/coordinator/students', label: 'Students', icon: GraduationCap },
  { href: '/coordinator/attendance', label: 'Attendance', icon: ClipboardCheck },
  { href: '/coordinator/community', label: 'Community', icon: MessageSquare },
];

export function CoordinatorSidebar() {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();
  return (
    <aside className="flex h-screen w-64 flex-col border-r border-brand-border bg-brand-bg">
      <div className="px-6 py-5">
        <Link
          href="/coordinator/dashboard"
          className="bg-brand-gradient bg-clip-text text-2xl font-bold text-transparent"
        >
          Luvia
        </Link>
        <p className="mt-1 text-xs text-white/50">Coordinator · {profile?.full_name}</p>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
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