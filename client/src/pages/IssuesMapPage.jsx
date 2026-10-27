import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LeafletMap } from '../components/LeafletMap';
import { StatusBadge } from '../components/StatusBadge';
import { SLABadge } from '../components/SLABadge';
import { UpvoteButton } from '../components/UpvoteButton';
import api from '../services/api';
import {
  Search,
  PlusCircle,
  MapPin,
  ExternalLink,
  AlertTriangle,
  Trash2,
  Lightbulb,
  Droplets,
  Waves,
  HelpCircle,
  Layers,
  ChevronRight,
} from 'lucide-react';

export default function IssuesMapPage() {
  const [issues, setIssues] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('map');

  useEffect(() => {
    api.get('/issues').then((res) => {
      if (Array.isArray(res.data)) setIssues(res.data);
    }).catch(() => {});

    api.get('/categories').then((res) => {
      if (Array.isArray(res.data)) setCategories(res.data);
    }).catch(() => {});
  }, []);

  const filtered = issues.filter((i) => {
    if (selectedCat !== 'all') {
      const catId = i.category?._id || i.category;
      if (catId !== selectedCat) return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const match =
        i.title?.toLowerCase().includes(q) ||
        i.public_id?.toLowerCase().includes(q) ||
        i.address_text?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const getCatIcon = (name = '') => {
    const l = name.toLowerCase();
    if (l.includes('pothole')) return AlertTriangle;
    if (l.includes('garbage')) return Trash2;
    if (l.includes('street')) return Lightbulb;
    if (l.includes('water')) return Droplets;
    if (l.includes('drain')) return Waves;
    return HelpCircle;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-1">
            <Layers className="w-3.5 h-3.5" /> Live Municipal Registry
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Civic Issue Map & Registry
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time public transparency for citizen reports across Bengaluru.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-xl p-1 bg-slate-900 border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                viewMode === 'map'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Map View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              List View ({filtered.length})
            </button>
          </div>

          <Link
            to="/report"
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/25 inline-flex items-center gap-1.5 transition"
          >
            <PlusCircle className="w-4 h-4" /> Report Issue
          </Link>
        </div>
      </div>

      {/* Category Chips & Search Bar */}
      <div className="space-y-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedCat('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 cursor-pointer transition-all ${
              selectedCat === 'all'
                ? 'bg-blue-600 text-white shadow-glow-blue'
                : 'bg-[#131B2B] text-slate-300 border border-slate-800 hover:border-slate-700 hover:bg-slate-800'
            }`}
          >
            All Categories ({issues.length})
          </button>

          {categories.map((cat) => {
            const Icon = getCatIcon(cat.name);
            const count = issues.filter((i) => (i.category?._id || i.category) === cat._id).length;
            const isSelected = selectedCat === cat._id;

            return (
              <button
                key={cat._id}
                type="button"
                onClick={() => setSelectedCat(cat._id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 cursor-pointer transition-all inline-flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-glow-blue'
                    : 'bg-[#131B2B] text-slate-300 border border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.name}</span>
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ticket ID (CF-...), problem description, or street name..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#131B2B] border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
      </div>

      {/* Main Map or List View */}
      {viewMode === 'map' ? (
        <div className="bg-[#131B2B] rounded-3xl border border-slate-800 overflow-hidden shadow-2xl p-2 relative">
          <div className="h-[600px] w-full rounded-2xl overflow-hidden relative z-0">
            <LeafletMap issues={filtered} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((issue) => {
            const isResolved = ['Resolved', 'Closed'].includes(issue.status);

            return (
              <div
                key={issue._id}
                className="bg-[#131B2B] rounded-2xl border border-slate-800 p-5 space-y-3 hover:border-slate-700 transition flex flex-col justify-between shadow-xl"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                      {issue.public_id}
                    </span>
                    <StatusBadge status={issue.status} size="sm" />
                  </div>

                  <Link
                    to={`/issues/${issue.public_id || issue._id}`}
                    className="font-bold text-sm text-white hover:text-blue-400 transition block line-clamp-2"
                  >
                    {issue.title}
                  </Link>

                  <p className="text-xs text-slate-400 line-clamp-2">
                    {issue.description}
                  </p>

                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{issue.address_text}</span>
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <SLABadge
                    createdAt={issue.createdAt}
                    slaDeadline={issue.sla_deadline}
                    isCompleted={isResolved}
                  />

                  <UpvoteButton
                    issueId={issue._id}
                    initialCount={issue.upvote_count || 0}
                    initialHasUpvoted={issue.has_upvoted}
                    size="sm"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
