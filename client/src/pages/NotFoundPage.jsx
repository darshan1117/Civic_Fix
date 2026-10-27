import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function NotFoundPage() {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-[75vh] flex items-center justify-center px-4 transition-colors ${
      isDark ? 'bg-[#0B0F17] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <div className="text-center space-y-4 max-w-md">
        <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto shadow-xs ${
          isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'
        }`}>
          <Shield className="w-8 h-8" />
        </div>
        <h1 className={`text-4xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>404</h1>
        <h2 className={`text-lg font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Page Not Found</h2>
        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          The civic resource, dispatch queue, or page you requested could not be located on the platform.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Homepage
        </Link>
      </div>
    </div>
  );
}
