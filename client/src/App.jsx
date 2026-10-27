import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { useTheme } from './context/ThemeContext';
import LandingPage from './pages/LandingPage';
import IssuesMapPage from './pages/IssuesMapPage';
import IssueDetailPage from './pages/IssueDetailPage';
import ReportPage from './pages/ReportPage';
import MyReportsPage from './pages/MyReportsPage';
import OfficerQueuePage from './pages/OfficerQueuePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminHotspotsPage from './pages/AdminHotspotsPage';
import AdminSLARulesPage from './pages/AdminSLARulesPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import { Shield } from 'lucide-react';

export default function App() {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${
      isDark ? 'bg-[#0B0F17] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <Navbar />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/issues" element={<IssuesMapPage />} />
          <Route path="/issues/:id" element={<IssueDetailPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/my-reports" element={<MyReportsPage />} />
          <Route path="/officer/queue" element={<OfficerQueuePage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/hotspots" element={<AdminHotspotsPage />} />
          <Route path="/admin/sla" element={<AdminSLARulesPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <footer className={`border-t py-8 text-xs transition-colors ${
        isDark ? 'border-slate-800/80 bg-[#080C14] text-slate-400' : 'border-slate-200 bg-white text-slate-600'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-blue-500/20">
              <Shield className="w-3.5 h-3.5 fill-white/20" />
            </div>
            <span className={`font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>CivicFix</span>
            <span className={isDark ? 'text-slate-600' : 'text-slate-300'}>|</span>
            <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Municipal Issue Resolution & Resolution Tracking System</span>
          </div>

          <div className={`flex items-center gap-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            <Link to="/issues" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
              Map View
            </Link>
            <Link to="/report" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
              Report Defect
            </Link>
            <Link to="/officer/queue" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
              Officer Portal
            </Link>
            <Link to="/admin" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
              Admin Console
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
