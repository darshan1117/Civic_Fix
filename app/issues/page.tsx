'use client';

import React, { useState, useEffect } from 'react';
import { Issue, Category } from '@/lib/types';
import { IssueMap } from '@/components/map/IssueMap';
import { StatusBadge } from '@/components/issues/StatusBadge';
import { SLACountdownBadge } from '@/components/issues/SLACountdownBadge';
import { UpvoteButton } from '@/components/issues/UpvoteButton';
import Link from 'next/link';
import {
  Search,
  Filter,
  MapPin,
  ExternalLink,
  PlusCircle,
  AlertTriangle,
  Trash2,
  Lightbulb,
  Droplets,
  Waves,
  HelpCircle,
} from 'lucide-react';

export default function IssuesPublicPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/issues').then((res) => res.json()),
      fetch('/api/categories').then((res) => res.json()),
    ])
      .then(([issuesData, categoriesData]) => {
        if (Array.isArray(issuesData)) setIssues(issuesData);
        if (Array.isArray(categoriesData)) setCategories(categoriesData);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const filteredIssues = issues.filter((issue) => {
    if (selectedCategory !== 'all' && issue.category_id !== selectedCategory) {
      return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        issue.title.toLowerCase().includes(q) ||
        issue.public_id.toLowerCase().includes(q) ||
        issue.address_text.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getCategoryIcon = (name: string = '') => {
    const lower = name.toLowerCase();
    if (lower.includes('pothole')) return AlertTriangle;
    if (lower.includes('garbage')) return Trash2;
    if (lower.includes('street')) return Lightbulb;
    if (lower.includes('water')) return Droplets;
    if (lower.includes('drain')) return Waves;
    return HelpCircle;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            Civic Issue Map & Registry
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time public transparency for citizen reports across Bengaluru.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                viewMode === 'map'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-2xs font-semibold'
                  : 'text-slate-600'
              }`}
            >
              Map View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-2xs font-semibold'
                  : 'text-slate-600'
              }`}
            >
              List View ({filteredIssues.length})
            </button>
          </div>

          <Link
            href="/report"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs inline-flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" /> Report Issue
          </Link>
        </div>
      </div>

      {/* Category Filter Chips & Search Bar */}
      <div className="space-y-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            All Categories ({issues.length})
          </button>

          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.name);
            const count = issues.filter((i) => i.category_id === cat.id).length;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 inline-flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.name}</span>
                <span className="opacity-75 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search issues by location or keywords..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'map' ? (
        <div className="space-y-4">
          <IssueMap
            issues={filteredIssues}
            height="550px"
            selectedCategory={selectedCategory}
          />
          <p className="text-xs text-slate-500 text-right">
            Click on any pin to inspect ticket ID, status, and SLA countdown.
          </p>
        </div>
      ) : (
        /* List View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIssues.map((issue) => (
            <div
              key={issue.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:border-blue-400 transition-colors flex flex-col justify-between"
            >
              <div>
                {issue.photos && issue.photos.length > 0 && (
                  <div className="w-full h-44 bg-slate-100 overflow-hidden relative">
                    <img
                      src={issue.photos[0].url}
                      alt={issue.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900/80 text-white backdrop-blur-xs">
                        {issue.public_id}
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      {issue.category_name}
                    </span>
                    <StatusBadge status={issue.status} size="sm" />
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
                    {issue.title}
                  </h3>

                  <p className="text-xs text-slate-500 flex items-center gap-1 line-clamp-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    {issue.address_text}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <UpvoteButton
                  issueId={issue.id}
                  initialUpvotes={issue.upvote_count}
                  initialHasUpvoted={issue.has_upvoted}
                  size="sm"
                />

                <Link
                  href={`/issues/${issue.id}`}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-blue-50 hover:text-blue-600 transition-colors inline-flex items-center gap-1"
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
