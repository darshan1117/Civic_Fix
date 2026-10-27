import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, demoPersonas } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Password123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide email and password.');
      return;
    }

    setLoading(true);
    setError(null);
    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/issues');
    } else {
      setError(res.error || 'Authentication failed.');
    }
  };

  const handleQuickLogin = async (personaEmail) => {
    setEmail(personaEmail);
    setLoading(true);
    setError(null);
    const res = await login(personaEmail, 'Password123!');
    setLoading(false);
    if (res.success) {
      navigate('/issues');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 mx-auto">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign in to CivicFix
          </h2>
          <p className="text-xs text-slate-500">
            Citizen, Officer, and Administration Portal
          </p>
        </div>

        {/* 1-Click Evaluation Personas */}
        <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 space-y-3">
          <p className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-blue-600" />
            1-Click Evaluation Login (Pre-configured)
          </p>
          <div className="grid grid-cols-2 gap-2">
            {demoPersonas.slice(0, 4).map((p) => (
              <button
                key={p.email}
                type="button"
                onClick={() => handleQuickLogin(p.email)}
                className="p-2 text-left bg-white hover:bg-blue-100/60 border border-blue-200 rounded-xl transition group shadow-2xs"
              >
                <div className="text-[11px] font-bold text-slate-800 group-hover:text-blue-700 line-clamp-1">
                  {p.name}
                </div>
                <div className="text-[10px] text-slate-500 capitalize">{p.role}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Standard Form */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@civicfix.org"
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Default for demo users: Password123!</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-500">Don't have an account? </span>
            <Link to="/register" className="text-xs font-bold text-blue-600 hover:underline">
              Create citizen profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
