import React, { useState } from 'react';
import { StatusBadge } from './StatusBadge';
import { AlertTriangle, ThumbsUp, MapPin, CheckCircle2, ArrowRight, X } from 'lucide-react';

export function SimilarIssuesModal({ isOpen, matches = [], onUpvoteInstead, onSubmitAnyway, onCancel }) {
  const [upvotedId, setUpvotedId] = useState(null);

  if (!isOpen || matches.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-amber-300 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Similar Issues Found Nearby ({matches.length})</h3>
              <p className="text-xs text-slate-600">An open report in this category already exists within 50 meters.</p>
            </div>
          </div>
          <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          <p className="text-xs text-slate-600">
            Upvoting existing tickets accelerates repair priority and notifies you upon resolution, avoiding duplicate work orders.
          </p>

          <div className="space-y-3">
            {matches.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:border-blue-400 transition-colors flex flex-col sm:flex-row gap-4 items-start"
              >
                {item.first_photo_url ? (
                  <img
                    src={item.first_photo_url}
                    alt={item.title}
                    className="w-full sm:w-24 h-24 rounded-lg object-cover bg-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-full sm:w-24 h-24 rounded-lg bg-slate-200 flex items-center justify-center text-slate-400 text-xs shrink-0">
                    No photo
                  </div>
                )}

                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[11px] font-bold text-slate-500">{item.public_id}</span>
                    <StatusBadge status={item.status} size="sm" />
                    <span className="text-[11px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      {item.distance_meters}m away
                    </span>
                  </div>

                  <h4 className="font-semibold text-sm text-slate-900 truncate">{item.title}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1 line-clamp-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    {item.address_text}
                  </p>

                  <div className="pt-2 flex items-center justify-between gap-3">
                    <span className="text-xs text-slate-500">
                      Upvotes: <strong className="text-slate-800">{item.upvote_count}</strong>
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

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={onCancel} className="text-xs font-medium text-slate-600 hover:text-slate-900">
            Review my report
          </button>
          <button
            type="button"
            onClick={onSubmitAnyway}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl border border-slate-300 transition-colors inline-flex items-center gap-1.5"
          >
            This is a different issue, submit anyway <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
