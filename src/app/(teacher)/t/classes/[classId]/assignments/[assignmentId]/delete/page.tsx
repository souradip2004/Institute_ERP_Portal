"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface DeleteAssignmentPageProps {
  params: {
    classId: string;
    assignmentId: string;
  };
}

interface Assignment {
  id: string;
  title: string;
  maxPoints: number;
  dueDate: string | null;
  submissions: { id: string }[];
}

export default function DeleteAssignmentPage({ params }: DeleteAssignmentPageProps) {
  const { classId, assignmentId } = params;
  
  const router = useRouter();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/assignments/${assignmentId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch assignment details');
        }
        
        const data = await response.json();
        setAssignment(data);
      } catch (error: unknown) {
        console.error('Error fetching assignment:', error);
        setError(error instanceof Error ? error.message : 'Failed to load assignment details');
      } finally {
        setLoading(false);
      }
    };

    if (assignmentId) {
      fetchAssignment();
    }
  }, [assignmentId]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      const response = await fetch(`/api/assignments/${assignmentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete assignment');
      }

      // Redirect back to assignments page
      router.push(`/t/classes/${classId}/assignments`);
    } catch (error: unknown) {
      console.error('Error deleting assignment:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete assignment');
      setDeleting(false);
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
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
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

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-xl font-semibold text-gray-800 mb-4">Assignment Not Found</h1>
          <p className="text-gray-700 mb-6">The assignment you&apos;re trying to delete could not be found.</p>
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

  const hasSubmissions = assignment.submissions && assignment.submissions.length > 0;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-xl font-semibold text-gray-800 mb-4">Delete Assignment</h1>
        
        <div className="mb-6">
          <h2 className="font-medium text-gray-700 mb-2">{assignment.title}</h2>
          <p className="text-sm text-gray-600 mb-1">
            Points: {assignment.maxPoints}
          </p>
          <p className="text-sm text-gray-600 mb-1">
            Due Date: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No due date'}
          </p>
          {hasSubmissions && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-700 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="inline-block h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Warning: This assignment has {assignment.submissions.length} submissions. Deleting it will remove all student submissions and grades.
              </p>
            </div>
          )}
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Confirm Delete'}
          </button>
          <Link
            href={`/t/classes/${classId}/assignments`}
            className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 text-center"
          >
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
} 