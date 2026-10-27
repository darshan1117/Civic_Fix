import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  PlusCircle,
  Briefcase,
  BarChart3,
  ListTodo,
  Bell,
  ChevronDown,
  LogOut,
  LogIn,
  ExternalLink,
} from 'lucide-react';

export function Navbar() {
  const { pathname } = useLocation();
  const { user, logout, switchDemoUser, demoPersonas, notifications, unreadCount } = useAuth();
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const isActive = (path) => pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition-colors">
              <Shield className="w-5 h-5 fill-white/20" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-slate-950 tracking-tight leading-none">CivicFix</span>
              <span className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider">MERN Stack</span>
            </div>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/issues"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/issues') ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Public Map
            </Link>

            <Link
              to="/report"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-1.5 ${
                isActive('/report') ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-blue-600" /> Report Issue
            </Link>

            {user?.role === 'citizen' && (
              <Link
                to="/my-reports"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/my-reports') ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                My Reports
              </Link>
            )}

            {(user?.role === 'officer' || user?.role === 'admin') && (
              <Link
                to="/officer/queue"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-1.5 ${
                  isActive('/officer/queue') ? 'bg-amber-50 text-amber-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Briefcase className="w-4 h-4 text-amber-600" /> Officer Queue
              </Link>
            )}

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-1.5 ${
                  pathname.startsWith('/admin') ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-blue-600" /> Admin Console
              </Link>
            )}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50">
                <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">Notifications</span>
                  <span className="text-[11px] text-slate-400">{notifications.length} updates</span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">No new notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n._id || n.id} className="p-3 text-xs space-y-1 hover:bg-slate-50">
                        <p className="text-slate-800 leading-snug">{n.message}</p>
                        <span className="text-[10px] text-slate-400">{new Date(n.createdAt).toLocaleTimeString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 1-Click Persona Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPersonaMenu(!showPersonaMenu)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  user?.role === 'admin' ? 'bg-rose-500' : user?.role === 'officer' ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
              />
              <span className="font-semibold text-slate-800 max-w-[120px] truncate">{user?.name || 'Visitor'}</span>
              <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">
                {user?.role || 'Guest'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showPersonaMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
                <div className="px-3 py-2 border-b border-slate-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    1-Click Demo Evaluation Persona
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
                      className="w-full px-3 py-2 text-left flex items-center justify-between text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <div>
                        <div className="font-semibold text-slate-900 truncate">{demo.name}</div>
                        <div className="text-[10px] text-slate-400">{demo.desc}</div>
                      </div>
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                          demo.role === 'admin'
                            ? 'bg-rose-100 text-rose-700'
                            : demo.role === 'officer'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {demo.role}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="pt-2 border-t border-slate-100 px-3">
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setShowPersonaMenu(false);
                    }}
                    className="w-full py-1 text-xs text-rose-600 hover:underline font-medium inline-flex items-center justify-center gap-1.5"
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
