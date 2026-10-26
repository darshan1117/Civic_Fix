import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/authContext';
import { Navbar } from '@/components/navbar';
import { MobileNav } from '@/components/mobile-nav';

export const metadata: Metadata = {
  title: 'CivicFix — Civic Issue Reporting & Resolution Tracking',
  description:
    'Modern municipal issue reporting platform with 50m duplicate detection, statutory SLA enforcement, and real-time civic lifecycle tracking.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 pb-16 md:pb-0">{children}</main>
          <MobileNav />

          {/* Footer */}
          <footer className="hidden md:block bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 mt-16 text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-slate-100">CivicFix</span>
                <span>— Open Civic Infrastructure Platform</span>
              </div>
              <div className="flex items-center gap-6">
                <span>Bengaluru Municipal Jurisdiction</span>
                <span>•</span>
                <span>Real-Time SLA Tracking</span>
                <span>•</span>
                <span>Zero Duplicate Guarantee</span>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
