import type { Metadata } from 'next';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/components/ui/Toast';
import { GlobalToastBridge } from '@/components/layout/BrandShell';
import './globals.css';

export const metadata: Metadata = {
  title: 'Luvia — Educational Platform',
  description: 'Cohort-based LMS with secure self-paced learning.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-brand-bg bg-brand-radial text-white antialiased">
        <AuthProvider>
          <ToastProvider>
            <GlobalToastBridge />
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}