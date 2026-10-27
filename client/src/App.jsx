import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Navbar } from './components/Navbar';
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
import { Shield, Heart } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
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

      {/* Clean Municipal Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              <Shield className="w-3.5 h-3.5 fill-white/20" />
            </div>
            <span className="font-bold text-slate-800">CivicFix</span>
            <span className="text-slate-400">|</span>
            <span>Municipal Issue Resolution & Resolution Tracking System</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/issues" className="hover:text-slate-900 transition">
              Map View
            </Link>
            <Link to="/report" className="hover:text-slate-900 transition">
              Report Defect
            </Link>
            <Link to="/officer/queue" className="hover:text-slate-900 transition">
              Officer Portal
            </Link>
            <Link to="/admin" className="hover:text-slate-900 transition">
              Admin Console
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
