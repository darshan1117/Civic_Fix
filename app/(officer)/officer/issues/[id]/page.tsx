'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { Issue, IssueStatus } from '@/lib/types';
import { getAvailableTransitions } from '@/lib/stateMachine';
import { StatusBadge } from '@/components/issues/StatusBadge';
import { SLACountdownBadge } from '@/components/issues/SLACountdownBadge';
import { IssueTimeline } from '@/components/issues/IssueTimeline';
import { ProofOfFixDialog } from '@/components/issues/ProofOfFixDialog';
import { formatDateTime } from '@/lib/utils';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Clock,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Wrench,
  Eye,
  Loader2,
  Building,
  User,
  AlertCircle,
} from 'lucide-react';

export default function OfficerIssueActionPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modals
  const [showProofDialog, setShowProofDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const fetchIssue = async () => {
    try {
      const res = await fetch(`/api/issues/${params.id}`);
      if (!res.ok) throw new Error('Issue not found');
      const data = await res.json();
      setIssue(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load issue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssue();
  }, [params.id]);

  // Handle direct transition
  const handleTransition = async (toStatus: IssueStatus, note?: string) => {
    if (!issue || !user) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/issues/${issue.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: toStatus,
          note: note || `Officer transitioned ticket to ${toStatus}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update status');
      }

      await fetchIssue();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Proof of Fix submit
  const handleProofSubmit = async (proofPhotoUrl: string, note: string) => {
    if (!issue || !user) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/issues/${issue.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Resolved',
          proofPhotoUrl,
          note,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to resolve issue');
      }

      await fetchIssue();
    } catch (err: any) {
      setErrorMsg(err.message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reject submit
  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason.trim()) return;
    await handleTransition('Rejected', rejectReason);
    setShowRejectDialog(false);
    setRejectReason('');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
        <p className="text-xs">Loading officer action console...</p>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold">Issue Not Found</h2>
        <Link href="/officer/queue" className="text-xs text-blue-600 hover:underline mt-2 inline-block">
          Return to Queue
        </Link>
      </div>
    );
  }

  // Pure state machine allowed transitions
  const allowedNext = getAvailableTransitions(
    issue.status,
    user?.role === 'admin' ? 'admin' : 'officer'
  );

  const reportPhotos = issue.photos?.filter((p) => p.kind === 'report') || [];
  const proofPhotos = issue.photos?.filter((p) => p.kind === 'proof') || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/officer/queue"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Queue
        </Link>
        <span className="font-mono text-xs font-bold text-slate-400">{issue.public_id}</span>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Action Control Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-blue-50 text-blue-700">
                {issue.public_id}
              </span>
              <StatusBadge status={issue.status} size="md" />
              <SLACountdownBadge
                createdAt={issue.created_at}
                slaDeadline={issue.sla_deadline}
                isCompleted={issue.status === 'Resolved' || issue.status === 'Closed'}
                showPercent={true}
              />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{issue.title}</h1>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              {issue.address_text}
            </p>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-400 block">Queue Priority</span>
            <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
              {issue.priority_score} pts
            </span>
          </div>
        </div>

        {/* Dynamic Action Buttons based strictly on State Machine transitions */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-3">
            Permitted Next Actions
          </span>

          {allowedNext.length === 0 ? (
            <p className="text-xs text-slate-400 italic">
              No further actions available for this issue in status '{issue.status}'.
            </p>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              {allowedNext.includes('Acknowledged') && (
                <button
                  type="button"
                  onClick={() => handleTransition('Acknowledged', 'Department officer acknowledged ticket and scheduled team.')}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  <Eye className="w-4 h-4" /> Acknowledge Report
                </button>
              )}

              {allowedNext.includes('In Progress') && (
                <button
                  type="button"
                  onClick={() => handleTransition('In Progress', 'Crew and machinery deployed to site. Work in progress.')}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  <Wrench className="w-4 h-4" /> Deploy Crew / Start Work
                </button>
              )}

              {allowedNext.includes('Resolved') && (
                <button
                  type="button"
                  onClick={() => setShowProofDialog(true)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" /> Upload Proof & Mark Resolved
                </button>
              )}

              {allowedNext.includes('Rejected') && (
                <button
                  type="button"
                  onClick={() => setShowRejectDialog(true)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" /> Reject (Invalid / Out of Bounds)
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reported Photos */}
      <div>
        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-3">
          Citizen Reported Photos
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {reportPhotos.map((photo) => (
            <div
              key={photo.id}
              className="rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100"
            >
              <img src={photo.url} alt="Reported issue" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      {/* Proof Photos if Already Resolved */}
      {proofPhotos.length > 0 && (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
            Proof of Fix Photo
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {proofPhotos.map((p) => (
              <img
                key={p.id}
                src={p.url}
                alt="Proof"
                className="w-full h-48 rounded-xl object-cover border border-emerald-300"
              />
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-4">
          Event Audit Trail
        </h3>
        <IssueTimeline events={issue.events || []} />
      </div>

      {/* Proof of Fix Dialog */}
      <ProofOfFixDialog
        isOpen={showProofDialog}
        onClose={() => setShowProofDialog(false)}
        onSubmit={handleProofSubmit}
        issueTitle={issue.title}
      />

      {/* Rejection Dialog */}
      {showRejectDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-rose-300 shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-base text-rose-600 flex items-center gap-2">
              <XCircle className="w-5 h-5" /> Reject Civic Report
            </h3>
            <p className="text-xs text-slate-500">
              Please specify the statutory justification for rejection (e.g. private jurisdiction,
              duplicate, duplicate outside bounds).
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter justification (at least 5 characters)..."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl"
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRejectDialog(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || rejectReason.trim().length < 5}
                  className="px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-xl disabled:opacity-50"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
