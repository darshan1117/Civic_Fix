import React, { useState } from 'react';
import { StatusBadge } from './StatusBadge';
import { AlertTriangle, ThumbsUp, MapPin, CheckCircle2, ArrowRight, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function SimilarIssuesModal({ isOpen, matches = [], onUpvoteInstead, onSubmitAnyway, onCancel }) {
  const [upvotedId, setUpvotedId] = useState(null);
  const { isDark } = useTheme();

  if (!isOpen || matches.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
      <div className={`rounded-2xl max-w-2xl w-full border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors ${
        isDark
          ? 'bg-[#131B2B] border-slate-700 text-slate-100'
          : 'bg-white border-amber-300 text-slate-900'
      }`}>
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isDark
            ? 'bg-amber-950/40 border-amber-800/50 text-amber-300'
            : 'bg-amber-50 border-amber-200 text-slate-900'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
              isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-500/20 text-amber-600'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Similar Issues Found Nearby ({matches.length})
              </h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                An open report in this category already exists within 50 meters.
              </p>
            </div>
          </div>
          <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Upvoting existing tickets accelerates repair priority and notifies you upon resolution, avoiding duplicate work orders.
          </p>

          <div className="space-y-3">
            {matches.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-colors flex flex-col sm:flex-row gap-4 items-start ${
                  isDark
                    ? 'border-slate-800 bg-slate-900/60 hover:border-blue-500/50'
                    : 'border-slate-200 bg-slate-50/60 hover:border-blue-400'
                }`}
              >
                {item.first_photo_url ? (
                  <img
                    src={item.first_photo_url}
                    alt={item.title}
                    className="w-full sm:w-24 h-24 rounded-lg object-cover bg-slate-800 shrink-0"
                  />
                ) : (
                  <div className={`w-full sm:w-24 h-24 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                    isDark ? 'bg-slate-800 text-slate-500' : 'bg-slate-200 text-slate-400'
                  }`}>
                    No photo
                  </div>
                )}

                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[11px] font-bold text-slate-500">{item.public_id}</span>
                    <StatusBadge status={item.status} size="sm" />
                    <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      {item.distance_meters}m away
                    </span>
                  </div>

                  <h4 className={`font-semibold text-sm truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.title}</h4>
                  <p className="text-xs text-slate-400 flex items-center gap-1 line-clamp-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                    {item.address_text}
                  </p>

                  <div className="pt-2 flex items-center justify-between gap-3">
                    <span className="text-xs text-slate-400">
                      Upvotes: <strong className={isDark ? 'text-white' : 'text-slate-800'}>{item.upvote_count}</strong>
                    </span>

                    <button
                      type="button"
                      onClick={async () => {
                        await onUpvoteInstead(item.id);
                        setUpvotedId(item.id);
                      }}
                      className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
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

        <div className={`px-6 py-4 border-t flex flex-wrap items-center justify-between gap-3 ${
          isDark ? 'bg-[#0E1524] border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <button
            type="button"
            onClick={onCancel}
            className={`text-xs font-medium cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Review my report
          </button>
          <button
            type="button"
            onClick={onSubmitAnyway}
            className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
              isDark
                ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                : 'border-slate-300 text-slate-700 hover:bg-slate-200'
            }`}
          >
            This is a different issue, submit anyway <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
