'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface AssignmentSubmission {
  id: string;
  studentId: string;
  student: {
    id: string;
    user: {
      name: string;
    };
    studentRoll: string;
  };
  createdAt: string;
  obtainedPoints: number;
  status: string;
  feedback: string | null;
  attachments?: {
    fileUrl: string;
  }[];
}

interface Assignment {
  id: string;
  title: string;
  dueDate: string | null;
  status: string;
  maxPoints: number;
  submissions: AssignmentSubmission[];
  classSection: {
    id: string;
    studentEnrollments: { studentId: string }[];
    teacherId: string;
  };
}

interface AssignmentsListProps {
  assignments: Assignment[];
  classSectionId: string;
}

const AssignmentsList = ({ assignments, classSectionId }: AssignmentsListProps) => {
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [expandedSubmissions, setExpandedSubmissions] = useState<AssignmentSubmission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [primaryColor, setPrimaryColor] = useState<string>('#3B82F6');

  // Load primary color from local storage
  useEffect(() => {
    const temp = localStorage.getItem('primaryColor');
    if (temp) {
      setPrimaryColor(temp);
    }
  }, []);

  // Fetch additional submission details when an assignment is selected
  useEffect(() => {
    const fetchSubmissionDetails = async () => {
      if (selectedAssignment) {
        setLoadingSubmissions(true);
        try {
          // Fetch detailed submissions for the selected assignment
          const submissionsPromises = selectedAssignment.submissions.map(async (submission) => {
            const response = await axios.get(`/api/assignments/submissions/${submission.id}`);
            return response.data;
          });

          const detailedSubmissions = await Promise.all(submissionsPromises);
          setExpandedSubmissions(detailedSubmissions);
        } catch (error) {
          console.error('Error fetching submission details:', error);
          // Fallback to initial submissions on error
          setExpandedSubmissions(selectedAssignment.submissions);
        } finally {
          setLoadingSubmissions(false);
        }
      }
    };

    fetchSubmissionDetails();
  }, [selectedAssignment]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getDate();
    return `${month}, ${day}`;
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'text-yellow-800 bg-yellow-100';
      case 'IN_PROGRESS':
        return 'text-blue-800 bg-blue-100';
      case 'COMPLETED':
        return 'text-green-800 bg-green-100';
      default:
        return 'text-gray-800 bg-gray-100';
    }
  };

  const getSubmissionStatusClass = (status: string) => {
    switch (status) {
      case 'GRADED':
        return 'text-green-800 bg-green-100';
      case 'PENDING':
        return 'text-yellow-800 bg-yellow-100';
      default:
        return 'text-gray-800 bg-gray-100';
    }
  };

  const viewSubmissionDetails = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
  };

  const closeSubmissionDetails = () => {
    setSelectedAssignment(null);
    setExpandedSubmissions([]);
  };

  const handleGradeChange = (submissionId: string, newPoints: number) => {
    setExpandedSubmissions((subs) =>
      subs.map((s) =>
        s.id === submissionId ? { ...s, obtainedPoints: newPoints } : s
      )
    );
  };

  const handleGradeSubmit = async (submissionId: string) => {
    const submissionToGrade = expandedSubmissions.find((s) => s.id === submissionId);
    if (!submissionToGrade) return;

    try {
      const response = await axios.post(`/api/assignments/submissions/${submissionId}/grade`, {
        obtainedPoints: submissionToGrade.obtainedPoints,
        feedback: submissionToGrade.obtainedPoints >= selectedAssignment.maxPoints * 0.7 ? 'Well Done' : 'Need Improvement',
        teacherId: selectedAssignment.classSection.teacherId,
        status: 'GRADED'
      });

      if (response.status === 200) {
        alert('Submission graded successfully!');
        // Update the submission in the state with the new data from the API
        setExpandedSubmissions((subs) =>
          subs.map((s) =>
            s.id === submissionId ? { ...s, ...response.data } : s
          )
        );
      } else {
        alert('Failed to grade submission. Please try again.');
      }
    } catch (error) {
      console.error("Error grading submission:", error);
      alert('Failed to grade submission. Please check the server logs.');
    }
  };

  return (
    <div className="bg-white rounded-md shadow-sm border-t-4" style={{ borderTopColor: primaryColor }}>
    

      {/* Desktop Table View */}
      <div className="overflow-hidden hidden md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submissions</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {assignments.length > 0 ? (
              assignments.map((assignment) => (
                <tr key={assignment.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{assignment.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(assignment.dueDate)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(assignment.status)}`}>
                      {assignment.status === 'SCHEDULED' ? 'Scheduled' :
                        assignment.status === 'IN_PROGRESS' ? 'Ongoing' :
                          assignment.status === 'COMPLETED' ? 'Completed' : 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {assignment.submissions.length}/{assignment.classSection.studentEnrollments.length}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      className="text-purple-600 hover:text-purple-900"
                      onClick={() => viewSubmissionDetails(assignment)}
                    >
                      View
                    </button>
                    <span className="text-gray-300">|</span>
                    <Link href={`/t/classes/${classSectionId}/assignments/${assignment.id}/delete`} className="text-red-600 hover:text-red-900">
                      Delete
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  No assignments found. Create your first assignment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden p-4 space-y-4">
        {assignments.length > 0 ? (
          assignments.map((assignment) => (
            <div key={assignment.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-lg" style={{ color: primaryColor }}>{assignment.title}</h4>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(assignment.status)}`}>
                  {assignment.status === 'SCHEDULED' ? 'Scheduled' :
                    assignment.status === 'IN_PROGRESS' ? 'Ongoing' :
                      assignment.status === 'COMPLETED' ? 'Completed' : 'Unknown'}
                </span>
              </div>
              <div className="text-gray-600 space-y-1 text-sm">
                <p><span className="font-medium">Due Date:</span> {formatDate(assignment.dueDate)}</p>
                <p><span className="font-medium">Submissions:</span> {assignment.submissions.length}/{assignment.classSection.studentEnrollments.length}</p>
              </div>
              <div className="mt-4 flex space-x-4 text-sm">
                <button
                  className="text-purple-600 hover:text-purple-900"
                  onClick={() => viewSubmissionDetails(assignment)}
                >
                  View Submissions
                </button>
                <Link href={`/t/classes/${classSectionId}/assignments/${assignment.id}/delete`} className="text-red-600 hover:text-red-900">
                  Delete
                </Link>
              </div>
            </div>
          ))
        ) : (
          <p className="py-6 text-center text-gray-500">
            No assignments found. Create your first assignment.
          </p>
        )}
      </div>

      {/* Submission Details Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold" style={{ color: primaryColor }}>Submissions for: {selectedAssignment.title}</h3>
              <button
                onClick={closeSubmissionDetails}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6 border-b pb-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Due Date:</span> {formatDate(selectedAssignment.dueDate)} |
                <span className="font-medium"> Total Points:</span> {selectedAssignment.maxPoints}
              </p>
            </div>

            {loadingSubmissions ? (
              <div className="flex justify-center items-center py-10">
                <Loader size="large" />
              </div>
            ) : (
              <>
                {/* Desktop Submission Table */}
                <div className="overflow-hidden hidden md:block">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted On</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {expandedSubmissions.length > 0 ? (
                        expandedSubmissions.map((submission) => (
                          <tr key={submission.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {submission.student?.user?.name || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(submission.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSubmissionStatusClass(submission.status)}`}>
                                {submission.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="number"
                                  min={0}
                                  max={selectedAssignment.maxPoints}
                                  value={submission.obtainedPoints}
                                  onChange={(e) => handleGradeChange(submission.id, Number(e.target.value))}
                                  className="w-16 border rounded px-2 py-1 focus:ring-purple-500 focus:border-purple-500"
                                />
                                <button
                                  className="px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors duration-200 disabled:bg-gray-400"
                                  onClick={() => handleGradeSubmit(submission.id)}
                                  disabled={submission.status === 'GRADED'}
                                >
                                  Save
                                </button>
                                <span>/ {selectedAssignment.maxPoints}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {submission.attachments && submission.attachments.length > 0 && (
                                <Link
                                  href={submission.attachments[0]?.fileUrl?.split("?")[0] || '#'}
                                  className="text-purple-600 hover:text-purple-900"
                                >
                                  Download
                                </Link>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                            No submissions yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Submission Card View */}
                <div className="md:hidden space-y-4">
                  {expandedSubmissions.length > 0 ? (
                    expandedSubmissions.map((submission) => (
                      <div key={submission.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold" style={{ color: primaryColor }}>{submission.student?.user?.name || 'N/A'}</h4>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getSubmissionStatusClass(submission.status)}`}>
                            {submission.status}
                          </span>
                        </div>
                        <div className="text-gray-600 space-y-1 text-sm">
                          <p><span className="font-medium">Submitted On:</span> {new Date(submission.createdAt).toLocaleDateString()}</p>
                          <p><span className="font-medium">Feedback:</span> {submission.feedback || '---'}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="font-medium">Grade:</span>
                            <input
                              type="number"
                              min={0}
                              max={selectedAssignment.maxPoints}
                              value={submission.obtainedPoints}
                              onChange={(e) => handleGradeChange(submission.id, Number(e.target.value))}
                              className="w-16 border rounded px-2 py-1 text-sm focus:ring-purple-500 focus:border-purple-500"
                            />
                            <button
                              className="px-2 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors duration-200 disabled:bg-gray-400"
                              onClick={() => handleGradeSubmit(submission.id)}
                              disabled={submission.status === 'GRADED'}
                            >
                              Save
                            </button>
                            <span>/ {selectedAssignment.maxPoints}</span>
                          </div>
                          {submission.attachments && submission.attachments.length > 0 && (
                            <div className="mt-2">
                              <Link
                                href={submission.attachments[0]?.fileUrl?.split("?")[0] || '#'}
                                className="text-purple-600 hover:text-purple-900 text-sm font-medium"
                              >
                                Download Submission
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="py-6 text-center text-gray-500">
                      No submissions yet.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentsList;