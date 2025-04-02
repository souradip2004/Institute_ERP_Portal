'use client';

import React from 'react';
import AttendanceSettingsForm from '@/components/attendance-settings/AttendanceSettingsForm';
import { useAttendanceSettings } from '@/hooks/useAttendanceSettings';
import StatusBadge from '@/components/attendance-settings/StatusBadge';

export default function AttendanceSettingsPage() {
  const {
    settings,
    loading,
    error,
    isSaving,
    saveError,
    saveSuccess,
    saveSettings,
  } = useAttendanceSettings();

  return (
    <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Attendance Configuration</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure attendance tracking settings for your institution.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Loading attendance settings...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading settings</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-100 text-red-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          {!settings && (
            <div className="mb-6">
              <StatusBadge type="info" text="No settings found. Create your first attendance configuration." />
            </div>
          )}
          <AttendanceSettingsForm
            settings={settings}
            isSaving={isSaving}
            saveError={saveError}
            saveSuccess={saveSuccess}
            onSubmit={saveSettings}
          />
        </>
      )}
    </div>
  );
}