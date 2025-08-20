"use client";

import React, {use, useEffect, useState} from 'react';
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
  attachments: { id: string; fileUrl: string; fileName: string; fileType: string }[];
}

interface ApiAssignment extends Omit<Assignment, 'submissions'> {
  submissions?: AssignmentSubmission[];
}

interface TeacherAssignmentsPageProps {
  params: {
    classId: string;
  };
}

export default function TeacherAssignmentsPage({params}: TeacherAssignmentsPageProps) {
  const resolvedParams = React.use(params as any) as { classId: string };
  const {classId} = resolvedParams;
  
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [institutionType, setInstitutionType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [className, setClassName] = useState<string>('');
  const [section, setSection] = useState<string>('');
  const [institutionId, setInstitutionId] = useState<string>('');
  const [isUploadPopupOpen, setIsUploadPopupOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("user")) {
      setInstitutionId(JSON.parse(localStorage.getItem("user")).institutionId)
      setInstitutionType(JSON.parse(localStorage.getItem("user")).institutionType || null);
    }
  }, [])
  const fetchAssignments1 = async () => {
    try {
      setLoading(true);
      console.log('Fetching assignments for class ID:', classId);
      const response = await fetch(`/api/classes/${classId}/assignments`);

      if (!response.ok) {
        throw new Error('Failed to fetch assignments');
      }

      const data = await response.json() as ApiAssignment[];
      const processedData = await Promise.all(data.map(async (assignment: ApiAssignment) => {
        const submissionsResponse = await fetch(`/api/assignments/${assignment.id}`, {
          method: 'GET',
          credentials: 'include'
        });
        const actualSubmissions = await submissionsResponse.json();
        console.log('Fetched submissions for assignment:', assignment.id, actualSubmissions);
        return {
          ...assignment,
          submissions: actualSubmissions.submissions || []
        };
      }));
      setAssignments(processedData);
    } catch (error: unknown) {
      console.error('Error fetching assignments:', error);
      setError(error instanceof Error ? error.message : 'Failed to load assignments');
      notify.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        console.log('Class ID: ', classId);

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

        if (classDetailsData) {
          setClassName(classDetailsData.name || classDetailsData.className ||
            (classDetailsData.batch ? `Class ${classDetailsData.batch.batchName}` : 'Class'));
          setSection(classDetailsData.section || classDetailsData.sectionName || 'A');
        } else {
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
        const processedData = await Promise.all(data.map(async (assignment: ApiAssignment) => {
          const submissionsResponse = await fetch(`/api/assignments/${assignment.id}`, {
            method: 'GET',
            credentials: 'include'
          });
          const actualSubmissions = await submissionsResponse.json();
          console.log('Fetched submissions for assignment:', assignment.id, actualSubmissions);
          return {
            ...assignment,
            submissions: actualSubmissions.submissions || []
          };
        }));
        setAssignments(processedData);
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
  
  const handleAssignmentCreated = () => {
    // Re-fetch assignments after a new one is created
    const loadingId = notify.loading('Reloading assignments...');
    fetchAssignments1()
      .finally(() => notify.dismiss(loadingId));
    
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{institutionType?.includes("College")?"Assignments":"Homeworks"}</h1>
              <p className="text-gray-600 mt-1">Manage {institutionType?.includes("College")?"Assignments":"Homeworks"} for this class</p>
            </div>
            {/* The changed button is here */}
            <button
              onClick={() => setIsUploadPopupOpen(true)}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-2 rounded-full shadow-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
            >
              New {institutionType?.includes("College") ? "Assignment" : "Homework"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Assignment Upload Section */}
          {isUploadPopupOpen && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 shadow-xl max-w-lg w-full">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    Create New {institutionType?.includes("College") ? "Assignment" : "Homework"}
                  </h2>
                  <button onClick={() => setIsUploadPopupOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <AssignmentUpload
                  classSectionId={classId}
                  instituteId={institutionId}
                  institutionType={institutionType}
                  onAssignmentCreated={() => {
                    handleAssignmentCreated();
                    setIsUploadPopupOpen(false);
                  }}
                />
              </div>
            </div>
          )}

          {/* Assignments List Section */}
          {loading ? (
            <Loader size="large" message="Loading assignments..."/>
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