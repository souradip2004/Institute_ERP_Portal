"use client";

import React, { useEffect, useState } from 'react';
import TeacherHeader from '@/components/TeacherHeader';
import AssignmentUpload from '@/components/AssignmentUpload';
import AssignmentsList from '@/components/AssignmentsList';

interface AssignmentSubmission {
  id: string;
  studentId: string;
  student: {
    id: string;
    user: {
      name: string;
    };
  };
  submissionTime: string;
  obtainedPoints: number;
  status: string;
}

interface Assignment {
  id: string;
  title: string;
  dueDate: string | null;
  status: string;
  maxPoints: number;
  submissions: AssignmentSubmission[];
}

interface ApiAssignment extends Omit<Assignment, 'submissions'> {
  submissions?: AssignmentSubmission[];
}

interface TeacherAssignmentsPageProps {
  params: {
    classId: string;
  };
}

export default function TeacherAssignmentsPage({ params }: TeacherAssignmentsPageProps) {
  const { classId } = params;
  
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/assignments?classSectionId=${classId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch assignments');
        }
        
        const data = await response.json() as ApiAssignment[];
        // Make sure submissions is always an array even if not provided from API
        const processedData = data.map((assignment: ApiAssignment) => ({
          ...assignment,
          submissions: assignment.submissions || []
        }));
        setAssignments(processedData);
      } catch (error: unknown) {
        console.error('Error fetching assignments:', error);
        setError(error instanceof Error ? error.message : 'Failed to load assignments');
      } finally {
        setLoading(false);
      }
    };

    if (classId) {
      fetchAssignments();
    }
  }, [classId]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <TeacherHeader classId={classId} />
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Assignment Upload Section */}
          <AssignmentUpload classSectionId={classId} />

          {/* Assignments List Section */}
          {loading ? (
            <div className="flex justify-center items-center h-64 bg-white rounded-md shadow-sm">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
          ) : error ? (
            <div className="p-6 bg-red-50 text-red-500 rounded-md">
              <p>{error}</p>
            </div>
          ) : (
            <AssignmentsList 
              assignments={assignments} 
              classSectionId={classId} 
            />
          )}
        </div>
      </div>
    </div>
  );
} 