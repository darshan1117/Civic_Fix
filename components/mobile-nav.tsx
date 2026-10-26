'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { Map, PlusCircle, ListTodo, Briefcase, BarChart3, Home } from 'lucide-react';

export function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-around shadow-lg">
      <Link
        href="/"
        className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
          isActive('/') ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <Home className="w-5 h-5" />
        <span>Home</span>
      </Link>

      <Link
        href="/issues"
        className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
          isActive('/issues') ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <Map className="w-5 h-5" />
        <span>Map</span>
      </Link>

      <Link
        href="/report"
        className="flex flex-col items-center -mt-5"
      >
        <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 hover:bg-blue-700 active:scale-95 transition-all">
          <PlusCircle className="w-6 h-6" />
        </div>
        <span className="text-[10px] font-semibold text-blue-600 mt-1">Report</span>
      </Link>

      {user?.role === 'officer' && (
        <Link
          href="/officer/queue"
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            isActive('/officer/queue') ? 'text-amber-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Briefcase className="w-5 h-5" />
          <span>Queue</span>
        </Link>
      )}

      {user?.role === 'admin' && (
        <Link
          href="/admin"
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            pathname.startsWith('/admin') ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span>Admin</span>
        </Link>
      )}

      {user?.role === 'citizen' && (
        <Link
          href="/my-reports"
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            isActive('/my-reports') ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <ListTodo className="w-5 h-5" />
          <span>Reports</span>
        </Link>
      )}
    </nav>
  );
}
