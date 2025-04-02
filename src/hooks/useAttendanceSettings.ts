import { useState, useEffect } from 'react';
import { AttendanceSettings, AttendanceSettingsFormData } from '@/types/attendance.types';

export const useAttendanceSettings = () => {
  const [settings, setSettings] = useState<AttendanceSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
  
    try {
      const response = await fetch("/api/attendance-settings", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Ensures cookies are sent with the request
      });
      console.log("present here")
      console.log("Response from attendance settings", response);
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized: Please log in again.");
        } else if (response.status === 404) {
          setSettings(null);
        } else {
          const data = await response.json();
          throw new Error(data.error || "Failed to fetch attendance settings");
        }
      } else {
        const data = await response.json();
        setSettings(data);
      }
    } catch (err) {
      console.log("Error fetching attendance settings", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };
  
  

  const saveSettings = async (data: AttendanceSettingsFormData) => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    
    try {
      const method = settings ? 'PUT' : 'POST';
      const response = await fetch("/api/attendance-settings", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Add this to send cookies
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${settings ? 'update' : 'create'} settings`);
      }
      
      const updatedSettings = await response.json();
      setSettings(updatedSettings);
      setSaveSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    isSaving,
    saveError,
    saveSuccess,
    fetchSettings,
    saveSettings,
  };
};
