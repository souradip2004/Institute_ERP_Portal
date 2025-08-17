"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Loader from '@/components/ui/Loader';
import { ArrowLeft, Download, Calendar, FileCheck, ClipboardCheck, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Assignment {
  id: string;
  title: string;
  dueDate: string | Date;
  status: string; // PENDING, SUBMITTED, GRADED
  submissions?: AssignmentSubmission[];
  maxPoints?: number;
  attachments: any;
  classSection: any;
}

interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  status: string; // PENDING, SUBMITTED, GRADED
  obtainedPoints?: number;
  maxPoints?: number;
  submissionUrl?: string; // Add submission URL
  attachments?: any[]; // Added attachments for submission
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
    submissionUrl?: string;
    attachments?: any[]; // Added attachments for raw submission
  }[];
  attachments: any[];
  maxPoints?: number;
  [key: string]: unknown;
  classSection: any;
}

export default function AssignmentsPage() {
  const [ongoingAssignments, setOngoingAssignments] = useState<Assignment[]>([]);
  const [submittedAssignments, setSubmittedAssignments] = useState<Assignment[]>([]);
  const [gradedAssignments, setGradedAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [rawAssignmentData, setRawAssignmentData] = useState<RawAssignment[]>([]);
  const [debugMode, setDebugMode] = useState(false);
  const [classSections, setClassSections] = useState<any[]>([]);
  
  // New state to track downloaded assignments
  const [downloadedAssignments, setDownloadedAssignments] = useState<Set<string>>(new Set());

  // Refs for file inputs
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDataStr = localStorage.getItem('user');
        if (!userDataStr) {
          setError("User data not found. Please log in again.");
          setLoading(false);
          return;
        }

        const userData = JSON.parse(userDataStr);
        setStudentData(userData);

        await fetchAssignments(userData.studentId);
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

      const userDataStr = localStorage.getItem('user');
      if (!userDataStr) {
        throw Error('User data not found. Please log in again.');
      }

      const userData = JSON.parse(userDataStr);
      const classdetails = await fetch(`/api/students/${userData.studentId}`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!classdetails.ok) {
        alert("No classes found for your student ID.");
        setLoading(false);
        return;
      }

      const classes = await classdetails.json();
      const classenrollments = classes?.classEnrollments;
      const classd: string[] = [];
      for (let i = 0; i < classenrollments.length; i++) {
        classd.push(classenrollments[i].classSectionId);
      }
      setClassSections(classd);

      const classSectionId = userData.classSectionId;

      let data: RawAssignment[] = [];
      if (classSectionId) {
        const response = await fetch(`/api/assignments/my-assignments?classSectionId=${classSectionId}&user=${studentId}`);
        if (!response.ok) {
          throw Error('Failed to fetch assignments for the specific class section.');
        }
        data = await response.json();
      } else {
        console.warn('No classSectionId found in user data, fetching all assignments.');
        const response = await fetch(`/api/assignments`);
        if (!response.ok) {
          throw Error('Failed to fetch all assignments.');
        }
        data = await response.json();
      }

      console.log('Raw assignment data received:', data);
      handleAssignmentData(data, studentId);
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError("Failed to fetch assignments. Please try again.");
      setOngoingAssignments([]);
      setSubmittedAssignments([]);
      setGradedAssignments([]);
      setLoading(false);
    }
  };

  const handleAssignmentData = (data: RawAssignment[], studentId: string) => {
    setRawAssignmentData(data);

    if (!data || data.length === 0) {
      console.log('No assignment data returned from API');
      setOngoingAssignments([]);
      setSubmittedAssignments([]);
      setGradedAssignments([]);
      setLoading(false);
      return;
    }

    const processedAssignments = data.map((assignment: RawAssignment): Assignment => {
      let formattedDueDate = 'No due date';
      if (assignment.dueDate) {
        const date = new Date(assignment.dueDate);
        formattedDueDate = date.toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
      }

      const studentSubmission = assignment.submissions?.find((sub) =>
        sub.studentId === studentId
      );

      return {
        id: assignment.id,
        title: assignment.title,
        dueDate: formattedDueDate,
        status: studentSubmission ? studentSubmission.status : 'PENDING',
        submissions: studentSubmission ? [studentSubmission] as AssignmentSubmission[] : [],
        maxPoints: assignment.maxPoints,
        attachments: assignment?.attachments[0]?.fileUrl,
        classSection: assignment?.classSection
      };
    });

    const ongoing = processedAssignments.filter((assignment) => {
      const submission = assignment.submissions?.find(sub => sub.studentId === studentId);
      return !submission;
    });

    const submitted = processedAssignments.filter((assignment) => {
      const submission = assignment.submissions?.find(sub => sub.studentId == studentId);
      console.log(assignment.submissions)
      console.log(studentId)
      return submission;
    });

    const graded = processedAssignments.filter((assignment) => {
      const submission = assignment.submissions?.find(sub => sub.studentId === studentId);
      return submission && submission.status === 'GRADED';
    });

    console.log('Ongoing assignments:', ongoing);
    console.log('Submitted assignments:', submitted);
    console.log('Graded assignments:', graded);


    setOngoingAssignments(ongoing);
    setSubmittedAssignments(submitted);
    setGradedAssignments(graded);
    setLoading(false);
  };

  const getStatusDisplay = (assignment: Assignment) => {
    const studentSubmission = assignment.submissions?.find(sub =>
      sub.studentId === (studentData?.studentId || studentData?.id)
    );

    if (studentSubmission) {
      return studentSubmission.status === 'GRADED' ? 'Graded' : studentSubmission.status;
    }
    return 'PENDING';
  };

  const handleFileUploadClick = (assignmentId: string) => {
    fileInputRefs.current[assignmentId]?.click();
  };

  const handleSubmitAssignment = async (assignment: Assignment, file: File) => {
    if (!file) {
      alert('No file selected for submission.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // Max 5MB
      alert('File size exceeds 5MB limit.');
      return;
    }

    if (window.confirm(`Are you sure you want to submit "${file.name}" for "${assignment.title}"?`)) {
      console.log(`Submitting assignment ${assignment.id} with file:`, file.name);
      const formData = new FormData();
      formData.append('assignmentId', assignment.id);
      formData.append('file', file);
      formData.append('user', JSON.stringify(studentData));

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
        await fetchAssignments(studentData?.studentId || studentData?.id || '');
      } catch (error: any) {
        console.error('Error submitting assignment:', error);
        alert(`Error submitting assignment: ${error.message}`);
      }
    }
  };

  const getActionButton = (assignment: Assignment) => {
    const studentSubmission = assignment.submissions?.find(sub =>
      sub.studentId === (studentData?.studentId || studentData?.id)
    );

    const isSubmitted = studentSubmission && studentSubmission.status === 'SUBMITTED';
    const isGraded = studentSubmission && studentSubmission.status === 'GRADED';

    if (isGraded) {
      return (
        <span className="text-green-700 font-medium">Graded</span>
      );
    }

    if (isSubmitted) {
      return (
        <Link href={`/s/assignments/edit/${assignment.id}`} className="text-purple-800 font-medium hover:text-purple-900 block text-center md:inline-block">
          Edit Submission
        </Link>
      );
    }

    // PENDING state - show upload and then submit
    return (
      <>
        <input
          type="file"
          accept="application/pdf"
          ref={el => fileInputRefs.current[assignment.id] = el}
          style={{ display: 'none' }}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              const submitBtn = document.getElementById(`submit-btn-${assignment.id}`);
              if (submitBtn) {
                submitBtn.onclick = () => handleSubmitAssignment(assignment, file);
                submitBtn.removeAttribute('disabled');
                submitBtn.textContent = `Submit "${file.name}"`;
                submitBtn.style.backgroundColor = '';
                submitBtn.style.cursor = 'pointer';
              }
            } else {
              const submitBtn = document.getElementById(`submit-btn-${assignment.id}`);
              if (submitBtn) {
                submitBtn.setAttribute('disabled', 'true');
                submitBtn.textContent = 'Submit Now';
                submitBtn.style.backgroundColor = 'gray';
                submitBtn.style.cursor = 'not-allowed';
              }
            }
          }}
        />
        <div className="flex flex-col md:flex-row gap-2">
          <Button
            onClick={() => handleFileUploadClick(assignment.id)}
            className="text-blue-600 border border-blue-600 bg-white hover:bg-blue-50 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors duration-200 w-full md:w-auto flex items-center justify-center"
          >
            <Upload className="h-4 w-4 mr-1" /> Upload File
          </Button>
          <Button
            id={`submit-btn-${assignment.id}`}
            onClick={() => alert("Please upload a file first.")}
            disabled={true}
            className="bg-gray-400 text-white font-medium px-3 py-1.5 rounded-lg w-full md:w-auto cursor-not-allowed"
          >
            Submit Now
          </Button>
        </div>
      </>
    );
  };

  const getGrade = (assignment: Assignment) => {
    const studentSubmission = assignment.submissions?.find(sub =>
      sub.studentId === (studentData?.studentId || studentData?.id)
    );

    if (studentSubmission && typeof studentSubmission.obtainedPoints === 'number') {
      if (typeof assignment.maxPoints === 'number') {
        return `${studentSubmission.obtainedPoints}/${assignment.maxPoints}`;
      }
      return studentSubmission.obtainedPoints;
    }
    return 'N/A';
  };

  const toggleDebugMode = () => {
    setDebugMode(!debugMode);
  };
  
  // New handler for download click
  const handleDownloadClick = (assignmentId: string) => {
    setDownloadedAssignments(prev => new Set(prev.add(assignmentId)));
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
      <div className="p-4 sm:p-8">
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
          <h2 className="relative left-14 sm:left-0 text-2xl font-semibold text-gray-800">Assignments</h2>
          <button
            onClick={toggleDebugMode}
            className="text-sm text-gray-500 hover:text-gray-700 mt-2 sm:mt-0"
          >
            {debugMode ? 'Hide Debug Info' : 'Show Debug Info'}
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
          <h3 className="text-xl font-semibold text-gray-800">Ongoing Assignments</h3>
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
                  .filter(a => classSections.includes(a.classSection?.id))
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
                      <td className="px-4 py-3 whitespace-nowrap">
                      {assignment.attachments ? (
                        downloadedAssignments.has(assignment.id) ? (
                          <span className="text-green-600 font-medium flex items-center">
                            <Download className="h-4 w-4 mr-1 sm:mr-2" /> Downloaded
                          </span>
                        ) : (
                          <Link
                            href={assignment?.attachments || ''}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-blue-600 hover:text-blue-800"
                            onClick={() => handleDownloadClick(assignment.id)}
                          >
                            <Download className="h-4 w-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">Download</span>
                          </Link>
                        )
                      ) : (
                        <span className="text-gray-500">No attachments</span>
                      )}
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

      {/* Submitted Assignments */}
      <div className="mb-8 max-w-screen-xl mx-auto">
        <div className="flex items-center mb-4">
          <ClipboardCheck className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-xl font-semibold text-gray-800">Submitted Assignments</h3>
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
                  Assignment File
                </th>
                <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 bg-gray-50 min-w-[100px]">
                  Submitted File
                </th>
                <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 bg-gray-50 min-w-[100px]">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {submittedAssignments.length > 0 ? (
                submittedAssignments.map((assignment) => {
                  const studentSubmission = assignment.submissions?.find(sub =>
                    sub.studentId === (studentData?.studentId || studentData?.id)
                  );
                  return (
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
                      <td className="px-4 py-3 whitespace-nowrap">
                        {downloadedAssignments.has(`assignment-${assignment.id}`) ? (
                          <span className="text-green-600 font-medium flex items-center">
                            <Download className="h-4 w-4 mr-1 sm:mr-2" /> Downloaded
                          </span>
                        ) : (
                          <Link
                            href={assignment?.attachments || ''}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-blue-600 hover:text-blue-800"
                            onClick={() => handleDownloadClick(`assignment-${assignment.id}`)}
                          >
                            <Download className="h-4 w-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">Assignment</span>
                          </Link>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-purple-600">
                        {studentSubmission?.attachments ? (
                          <Link
                            href={studentSubmission.attachments[0].fileUrl?.split("?")[0]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center hover:text-purple-800"
                          >
                            <Download className="h-4 w-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">Submission</span>
                          </Link>
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {/*getStatusDisplay(assignment)*/}
                          submitted
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-center text-sm text-gray-500">
                    No submitted assignments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Graded Assignments */}
      <div className="max-w-screen-xl mx-auto">
        <div className="flex items-center mb-4">
          <ClipboardCheck className="h-5 w-5 text-green-600 mr-2" />
          <h3 className="text-xl font-semibold text-gray-800">Graded Assignments</h3>
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
                  Assignment File
                </th>
                <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 bg-gray-50 min-w-[100px]">
                  Submitted File
                </th>
                <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 bg-gray-50 min-w-[100px]">
                  Grade
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {gradedAssignments.length > 0 ? (
                gradedAssignments.map((assignment) => {
                  const studentSubmission = assignment.submissions?.find(sub =>
                    sub.studentId === (studentData?.studentId || studentData?.id)
                  );
                  return (
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
                      <td className="px-4 py-3 whitespace-nowrap">
                        {downloadedAssignments.has(`assignment-${assignment.id}`) ? (
                          <span className="text-green-600 font-medium flex items-center">
                            <Download className="h-4 w-4 mr-1 sm:mr-2" /> Downloaded
                          </span>
                        ) : (
                          <Link
                            href={assignment?.attachments || ''}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-blue-600 hover:text-blue-800"
                            onClick={() => handleDownloadClick(`assignment-${assignment.id}`)}
                          >
                            <Download className="h-4 w-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">Assignment</span>
                          </Link>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-purple-600">
                        {studentSubmission?.submissionUrl ? (
                          <Link
                            href={studentSubmission.submissionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center hover:text-purple-800"
                          >
                            <Download className="h-4 w-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">Submission</span>
                          </Link>
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          {getGrade(assignment)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-center text-sm text-gray-500">
                    No graded assignments found
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