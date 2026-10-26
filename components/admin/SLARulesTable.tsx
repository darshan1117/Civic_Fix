'use client';

import React, { useState } from 'react';
import { SLARule } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';
import { Clock, Edit2, Check, X, Loader2 } from 'lucide-react';

interface SLARulesTableProps {
  rules: Array<SLARule & { category_name: string; severity_weight: number }>;
  onRuleUpdated?: () => void;
}

export function SLARulesTable({ rules, onRuleUpdated }: SLARulesTableProps) {
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [newSlaHours, setNewSlaHours] = useState<number>(48);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const startEdit = (categoryId: string, currentHours: number) => {
    setEditingCategoryId(categoryId);
    setNewSlaHours(currentHours);
    setErrorMsg(null);
  };

  const handleSave = async (categoryId: string) => {
    if (newSlaHours < 1) {
      setErrorMsg('SLA must be at least 1 hour.');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/sla-rules', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_id: categoryId, sla_hours: newSlaHours }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update SLA');
      }

      setEditingCategoryId(null);
      if (onRuleUpdated) onRuleUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update SLA rule.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
            Category SLA Deadline Rules
          </h3>
          <p className="text-xs text-slate-500">
            Configure statutory resolution deadlines for each hazard type.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="mx-6 mt-4 p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
          {errorMsg}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-3.5">Category</th>
              <th className="px-6 py-3.5">Severity Weight</th>
              <th className="px-6 py-3.5">Standard SLA Window</th>
              <th className="px-6 py-3.5">Last Updated</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rules.map((rule) => {
              const isEditing = editingCategoryId === rule.category_id;
              return (
                <tr key={rule.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">
                    {rule.category_name}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                      {rule.severity_weight} / 10
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          max={720}
                          value={newSlaHours}
                          onChange={(e) => setNewSlaHours(parseInt(e.target.value) || 1)}
                          className="w-20 px-2 py-1 border border-blue-500 rounded text-xs bg-white dark:bg-slate-800"
                        />
                        <span className="text-slate-500">hours</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{rule.sla_hours} hours</span>
                        <span className="text-slate-400 text-[11px]">
                          ({(rule.sla_hours / 24).toFixed(1)} days)
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {formatDateTime(rule.updated_at)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {isEditing ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSave(rule.category_id)}
                          disabled={isSaving}
                          className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                        >
                          {isSaving ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCategoryId(null)}
                          className="p-1.5 rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-700 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startEdit(rule.category_id, rule.sla_hours)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" /> Edit SLA
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
