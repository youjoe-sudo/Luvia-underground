'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap } from 'lucide-react';

const NAV = [
  { href: '/', label: 'Luvia' },
  { href: '/course', label: 'Course' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/faq', label: 'FAQ' },
  { href: '/about', label: 'About' },
];

export function PublicHeader() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-brand-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="rounded-lg bg-brand-gradient p-1.5">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          <span className="bg-brand-gradient bg-clip-text text-xl font-semibold text-transparent">
            Luvia
          </span>
        </Link>
        <nav className="hidden gap-6 md:flex">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition ${
                  active ? 'text-white' : 'text-white/60 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden text-sm text-white/70 hover:text-white sm:block"
          >
            Login
          </Link>
          <Link
            href="/access"
            className="rounded-lg bg-brand-gradient px-4 py-2 text-sm font-medium text-white shadow-lg shadow-brand-purple/20 hover:opacity-95"
          >
            Enroll
          </Link>
        </div>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-white/5">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-8 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
        <div>© {new Date().getFullYear()} Luvia. All rights reserved.</div>
        <div className="flex gap-4">
          <Link href="/faq" className="hover:text-white/70">FAQ</Link>
          <Link href="/about" className="hover:text-white/70">About</Link>
          <Link href="/access" className="hover:text-white/70">Enroll</Link>
        </div>
      </div>
    </footer>
  );
}
