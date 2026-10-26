'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/authContext';
import { Notification } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';
import { Bell, Check, ExternalLink, X } from 'lucide-react';
import Link from 'next/link';

export function NotificationBell() {
  const { user, unreadCount, refreshNotifications } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchList = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/notifications?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch {
      // quiet fail
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchList();
    }
  }, [isOpen]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      refreshNotifications();
    } catch {
      // quiet
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true, userId: user.id }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      refreshNotifications();
    } catch {
      // quiet
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-in zoom-in-50">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-3 z-50 animate-in fade-in slide-in-from-top-2">
          {/* Header */}
          <div className="px-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                Notifications
              </h4>
              {unreadCount > 0 && (
                <span className="text-xs bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-semibold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading ? (
              <div className="py-6 text-center text-xs text-slate-400">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No notifications right now.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 transition-colors flex items-start gap-3 ${
                    notif.read
                      ? 'bg-white dark:bg-slate-900 opacity-80'
                      : 'bg-blue-50/40 dark:bg-blue-950/20'
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      notif.read ? 'bg-transparent' : 'bg-blue-600'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-800 dark:text-slate-200 leading-snug">
                      {notif.message}
                    </p>
                    <div className="flex items-center justify-between mt-1.5 pt-1 text-[11px] text-slate-400">
                      <span>{formatDateTime(notif.created_at)}</span>
                      {notif.issue_id && (
                        <Link
                          href={`/issues/${notif.issue_id}`}
                          onClick={() => {
                            markAsRead(notif.id);
                            setIsOpen(false);
                          }}
                          className="font-medium text-blue-600 hover:underline inline-flex items-center gap-0.5"
                        >
                          View ticket <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
