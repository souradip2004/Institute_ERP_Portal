"use client";

import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface GradeSubmissionPageProps {
  params: {
    classId: string;
    submissionId: string;
  };
}

interface Submission {
  id: string;
  assignmentId: string;
  assignment: {
    id: string;
    title: string;
    maxPoints: number;
  };
  student: {
    id: string;
    user: {
      name: string;
    };
  };
  submissionTime: string;
  obtainedPoints: number;
  status: string;
  feedback: string | null;
  attachments: {
    id: string;
    fileUrl: string;
    fileName: string;
    fileType: string;
  }[];
}

export default function GradeSubmissionPage({ params }: GradeSubmissionPageProps) {
  const { classId, submissionId } = params;
  
  const router = useRouter();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [obtainedPoints, setObtainedPoints] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/assignments/submissions/${submissionId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch submission details');
        }
        
        const data = await response.json();
        setSubmission(data);
        setObtainedPoints(data.obtainedPoints?.toString() || '');
        setFeedback(data.feedback || '');
      } catch (error: unknown) {
        console.error('Error fetching submission:', error);
        setError(error instanceof Error ? error.message : 'Failed to load submission details');
      } finally {
        setLoading(false);
      }
    };

    if (submissionId) {
      fetchSubmission();
    }
  }, [submissionId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!submission) return;

    if (obtainedPoints === '' || isNaN(Number(obtainedPoints))) {
      alert('Please enter a valid point value');
      return;
    }

    // Validate max points
    const points = Number(obtainedPoints);
    if (points < 0 || points > submission.assignment.maxPoints) {
      alert(`Points must be between 0 and ${submission.assignment.maxPoints}`);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/assignments/submissions/${submissionId}/grade`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          obtainedPoints: points,
          feedback,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update grade');
      }

      // Redirect back to assignments page
      router.push(`/t/classes/${classId}/assignments`);
    } catch (error: unknown) {
      console.error('Error updating grade:', error);
      setError(error instanceof Error ? error.message : 'Failed to update grade');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-xl font-semibold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <Link 
            href={`/t/classes/${classId}/assignments`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Return to Assignments
          </Link>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-xl font-semibold text-gray-800 mb-4">Submission Not Found</h1>
          <p className="text-gray-700 mb-6">The submission you&apos;re trying to grade could not be found.</p>
          <Link 
            href={`/t/classes/${classId}/assignments`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Return to Assignments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-purple-50 border-b border-purple-100">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-semibold text-purple-900">Grade Assignment Submission</h1>
              <Link 
                href={`/t/classes/${classId}/assignments`}
                className="text-purple-600 hover:text-purple-800 font-medium text-sm"
              >
                Back to Assignments
              </Link>
            </div>
          </div>
          
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-800 mb-2">{submission.assignment.title}</h2>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Student:</span> {submission.student.user.name}
                </p>
                <p>
                  <span className="font-medium">Submitted:</span> {new Date(submission.submissionTime).toLocaleString()}
                </p>
                <p>
                  <span className="font-medium">Max Points:</span> {submission.assignment.maxPoints}
                </p>
              </div>
            </div>
            
            {submission.attachments && submission.attachments.length > 0 && (
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-800 mb-2">Attachments:</h3>
                <div className="flex flex-wrap gap-3">
                  {submission.attachments.map((attachment) => (
                    <a 
                      key={attachment.id}
                      href={attachment.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {attachment.fileName}
                    </a>
                  ))}
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="obtainedPoints" className="block text-sm font-medium text-gray-700 mb-1">
                  Points ({submission.assignment.maxPoints} maximum)
                </label>
                <input
                  type="number"
                  id="obtainedPoints"
                  min="0"
                  max={submission.assignment.maxPoints}
                  step="0.5"
                  value={obtainedPoints}
                  onChange={(e) => setObtainedPoints(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
                  Feedback
                </label>
                <textarea
                  id="feedback"
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  placeholder="Provide feedback to the student..."
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <Link
                  href={`/t/classes/${classId}/assignments`}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Grade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 