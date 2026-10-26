'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { Category, SimilarIssue } from '@/lib/types';
import { LocationPickerMap } from '../map/LocationPickerMap';
import { SimilarIssuesModal } from './SimilarIssuesModal';
import {
  AlertTriangle,
  Trash2,
  Lightbulb,
  Droplets,
  Waves,
  HelpCircle,
  Upload,
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Camera,
  MapPin,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import Link from 'next/link';

interface PhotoUploadState {
  file?: File;
  url: string;
  progress: number;
  isUploading: boolean;
  error?: string | null;
}

export function ReportWizard() {
  const router = useRouter();
  const { user } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Form State
  const [categoryId, setCategoryId] = useState<string>('cat-pothole');
  const [lat, setLat] = useState<number>(12.9716);
  const [lng, setLng] = useState<number>(77.5946);
  const [addressText, setAddressText] = useState<string>('MG Road, Bengaluru');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [photos, setPhotos] = useState<PhotoUploadState[]>([]);

  // Duplicate Check & Submission State
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [similarIssues, setSimilarIssues] = useState<SimilarIssue[]>([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [submittedIssue, setSubmittedIssue] = useState<any | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Load categories
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        if (data.length > 0 && !categoryId) {
          setCategoryId(data[0].id);
        }
      })
      .finally(() => setLoadingCategories(false));
  }, []);

  const getCategoryIcon = (name: string = '') => {
    const lower = name.toLowerCase();
    if (lower.includes('pothole')) return AlertTriangle;
    if (lower.includes('garbage')) return Trash2;
    if (lower.includes('street')) return Lightbulb;
    if (lower.includes('water')) return Droplets;
    if (lower.includes('drain')) return Waves;
    return HelpCircle;
  };

  // Upload Photo handler
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 3) {
      setGeneralError('Maximum 3 photos allowed.');
      return;
    }

    setGeneralError(null);

    for (const file of files) {
      // Client validation
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setGeneralError(`Invalid type: ${file.name}. Only JPG, PNG, and WebP are allowed.`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        setGeneralError(`File too large: ${file.name}. Max limit is 5MB.`);
        continue;
      }

      const tempId = Date.now() + Math.random();
      const newPhotoState: PhotoUploadState = {
        file,
        url: '',
        progress: 20,
        isUploading: true,
      };

      setPhotos((prev) => [...prev, newPhotoState]);

      // Execute upload
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Upload failed');

        setPhotos((prev) =>
          prev.map((p) => (p.file === file ? { ...p, url: data.url, progress: 100, isUploading: false } : p))
        );
      } catch (err: any) {
        setPhotos((prev) =>
          prev.map((p) =>
            p.file === file ? { ...p, error: err.message || 'Upload failed', isUploading: false } : p
          )
        );
      }
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const retryPhotoUpload = async (index: number) => {
    const photo = photos[index];
    if (!photo.file) return;

    setPhotos((prev) =>
      prev.map((p, i) => (i === index ? { ...p, isUploading: true, error: null, progress: 30 } : p))
    );

    const formData = new FormData();
    formData.append('file', photo.file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setPhotos((prev) =>
        prev.map((p, i) => (i === index ? { ...p, url: data.url, progress: 100, isUploading: false } : p))
      );
    } catch (err: any) {
      setPhotos((prev) =>
        prev.map((p, i) => (i === index ? { ...p, error: err.message, isUploading: false } : p))
      );
    }
  };

  // Step 1 Validation
  const validateStep1 = () => {
    if (!categoryId) {
      setGeneralError('Please pick an issue category.');
      return false;
    }
    setGeneralError(null);
    return true;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    if (!title || title.trim().length < 5) {
      setGeneralError('Title must be at least 5 characters.');
      return false;
    }
    if (!description || description.trim().length < 10) {
      setGeneralError('Please provide a detailed description (at least 10 characters).');
      return false;
    }
    const uploadedUrls = photos.filter((p) => p.url).map((p) => p.url);
    if (uploadedUrls.length === 0) {
      setGeneralError('Please upload at least 1 photo of the issue.');
      return false;
    }
    setGeneralError(null);
    return true;
  };

  // Proceed from Step 2 to Step 3: Run Duplicate Detection (<50m) Check
  const handleProceedToReview = async () => {
    if (!validateStep2()) return;

    setIsCheckingDuplicates(true);
    setGeneralError(null);

    try {
      const res = await fetch('/api/issues/check-duplicates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_id: categoryId,
          lat,
          lng,
          radius_meters: 50,
        }),
      });

      const data = await res.json();
      if (res.ok && data.hasDuplicates && data.matches?.length > 0) {
        setSimilarIssues(data.matches);
        setShowDuplicateModal(true);
      } else {
        setStep(3);
      }
    } catch {
      // Proceed gracefully even if duplicate check has a network hiccup
      setStep(3);
    } finally {
      setIsCheckingDuplicates(false);
    }
  };

  // Handle Upvote Instead from Duplicate Modal
  const handleUpvoteExisting = async (existingIssueId: string) => {
    try {
      const res = await fetch(`/api/issues/${existingIssueId}/upvote`, {
        method: 'POST',
      });
      if (res.ok) {
        router.push(`/issues/${existingIssueId}?upvoted=true`);
      }
    } catch {
      router.push(`/issues/${existingIssueId}`);
    }
  };

  // Final Issue Submission
  const handleFinalSubmit = async () => {
    setGeneralError(null);
    setIsSubmitting(true);

    const validPhotoUrls = photos.filter((p) => p.url).map((p) => p.url);

    try {
      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category_id: categoryId,
          lat,
          lng,
          address_text: addressText || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
          photos: validPhotoUrls,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit issue report.');
      }

      setSubmittedIssue(data);
    } catch (err: any) {
      setGeneralError(err.message || 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success Confirmation Screen
  if (submittedIssue) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 mx-auto flex items-center justify-center mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Civic Issue Reported Successfully!
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
          Your ticket has been dispatched directly to the{' '}
          <strong className="text-slate-900 dark:text-slate-100">
            {submittedIssue.department_name}
          </strong>{' '}
          with SLA resolution tracking enabled.
        </p>

        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-left mb-8 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
            <span className="text-xs uppercase font-semibold text-slate-500">Tracking Public ID</span>
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-base">
              {submittedIssue.public_id}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Assigned Department:</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{submittedIssue.department_name}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Initial Priority Score:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{submittedIssue.priority_score} pts</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Location:</span>
            <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
              {submittedIssue.address_text}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={`/issues/${submittedIssue.id}`}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition-colors inline-flex items-center justify-center gap-2"
          >
            Track Issue Timeline <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={() => {
              setSubmittedIssue(null);
              setStep(1);
              setTitle('');
              setDescription('');
              setPhotos([]);
            }}
            className="w-full sm:w-auto px-6 py-3 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-colors"
          >
            Report Another Issue
          </button>
        </div>
      </div>
    );
  }

  const selectedCategoryObj = categories.find((c) => c.id === categoryId);

  return (
    <div className="max-w-3xl mx-auto">
      {/* 3-Step Wizard Stepper Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-200 dark:bg-slate-800 -z-10" />

          {/* Step 1 Indicator */}
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step >= 1
                  ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-950'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              1
            </div>
            <span className="text-xs font-semibold mt-1 text-slate-700 dark:text-slate-300">
              Location & Category
            </span>
          </div>

          {/* Step 2 Indicator */}
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step >= 2
                  ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-950'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              2
            </div>
            <span className="text-xs font-semibold mt-1 text-slate-700 dark:text-slate-300">
              Photos & Details
            </span>
          </div>

          {/* Step 3 Indicator */}
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step === 3
                  ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-950'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              3
            </div>
            <span className="text-xs font-semibold mt-1 text-slate-700 dark:text-slate-300">
              Review & Submit
            </span>
          </div>
        </div>
      </div>

      {generalError && (
        <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-3 text-sm text-rose-700 dark:text-rose-300 animate-in fade-in">
          <ShieldAlert className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{generalError}</span>
        </div>
      )}

      {/* STEP 1: Category & Location */}
      {step === 1 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Select Civic Hazard Category
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose the department that should address this issue.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
              {categories.map((cat) => {
                const Icon = getCategoryIcon(cat.name);
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 shadow-xs ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                        {cat.name}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Severity {cat.severity_weight}/10
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <LocationPickerMap
              lat={lat}
              lng={lng}
              addressText={addressText}
              onChange={(newLat, newLng, newAddr) => {
                setLat(newLat);
                setLng(newLng);
                if (newAddr) setAddressText(newAddr);
              }}
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                if (validateStep1()) setStep(2);
              }}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              Continue to Details <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Photos & Details */}
      {step === 2 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Provide Details and Photos
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Clear photos and location descriptions help the department inspect and resolve faster.
            </p>
          </div>

          {/* Photo Uploader */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
              Attach Photos (1–3 Photos, Max 5MB Each)
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {photos.map((photo, idx) => (
                <div
                  key={idx}
                  className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video sm:aspect-square bg-slate-100 dark:bg-slate-800 flex items-center justify-center group"
                >
                  {photo.url ? (
                    <>
                      <img
                        src={photo.url}
                        alt="Issue report"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute top-2 right-2 p-1 bg-rose-600 text-white rounded-full opacity-90 hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : photo.error ? (
                    <div className="p-3 text-center space-y-2">
                      <p className="text-xs text-rose-600 line-clamp-2">{photo.error}</p>
                      <button
                        type="button"
                        onClick={() => retryPhotoUpload(idx)}
                        className="text-xs font-semibold text-blue-600 inline-flex items-center gap-1 hover:underline"
                      >
                        <RefreshCw className="w-3 h-3" /> Retry
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 text-center space-y-2">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
                      <p className="text-xs text-slate-500">Uploading {photo.progress}%</p>
                    </div>
                  )}
                </div>
              ))}

              {photos.length < 3 && (
                <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all aspect-video sm:aspect-square text-center">
                  <Camera className="w-7 h-7 text-slate-400 mb-1" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Add Photo
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WebP</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Issue Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
              Issue Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Hazardous deep pothole near Sony World Signal"
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Issue Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
              Detailed Description & Landmark
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the severity, exact landmark, and any immediate hazards to pedestrians or motorists..."
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <button
              type="button"
              onClick={handleProceedToReview}
              disabled={isCheckingDuplicates}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              {isCheckingDuplicates ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Checking nearby duplicates...
                </>
              ) : (
                <>
                  Review Submission <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Review & Submit */}
      {step === 3 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Review and Confirm Submission
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Confirm details before submitting your formal civic hazard report.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl p-5 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  {selectedCategoryObj?.name || 'Civic Issue'}
                </span>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mt-0.5">
                  {title}
                </h3>
              </div>
              <span className="text-xs px-2.5 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-full font-medium shrink-0">
                Severity {selectedCategoryObj?.severity_weight}/10
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {description}
            </p>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
              <span className="truncate">{addressText}</span>
            </div>
          </div>

          {/* Photos Preview */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-2">
              Uploaded Photos ({photos.filter((p) => p.url).length})
            </span>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {photos
                .filter((p) => p.url)
                .map((p, i) => (
                  <img
                    key={i}
                    src={p.url}
                    alt="Preview"
                    className="w-24 h-24 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                  />
                ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Edit
            </button>

            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-md transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Submitting report...
                </>
              ) : (
                <>
                  Submit Issue Report <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Duplicate Detection Warning Modal (<50m matches) */}
      <SimilarIssuesModal
        isOpen={showDuplicateModal}
        matches={similarIssues}
        onUpvoteInstead={handleUpvoteExisting}
        onSubmitAnyway={() => {
          setShowDuplicateModal(false);
          setStep(3);
        }}
        onCancel={() => {
          setShowDuplicateModal(false);
        }}
      />
    </div>
  );
}
