import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Shield, Lock, Mail, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, demoPersonas } = useAuth();
  const { isDark } = useTheme();

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
    <div className={`min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors ${
      isDark ? 'bg-[#0B0F17]' : 'bg-slate-50'
    }`}>
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 mx-auto">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Sign in to CivicFix
          </h2>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Citizen, Officer, and Administration Portal
          </p>
        </div>

        <div className={`rounded-2xl p-4 space-y-3 border transition-colors ${
          isDark
            ? 'bg-blue-950/30 border-blue-800/40'
            : 'bg-blue-50/80 border-blue-200'
        }`}>
          <p className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? 'text-blue-300' : 'text-blue-900'}`}>
            <UserCheck className="w-4 h-4 text-blue-500" />
            1-Click Evaluation Login (Pre-configured)
          </p>
          <div className="grid grid-cols-2 gap-2">
            {demoPersonas.slice(0, 4).map((p) => (
              <button
                key={p.email}
                type="button"
                onClick={() => handleQuickLogin(p.email)}
                className={`p-2 text-left rounded-xl transition group shadow-2xs border ${
                  isDark
                    ? 'bg-[#131B2B] hover:bg-blue-900/40 border-slate-700/80'
                    : 'bg-white hover:bg-blue-100/60 border-blue-200'
                }`}
              >
                <div className={`text-[11px] font-bold line-clamp-1 group-hover:text-blue-500 ${
                  isDark ? 'text-slate-200' : 'text-slate-800'
                }`}>
                  {p.name}
                </div>
                <div className={`text-[10px] capitalize ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{p.role}</div>
              </button>
            ))}
          </div>
        </div>

        <div className={`p-6 sm:p-8 rounded-2xl border shadow-sm space-y-5 transition-colors ${
          isDark
            ? 'bg-[#131B2B]/90 border-slate-800'
            : 'bg-white border-slate-200'
        }`}>
          {error && (
            <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
              isDark
                ? 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}>
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@civicfix.org"
                  className={`w-full pl-10 pr-3 py-2 rounded-xl text-sm transition border focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                    isDark
                      ? 'bg-slate-900/90 border-slate-700 text-white placeholder-slate-500'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                  required
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-3 py-2 rounded-xl text-sm transition border focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                    isDark
                      ? 'bg-slate-900/90 border-slate-700 text-white placeholder-slate-500'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                  required
                />
              </div>
              <p className={`text-[10px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Default for demo users: Password123!</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className={`text-center pt-2 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Don't have an account? </span>
            <Link to="/register" className="text-xs font-bold text-blue-500 hover:underline">
              Create citizen profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
