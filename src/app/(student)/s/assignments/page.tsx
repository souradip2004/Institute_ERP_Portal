"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Loader from '@/components/ui/Loader';
import { ArrowLeft, Download, Calendar, FileCheck, ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Assignment {
  id: string;
  title: string;
  dueDate: string | Date;
  status: string;
  submissions?: AssignmentSubmission[];
  maxPoints?: number;
  attachments: any;
  classSection:any;
}

interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  status: string;
  obtainedPoints?: number;
  maxPoints?: number;

}

interface StudentData {
  id: string;
  studentId?: string;
  role: string;
  name?: string;
  [key: string]: unknown;
}

interface RawAssignment {
  id: string;
  title: string;
  dueDate?: string;
  submissions?: {
    id: string;
    assignmentId: string;
    studentId: string;
    status: string;
    obtainedPoints?: number;
  }[];
  attachments: any[];
  maxPoints?: number;
  [key: string]: unknown;
  classSection  :any;
}

export default function AssignmentsPage() {
  const [ongoingAssignments, setOngoingAssignments] = useState<Assignment[]>([]);
  const [completedAssignments, setCompletedAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [rawAssignmentData, setRawAssignmentData] = useState<RawAssignment[]>([]);
  const [debugMode, setDebugMode] = useState(false);
  const [classSections, setClassSections] = useState<any[]>([])

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get user data from localStorage
        const userDataStr = localStorage.getItem('user');
        if (!userDataStr) {
          setError("User data not found. Please log in again.");
          setLoading(false);
          return;
        }

        const userData = JSON.parse(userDataStr);
        setStudentData(userData);

        // Fetch assignments
        await fetchAssignments(userData.studentId || userData.id);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load user data. Please refresh the page.");
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const fetchAssignments = async (studentId: string) => {
    try {
      setLoading(true);

      // Get user data from localStorage to extract classSectionId
      const userDataStr = localStorage.getItem('user');
      if (!userDataStr) {
        throw Error('User data not found. Please log in again.');
      }

      const userData = JSON.parse(userDataStr);
      const classdetails = await fetch(`/api/students/${userData.studentId}`, {
                method:"GET",
                headers: {
                  'Content-Type': 'application/json',
                },
              })
      if(!classdetails.ok){
        alert("no classes found")
        return;
      }
      const classes=await classdetails.json();
      const classenrollments=classes?.classEnrollments
      const classd=[]
      for(let i=0;i<classenrollments.length;i++){
        classd.push(classenrollments[i].classSectionId)
      }
      setClassSections(classd)
      const classSectionId = userData.classSectionId;

      if (!classSectionId) {
        console.warn('No classSectionId found in user data, falling back to fetching all assignments');
        // Fall back to original API if no classSectionId is found
        const response = await fetch(`/api/assignments`);

        if (!response.ok) {
          throw Error('Failed to fetch assignments');
        }

        const data = await response.json();
        handleAssignmentData(data, studentId);
        return;
      }

      // Fetch from the new API endpoint with classSectionId
      const response = await fetch(`/api/assignments/my-assignments?classSectionId=${classSectionId}&user=${studentId}`);

      if (!response.ok) {
        throw Error('Failed to fetch assignments');
      }

      const data = await response.json();
      console.log('Raw assignment data received:', data);

      handleAssignmentData(data, studentId);
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError("Failed to fetch assignments."); // Set user-friendly error
      setOngoingAssignments([]);
      setCompletedAssignments([]);
      setLoading(false);
    }
  };

  // Extract processing logic to a separate function for reuse
  const handleAssignmentData = (data: RawAssignment[], studentId: string) => {
    // Store raw data for debugging
    setRawAssignmentData(data);

    // Check if data is empty
    if (!data || data.length === 0) {
      console.log('No assignment data returned from API');
      setOngoingAssignments([]);
      setCompletedAssignments([]);
      setLoading(false);
      return;
    }

    // Process and map assignments
    const processedAssignments = data.map((assignment: RawAssignment): Assignment => {
      // Format due date
      let formattedDueDate = 'No due date';
      if (assignment.dueDate) {
        const date = new Date(assignment.dueDate);
        // Using toLocaleDateString with options for more robust formatting
        formattedDueDate = date.toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
      }

      // Find submission for this student
      const studentSubmission = assignment.submissions?.find((sub) =>
        sub.studentId === studentId
      );

      // Map to Assignment type
      return {
        id: assignment.id,
        title: assignment.title,
        dueDate: formattedDueDate,
        status: studentSubmission ? studentSubmission.status : 'PENDING',
        submissions: studentSubmission ? [studentSubmission] as AssignmentSubmission[] : [], // Only include student's submission
        maxPoints: assignment.maxPoints,
        attachments:assignment?.attachments[0]?.fileUrl,
        classSection:assignment?.classSection
      };
    });

    // Filter assignments into ongoing and completed
    const ongoing = processedAssignments.filter((assignment) =>
      !assignment.submissions?.some((sub) => sub.studentId === studentId && sub.status === 'GRADED') // Ongoing if not graded by this student
    );

    const completed = processedAssignments.filter((assignment) =>
      assignment.submissions?.some((sub) => sub.studentId === studentId && sub.status === 'GRADED') // Completed if graded by this student
    );

    console.log('Ongoing assignments:', ongoing);
    console.log('Completed assignments:', completed);

    setOngoingAssignments(ongoing);
    setCompletedAssignments(completed);
    setLoading(false);
  };

  const getStatusDisplay = (assignment: Assignment) => {
    const studentSubmission = assignment.submissions?.find(sub =>
      sub.studentId === (studentData?.studentId || studentData?.id)
    );

    if (studentSubmission) {
      return studentSubmission.status === 'GRADED' ? 'Submitted' : 'Pending';
    }

    return 'Pending';
  };

  const getActionButton = (assignment: Assignment) => {
    const studentSubmission = assignment.submissions?.find(sub =>
      sub.studentId === (studentData?.studentId || studentData?.id)
    );

    // If no submission or status is not GRADED, show Submit Now
    if (!studentSubmission || studentSubmission.status !== 'GRADED') {
      return (
        <Button
          onClick={async () => {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'application/pdf'; // Restrict to PDF

            fileInput.onchange = async (event) => {
              const file = (event.target as HTMLInputElement).files?.[0];
              if (!file) {
                console.error('No file selected');
                alert('No file selected for submission.');
                return;
              }

              if (file.size > 5 * 1024 * 1024) { // Max 5MB
                alert('File size exceeds 5MB limit.');
                return;
              }

              console.log(`Submitting assignment ${assignment.id} with file:`, file.name);
              const formData = new FormData();
              formData.append('assignmentId', assignment.id);
              formData.append('file', file);
              formData.append('user', studentData?.studentId || studentData?.id || ''); // Use actual student ID

              try {
                const response = await fetch(`/api/assignments/submit`, {
                  method: 'POST',
                  body: formData,
                });

                if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(errorData.error || 'Failed to submit assignment');
                }

                alert('Assignment submitted successfully');
                // Re-fetch assignments to update UI
                await fetchAssignments(studentData?.studentId || studentData?.id || '');
              } catch (error: any) {
                console.error('Error submitting assignment:', error);
                alert(`Error submitting assignment: ${error.message}`);
              }
            };

            fileInput.click();
          }}
          className="text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 bg-blue-600 hover:bg-blue-700 w-full md:w-auto"
        >
          Submit Now
        </Button>
      );
    }

    // If status is GRADED, show Edit (or potentially View Submission)
    return (
      <Link href={`/s/assignments/edit/${assignment.id}`} className="text-purple-800 font-medium hover:text-purple-900 block text-center md:inline-block">
        Edit
      </Link>
    );
  };

  const getGrade = (assignment: Assignment) => {
    const studentSubmission = assignment.submissions?.find(sub =>
      sub.studentId === (studentData?.studentId || studentData?.id)
    );

    if (typeof studentSubmission?.obtainedPoints === 'number') {
      if (typeof assignment.maxPoints === 'number') {
        return `${studentSubmission.obtainedPoints}/${assignment.maxPoints}`;
      }
      return studentSubmission.obtainedPoints; // Just show obtained points if max not available
    }

    return 'N/A'; // No grade yet or not submitted
  };

  const toggleDebugMode = () => {
    setDebugMode(!debugMode);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <Loader size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-8"> {/* Adjusted padding for mobile */}
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

 return (
  <div className="p-4 sm:p-8 overflow-x-auto">
    <div className="mb-6 sm:mb-8 max-w-screen-xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h2 className="text-2xl font-semibold text-gray-800">Assignments</h2>
        <button
          onClick={toggleDebugMode}
          className="text-sm text-gray-500 hover:text-gray-700 mt-2 sm:mt-0"
        >
          {/* {debugMode ? 'Hide Debug Info' : 'Show Debug Info'} */}
        </button>
      </div>
    </div>

    {debugMode && (
      <div className="bg-white p-4 rounded-lg shadow-sm mb-4 overflow-auto max-h-60 max-w-screen-xl mx-auto">
        <h3 className="font-semibold mb-2">Raw Assignment Data:</h3>
        <pre className="text-xs break-words whitespace-pre-wrap">
          {JSON.stringify(rawAssignmentData, null, 2)}
        </pre>
      </div>
    )}

    {/* Ongoing Assignments */}
    <div className="mb-8 max-w-screen-xl mx-auto">
      <div className="flex items-center mb-4">
        <FileCheck className="h-5 w-5 text-purple-600 mr-2" />
        <h3 className="text-xl font-semibold text-gray-800">Ongoing</h3>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 bg-gray-50 min-w-[120px]">
                Topic
              </th>
              <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 bg-gray-50 min-w-[140px]">
                Due Date
              </th>
              <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 bg-gray-50 min-w-[100px]">
                View
              </th>
              <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 bg-gray-50 min-w-[100px]">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 bg-gray-50 min-w-[120px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ongoingAssignments.length > 0 ? (
              ongoingAssignments
                .filter(a => classSections.includes(a.classSection.id))
                .map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 break-words whitespace-normal">
                      {assignment.title}
                    </td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-1 sm:mr-2" />
                        {typeof assignment.dueDate === 'string'
                          ? assignment.dueDate
                          : assignment.dueDate instanceof Date
                            ? assignment.dueDate.toLocaleDateString()
                            : 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-blue-600">
                      <Link
                        href={assignment?.attachments || ''}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center hover:text-blue-800"
                      >
                        <Download className="h-4 w-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Download</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                        {getStatusDisplay(assignment)}
                      </span>
                    </td>
                    <td className="px-4 py-3">{getActionButton(assignment)}</td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-4 text-center text-sm text-gray-500">
                  No ongoing assignments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>

    {/* Completed Assignments */}
    <div className="max-w-screen-xl mx-auto">
      <div className="flex items-center mb-4">
        <ClipboardCheck className="h-5 w-5 text-green-600 mr-2" />
        <h3 className="text-xl font-semibold text-gray-800">Completed</h3>
      </div>

      <div className="bg-white overflow-hidden shadow-sm rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 bg-gray-50 min-w-[100px]">
                Topic
              </th>
              <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 bg-gray-50 min-w-[120px]">
                Due Date
              </th>
              <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 bg-gray-50 min-w-[100px]">
                View
              </th>
              <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 bg-gray-50 min-w-[100px]">
                Grade
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {completedAssignments.length > 0 ? (
              completedAssignments.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700 break-words whitespace-normal">
                    {assignment.title}
                  </td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-1 sm:mr-2" />
                      {typeof assignment.dueDate === 'string'
                        ? assignment.dueDate
                        : assignment.dueDate instanceof Date
                          ? assignment.dueDate.toLocaleDateString()
                          : 'N/A'}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-blue-600">
                    <Link
                      href={assignment?.attachments || ''}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center hover:text-blue-800"
                    >
                      <Download className="h-4 w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Download</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      {getGrade(assignment)}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-4 text-center text-sm text-gray-500">
                  No completed assignments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

}