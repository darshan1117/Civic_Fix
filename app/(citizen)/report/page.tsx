import React from 'react';
import { ReportWizard } from '@/components/report/ReportWizard';
import { Shield } from 'lucide-react';

export const metadata = {
  title: 'Report a Civic Issue — CivicFix',
  description: 'Report potholes, garbage, streetlights, or water leaks with duplicate detection.',
};

export default function ReportPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Report a Civic Hazard
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
          Submit photos and location. Our automated engine checks for duplicates within 50m and routes
          your ticket directly to the municipal department.
        </p>
      </div>

      <ReportWizard />
    </div>
  );
}
