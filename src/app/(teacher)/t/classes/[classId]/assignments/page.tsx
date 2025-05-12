"use client";

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import AssignmentUpload from '@/components/AssignmentUpload';
import AssignmentsList from '@/components/AssignmentsList';
import notify from '@/utils/toast';
import Loader from '@/components/ui/Loader';

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
  feedback: string | null;
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
  const resolvedParams = React.use(params as any) as { classId: string };
  const { classId } = resolvedParams;

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [className, setClassName] = useState<string>('');
  const [section, setSection] = useState<string>('');

  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        for(let i=0;i<10;i++)
          console.log (' ------------- ')
            console.log('Class ID:', classId);


        // Try to fetch class details from API
        const classDetailsEndpoints = [
          `/api/classes/${classId}`,
          `/api/class-sections/${classId}`
        ];

        let classDetailsData = null;

        for (const endpoint of classDetailsEndpoints) {
          try {
            const response = await fetch(endpoint, {
              credentials: 'include'
            });

            if (response.ok) {
              const data = await response.json();
              classDetailsData = data;
              break;
            }
          } catch (error) {
            console.error(`Error fetching from ${endpoint}:`, error);
          }
        }

        // If we have class details from API
        if (classDetailsData) {
          setClassName(classDetailsData.name || classDetailsData.className ||
            (classDetailsData.batch ? `Class ${classDetailsData.batch.batchName}` : 'Class'));
          setSection(classDetailsData.section || classDetailsData.sectionName || 'A');
          notify.success('Class details loaded successfully');
        } else {
          // Use sample data if API fails
          setClassName('Class 9th');
          setSection('A');
          notify.warning('Using default class data');
        }
      } catch (error) {
        console.error('Error fetching class details:', error);
        notify.error('Failed to load class details');
      }
    };

    const fetchAssignments = async () => {
      try {
        setLoading(true);
        console.log('Fetching assignments for class ID:', classId);
        const response = await fetch(`/api/classes/${classId}/assignments`);

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
        notify.success('Assignments loaded successfully');
      } catch (error: unknown) {
        console.error('Error fetching assignments:', error);
        setError(error instanceof Error ? error.message : 'Failed to load assignments');
        notify.error('Failed to load assignments');
      } finally {
        setLoading(false);
      }
    };

    if (classId) {
      const loadingId = notify.loading('Loading assignments...');
      Promise.all([fetchClassDetails(), fetchAssignments()])
        .finally(() => notify.dismiss(loadingId));
    }
  }, [classId]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              {/* <h1 className="text-2xl font-bold text-gray-900">{className} {section} - Assignments</h1> */}
              <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>

              <p className="text-gray-600 mt-1">Manage assignments for this class</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Assignment Upload Section */}
          <AssignmentUpload classSectionId={classId} />

          {/* Assignments List Section */}
          {loading ? (
            <Loader size="large" message="Loading assignments..." />
          ) : error ? (
            <div className="p-6 bg-red-50 text-red-500 rounded-md">
              <p>{error}</p>
            </div>
          ) : (
            <AssignmentsList
              assignments={assignments.map(assignment => ({
                ...assignment,
                submissions: assignment.submissions.map(submission => ({
                  ...submission,
                  feedback: submission.feedback || null
                }))
              }))}
              classSectionId={classId}
            />
          )}
        </div>
      </div>
    </div>
  );
} 