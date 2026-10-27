import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
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
  const { theme, isDark, toggleTheme } = useTheme();
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const isActive = (path) => pathname === path;

  return (
    <header className={`sticky top-0 z-50 w-full backdrop-blur-xl border-b transition-colors duration-200 ${
      isDark
        ? 'bg-[#0B0F17]/90 border-slate-800/80 text-slate-100'
        : 'bg-white/95 border-slate-200 text-slate-900 shadow-xs'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Left Navigation */}
        <div className="flex items-center gap-6">
          {/* Sun / Moon Toggle Pill (Dark & Light Mode) */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle dark/light mode"
            className={`flex items-center gap-2 p-1.5 px-3 rounded-full border transition-all text-xs shadow-xs cursor-pointer ${
              isDark
                ? 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:border-slate-500'
                : 'bg-slate-100 border-slate-300 text-slate-800 hover:text-slate-950 hover:border-slate-400'
            }`}
          >
            <Sun className={`w-3.5 h-3.5 ${!isDark ? 'text-amber-500 font-extrabold' : 'text-slate-500'}`} />
            <span className="text-[11px] font-bold tracking-wide">
              {isDark ? 'Dark Mode' : 'Light Mode'}
            </span>
            <Moon className={`w-3.5 h-3.5 ${isDark ? 'text-blue-400 font-extrabold' : 'text-slate-400'}`} />
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all shrink-0">
              <Shield className="w-5 h-5 fill-white/20" />
            </div>
            <div className="flex flex-col">
              <span className={`font-extrabold text-lg tracking-tight leading-none transition-colors ${
                isDark ? 'text-white group-hover:text-blue-400' : 'text-slate-950 group-hover:text-blue-600'
              }`}>
                CivicFix
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${
                isDark ? 'text-blue-400' : 'text-blue-600'
              }`}>
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
                  ? isDark
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-xs'
                    : 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
                  : isDark
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Public Map
            </Link>

            <Link
              to="/report"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-1.5 ${
                isActive('/report')
                  ? isDark
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-xs'
                    : 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
                  : isDark
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <PlusCircle className={`w-3.5 h-3.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} /> Report Issue
            </Link>

            {user?.role === 'citizen' && (
              <Link
                to="/my-reports"
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive('/my-reports')
                    ? isDark
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                    : isDark
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
                    ? isDark
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                    : isDark
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Briefcase className={`w-3.5 h-3.5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} /> Officer Queue
              </Link>
            )}

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-1.5 ${
                  pathname.startsWith('/admin')
                    ? isDark
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                      : 'bg-purple-50 text-purple-700 border border-purple-200'
                    : isDark
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BarChart3 className={`w-3.5 h-3.5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} /> Admin Console
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
              className={`relative p-2 rounded-xl transition-colors cursor-pointer ${
                isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
              }`}
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifMenu && (
              <div className={`absolute right-0 mt-2 w-80 rounded-2xl shadow-2xl border py-2 z-50 animate-in fade-in ${
                isDark
                  ? 'bg-[#131B2B] border-slate-700/80 text-slate-200'
                  : 'bg-white border-slate-200 text-slate-800 shadow-xl'
              }`}>
                <div className={`px-4 py-2 border-b flex items-center justify-between ${
                  isDark ? 'border-slate-800' : 'border-slate-100'
                }`}>
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-500">
                    Live Audit Notifications
                  </span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {unreadCount} unread
                  </span>
                </div>
                <div className={`max-h-64 overflow-y-auto divide-y ${
                  isDark ? 'divide-slate-800/60' : 'divide-slate-100'
                }`}>
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">No new notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n._id || n.id} className={`p-3 text-xs space-y-1 transition ${
                        isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'
                      }`}>
                        <p className={`leading-snug ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{n.message}</p>
                        <span className="text-[10px] text-slate-400">{new Date(n.createdAt).toLocaleTimeString()}</span>
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
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer shadow-xs ${
                isDark
                  ? 'border-slate-700/80 bg-slate-900/80 hover:bg-slate-800 text-slate-200'
                  : 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800'
              }`}
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
              <span className={`font-bold max-w-[130px] truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {user?.name || 'Visitor'}
              </span>
              <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${
                isDark
                  ? 'text-blue-300 bg-blue-950/70 border-blue-800/60'
                  : 'text-blue-700 bg-blue-100 border-blue-200'
              }`}>
                {user?.role || 'Guest'}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            </button>

            {/* Persona Menu Dropdown */}
            {showPersonaMenu && (
              <div className={`absolute right-0 mt-2 w-72 rounded-2xl shadow-2xl border py-2 z-50 animate-in fade-in ${
                isDark
                  ? 'bg-[#131B2B] border-slate-700/80 text-slate-200'
                  : 'bg-white border-slate-200 text-slate-800 shadow-xl'
              }`}>
                <div className={`px-3 py-2 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
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
                      className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                        isDark ? 'hover:bg-slate-800/60' : 'hover:bg-slate-100'
                      }`}
                    >
                      <div>
                        <div className={`font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{demo.name}</div>
                        <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{demo.desc}</div>
                      </div>
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md border ${
                          demo.role === 'admin'
                            ? isDark ? 'bg-rose-950/80 text-rose-300 border-rose-800/60' : 'bg-rose-100 text-rose-700 border-rose-200'
                            : demo.role === 'officer'
                            ? isDark ? 'bg-amber-950/80 text-amber-300 border-amber-800/60' : 'bg-amber-100 text-amber-700 border-amber-200'
                            : isDark ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60' : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {demo.role}
                      </span>
                    </button>
                  ))}
                </div>
                <div className={`pt-2 border-t px-3 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setShowPersonaMenu(false);
                    }}
                    className="w-full py-1 text-xs text-rose-600 hover:text-rose-700 font-medium inline-flex items-center justify-center gap-1.5 cursor-pointer"
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
