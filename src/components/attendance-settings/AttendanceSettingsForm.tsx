import React, { useState, useEffect } from 'react';
import { AttendanceSettings, AttendanceSettingsFormData } from '@/types/attendance.types';
import { validateAttendanceSettings } from '@/utils/formUtils';
import StatusBadge from './StatusBadge';

interface AttendanceSettingsFormProps {
  settings: AttendanceSettings | null;
  isSaving: boolean;
  saveError: string | null;
  saveSuccess: boolean;
  onSubmit: (data: AttendanceSettingsFormData) => void;
}

const AttendanceSettingsForm: React.FC<AttendanceSettingsFormProps> = ({
  settings,
  isSaving,
  saveError,
  saveSuccess,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<AttendanceSettingsFormData>({
    minimumAttendancePercentage: 75,
    autoLockAttendance: false,
    autoLockAfterHours: 24,
    allowExcusedAbsences: true,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Initialize form with existing settings
  useEffect(() => {
    if (settings) {
      setFormData({
        minimumAttendancePercentage: settings.minimumAttendancePercentage,
        autoLockAttendance: settings.autoLockAttendance,
        autoLockAfterHours: settings.autoLockAfterHours,
        allowExcusedAbsences: settings.allowExcusedAbsences,
      });
    }
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue,
    }));
    
    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true,
    }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    
    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true,
    }));
    
    // Validate the form
    const validationErrors = validateAttendanceSettings(formData);
    setErrors(validationErrors);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const validationErrors = validateAttendanceSettings(formData);
    setErrors(validationErrors);
    
    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allTouched);
    
    // Submit if no errors
    if (Object.keys(validationErrors).length === 0) {
      onSubmit(formData);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Attendance Settings</h2>
        <div>
          {saveSuccess && <StatusBadge type="success" text="Settings saved!" />}
          {saveError && <StatusBadge type="error" text={saveError} />}
          {isSaving && <StatusBadge type="loading" text="Saving..." />}
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="minimumAttendancePercentage" className="block text-sm font-medium text-gray-700 mb-1">
            Minimum Attendance Percentage
          </label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <input
              type="number"
              name="minimumAttendancePercentage"
              id="minimumAttendancePercentage"
              min="0"
              max="100"
              step="0.1"
              value={formData.minimumAttendancePercentage}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`block w-full pl-3 pr-12 py-2 rounded-md border ${
                touched.minimumAttendancePercentage && errors.minimumAttendancePercentage 
                  ? 'border-red-300 text-red-900 focus:outline-none focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
              aria-invalid={touched.minimumAttendancePercentage && !!errors.minimumAttendancePercentage}
              aria-describedby={
                touched.minimumAttendancePercentage && errors.minimumAttendancePercentage 
                  ? "minimumAttendancePercentage-error" 
                  : undefined
              }
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-gray-500 sm:text-sm">%</span>
            </div>
          </div>
          {touched.minimumAttendancePercentage && errors.minimumAttendancePercentage && (
            <p className="mt-2 text-sm text-red-600" id="minimumAttendancePercentage-error">
              {errors.minimumAttendancePercentage}
            </p>
          )}
          <p className="mt-2 text-sm text-gray-500">
            Students with attendance below this threshold may face academic penalties.
          </p>
        </div>
        
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="autoLockAttendance"
              name="autoLockAttendance"
              type="checkbox"
              checked={formData.autoLockAttendance}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="autoLockAttendance" className="font-medium text-gray-700">
              Auto-lock Attendance
            </label>
            <p className="text-gray-500">Automatically lock attendance records after a specified time.</p>
          </div>
        </div>
        
        {formData.autoLockAttendance && (
          <div>
            <label htmlFor="autoLockAfterHours" className="block text-sm font-medium text-gray-700 mb-1">
              Auto-lock After (Hours)
            </label>
            <input
              type="number"
              name="autoLockAfterHours"
              id="autoLockAfterHours"
              min="0"
              value={formData.autoLockAfterHours}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`block w-full px-3 py-2 rounded-md border ${
                touched.autoLockAfterHours && errors.autoLockAfterHours 
                  ? 'border-red-300 text-red-900 focus:outline-none focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
              aria-invalid={touched.autoLockAfterHours && !!errors.autoLockAfterHours}
              aria-describedby={
                touched.autoLockAfterHours && errors.autoLockAfterHours 
                  ? "autoLockAfterHours-error" 
                  : undefined
              }
            />
            {touched.autoLockAfterHours && errors.autoLockAfterHours && (
              <p className="mt-2 text-sm text-red-600" id="autoLockAfterHours-error">
                {errors.autoLockAfterHours}
              </p>
            )}
          </div>
        )}
        
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="allowExcusedAbsences"
              name="allowExcusedAbsences"
              type="checkbox"
              checked={formData.allowExcusedAbsences}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="allowExcusedAbsences" className="font-medium text-gray-700">
              Allow Excused Absences
            </label>
            <p className="text-gray-500">
              When enabled, instructors can mark absences as excused, which won't count against attendance requirements.
            </p>
          </div>
        </div>
      </div>
      
      <div className="pt-5">
        <div className="flex justify-end">
          <button
            type="button"
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
            onClick={() => {
              // Reset form to original settings
              if (settings) {
                setFormData({
                  minimumAttendancePercentage: settings.minimumAttendancePercentage,
                  autoLockAttendance: settings.autoLockAttendance,
                  autoLockAfterHours: settings.autoLockAfterHours,
                  allowExcusedAbsences: settings.allowExcusedAbsences,
                });
              } else {
                setFormData({
                  minimumAttendancePercentage: 75,
                  autoLockAttendance: false,
                  autoLockAfterHours: 24,
                  allowExcusedAbsences: true,
                });
              }
              setErrors({});
              setTouched({});
            }}
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className={`${
              isSaving ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            } py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {settings ? 'Update Settings' : 'Save Settings'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default AttendanceSettingsForm;