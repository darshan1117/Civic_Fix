'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { Issue } from '@/lib/types';
import { StatusBadge } from '@/components/issues/StatusBadge';
import { SLACountdownBadge } from '@/components/issues/SLACountdownBadge';
import { UpvoteButton } from '@/components/issues/UpvoteButton';
import { IssueTimeline } from '@/components/issues/IssueTimeline';
import { formatDateTime } from '@/lib/utils';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Clock,
  ShieldAlert,
  CheckCircle2,
  RotateCcw,
  Camera,
  AlertTriangle,
  Loader2,
  Calendar,
  Building,
  User,
  Share2,
} from 'lucide-react';

export default function IssueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [issue, setIssue] = useState<Issue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Dispute & Close states
  const [isClosing, setIsClosing] = useState(false);
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [reopenNote, setReopenNote] = useState('');
  const [isReopening, setIsReopening] = useState(false);

  const fetchIssue = async () => {
    try {
      const res = await fetch(`/api/issues/${params.id}`);
      if (!res.ok) {
        throw new Error('Issue not found');
      }
      const data = await res.json();
      setIssue(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load issue');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIssue();
  }, [params.id]);

  // Citizen Confirmation -> Move to Closed
  const handleConfirmClose = async () => {
    if (!issue || !user) return;
    setIsClosing(true);
    try {
      const res = await fetch(`/api/issues/${issue.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Closed',
          note: 'Citizen inspected the fix and confirmed satisfaction. Issue closed.',
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to close issue');
      }

      await fetchIssue();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsClosing(false);
    }
  };

  // Citizen Dispute -> Reopen issue within 7 days
  const handleReopenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issue || !user || !reopenNote.trim()) return;

    setIsReopening(true);
    try {
      const res = await fetch(`/api/issues/${issue.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Reopened',
          note: reopenNote,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to reopen issue');
      }

      setShowReopenModal(false);
      setReopenNote('');
      await fetchIssue();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsReopening(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
        <p className="text-xs">Loading issue lifecycle & timeline...</p>
      </div>
    );
  }

  if (errorMsg || !issue) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Issue Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested ticket ID does not exist or may have been deleted.
        </p>
        <Link
          href="/issues"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Issue Explorer
        </Link>
      </div>
    );
  }

  const isReporter = user?.id === issue.reporter_id;
  const isResolved = issue.status === 'Resolved';
  const reportPhotos = issue.photos?.filter((p) => p.kind === 'report') || [];
  const proofPhotos = issue.photos?.filter((p) => p.kind === 'proof') || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/issues"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Map & Issues
        </Link>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-slate-400 uppercase">
            {issue.public_id}
          </span>
        </div>
      </div>

      {/* Main Issue Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                {issue.public_id}
              </span>
              <StatusBadge status={issue.status} size="md" />
              <SLACountdownBadge
                createdAt={issue.created_at}
                slaDeadline={issue.sla_deadline}
                isCompleted={issue.status === 'Resolved' || issue.status === 'Closed'}
                showPercent={true}
              />
              {issue.escalation_level > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> SLA Escalated (Level {issue.escalation_level})
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              {issue.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5 pt-1">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{issue.address_text}</span>
            </p>
          </div>

          {/* Upvote & Actions */}
          <div className="shrink-0 flex items-center gap-3">
            <UpvoteButton
              issueId={issue.id}
              initialUpvotes={issue.upvote_count}
              initialHasUpvoted={issue.has_upvoted}
              size="md"
            />
          </div>
        </div>

        {/* Citizen Confirm or Dispute Banner (When Resolved) */}
        {isResolved && (
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-100">
                  Municipal Crew Marked This Issue as Resolved
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
                  Please inspect the proof-of-fix photo below. As the citizen reporter, you can
                  confirm the resolution to permanently close it, or dispute and reopen it within 7 days.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleConfirmClose}
                disabled={isClosing}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isClosing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm & Close Ticket
              </button>

              <button
                type="button"
                onClick={() => setShowReopenModal(true)}
                className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 text-xs font-semibold rounded-xl shadow-2xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Dispute Resolution (Reopen)
              </button>
            </div>
          </div>
        )}

        {/* Description Body */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Description
          </h3>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {issue.description}
          </p>
        </div>

        {/* Key Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block mb-1">Department</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-blue-500" />
              {issue.department_name}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block mb-1">Category</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {issue.category_name}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block mb-1">Calculated Priority</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {issue.priority_score} pts
            </span>
          </div>

          <div>
            <span className="text-slate-400 block mb-1">Reported Date</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {formatDateTime(issue.created_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Photo Gallery (Report Photos & Proof-of-fix Photo) */}
      <div className="space-y-6">
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
            <Camera className="w-5 h-5 text-slate-500" />
            Reported Issue Photos ({reportPhotos.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {reportPhotos.map((photo) => (
              <div
                key={photo.id}
                className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 aspect-video bg-slate-100 shadow-xs"
              >
                <img
                  src={photo.url}
                  alt="Citizen report"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Proof of Fix Photos if Available */}
        {proofPhotos.length > 0 && (
          <div className="p-6 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Official Proof-of-Fix Photo</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {proofPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="rounded-xl overflow-hidden border border-emerald-300 dark:border-emerald-700 aspect-video bg-slate-100 shadow-md"
                >
                  <img
                    src={photo.url}
                    alt="Proof of Fix"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Vertical Lifecycle Audit Timeline */}
      <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
            Resolution Lifecycle & Audit Trail
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable, append-only history of inspections, status changes, and SLA escalations.
          </p>
        </div>

        <IssueTimeline events={issue.events || []} />
      </div>

      {/* Reopen Dispute Modal */}
      {showReopenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-orange-300 dark:border-orange-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-2.5 text-orange-600 dark:text-orange-400 font-bold text-base">
              <RotateCcw className="w-5 h-5" />
              <span>Dispute & Reopen Resolution</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Please explain why the fix was insufficient or recurred. The ticket will return to
              the active department queue for reinspection.
            </p>

            <form onSubmit={handleReopenSubmit} className="space-y-4">
              <textarea
                rows={3}
                value={reopenNote}
                onChange={(e) => setReopenNote(e.target.value)}
                placeholder="e.g. The asphalt washed away during rain; hole has reopened..."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 text-slate-900 dark:text-slate-100"
              />

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReopenModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isReopening || !reopenNote.trim()}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-xl disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {isReopening && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Submit Dispute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
