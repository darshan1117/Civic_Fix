'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Issue, IssueStatus } from '@/lib/types';
import { StatusBadge } from '../issues/StatusBadge';
import { SLACountdownBadge } from '../issues/SLACountdownBadge';
import { UpvoteButton } from '../issues/UpvoteButton';
import { formatDateTime } from '@/lib/utils';
import {
  Search,
  Filter,
  ArrowUpDown,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

interface IssuesTableProps {
  issues: Issue[];
  title?: string;
  isOfficerQueue?: boolean;
}

export function IssuesTable({
  issues,
  title = 'Civic Issues Directory',
  isOfficerQueue = false,
}: IssuesTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'priority' | 'created_at' | 'sla_deadline' | 'upvotes'>(
    'priority'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter issues
  const filtered = issues.filter((issue) => {
    if (statusFilter !== 'all' && issue.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && issue.category_id !== categoryFilter) return false;
    if (overdueOnly) {
      if (issue.status === 'Resolved' || issue.status === 'Closed' || issue.status === 'Rejected') {
        return false;
      }
      if (new Date(issue.sla_deadline).getTime() >= Date.now()) return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const match =
        issue.title.toLowerCase().includes(q) ||
        issue.public_id.toLowerCase().includes(q) ||
        issue.address_text.toLowerCase().includes(q) ||
        issue.department_name?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Sort issues
  filtered.sort((a, b) => {
    let cmp = 0;
    if (sortBy === 'priority') {
      cmp = b.priority_score - a.priority_score;
    } else if (sortBy === 'created_at') {
      cmp = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else if (sortBy === 'sla_deadline') {
      cmp = new Date(a.sla_deadline).getTime() - new Date(b.sla_deadline).getTime();
    } else if (sortBy === 'upvotes') {
      cmp = b.upvote_count - a.upvote_count;
    }
    return sortOrder === 'desc' ? cmp : -cmp;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSort = (field: 'priority' | 'created_at' | 'sla_deadline' | 'upvotes') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
      {/* Header & Controls */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{title}</h3>
            <p className="text-xs text-slate-500">
              Showing {filtered.length} matching issues
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
              <input
                type="checkbox"
                checked={overdueOnly}
                onChange={(e) => setOverdueOnly(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500"
              />
              <span className={overdueOnly ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                Overdue Only
              </span>
            </label>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by ID, title, address, or department..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200"
            >
              <option value="all">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Acknowledged">Acknowledged</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
              <option value="Rejected">Rejected</option>
              <option value="Reopened">Reopened</option>
            </select>
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200"
            >
              <option value="all">All Categories</option>
              <option value="cat-pothole">Pothole</option>
              <option value="cat-garbage">Garbage</option>
              <option value="cat-streetlight">Streetlight</option>
              <option value="cat-water">Water Leakage</option>
              <option value="cat-drainage">Drainage</option>
              <option value="cat-other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-5 py-3.5">Issue Details</th>
              <th className="px-4 py-3.5">Status</th>
              <th
                className="px-4 py-3.5 cursor-pointer hover:text-slate-900"
                onClick={() => toggleSort('priority')}
              >
                <div className="flex items-center gap-1">
                  <span>Priority</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="px-4 py-3.5 cursor-pointer hover:text-slate-900"
                onClick={() => toggleSort('sla_deadline')}
              >
                <div className="flex items-center gap-1">
                  <span>SLA Countdown</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="px-4 py-3.5 cursor-pointer hover:text-slate-900 text-center"
                onClick={() => toggleSort('upvotes')}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Upvotes</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-5 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                  No issues found matching your filters.
                </td>
              </tr>
            ) : (
              paginated.map((issue) => (
                <tr
                  key={issue.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-start gap-3">
                      {issue.photos && issue.photos.length > 0 && (
                        <img
                          src={issue.photos[0].url}
                          alt={issue.title}
                          className="w-11 h-11 rounded-lg object-cover bg-slate-100 shrink-0"
                        />
                      )}
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400">
                            {issue.public_id}
                          </span>
                          {issue.escalation_level > 0 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-sm bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 flex items-center gap-0.5">
                              <ShieldAlert className="w-2.5 h-2.5" /> L{issue.escalation_level}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400">
                            {issue.category_name}
                          </span>
                        </div>
                        <h4 className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate max-w-xs">
                          {issue.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate max-w-xs">
                          {issue.address_text}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={issue.status} size="sm" />
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {issue.priority_score} pts
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <SLACountdownBadge
                      createdAt={issue.created_at}
                      slaDeadline={issue.sla_deadline}
                      isCompleted={issue.status === 'Resolved' || issue.status === 'Closed'}
                    />
                  </td>
                  <td className="px-4 py-3.5 text-center font-semibold text-slate-700 dark:text-slate-300">
                    {issue.upvote_count}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={isOfficerQueue ? `/officer/issues/${issue.id}` : `/issues/${issue.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                    >
                      {isOfficerQueue ? 'Take Action' : 'View'} <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
