'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { cn } from '@/lib/utils';
import { ThumbsUp, Check } from 'lucide-react';

interface UpvoteButtonProps {
  issueId: string;
  initialUpvotes: number;
  initialHasUpvoted?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  onUpvoteChange?: (newCount: number, hasUpvoted: boolean) => void;
}

export function UpvoteButton({
  issueId,
  initialUpvotes,
  initialHasUpvoted = false,
  className,
  size = 'md',
  onUpvoteChange,
}: UpvoteButtonProps) {
  const { user } = useAuth();
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [hasUpvoted, setHasUpvoted] = useState(initialHasUpvoted);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      setErrorToast('Please sign in to upvote issues.');
      setTimeout(() => setErrorToast(null), 3000);
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    // Optimistic UI update
    const nextHasUpvoted = !hasUpvoted;
    const nextCount = nextHasUpvoted ? upvotes + 1 : Math.max(0, upvotes - 1);
    setHasUpvoted(nextHasUpvoted);
    setUpvotes(nextCount);

    try {
      const res = await fetch(`/api/issues/${issueId}/upvote`, {
        method: 'POST',
      });
      const data = await res.json();

      if (!res.ok) {
        // Revert on error
        setHasUpvoted(hasUpvoted);
        setUpvotes(upvotes);
        setErrorToast(data.error || 'Failed to update upvote');
        setTimeout(() => setErrorToast(null), 3000);
      } else {
        setHasUpvoted(data.hasUpvoted);
        setUpvotes(data.upvoteCount);
        if (onUpvoteChange) {
          onUpvoteChange(data.upvoteCount, data.hasUpvoted);
        }
      }
    } catch {
      // Revert on error
      setHasUpvoted(hasUpvoted);
      setUpvotes(upvotes);
      setErrorToast('Network error updating upvote');
      setTimeout(() => setErrorToast(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-sm px-3.5 py-1.5 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5 font-semibold',
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleToggle}
        disabled={isSubmitting}
        title={hasUpvoted ? 'Remove upvote' : 'I face this civic issue too (+1)'}
        className={cn(
          'inline-flex items-center rounded-xl font-medium transition-all cursor-pointer border shadow-xs',
          hasUpvoted
            ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 shadow-blue-500/20 shadow-md'
            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 hover:border-blue-400',
          sizeClasses[size],
          className
        )}
      >
        {hasUpvoted ? (
          <Check className="w-4 h-4 stroke-[2.5]" />
        ) : (
          <ThumbsUp className="w-4 h-4 stroke-[2]" />
        )}
        <span>{upvotes}</span>
        <span className="hidden sm:inline text-xs opacity-90">
          {hasUpvoted ? 'Upvoted' : 'Upvote'}
        </span>
      </button>

      {errorToast && (
        <div className="absolute left-0 -bottom-8 z-50 bg-rose-600 text-white text-xs px-2.5 py-1 rounded shadow-lg whitespace-nowrap animate-in fade-in slide-in-from-top-1">
          {errorToast}
        </div>
      )}
    </div>
  );
}
