import React, { useState } from 'react';
import { ThumbsUp, Check } from 'lucide-react';
import api from '../services/api';

export function UpvoteButton({ issueId, initialCount = 0, initialHasUpvoted = false, size = 'md' }) {
  const [upvotes, setUpvotes] = useState(initialCount);
  const [hasUpvoted, setHasUpvoted] = useState(initialHasUpvoted);
  const [submitting, setSubmitting] = useState(false);

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (submitting) return;
    setSubmitting(true);

    const nextState = !hasUpvoted;
    const nextCount = nextState ? upvotes + 1 : Math.max(0, upvotes - 1);
    setHasUpvoted(nextState);
    setUpvotes(nextCount);

    try {
      const res = await api.post(`/issues/${issueId}/upvote`);
      if (res.data?.success) {
        setHasUpvoted(res.data.hasUpvoted);
        setUpvotes(res.data.upvoteCount);
      }
    } catch {
      // Revert if API fails
      setHasUpvoted(hasUpvoted);
      setUpvotes(upvotes);
    } finally {
      setSubmitting(false);
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-sm px-3.5 py-1.5 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5 font-semibold',
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={submitting}
      className={`inline-flex items-center rounded-xl font-medium transition-all cursor-pointer border shadow-2xs ${
        hasUpvoted
          ? 'bg-blue-600 text-white border-blue-600 shadow-blue-500/20 shadow-md'
          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-blue-400'
      } ${sizeClasses[size]}`}
    >
      {hasUpvoted ? <Check className="w-4 h-4 stroke-[2.5]" /> : <ThumbsUp className="w-4 h-4 stroke-[2]" />}
      <span>{upvotes}</span>
      <span className="hidden sm:inline text-xs opacity-90">{hasUpvoted ? 'Upvoted' : 'Upvote'}</span>
    </button>
  );
}
