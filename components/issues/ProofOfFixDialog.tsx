'use client';

import React, { useState } from 'react';
import { Camera, Upload, AlertCircle, X, Loader2, Check } from 'lucide-react';

interface ProofOfFixDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (proofPhotoUrl: string, note: string) => Promise<void>;
  issueTitle: string;
}

export function ProofOfFixDialog({
  isOpen,
  onClose,
  onSubmit,
  issueTitle,
}: ProofOfFixDialogProps) {
  const [proofPhotoUrl, setProofPhotoUrl] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setIsUploading(true);
    setUploadProgress(20);

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadProgress(60);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      setUploadProgress(100);
      setProofPhotoUrl(data.url);
    } catch (err: any) {
      setErrorMessage(err.message || 'Photo upload failed. Please retry.');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!proofPhotoUrl) {
      setErrorMessage('Proof-of-fix photo is strictly required to resolve an issue.');
      return;
    }

    if (!note || note.trim().length < 5) {
      setErrorMessage('Please provide a resolution note detailing the fix completed.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(proofPhotoUrl, note);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resolve issue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                Mark Issue as Resolved
              </h3>
              <p className="text-xs text-slate-500 line-clamp-1">{issueTitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFinalSubmit} className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Proof Photo Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
              1. Proof-of-Fix Photo (Required)
            </label>

            {proofPhotoUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-emerald-300 dark:border-emerald-800 group">
                <img
                  src={proofPhotoUrl}
                  alt="Proof of fix"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2 bg-emerald-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
                  <Check className="w-3.5 h-3.5" /> Photo Attached
                </div>
                <button
                  type="button"
                  onClick={() => setProofPhotoUrl('')}
                  className="absolute bottom-2 right-2 bg-slate-900/80 hover:bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
                >
                  Replace Photo
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-all text-center">
                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {isUploading ? 'Uploading proof photo...' : 'Click to upload proof-of-fix photo'}
                </span>
                <span className="text-xs text-slate-500 mt-1">
                  JPG, PNG or WebP up to 5MB
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            )}

            {isUploading && (
              <div className="mt-2 space-y-1">
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 text-right">Uploading {uploadProgress}%</p>
              </div>
            )}
          </div>

          {/* Resolution Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
              2. Resolution Details & Notes (Required)
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Describe work completed (e.g., 'Resurfaced 12m asphalt crater and leveled road with hot mix asphalt batch')..."
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading || !proofPhotoUrl}
              className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md transition-colors inline-flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Confirm Resolution
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
