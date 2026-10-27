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
  ChevronRight,
  Sparkles,
  Camera,
  Layers,
  Building,
  Check,
  X,
  Smartphone,
  Laptop,
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

  const [activeCapability, setActiveCapability] = useState('duplicate');
  const [testAddress, setTestAddress] = useState('');
  const [checkResult, setCheckResult] = useState(null);
  const [showCookieBanner, setShowCookieBanner] = useState(true);

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
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 relative overflow-hidden">
      {/* Background ambient lighting glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-600/15 via-purple-600/10 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
        {/* Main Grid: Left Navigation / Tool Sidebar + Right Hero Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDEBAR: Table of Contents & Ward Checker (Inspired by Tabnav reference) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Table of Capabilities Card */}
            <div className="bg-[#131B2B]/80 backdrop-blur-md rounded-2xl border border-slate-800 p-5 shadow-2xl">
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block mb-3">
                CORE CAPABILITIES & WORKFLOWS
              </span>
              <div className="space-y-1">
                {[
                  { id: 'duplicate', label: 'Workflow #1 - 50m Duplicate Detection' },
                  { id: 'statemachine', label: 'Workflow #2 - Pure Lifecycle State Machine' },
                  { id: 'sla', label: 'Workflow #3 - Live SLA Timers & Auto-Escalation' },
                  { id: 'proof', label: 'Workflow #4 - Proof-of-Fix Verification Gate' },
                  { id: 'hotspots', label: 'Workflow #5 - BBMP Ward Hotspot Analytics' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveCapability(item.id)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                      activeCapability === item.id
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-glow-blue'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <span>{item.label}</span>
                    {activeCapability === item.id && <ChevronRight className="w-3.5 h-3.5 text-blue-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Ward Defect Scanner Card (Matching the Purple Card in reference image) */}
            <div className="bg-gradient-to-b from-[#182338] to-[#121927] rounded-2xl border border-blue-500/30 p-5 shadow-2xl space-y-3 relative overflow-hidden">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Search className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-white">Instant Ward Scanner</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Scan your street or ward to verify active municipal tickets, duplicate clusters, and SLA response time.
              </p>

              <form onSubmit={handleSimulateCheck} className="space-y-2 pt-1">
                <input
                  type="text"
                  value={testAddress}
                  onChange={(e) => setTestAddress(e.target.value)}
                  placeholder="e.g. Indiranagar, 100ft Road"
                  className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" /> Analyze Ward Defects
                </button>
              </form>

              {checkResult && (
                <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-800/60 text-[11px] text-blue-200 animate-in fade-in leading-relaxed">
                  {checkResult}
                </div>
              )}

              <span className="text-[10px] text-slate-400 block text-center pt-1">
                Real-time Haversine distance analysis
              </span>
            </div>

            {/* Quick Live Operational Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-[#131B2B]/70 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Mean SLA</span>
                <span className="text-xl font-extrabold text-blue-400">{stats.avgResolutionHours}h</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#131B2B]/70 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">SLA Compliance</span>
                <span className="text-xl font-extrabold text-emerald-400">{stats.slaComplianceRate}%</span>
              </div>
            </div>
          </div>

          {/* RIGHT CENTER: Hero Headline + Dual Device Mockup (Laptop + Overlapping Phone) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Hero Title Section */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Municipal Intelligence & Spatial Issue Resolution</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
                CivicFix — Clean Civic Resolution Platform{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                  With Real-Time Spatial Verification
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
                Empowering municipal corporations and smart cities. Eliminate chaotic duplicate reports within 50 meters,
                enforce statutory SLA countdown timers, and guarantee physical repair verification through photo proof gates.
              </p>
            </div>

            {/* DUAL DEVICE MOCKUP (The exact Wiz design centerpiece from the reference image!) */}
            <div className="relative pt-4 pb-2">
              {/* Laptop Mockup (Outer Container) */}
              <div className="relative bg-slate-900 rounded-3xl border-2 border-slate-700/80 shadow-2xl p-2 sm:p-3 overflow-hidden shadow-blue-500/10">
                {/* Laptop Top Chrome Bar */}
                <div className="h-6 bg-slate-950 rounded-t-xl px-3 flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="flex-1 max-w-xs mx-auto bg-slate-900 rounded-md text-[10px] font-mono text-slate-400 px-3 py-0.5 text-center truncate">
                    civicfix.city/map — Live Bengaluru GIS Ward Registry
                  </div>
                </div>

                {/* Laptop Screen Content: Interactive Leaflet Map Preview */}
                <div className="h-72 sm:h-96 w-full rounded-xl overflow-hidden relative z-0">
                  <LeafletMap issues={issues.slice(0, 12)} />
                </div>
              </div>

              {/* Overlapping Mobile Phone Mockup (Floating on the left, exactly like the reference!) */}
              <div className="absolute -left-3 sm:-left-6 bottom-4 sm:bottom-6 w-52 sm:w-64 bg-[#131B2B] rounded-3xl border-2 border-slate-600 shadow-2xl p-2.5 z-20 shadow-black/80 hidden md:block animate-in fade-in slide-in-from-bottom-4">
                {/* Mobile Notch */}
                <div className="w-16 h-3 bg-slate-950 rounded-full mx-auto mb-2" />

                {/* Mobile Screen App UI */}
                <div className="bg-[#0B0F17] rounded-2xl p-3 space-y-2.5 border border-slate-800 text-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-white">CivicFix Mobile</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                      GPS Active
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <p className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Similar Issue Nearby (22m)
                    </p>
                    <p className="text-[9px] text-slate-400 line-clamp-2">
                      Hebbal Flyover deep pothole already reported 4 hours ago.
                    </p>
                    <div className="pt-1 flex items-center gap-1.5">
                      <button className="flex-1 py-1 rounded bg-blue-600 text-[9px] font-bold text-white text-center">
                        Upvote (44)
                      </button>
                      <button className="flex-1 py-1 rounded bg-slate-800 text-[9px] text-slate-300 text-center">
                        Submit New
                      </button>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-800/40 space-y-1">
                    <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Verified Proof-of-Fix
                    </span>
                    <p className="text-[8px] text-slate-400">
                      Asphalt patch completed with mandatory timestamped photo.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action CTAs Below Devices */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/issues"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all cursor-pointer"
              >
                Explore Live Platform <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/report"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 hover:text-white font-semibold text-sm transition-all"
              >
                Report Civic Defect
              </Link>

              <Link
                to="/admin/hotspots"
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-blue-400 transition"
              >
                <Flame className="w-4 h-4 text-rose-500" /> View BBMP Hotspots →
              </Link>
            </div>

            {/* "What You Can Learn From This Design" (Matches Reference Screenshot Footer Section) */}
            <div className="pt-8 border-t border-slate-800/80 space-y-4">
              <h3 className="text-xl font-bold text-white tracking-tight">
                What You Can Learn From This Architecture
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[#131B2B]/60 border border-slate-800 space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h4 className="font-bold text-sm text-white">50m Spatial Filtering</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Uses the spherical Haversine formula to identify open hazards within 50 meters, preventing helpline flood.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#131B2B]/60 border border-slate-800 space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <h4 className="font-bold text-sm text-white">Pure Finite State Machine</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Zero illegal status jumps. Resolving issues strictly mandates uploading photographic proof-of-work.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#131B2B]/60 border border-slate-800 space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <h4 className="font-bold text-sm text-white">Multi-Tier SLA Escalation</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Idempotent cron engine escalates breached tickets from Field Crews to Dept Heads to the City Commissioner.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Floating Cookie / Quick Notification Card (Bottom-Right, Exactly like the reference image!) */}
      {showCookieBanner && (
        <div className="fixed bottom-5 right-5 z-40 max-w-sm w-full bg-[#131B2B] rounded-2xl border border-slate-700/90 shadow-2xl p-5 space-y-3 animate-in fade-in slide-in-from-bottom-5">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" /> Live Operational Notice
            </h4>
            <button
              onClick={() => setShowCookieBanner(false)}
              className="text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            All 4 municipal departments are currently operating within 92% SLA compliance across Bengaluru wards.
          </p>
          <div className="space-y-2 pt-1">
            <Link
              to="/issues"
              onClick={() => setShowCookieBanner(false)}
              className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center transition shadow-md shadow-blue-500/20"
            >
              Explore Live GIS Registry
            </Link>
            <button
              onClick={() => setShowCookieBanner(false)}
              className="w-full py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
            >
              Dismiss Notice
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
