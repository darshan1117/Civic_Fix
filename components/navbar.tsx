'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { NotificationBell } from './notification-bell';
import {
  Shield,
  MapPin,
  PlusCircle,
  FileText,
  Briefcase,
  BarChart3,
  Users,
  LogOut,
  LogIn,
  ChevronDown,
  UserCheck,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { user, logout, switchUser, demoUsers } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition-colors">
              <Shield className="w-5 h-5 fill-white/20" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-slate-950 dark:text-white tracking-tight leading-none">
                CivicFix
              </span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider">
                Bengaluru City
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/issues"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/issues')
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Public Map
            </Link>

            <Link
              href="/report"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-1.5 ${
                isActive('/report')
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-blue-600" /> Report Issue
            </Link>

            {user?.role === 'citizen' && (
              <Link
                href="/my-reports"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/my-reports')
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                My Reports
              </Link>
            )}

            {(user?.role === 'officer' || user?.role === 'admin') && (
              <Link
                href="/officer/queue"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-1.5 ${
                  isActive('/officer/queue')
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Briefcase className="w-4 h-4 text-amber-600" /> Officer Queue
              </Link>
            )}

            {user?.role === 'admin' && (
              <Link
                href="/admin"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-1.5 ${
                  pathname.startsWith('/admin')
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-blue-600" /> Admin Console
              </Link>
            )}
          </nav>
        </div>

        {/* Right Action Icons & Role Switcher */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <NotificationBell />

          {/* Demo User / Role Switcher Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors cursor-pointer shadow-2xs"
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  user?.role === 'admin'
                    ? 'bg-rose-500'
                    : user?.role === 'officer'
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
              />
              <span className="font-semibold text-slate-800 dark:text-slate-200 max-w-[120px] truncate">
                {user ? user.full_name : 'Visitor'}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-200/60 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                {user ? user.role : 'Public'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Demo Persona (1-Click)
                  </p>
                </div>

                <div className="max-h-64 overflow-y-auto py-1">
                  {demoUsers.map((demo) => {
                    const isCurrent = user?.id === demo.id;
                    return (
                      <button
                        key={demo.id}
                        type="button"
                        onClick={() => {
                          switchUser(demo.id);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                          isCurrent ? 'bg-blue-50/70 dark:bg-blue-950/40 font-semibold' : ''
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="truncate text-slate-900 dark:text-slate-100 font-medium">
                            {demo.full_name}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">{demo.email}</div>
                        </div>
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full shrink-0 ${
                            demo.role === 'admin'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60'
                              : demo.role === 'officer'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60'
                          }`}
                        >
                          {demo.role}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 px-3">
                  {user ? (
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setShowRoleMenu(false);
                      }}
                      className="w-full py-1.5 text-xs text-rose-600 hover:underline font-medium inline-flex items-center justify-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setShowRoleMenu(false)}
                      className="w-full py-1.5 text-xs text-blue-600 hover:underline font-medium inline-flex items-center justify-center gap-1.5"
                    >
                      <LogIn className="w-3.5 h-3.5" /> Sign In
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
