'use client';

import React, { useState } from 'react';
import { SimilarIssue } from '@/lib/types';
import { StatusBadge } from '../issues/StatusBadge';
import { formatDateTime } from '@/lib/utils';
import {
  AlertTriangle,
  ThumbsUp,
  MapPin,
  CheckCircle2,
  ArrowRight,
  X,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

interface SimilarIssuesModalProps {
  isOpen: boolean;
  matches: SimilarIssue[];
  onUpvoteInstead: (issueId: string) => Promise<void>;
  onSubmitAnyway: () => void;
  onCancel: () => void;
}

export function SimilarIssuesModal({
  isOpen,
  matches,
  onUpvoteInstead,
  onSubmitAnyway,
  onCancel,
}: SimilarIssuesModalProps) {
  const [upvotingId, setUpvotingId] = useState<string | null>(null);
  const [upvotedId, setUpvotedId] = useState<string | null>(null);

  if (!isOpen || matches.length === 0) return null;

  const handleUpvote = async (issueId: string) => {
    setUpvotingId(issueId);
    try {
      await onUpvoteInstead(issueId);
      setUpvotedId(issueId);
    } finally {
      setUpvotingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-amber-300 dark:border-amber-800/60 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Similar Issues Found Nearby ({matches.length})
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                An open issue for this category already exists within 50 meters of your pin.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Upvoting existing reports increases municipal urgency and notifies you when the crew fixes it, avoiding duplicate tickets.
          </p>

          <div className="space-y-3">
            {matches.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 hover:border-blue-400 transition-colors flex flex-col sm:flex-row gap-4 items-start"
              >
                {/* Photo thumbnail */}
                {item.first_photo_url ? (
                  <img
                    src={item.first_photo_url}
                    alt={item.title}
                    className="w-full sm:w-24 h-24 rounded-lg object-cover bg-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-full sm:w-24 h-24 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-xs shrink-0">
                    No photo
                  </div>
                )}

                {/* Details */}
                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[11px] font-bold text-slate-500">
                      {item.public_id}
                    </span>
                    <StatusBadge status={item.status} size="sm" />
                    <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded-full">
                      {item.distance_meters}m away
                    </span>
                  </div>

                  <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                    {item.title}
                  </h4>

                  <p className="text-xs text-slate-500 flex items-center gap-1 line-clamp-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    {item.address_text}
                  </p>

                  <div className="pt-2 flex items-center justify-between gap-3">
                    <span className="text-xs text-slate-500">
                      Current upvotes: <strong className="text-slate-800 dark:text-slate-200">{item.upvote_count}</strong>
                    </span>

                    <button
                      type="button"
                      onClick={() => handleUpvote(item.id)}
                      disabled={upvotingId === item.id || upvotedId === item.id}
                      className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-75"
                    >
                      {upvotedId === item.id ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Upvoted!
                        </>
                      ) : (
                        <>
                          <ThumbsUp className="w-3.5 h-3.5" /> Upvote this instead
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900"
          >
            Review my report
          </button>

          <button
            type="button"
            onClick={onSubmitAnyway}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl border border-slate-300 dark:border-slate-700 transition-colors inline-flex items-center gap-1.5"
          >
            This is a different issue, submit anyway <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
