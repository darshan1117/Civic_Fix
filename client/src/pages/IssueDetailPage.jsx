import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { StatusBadge } from '../components/StatusBadge';
import { SLABadge } from '../components/SLABadge';
import { UpvoteButton } from '../components/UpvoteButton';
import { ProofOfFixModal } from '../components/ProofOfFixModal';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../services/api';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Shield,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RotateCcw,
  Building,
  User,
  Share2,
  FileCheck2,
  AlertCircle,
  Loader2,
  Send,
} from 'lucide-react';

const pinIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function IssueDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Modals state
  const [showProofModal, setShowProofModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [reopenNote, setReopenNote] = useState('');
  const [rejectNote, setRejectNote] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchIssue = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/issues/${id}`);
      setIssue(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Issue not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssue();
  }, [id]);

  const handleStatusChange = async (targetStatus, note = '', proofPhotoUrl = '') => {
    setSubmittingAction(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const res = await api.patch(`/issues/${issue._id}/status`, {
        status: targetStatus,
        note,
        proofPhotoUrl,
      });
      setIssue(res.data);
      setActionSuccess(`Issue status successfully updated to "${targetStatus}".`);
      setShowRejectModal(false);
      setShowReopenModal(false);
      setShowProofModal(false);
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to update issue status.');
    } finally {
      setSubmittingAction(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-[70vh] flex flex-col items-center justify-center transition-colors ${
        isDark ? 'bg-[#0B0F17]' : 'bg-slate-50'
      }`}>
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Loading issue details...
        </p>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className={`max-w-3xl mx-auto px-4 py-16 text-center transition-colors ${
        isDark ? 'text-slate-100' : 'text-slate-900'
      }`}>
        <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
          isDark ? 'bg-rose-950/60 text-rose-400 border border-rose-800' : 'bg-rose-100 text-rose-600'
        }`}>
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Issue Not Found</h2>
        <p className={`mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          {error || "The issue you requested doesn't exist or has been removed."}
        </p>
        <Link
          to="/issues"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Map
        </Link>
      </div>
    );
  }

  const isCompleted = ['Resolved', 'Closed', 'Rejected'].includes(issue.status);
  const isReporter = user && issue.reporter && (String(user._id || user.id) === String(issue.reporter._id || issue.reporter));
  const isStaff = user && (user.role === 'officer' || user.role === 'admin');
  const reportPhotos = (issue.photos || []).filter((p) => p.kind !== 'proof');
  const proofPhotos = (issue.photos || []).filter((p) => p.kind === 'proof');

  return (
    <div className={`min-h-screen py-8 transition-colors ${
      isDark ? 'bg-[#0B0F17] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/issues"
            className={`inline-flex items-center gap-2 text-sm font-medium transition cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowLeft className="w-4 h-4" /> Back to All Issues
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setActionSuccess('Link copied to clipboard!');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
                isDark
                  ? 'border-slate-800 bg-[#131B2B] text-slate-300 hover:bg-slate-800'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Share2 className="w-3.5 h-3.5 text-slate-400" /> Share
            </button>
          </div>
        </div>

        {/* Action feedback banners */}
        {actionSuccess && (
          <div className={`mb-6 p-4 rounded-xl text-sm flex items-center justify-between border animate-in fade-in ${
            isDark
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              {actionSuccess}
            </span>
            <button
              onClick={() => setActionSuccess(null)}
              className="font-semibold text-xs cursor-pointer hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {actionError && (
          <div className={`mb-6 p-4 rounded-xl text-sm flex items-center justify-between border animate-in fade-in ${
            isDark
              ? 'bg-rose-950/40 border-rose-800/60 text-rose-300'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            <span className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              {actionError}
            </span>
            <button
              onClick={() => setActionError(null)}
              className="font-semibold text-xs cursor-pointer hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className={`rounded-2xl border p-6 sm:p-8 shadow-xs transition-colors ${
              isDark ? 'bg-[#131B2B]/90 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className={`font-mono text-sm font-bold px-3 py-1 rounded-lg border ${
                    isDark ? 'bg-slate-800/80 text-blue-400 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {issue.public_id}
                  </span>
                  <StatusBadge status={issue.status} size="lg" />
                </div>
                <div className="flex items-center gap-2">
                  <SLABadge
                    createdAt={issue.createdAt}
                    slaDeadline={issue.sla_deadline}
                    isCompleted={isCompleted}
                  />
                  <UpvoteButton
                    issueId={issue._id}
                    initialCount={issue.upvote_count || 0}
                    initialHasUpvoted={issue.has_upvoted}
                  />
                </div>
              </div>

              <h1 className={`text-2xl sm:text-3xl font-extrabold mb-3 tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                {issue.title}
              </h1>

              <div className={`flex flex-wrap items-center gap-y-2 gap-x-4 text-xs sm:text-sm mb-6 pb-6 border-b ${
                isDark ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
              }`}>
                <span className={`inline-flex items-center gap-1.5 font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  <Building className="w-4 h-4 text-blue-500" />
                  {issue.department?.name || 'Department'}
                </span>
                <span className={isDark ? 'text-slate-700' : 'text-slate-300'}>•</span>
                <span className={`inline-flex items-center gap-1.5 font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  <User className="w-4 h-4 text-slate-400" />
                  {issue.reporter?.name || 'Citizen Reporter'}
                </span>
                <span className={isDark ? 'text-slate-700' : 'text-slate-300'}>•</span>
                <span className={`inline-flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <Calendar className="w-4 h-4" />
                  {new Date(issue.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {/* Description */}
              <div className="space-y-2 mb-6">
                <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                  Citizen Description
                </h3>
                <p className={`text-sm sm:text-base leading-relaxed whitespace-pre-line p-4 rounded-xl border ${
                  isDark
                    ? 'bg-slate-900/80 border-slate-800 text-slate-200'
                    : 'bg-slate-50/70 border-slate-100 text-slate-700'
                }`}>
                  {issue.description}
                </p>
              </div>

              {/* Photos Gallery */}
              <div className="space-y-3">
                <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                  Attached Photos ({reportPhotos.length})
                </h3>
                {reportPhotos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {reportPhotos.map((photo, index) => (
                      <a
                        key={index}
                        href={photo.url}
                        target="_blank"
                        rel="noreferrer"
                        className={`group relative aspect-4/3 rounded-xl overflow-hidden border transition block ${
                          isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-100'
                        }`}
                      >
                        <img
                          src={photo.url}
                          alt={`Report photo ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                          <span className="text-white text-xs font-medium px-2 py-1 rounded bg-black/60">Enlarge</span>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No photos attached.</p>
                )}
              </div>

              {/* Verified Resolution Card (if proof photo exists) */}
              {proofPhotos.length > 0 && (
                <div className={`mt-8 p-5 rounded-2xl border space-y-3 ${
                  isDark
                    ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-200'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}>
                  <div className={`flex items-center gap-2 font-bold text-sm ${
                    isDark ? 'text-emerald-300' : 'text-emerald-800'
                  }`}>
                    <FileCheck2 className="w-5 h-5 text-emerald-500" />
                    <span>Official Proof-of-Fix Submitted by Department</span>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-emerald-300/80' : 'text-emerald-700'}`}>
                    Municipal crew has completed the repairs. Review the proof-of-work photograph below:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {proofPhotos.map((photo, index) => (
                      <div key={index} className="space-y-1">
                        <a
                          href={photo.url}
                          target="_blank"
                          rel="noreferrer"
                          className="relative aspect-4/3 rounded-xl overflow-hidden border-2 border-emerald-500 block shadow-sm"
                        >
                          <img
                            src={photo.url}
                            alt="Proof of Fix"
                            className="w-full h-full object-cover"
                          />
                        </a>
                        <span className={`text-[11px] font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-800'}`}>
                          Submitted on {new Date(photo.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Workflow Action Management Center */}
            <div className={`rounded-2xl border p-6 shadow-xs transition-colors ${
              isDark ? 'bg-[#131B2B]/90 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <h3 className={`text-base font-bold mb-1 flex items-center gap-2 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                <Shield className="w-5 h-5 text-blue-500" /> Resolution Workflow Controls
              </h3>
              <p className={`text-xs mb-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Lifecycle actions permitted based on your authenticated role ({user?.role || 'Guest'}).
              </p>

              {/* Staff / Officer Actions */}
              {isStaff && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    {issue.status === 'Submitted' && (
                      <>
                        <button
                          type="button"
                          disabled={submittingAction}
                          onClick={() => handleStatusChange('Acknowledged', 'Department has verified report and scheduled field assessment.')}
                          className="px-4 py-2.5 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition flex items-center gap-2 shadow-sm cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Acknowledge Issue
                        </button>
                        <button
                          type="button"
                          disabled={submittingAction}
                          onClick={() => setShowRejectModal(true)}
                          className={`px-4 py-2.5 rounded-xl font-medium text-sm transition flex items-center gap-2 cursor-pointer border ${
                            isDark
                              ? 'bg-rose-950/40 text-rose-300 border-rose-800/60 hover:bg-rose-900/50'
                              : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                          }`}
                        >
                          <XCircle className="w-4 h-4" /> Reject as Invalid
                        </button>
                      </>
                    )}

                    {issue.status === 'Acknowledged' && (
                      <>
                        <button
                          type="button"
                          disabled={submittingAction}
                          onClick={() => handleStatusChange('In Progress', 'Field repair crew dispatched to site.')}
                          className="px-4 py-2.5 rounded-xl bg-amber-500 text-white font-medium text-sm hover:bg-amber-600 transition flex items-center gap-2 shadow-sm cursor-pointer"
                        >
                          <Clock className="w-4 h-4" /> Dispatch Crew (In Progress)
                        </button>
                        <button
                          type="button"
                          disabled={submittingAction}
                          onClick={() => setShowRejectModal(true)}
                          className={`px-4 py-2.5 rounded-xl font-medium text-sm transition flex items-center gap-2 cursor-pointer border ${
                            isDark
                              ? 'bg-rose-950/40 text-rose-300 border-rose-800/60 hover:bg-rose-900/50'
                              : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                          }`}
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </>
                    )}

                    {issue.status === 'In Progress' && (
                      <button
                        type="button"
                        onClick={() => setShowProofModal(true)}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition flex items-center gap-2 shadow-md shadow-emerald-500/20 cursor-pointer"
                      >
                        <FileCheck2 className="w-4 h-4" /> Upload Proof & Mark Resolved
                      </button>
                    )}

                    {issue.status === 'Reopened' && (
                      <button
                        type="button"
                        disabled={submittingAction}
                        onClick={() => handleStatusChange('In Progress', 'Resuming corrective repairs following citizen dispute.')}
                        className="px-4 py-2.5 rounded-xl bg-amber-600 text-white font-medium text-sm hover:bg-amber-700 transition flex items-center gap-2 shadow-sm cursor-pointer"
                      >
                        <Clock className="w-4 h-4" /> Re-dispatch Crew
                      </button>
                    )}

                    {issue.status === 'Resolved' && (
                      <button
                        type="button"
                        disabled={submittingAction}
                        onClick={() => handleStatusChange('Closed', 'Staff final review confirmed closure.')}
                        className="px-4 py-2.5 rounded-xl bg-slate-800 text-white font-medium text-sm hover:bg-slate-700 transition flex items-center gap-2 shadow-sm cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Finalize & Close
                      </button>
                    )}

                    {['Closed', 'Rejected'].includes(issue.status) && (
                      <p className={`text-xs italic ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        This issue is in a terminal status ({issue.status}) and cannot be transitioned further.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Citizen Actions (When status is Resolved) */}
              {issue.status === 'Resolved' && (
                <div className={`p-4 rounded-xl border space-y-3 mt-3 ${
                  isDark
                    ? 'bg-blue-950/40 border-blue-800/60 text-blue-200'
                    : 'bg-blue-50/70 border-blue-200 text-blue-900'
                }`}>
                  <div className={`flex items-center gap-2 font-semibold text-sm ${
                    isDark ? 'text-blue-300' : 'text-blue-900'
                  }`}>
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    <span>Citizen Verification Window (Active for 7 Days)</span>
                  </div>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-blue-300/80' : 'text-blue-800'}`}>
                    Has the civic defect been fixed to your satisfaction? If yes, confirm to formally close it.
                    If the problem persists or work is substandard, you can dispute and reopen this issue with a reason.
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="button"
                      disabled={submittingAction}
                      onClick={() => handleStatusChange('Closed', 'Citizen verified repair and confirmed resolution.')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-medium text-xs hover:bg-emerald-700 transition shadow-xs cursor-pointer"
                    >
                      Confirm Resolution & Close
                    </button>
                    <button
                      type="button"
                      disabled={submittingAction}
                      onClick={() => setShowReopenModal(true)}
                      className={`px-4 py-2 rounded-xl border font-medium text-xs transition cursor-pointer ${
                        isDark
                          ? 'bg-slate-900 border-rose-700 text-rose-300 hover:bg-rose-950/40'
                          : 'bg-white border-rose-300 text-rose-700 hover:bg-rose-50'
                      }`}
                    >
                      Dispute Resolution & Reopen
                    </button>
                  </div>
                </div>
              )}

              {!isStaff && issue.status !== 'Resolved' && (
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  This issue is currently under municipal review ({issue.status}). You will receive real-time updates as progress is made.
                </p>
              )}
            </div>

            {/* Vertical Timeline */}
            <div className={`rounded-2xl border p-6 sm:p-8 shadow-xs transition-colors ${
              isDark ? 'bg-[#131B2B]/90 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                <Clock className="w-5 h-5 text-blue-500" /> Lifecycle Audit Trail ({issue.events?.length || 0})
              </h3>

              <div className={`relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-[11px] sm:before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 ${
                isDark ? 'before:bg-slate-800' : 'before:bg-slate-200'
              }`}>
                {(issue.events || []).map((event, idx) => {
                  const isLatest = idx === (issue.events.length - 1);
                  return (
                    <div key={idx} className="relative group">
                      {/* Node Bullet */}
                      <div
                        className={`absolute -left-[27px] sm:-left-[35px] top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          isLatest
                            ? 'bg-blue-600 border-white shadow-md shadow-blue-500/30'
                            : isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isLatest ? 'bg-white' : isDark ? 'bg-slate-500' : 'bg-slate-400'
                          }`}
                        />
                      </div>

                      {/* Content */}
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {event.toStatus ? `Status: ${event.toStatus}` : event.eventType}
                            </span>
                            <span className={`text-[11px] font-medium uppercase px-2 py-0.5 rounded-full ${
                              isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {event.actorRole || 'system'}
                            </span>
                          </div>
                          <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            {new Date(event.createdAt).toLocaleString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          By <span className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{event.actorName || 'System'}</span>
                        </p>

                        {event.note && (
                          <p className={`text-sm p-3 rounded-xl border mt-2 ${
                            isDark ? 'bg-slate-900/80 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-700'
                          }`}>
                            {event.note}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* Location Map Preview */}
            <div className={`rounded-2xl border p-5 shadow-xs space-y-3 transition-colors ${
              isDark ? 'bg-[#131B2B]/90 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-500" /> Location Details
              </h3>
              <p className={`text-sm font-medium leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {issue.address_text || `${issue.lat.toFixed(5)}, ${issue.lng.toFixed(5)}`}
              </p>
              <div className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                GPS: {issue.lat.toFixed(6)}, {issue.lng.toFixed(6)}
              </div>

              {/* Leaflet Static Pin Preview */}
              <div className={`h-48 rounded-xl overflow-hidden border relative z-0 ${
                isDark ? 'border-slate-800' : 'border-slate-200'
              }`}>
                <MapContainer
                  center={[issue.lat, issue.lng]}
                  zoom={15}
                  scrollWheelZoom={false}
                  className="w-full h-full"
                >
                  <TileLayer
                    url={
                      isDark
                        ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
                        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    }
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  <Marker position={[issue.lat, issue.lng]} icon={pinIcon}>
                    <Popup>{issue.title}</Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>

            {/* SLA & Priority Meta */}
            <div className={`rounded-2xl border p-5 shadow-xs space-y-4 transition-colors ${
              isDark ? 'bg-[#131B2B]/90 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Service Level Agreement (SLA)
              </h3>

              <div className={`space-y-3 divide-y text-sm ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                <div className="flex justify-between items-center pt-2">
                  <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Priority Score</span>
                  <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                    isDark ? 'bg-blue-950 text-blue-300 border border-blue-800' : 'bg-blue-50 text-blue-700'
                  }`}>
                    {issue.priority_score?.toFixed(1) || '0.0'} pts
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Escalation Tier</span>
                  <span
                    className={`font-semibold text-xs px-2 py-0.5 rounded-full ${
                      issue.escalation_level === 0
                        ? isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                        : issue.escalation_level === 1
                        ? isDark ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-amber-100 text-amber-800'
                        : isDark ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    Level {issue.escalation_level} {issue.escalation_level === 2 ? '(Commissioner)' : issue.escalation_level === 1 ? '(Head)' : '(Standard)'}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>SLA Target Deadline</span>
                  <span className={`text-xs font-medium text-right ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {new Date(issue.sla_deadline).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Citizen Upvotes</span>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {issue.upvote_count || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Help / Contact */}
            <div className={`p-5 rounded-2xl border text-xs space-y-2 transition-colors ${
              isDark ? 'bg-[#0E1524] border-slate-800 text-slate-400' : 'bg-slate-100/80 border-slate-200 text-slate-600'
            }`}>
              <p className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                Department Escalation Protocol
              </p>
              <p className="leading-relaxed">
                If an issue breaches its SLA deadline without reaching "Resolved", the system's automated cron job triggers Level 1 escalation to the department head, followed by Level 2 escalation to the Municipal Commissioner.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Proof-of-Fix Upload Modal */}
      <ProofOfFixModal
        isOpen={showProofModal}
        onClose={() => setShowProofModal(false)}
        onSubmit={(photoUrl, note) => handleStatusChange('Resolved', note, photoUrl)}
        issueTitle={issue.title}
      />

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className={`rounded-2xl max-w-md w-full border shadow-2xl p-6 space-y-4 transition-colors ${
            isDark ? 'bg-[#131B2B] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center gap-3 text-rose-500 font-bold text-lg">
              <XCircle className="w-6 h-6" /> Reject Report
            </div>
            <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Please provide a valid administrative justification for rejecting this report (e.g. duplicate, private property, spam, or invalid address).
            </p>
            <textarea
              rows={3}
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="Reason for rejection (required)..."
              className={`w-full text-sm p-3 rounded-xl border focus:outline-hidden focus:ring-2 focus:ring-rose-500 ${
                isDark ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                  isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingAction || !rejectNote.trim()}
                onClick={() => handleStatusChange('Rejected', rejectNote)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reopen Dispute Modal */}
      {showReopenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className={`rounded-2xl max-w-md w-full border shadow-2xl p-6 space-y-4 transition-colors ${
            isDark ? 'bg-[#131B2B] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center gap-3 text-amber-500 font-bold text-lg">
              <RotateCcw className="w-6 h-6" /> Dispute Resolution & Reopen
            </div>
            <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Why do you consider this civic issue unresolved? Please explain so the municipal department can schedule additional remedial action.
            </p>
            <textarea
              rows={3}
              value={reopenNote}
              onChange={(e) => setReopenNote(e.target.value)}
              placeholder="Explain why the issue is still not fixed (required)..."
              className={`w-full text-sm p-3 rounded-xl border focus:outline-hidden focus:ring-2 focus:ring-amber-500 ${
                isDark ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowReopenModal(false)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                  isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingAction || !reopenNote.trim()}
                onClick={() => handleStatusChange('Reopened', reopenNote)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 cursor-pointer"
              >
                Submit Dispute & Reopen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
