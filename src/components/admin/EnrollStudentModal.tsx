import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

// Interface for the batch data received from the API
interface Batch {
  id: string;
  batchName: string;
  year: number;
  classSections: Array<{
    id: string;
    sectionName: string;
  }>;
}

interface EnrollStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  onEnrollmentSuccess: () => void;
}

export default function EnrollStudentModal({ isOpen, onClose, studentId, onEnrollmentSuccess }: EnrollStudentModalProps) {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [selectedClassSectionId, setSelectedClassSectionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch batches only when the modal is opened
    if (isOpen) {
      const fetchBatches = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await axios.get<Batch[]>('/api/batches');
          setBatches(response.data);
        } catch (err) {
          setError('Failed to fetch batches. Please try again.');
          console.error('Error fetching batches:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchBatches();
    } else {
      // Reset state when modal is closed
      setSelectedBatchId('');
      setSelectedClassSectionId('');
      setError(null);
    }
  }, [isOpen]);

  // Memoize the class sections to avoid re-calculating on every render
  const availableClassSections = useMemo(() => {
    if (!selectedBatchId) return [];
    const selectedBatch = batches.find(b => b.id === selectedBatchId);
    return selectedBatch?.classSections || [];
  }, [selectedBatchId, batches]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassSectionId) {
      setError('Please select a class section.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await axios.post('/api/studentClassEnrollment', {
        studentId,
        classSectionId: selectedClassSectionId,
        enrollmentStatus: 'ENROLLED',
      });
      // On success, call the callback function to refresh data and close the modal
      onEnrollmentSuccess();
    } catch (err) {
      setError('Failed to enroll student. The student might already be enrolled in this class.');
      console.error('Error creating enrollment:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-600/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg mx-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Enroll Student in a Class</h2>
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="batch-select" className="block text-sm font-medium text-gray-700 mb-1">Select Batch</label>
              <select
                id="batch-select"
                value={selectedBatchId}
                onChange={(e) => {
                  setSelectedBatchId(e.target.value);
                  setSelectedClassSectionId(''); // Reset class selection
                }}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                disabled={loading}
              >
                <option value="">-- Choose a Batch --</option>
                {batches.map(batch => (
                  <option key={batch.id} value={batch.id}>
                    {batch.batchName} ({batch.year})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="class-section-select" className="block text-sm font-medium text-gray-700 mb-1">Select Class Section</label>
              <select
                id="class-section-select"
                value={selectedClassSectionId}
                onChange={(e) => setSelectedClassSectionId(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                disabled={!selectedBatchId || loading}
              >
                <option value="">-- Choose a Class Section --</option>
                {availableClassSections.map(section => (
                  <option key={section.id} value={section.id}>
                    {section.sectionName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedClassSectionId}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-700 hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Enrolling...' : 'Create Enrollment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}