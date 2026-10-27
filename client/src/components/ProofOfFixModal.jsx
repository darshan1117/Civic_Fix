import React, { useState } from 'react';
import { Camera, Upload, AlertCircle, X, Loader2, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function ProofOfFixModal({ isOpen, onClose, onSubmit, issueTitle }) {
  const [proofPhotoUrl, setProofPhotoUrl] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const { isDark } = useTheme();

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrorMsg('Only JPG, PNG, and WebP images are permitted.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Photo must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProofPhotoUrl(reader.result);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (!proofPhotoUrl) {
      setErrorMsg('Proof-of-fix photo is strictly required to resolve an issue.');
      return;
    }
    if (!note || note.trim().length < 5) {
      setErrorMsg('Please describe the repair work completed (at least 5 characters).');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(proofPhotoUrl, note);
      onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message || 'Failed to resolve issue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
      <div className={`rounded-2xl max-w-lg w-full border shadow-2xl overflow-hidden transition-colors ${
        isDark ? 'bg-[#131B2B] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isDark ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
              isDark ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800' : 'bg-emerald-100 text-emerald-600'
            }`}>
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Mark Issue as Resolved</h3>
              <p className={`text-xs truncate max-w-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{issueTitle}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleFinalSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className={`p-3 rounded-xl flex items-center gap-2 text-xs border ${
              isDark
                ? 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}>
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${
              isDark ? 'text-slate-300' : 'text-slate-800'
            }`}>
              1. Proof-of-Fix Photo (Mandatory)
            </label>
            {proofPhotoUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-emerald-500">
                <img src={proofPhotoUrl} alt="Proof" className="w-full h-44 object-cover" />
                <button
                  type="button"
                  onClick={() => setProofPhotoUrl('')}
                  className="absolute bottom-2 right-2 bg-slate-900/80 hover:bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg cursor-pointer"
                >
                  Change Photo
                </button>
              </div>
            ) : (
              <label className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer text-center transition ${
                isDark
                  ? 'border-slate-700 hover:border-emerald-500 bg-slate-900/40 hover:bg-emerald-950/20'
                  : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50/40'
              }`}>
                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                <span className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  Click to upload proof-of-fix photo
                </span>
                <span className="text-xs text-slate-400 mt-0.5">JPG, PNG, WebP up to 5MB</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            )}
          </div>

          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${
              isDark ? 'text-slate-300' : 'text-slate-800'
            }`}>
              2. Resolution Notes & Materials Used
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Repaired broken junction box and replaced burnt ballast fuse..."
              className={`w-full px-3.5 py-2.5 text-xs rounded-xl transition border focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                isDark
                  ? 'bg-slate-900/90 border-slate-700 text-white placeholder-slate-500'
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          <div className={`flex justify-end gap-3 pt-3 border-t ${
            isDark ? 'border-slate-800' : 'border-slate-100'
          }`}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className={`px-4 py-2 text-xs font-semibold cursor-pointer ${
                isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !proofPhotoUrl}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Confirm Resolution
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
