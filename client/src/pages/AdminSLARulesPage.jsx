import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';
import {
  Settings,
  ArrowLeft,
  Clock,
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Loader2,
  Zap,
} from 'lucide-react';

export default function AdminSLARulesPage() {
  const { isDark } = useTheme();
  const [categories, setCategories] = useState([]);
  const [slaRules, setSlaRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [editHours, setEditHours] = useState({});

  const fetchData = async () => {
    try {
      const [catsRes, rulesRes] = await Promise.all([
        api.get('/categories'),
        api.get('/sla-rules'),
      ]);
      setCategories(catsRes.data || []);
      setSlaRules(rulesRes.data || []);

      const initialHours = {};
      (catsRes.data || []).forEach((c) => {
        const rule = (rulesRes.data || []).find((r) => String(r.category?._id || r.category) === String(c._id));
        initialHours[c._id] = rule ? rule.slaHours : c.defaultSlaHours;
      });
      setEditHours(initialHours);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (categoryId) => {
    setSavingId(categoryId);
    setFeedback(null);
    try {
      const hours = parseInt(editHours[categoryId], 10);
      if (isNaN(hours) || hours <= 0) {
        setFeedback({ type: 'error', text: 'SLA hours must be a positive integer.' });
        setSavingId(null);
        return;
      }

      await api.patch('/sla-rules', {
        category_id: categoryId,
        sla_hours: hours,
      });

      setFeedback({ type: 'success', text: 'SLA rule updated successfully.' });
      fetchData();
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.response?.data?.error || 'Failed to update SLA rule.',
      });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className={`min-h-screen py-8 transition-colors ${
      isDark ? 'bg-[#0B0F17] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <Link
            to="/admin"
            className={`inline-flex items-center gap-2 text-sm font-medium transition cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>

        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-500 mb-1">
            <Settings className="w-4 h-4" /> Operational Service Standards
          </div>
          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Category SLA Configuration
          </h1>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Define target turnaround times for municipal issues before automatic escalation triggers.
          </p>
        </div>

        <div className={`p-4 rounded-2xl border text-xs flex items-start gap-3 transition-colors ${
          isDark
            ? 'bg-amber-950/40 border-amber-800/60 text-amber-200'
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          <Zap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Demonstration & Evaluation Mode Supported</p>
            <p className="leading-relaxed">
              By default, SLA rules are configured in hours (e.g. 24h for Garbage, 120h for Potholes).
              For live demonstration and evaluation, the server environment variable{' '}
              <code className={`px-1.5 py-0.5 rounded font-mono font-semibold ${
                isDark ? 'bg-amber-900/60 text-amber-200' : 'bg-amber-100 text-amber-900'
              }`}>SLA_TIME_UNIT=minutes</code>{' '}
              can be toggled so deadlines elapse in minutes instead of days.
            </p>
          </div>
        </div>

        {feedback && (
          <div
            className={`p-4 rounded-xl text-sm flex items-center justify-between border animate-in fade-in ${
              feedback.type === 'success'
                ? isDark
                  ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : isDark
                  ? 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <span className="flex items-center gap-2">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-500" />
              )}
              {feedback.text}
            </span>
            <button onClick={() => setFeedback(null)} className="text-xs font-semibold underline cursor-pointer">
              Dismiss
            </button>
          </div>
        )}

        <div className={`rounded-2xl border shadow-2xs overflow-hidden transition-colors ${
          isDark
            ? 'bg-[#131B2B]/90 border-slate-800'
            : 'bg-white border-slate-200'
        }`}>
          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Loading SLA configurations...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                  isDark
                    ? 'border-slate-800 bg-slate-900/60 text-slate-400'
                    : 'border-slate-200 bg-slate-50/70 text-slate-500'
                }`}>
                  <th className="py-3 px-6">Category</th>
                  <th className="py-3 px-6">Assigned Department</th>
                  <th className="py-3 px-6">Severity Weight</th>
                  <th className="py-3 px-6">Target SLA (Hours)</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className={`divide-y text-sm ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                {categories.map((cat) => {
                  return (
                    <tr key={cat._id} className={`transition ${
                      isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'
                    }`}>
                      <td className={`py-4 px-6 font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {cat.name}
                      </td>
                      <td className={`py-4 px-6 text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {cat.department?.name || 'Assigned Dept'}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                          isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {cat.severityWeight} / 10
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            max="720"
                            value={editHours[cat._id] || ''}
                            onChange={(e) =>
                              setEditHours({ ...editHours, [cat._id]: e.target.value })
                            }
                            className={`w-20 px-2.5 py-1.5 rounded-lg text-sm font-semibold transition border focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                              isDark
                                ? 'bg-slate-900 border-slate-700 text-white'
                                : 'border-slate-300 text-slate-900'
                            }`}
                          />
                          <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>hours</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          type="button"
                          disabled={savingId === cat._id}
                          onClick={() => handleSave(cat._id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition shadow-2xs disabled:opacity-50 cursor-pointer"
                        >
                          {savingId === cat._id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Save className="w-3.5 h-3.5" />
                          )}
                          Save Rule
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
