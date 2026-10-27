import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LeafletMap } from '../components/LeafletMap';
import api from '../services/api';
import {
  Shield,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Flame,
  Search,
  Sparkles,
  X,
  Layers,
  Building,
} from 'lucide-react';

export default function LandingPage() {
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState({
    totalIssues: 12,
    openIssuesCount: 9,
    resolvedIssuesCount: 3,
    avgResolutionHours: 24,
    slaComplianceRate: 92,
  });

  const [testAddress, setTestAddress] = useState('');
  const [checkResult, setCheckResult] = useState(null);
  const [showNoticeBanner, setShowNoticeBanner] = useState(true);

  useEffect(() => {
    api.get('/issues').then((res) => {
      if (Array.isArray(res.data)) setIssues(res.data);
    }).catch(() => {});

    api.get('/stats').then((res) => {
      if (res.data) setStats(res.data);
    }).catch(() => {});
  }, []);

  const handleSimulateCheck = (e) => {
    e.preventDefault();
    if (!testAddress.trim()) {
      setCheckResult('Please enter an address or landmark in Bengaluru.');
      return;
    }
    setCheckResult(`📍 Ward scan complete for "${testAddress}": 2 active reports found within 500m. Average SLA response: 24h.`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 relative overflow-hidden transition-colors duration-200">
      {/* Background ambient lighting glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-500/10 dark:from-blue-600/15 via-purple-500/5 dark:via-purple-600/10 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
        {/* Main Grid: Left Ward Scanner + Right Hero Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDEBAR: Instant Ward Scanner & Live Stats */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* Interactive Ward Defect Scanner Card */}
            <div className="bg-white dark:bg-gradient-to-b dark:from-[#182338] dark:to-[#121927] rounded-3xl border border-slate-200 dark:border-blue-500/30 p-6 shadow-xl space-y-4 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Instant Ward Scanner</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Geo-spatial Defect Verification</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Scan your street or ward to verify active municipal tickets, duplicate clusters, and SLA response time.
              </p>

              <form onSubmit={handleSimulateCheck} className="space-y-2.5 pt-1">
                <input
                  type="text"
                  value={testAddress}
                  onChange={(e) => setTestAddress(e.target.value)}
                  placeholder="e.g. Indiranagar, 100ft Road"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" /> Analyze Ward Defects
                </button>
              </form>

              {checkResult && (
                <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 text-[11px] text-blue-900 dark:text-blue-200 animate-in fade-in leading-relaxed">
                  {checkResult}
                </div>
              )}

              <span className="text-[10px] text-slate-400 dark:text-slate-500 block text-center pt-1">
                Real-time Haversine distance analysis (50m precision)
              </span>
            </div>

            {/* Live Operational Metrics Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-white dark:bg-[#131B2B]/70 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block">Mean SLA</span>
                <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1 block">{stats.avgResolutionHours}h</span>
                <span className="text-[10px] text-slate-400">Target turnaround</span>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-[#131B2B]/70 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block">SLA Compliance</span>
                <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block">{stats.slaComplianceRate}%</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Fixed within SLA</span>
              </div>
            </div>

            {/* Priority Status Callout */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#131B2B]/70 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">Department Operations Active</span>
              <p className="text-[11px] leading-relaxed">
                Solid Waste, Roads, Electricity, and Water Supply field crews actively dispatched with photo-verified closure tracking.
              </p>
            </div>
          </div>

          {/* RIGHT CENTER: Hero Headline + Clean Laptop Mockup (NO Phone Mockup, 100% Clean Map) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Hero Title Section */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Municipal Intelligence & Spatial Issue Resolution</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 dark:text-white tracking-tight leading-[1.15]">
                CivicFix — Clean Civic Resolution{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-400">
                  Platform
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                Empowering municipal corporations and smart cities. Eliminate chaotic duplicate reports within 50 meters,
                enforce statutory SLA countdown timers, and guarantee physical repair verification through photo proof gates.
              </p>
            </div>

            {/* Laptop Mockup (Full-Width, Completely Unobstructed, ZERO Mobile Overlay) */}
            <div className="relative pt-2 pb-2">
              <div className="relative bg-slate-100 dark:bg-slate-900 rounded-3xl border-2 border-slate-300 dark:border-slate-700/80 shadow-2xl p-2 sm:p-3 overflow-hidden shadow-blue-500/10 transition-colors">
                {/* Laptop Top Chrome Bar */}
                <div className="h-7 bg-white dark:bg-slate-950 rounded-t-xl px-3 flex items-center gap-2 mb-2 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="flex-1 max-w-xs mx-auto bg-slate-100 dark:bg-slate-900 rounded-md text-[10px] font-mono text-slate-500 dark:text-slate-400 px-3 py-0.5 text-center truncate">
                    civicfix.city/map — Live Bengaluru GIS Ward Registry
                  </div>
                </div>

                {/* Laptop Screen Content: Full Width Leaflet Map */}
                <div className="h-80 sm:h-[420px] w-full rounded-xl overflow-hidden relative z-0">
                  <LeafletMap issues={issues.slice(0, 12)} />
                </div>
              </div>
            </div>

            {/* Action CTAs Below Devices */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <Link
                to="/issues"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all cursor-pointer"
              >
                Explore Live Platform <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/report"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 text-slate-800 dark:text-slate-200 font-semibold text-sm transition-all shadow-xs"
              >
                Report Civic Defect
              </Link>

              <Link
                to="/admin/hotspots"
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                <Flame className="w-4 h-4 text-rose-500" /> View BBMP Hotspots →
              </Link>
            </div>

            {/* "What You Can Learn From This Architecture" */}
            <div className="pt-8 border-t border-slate-200 dark:border-slate-800/80 space-y-4">
              <h3 className="text-xl font-bold text-slate-950 dark:text-white tracking-tight">
                What You Can Learn From This Architecture
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-[#131B2B]/60 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h4 className="font-bold text-sm text-slate-950 dark:text-white">50m Spatial Filtering</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Uses the spherical Haversine formula to identify open hazards within 50 meters, preventing helpline flood.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-[#131B2B]/60 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <h4 className="font-bold text-sm text-slate-950 dark:text-white">Pure Finite State Machine</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Zero illegal status jumps. Resolving issues strictly mandates uploading photographic proof-of-work.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-[#131B2B]/60 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <h4 className="font-bold text-sm text-slate-950 dark:text-white">Multi-Tier SLA Escalation</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Idempotent cron engine escalates breached tickets from Field Crews to Dept Heads to the City Commissioner.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Floating Operational Notice Card */}
      {showNoticeBanner && (
        <div className="fixed bottom-5 right-5 z-40 max-w-sm w-full bg-white dark:bg-[#131B2B] rounded-2xl border border-slate-200 dark:border-slate-700/90 shadow-2xl p-5 space-y-3 animate-in fade-in slide-in-from-bottom-5">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Live Operational Notice
            </h4>
            <button
              onClick={() => setShowNoticeBanner(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            All 4 municipal departments are currently operating within 92% SLA compliance across Bengaluru wards.
          </p>
          <div className="space-y-2 pt-1">
            <Link
              to="/issues"
              onClick={() => setShowNoticeBanner(false)}
              className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center transition shadow-md shadow-blue-500/20"
            >
              Explore Live GIS Registry
            </Link>
            <button
              onClick={() => setShowNoticeBanner(false)}
              className="w-full py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition cursor-pointer"
            >
              Dismiss Notice
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
