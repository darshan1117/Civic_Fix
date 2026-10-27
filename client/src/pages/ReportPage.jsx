import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LocationPicker } from '../components/LocationPicker';
import { SimilarIssuesModal } from '../components/SimilarIssuesModal';
import api from '../services/api';
import {
  AlertTriangle,
  Trash2,
  Lightbulb,
  Droplets,
  Waves,
  HelpCircle,
  Camera,
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  MapPin,
  ShieldAlert,
} from 'lucide-react';

export default function ReportPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [lat, setLat] = useState(12.9716);
  const [lng, setLng] = useState(77.5946);
  const [addressText, setAddressText] = useState('MG Road, Bengaluru');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState([]);

  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [similarIssues, setSimilarIssues] = useState([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [submittedIssue, setSubmittedIssue] = useState(null);
  const [generalError, setGeneralError] = useState(null);

  useEffect(() => {
    api.get('/categories').then((res) => {
      if (Array.isArray(res.data) && res.data.length > 0) {
        setCategories(res.data);
        setCategoryId(res.data[0]._id);
      }
    }).catch(() => {});
  }, []);

  const getCatIcon = (name = '') => {
    const l = name.toLowerCase();
    if (l.includes('pothole')) return AlertTriangle;
    if (l.includes('garbage')) return Trash2;
    if (l.includes('street')) return Lightbulb;
    if (l.includes('water')) return Droplets;
    if (l.includes('drain')) return Waves;
    return HelpCircle;
  };

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 3) {
      setGeneralError('Maximum 3 photos allowed.');
      return;
    }

    setGeneralError(null);
    for (const file of files) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setGeneralError(`Invalid format for ${file.name}. Only JPG, PNG, and WebP allowed.`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        setGeneralError(`File ${file.name} exceeds 5MB limit.`);
        continue;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setPhotos((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (idx) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  // Step 2 -> 3: Check duplicates within 50m
  const handleProceedToReview = async () => {
    if (!title || title.trim().length < 5) {
      setGeneralError('Title must be at least 5 characters.');
      return;
    }
    if (!description || description.trim().length < 10) {
      setGeneralError('Description must be at least 10 characters.');
      return;
    }
    if (photos.length === 0) {
      setGeneralError('Please upload at least 1 photo.');
      return;
    }

    setGeneralError(null);
    setIsCheckingDuplicates(true);

    try {
      const res = await api.post('/issues/check-duplicates', {
        category_id: categoryId,
        lat,
        lng,
        radius_meters: 50,
      });

      if (res.data?.hasDuplicates && res.data.matches?.length > 0) {
        setSimilarIssues(res.data.matches);
        setShowDuplicateModal(true);
      } else {
        setStep(3);
      }
    } catch {
      setStep(3);
    } finally {
      setIsCheckingDuplicates(false);
    }
  };

  const handleUpvoteExisting = async (existingIssueId) => {
    try {
      await api.post(`/issues/${existingIssueId}/upvote`);
      navigate(`/issues/${existingIssueId}`);
    } catch {
      navigate(`/issues/${existingIssueId}`);
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setGeneralError(null);

    try {
      const res = await api.post('/issues', {
        title,
        description,
        category_id: categoryId,
        lat,
        lng,
        address_text: addressText,
        photos,
      });

      setSubmittedIssue(res.data);
    } catch (err) {
      setGeneralError(err.response?.data?.error || 'Failed to submit report. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedIssue) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Civic Issue Reported Successfully!</h2>
        <p className="text-slate-600 text-sm mb-6">
          Your ticket has been dispatched to{' '}
          <strong>{submittedIssue.department?.name || 'Assigned Department'}</strong> with statutory SLA tracking.
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left mb-8 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span className="text-xs uppercase font-semibold text-slate-500">Tracking Public ID</span>
            <span className="font-mono font-bold text-blue-600 text-base">{submittedIssue.public_id}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Assigned Department:</span>
            <span className="font-medium text-slate-800">{submittedIssue.department?.name}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Initial Priority:</span>
            <span className="font-semibold text-slate-800">{submittedIssue.priority_score} pts</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Location:</span>
            <span className="font-medium text-slate-800 truncate max-w-[200px]">{submittedIssue.address_text}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to={`/issues/${submittedIssue._id || submittedIssue.id}`}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md inline-flex items-center justify-center gap-2"
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
            className="w-full sm:w-auto px-6 py-3 border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium rounded-xl"
          >
            Report Another Issue
          </button>
        </div>
      </div>
    );
  }

  const selectedCategoryObj = categories.find((c) => c._id === categoryId);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* 3-Step Wizard Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-200 -z-10" />
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 1 ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-slate-200 text-slate-600'
              }`}
            >
              1
            </div>
            <span className="text-xs font-semibold mt-1 text-slate-700">Location & Category</span>
          </div>
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 2 ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-slate-200 text-slate-600'
              }`}
            >
              2
            </div>
            <span className="text-xs font-semibold mt-1 text-slate-700">Photos & Details</span>
          </div>
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 3 ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-slate-200 text-slate-600'
              }`}
            >
              3
            </div>
            <span className="text-xs font-semibold mt-1 text-slate-700">Review & Submit</span>
          </div>
        </div>
      </div>

      {generalError && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-sm text-rose-700 animate-in fade-in">
          <ShieldAlert className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{generalError}</span>
        </div>
      )}

      {/* STEP 1: Category & Pin Location */}
      {step === 1 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Select Civic Hazard Category</h2>
            <p className="text-xs text-slate-500 mt-0.5">Choose the department responsible for this infrastructure.</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
              {categories.map((cat) => {
                const Icon = getCatIcon(cat.name);
                const isSelected = categoryId === cat._id;
                return (
                  <button
                    key={cat._id}
                    type="button"
                    onClick={() => setCategoryId(cat._id)}
                    className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs sm:text-sm text-slate-900">{cat.name}</div>
                      <div className="text-[10px] text-slate-400">Severity {cat.severityWeight}/10</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <LocationPicker
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

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-xs inline-flex items-center gap-2 cursor-pointer"
            >
              Continue to Details <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Photos & Details */}
      {step === 2 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Provide Details and Photos</h2>
            <p className="text-xs text-slate-500 mt-0.5">Attach clear photographs to help officers inspect and resolve rapidly.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">
              Attach Photos (1–3 Photos, Max 5MB Each)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {photos.map((url, idx) => (
                <div
                  key={idx}
                  className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video sm:aspect-square bg-slate-100 flex items-center justify-center group"
                >
                  <img src={url} alt="Report" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute top-2 right-2 p-1 bg-rose-600 text-white rounded-full opacity-90 hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {photos.length < 3 && (
                <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50/30 aspect-video sm:aspect-square text-center">
                  <Camera className="w-7 h-7 text-slate-400 mb-1" />
                  <span className="text-xs font-semibold text-slate-700">Add Photo</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WebP</span>
                  <input type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
                </label>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">Issue Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Hazardous deep pothole near Sony World Signal"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">
              Detailed Description & Landmark
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the severity, exact landmark, and any immediate hazard..."
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              type="button"
              onClick={handleProceedToReview}
              disabled={isCheckingDuplicates}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-xs inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isCheckingDuplicates ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Checking 50m duplicates...
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

      {/* STEP 3: Review & Final Submit */}
      {step === 3 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Review and Confirm Submission</h2>
            <p className="text-xs text-slate-500 mt-0.5">Confirm details before submitting your formal civic report.</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
                  {selectedCategoryObj?.name || 'Civic Issue'}
                </span>
                <h3 className="font-bold text-base text-slate-900 mt-0.5">{title}</h3>
              </div>
              <span className="text-xs px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full font-medium shrink-0">
                Severity {selectedCategoryObj?.severityWeight}/10
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{description}</p>
            <div className="pt-3 border-t border-slate-200 text-xs text-slate-500 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
              <span className="truncate">{addressText}</span>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-2">
              Uploaded Photos ({photos.length})
            </span>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {photos.map((p, i) => (
                <img key={i} src={p} alt="Preview" className="w-24 h-24 rounded-lg object-cover border border-slate-200" />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Edit
            </button>
            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-md inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
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

      {/* 50m Duplicate Detection Modal */}
      <SimilarIssuesModal
        isOpen={showDuplicateModal}
        matches={similarIssues}
        onUpvoteInstead={handleUpvoteExisting}
        onSubmitAnyway={() => {
          setShowDuplicateModal(false);
          setStep(3);
        }}
        onCancel={() => setShowDuplicateModal(false)}
      />
    </div>
  );
}
