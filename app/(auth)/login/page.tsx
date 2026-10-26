'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import Link from 'next/link';
import { Shield, Lock, Mail, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, demoUsers } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Password123!');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const errorParam = searchParams.get('error');
  const returnUrl = searchParams.get('returnUrl') || '/';

  const getNotice = () => {
    if (errorParam === 'admin_required') return 'Administrator access required to view this page.';
    if (errorParam === 'officer_required') return 'Municipal Officer credentials required.';
    if (errorParam === 'unauthorized') return 'Please sign in to continue.';
    return null;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email) {
      setErrorMsg('Please enter an email address.');
      return;
    }

    setIsLoading(true);
    try {
      await login(email);
      router.push(returnUrl);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string) => {
    setIsLoading(true);
    await login(demoEmail);
    const demo = demoUsers.find((d) => d.email === demoEmail);
    if (demo?.role === 'admin') router.push('/admin');
    else if (demo?.role === 'officer') router.push('/officer/queue');
    else router.push('/issues');
  };

  return (
    <div className="max-w-md w-full mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md shadow-blue-500/20">
          <Shield className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Sign In to CivicFix
        </h1>
        <p className="text-xs text-slate-500">
          Access civic issue tracking, officer queues, and administrative tools.
        </p>
      </div>

      {(errorMsg || getNotice()) && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg || getNotice()}</span>
        </div>
      )}

      {/* Main Login Form */}
      <form
        onSubmit={handleFormSubmit}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4"
      >
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. citizen1@civicfix.org"
              className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>

        <div className="text-center pt-2">
          <Link
            href="/register"
            className="text-xs text-blue-600 hover:underline font-medium"
          >
            Don't have an account? Register as a Citizen
          </Link>
        </div>
      </form>

      {/* 1-Click Demo Evaluation Profiles */}
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
          1-Click Instant Evaluation Logins
        </span>

        <div className="grid grid-cols-1 gap-2">
          <button
            type="button"
            onClick={() => handleQuickDemoLogin('admin@civicfix.org')}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-left flex items-center justify-between text-xs cursor-pointer shadow-2xs"
          >
            <div>
              <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                Aarav Sharma (Admin)
              </span>
              <span className="text-[10px] text-slate-400">admin@civicfix.org</span>
            </div>
            <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
              Admin
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemoLogin('roads.officer@civicfix.org')}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-left flex items-center justify-between text-xs cursor-pointer shadow-2xs"
          >
            <div>
              <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                Priya Nair (Roads Officer)
              </span>
              <span className="text-[10px] text-slate-400">roads.officer@civicfix.org</span>
            </div>
            <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
              Officer
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemoLogin('citizen1@civicfix.org')}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-left flex items-center justify-between text-xs cursor-pointer shadow-2xs"
          >
            <div>
              <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                Vikram Mehta (Citizen)
              </span>
              <span className="text-[10px] text-slate-400">citizen1@civicfix.org</span>
            </div>
            <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
              Citizen
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-xs text-slate-400">Loading login...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
