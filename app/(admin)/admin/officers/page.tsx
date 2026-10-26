'use client';

import React, { useState, useEffect } from 'react';
import { Department, Profile } from '@/lib/types';
import { DEMO_PROFILES } from '@/lib/dataStore';
import Link from 'next/link';
import { ArrowLeft, Users, Building, Shield, Phone, Mail, CheckCircle2 } from 'lucide-react';

export default function AdminOfficersRosterPage() {
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    fetch('/api/departments')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setDepartments(data);
      });
  }, []);

  const officers = DEMO_PROFILES.filter((p) => p.role === 'officer' || p.role === 'admin');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Admin Console
        </Link>
      </div>

      <div>
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
            <Users className="w-5 h-5" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            Municipal Department Officers Roster
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Active department commissioners, engineers, and site officers handling civic issue routing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {officers.map((officer) => {
          const dept = departments.find((d) => d.id === officer.department_id);
          return (
            <div
              key={officer.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {officer.full_name}
                  </h3>
                  <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                    {dept ? dept.name : 'Municipal Administration'}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    officer.role === 'admin'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60'
                  }`}
                >
                  {officer.role}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{officer.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{officer.phone || '+91 98765 00000'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
