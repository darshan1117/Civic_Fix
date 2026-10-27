import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  PlusCircle,
  Briefcase,
  BarChart3,
  Bell,
  ChevronDown,
  LogOut,
  Moon,
  Sun,
} from 'lucide-react';

export function Navbar() {
  const { pathname } = useLocation();
  const { user, logout, switchDemoUser, demoPersonas, notifications, unreadCount } = useAuth();
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [isDark, setIsDark] = useState(true);

  // Initialize theme on mount
  useEffect(() => {
    const saved = localStorage.getItem('civicfix_theme');
    if (saved === 'light') {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('civicfix_theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('civicfix_theme', 'dark');
      setIsDark(true);
    }
  };

  const isActive = (path) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-[#0B0F17]/85 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/80 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Left Navigation */}
        <div className="flex items-center gap-6">
          {/* Sun / Moon Toggle Pill (Fully functional Dark & Light Mode) */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex items-center gap-2 p-1.5 px-3 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 transition-all text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white text-xs shadow-xs cursor-pointer"
          >
            <Sun className={`w-3.5 h-3.5 ${!isDark ? 'text-amber-500 font-bold' : 'text-slate-400 dark:text-slate-500'}`} />
            <span className="text-[11px] font-bold">{isDark ? 'Dark' : 'Light'}</span>
            <Moon className={`w-3.5 h-3.5 ${isDark ? 'text-blue-400 font-bold' : 'text-slate-400 dark:text-slate-500'}`} />
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all">
              <Shield className="w-5 h-5 fill-white/20" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight leading-none group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                CivicFix
              </span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mt-0.5">
                CIVIC RESOLUTION
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 ml-4">
            <Link
              to="/issues"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                isActive('/issues')
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-600/20 dark:text-blue-400 dark:border-blue-500/30 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60'
              }`}
            >
              Public Map
            </Link>

            <Link
              to="/report"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-1.5 ${
                isActive('/report')
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-600/20 dark:text-blue-400 dark:border-blue-500/30 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Report Issue
            </Link>

            {user?.role === 'citizen' && (
              <Link
                to="/my-reports"
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive('/my-reports')
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-600/20 dark:text-blue-400 dark:border-blue-500/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60'
                }`}
              >
                My Reports
              </Link>
            )}

            {(user?.role === 'officer' || user?.role === 'admin') && (
              <Link
                to="/officer/queue"
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-1.5 ${
                  isActive('/officer/queue')
                    ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Officer Queue
              </Link>
            )}

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-1.5 ${
                  pathname.startsWith('/admin')
                    ? 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-600/20 dark:text-purple-300 dark:border-purple-500/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Admin Console
              </Link>
            )}
          </nav>
        </div>

        {/* Right Actions: Notification + Persona Switcher */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#131B2B] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700/80 py-2 z-50 text-slate-800 dark:text-slate-200 animate-in fade-in">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Live Audit Notifications
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400">
                    {unreadCount} unread
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">No new notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n._id || n.id} className="p-3 text-xs space-y-1 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <p className="text-slate-800 dark:text-slate-200 leading-snug">{n.message}</p>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">{new Date(n.createdAt).toLocaleTimeString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 1-Click Evaluation Persona Switcher Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPersonaMenu(!showPersonaMenu)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-300 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs text-slate-800 dark:text-slate-200"
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
              <span className="font-bold text-slate-900 dark:text-white max-w-[130px] truncate">{user?.name || 'Visitor'}</span>
              <span className="text-[9px] uppercase font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/70 border border-blue-300 dark:border-blue-800/60 px-1.5 py-0.5 rounded">
                {user?.role || 'Guest'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            </button>

            {/* Persona Menu Dropdown */}
            {showPersonaMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#131B2B] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700/80 py-2 z-50 text-slate-800 dark:text-slate-200 animate-in fade-in">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    1-Click Evaluation Persona
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto py-1">
                  {demoPersonas.map((demo) => (
                    <button
                      key={demo.email}
                      type="button"
                      onClick={() => {
                        switchDemoUser(demo.email);
                        setShowPersonaMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left flex items-center justify-between text-xs hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                    >
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white truncate">{demo.name}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">{demo.desc}</div>
                      </div>
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md ${
                          demo.role === 'admin'
                            ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800/60'
                            : demo.role === 'officer'
                            ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60'
                            : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60'
                        }`}
                      >
                        {demo.role}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 px-3">
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setShowPersonaMenu(false);
                    }}
                    className="w-full py-1 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 font-medium inline-flex items-center justify-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
