'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AlertTriangle, Award, Calendar, Clock, LayoutDashboard, LifeBuoy, LogOut, Megaphone, MessageSquareQuote, Settings, Users, Smartphone, BookOpen, HelpCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';

const NAV = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/requests', label: 'Access Requests', icon: Users },
  { href: '/admin/courses', label: 'Courses', icon: BookOpen },
  { href: '/admin/cohorts', label: 'Cohorts', icon: Users },
  { href: '/admin/sessions', label: 'Live Sessions', icon: Calendar },
  { href: '/admin/enrollments', label: 'Enrollments', icon: Award },
  { href: '/admin/devices', label: 'Device Lock', icon: Smartphone },
  { href: '/admin/certificates', label: 'Certificates', icon: Award },
  { href: '/admin/tickets', label: 'Support Tickets', icon: LifeBuoy },
  { href: '/admin/announcements', label: 'Announcements', icon: Megaphone },
  { href: '/admin/faqs', label: 'FAQ', icon: HelpCircle },
  { href: '/admin/testimonials', label: 'Testimonials', icon: MessageSquareQuote },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();
  return (
    <aside className="flex h-screen w-64 flex-col border-r border-brand-border bg-brand-bg">
      <div className="px-6 py-5">
        <Link href="/admin/dashboard" className="bg-brand-gradient bg-clip-text text-2xl font-bold text-transparent">
          Luvia
        </Link>
        <p className="mt-1 text-xs text-white/50">Admin · {profile?.full_name}</p>
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
