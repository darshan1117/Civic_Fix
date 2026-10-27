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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Civic Issue Map & Registry</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time public transparency for citizen reports across Bengaluru.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-xl p-1 bg-slate-100 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                viewMode === 'map' ? 'bg-white text-blue-600 shadow-2xs font-semibold' : 'text-slate-600'
              }`}
            >
              Map View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                viewMode === 'list' ? 'bg-white text-blue-600 shadow-2xs font-semibold' : 'text-slate-600'
              }`}
            >
              List View ({filtered.length})
            </button>
          </div>

          <Link
            to="/report"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs inline-flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" /> Report Issue
          </Link>
        </div>
      </div>

      {/* Category Chips & Search */}
      <div className="space-y-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedCat('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 cursor-pointer ${
              selectedCat === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
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
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 inline-flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.name}</span>
                <span className="opacity-75 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>

        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search issues by location or keywords..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {viewMode === 'map' ? (
        <LeafletMap issues={filtered} height="550px" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((issue) => (
            <div
              key={issue._id || issue.id}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:border-blue-400 transition-colors flex flex-col justify-between"
            >
              <div>
                {issue.photos?.[0] && (
                  <div className="w-full h-44 bg-slate-100 overflow-hidden relative">
                    <img src={issue.photos[0].url} alt={issue.title} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900/80 text-white">
                        {issue.public_id}
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
                      {issue.category?.name || 'Hazard'}
                    </span>
                    <StatusBadge status={issue.status} size="sm" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 line-clamp-2 leading-snug">{issue.title}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 line-clamp-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    {issue.address_text}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <UpvoteButton
                  issueId={issue._id || issue.id}
                  initialCount={issue.upvote_count || 0}
                  initialHasUpvoted={issue.has_upvoted}
                  size="sm"
                />
                <Link
                  to={`/issues/${issue._id || issue.id}`}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors inline-flex items-center gap-1"
                >
                  View Details <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
