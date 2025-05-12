'use client';

import { get } from 'http';
import Link from 'next/link';
import { useState, useEffect } from 'react';

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

interface AssignmentsListProps {
  assignments: Assignment[];
  classSectionId: string;
}

const AssignmentsList = ({ assignments, classSectionId }: AssignmentsListProps) => {
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [expandedSubmissions, setExpandedSubmissions] = useState<AssignmentSubmission[]>([]);
  
  // Fetch additional submission details when an assignment is selected
  useEffect(() => {
    const fetchSubmissionDetails = async () => {
      if (selectedAssignment && selectedAssignment.submissions.length > 0) {
        try {
          // Create an array of promises to fetch all submission details
          const submissionsPromises = selectedAssignment.submissions.map(async (submission) => {
            // If we already have complete student data, don't fetch again
            
            const response = await fetch(`/api/assignments/submissions/${submission.id}`);
            if (!response.ok) {
              console.error(`Failed to fetch details for submission ${submission.id}`);
              return submission;
            }
            return await response.json();
          });
          
          // Wait for all promises to resolve
          const detailedSubmissions = await Promise.all(submissionsPromises);
          setExpandedSubmissions(detailedSubmissions);
        } catch (error) {
          console.error('Error fetching submission details:', error);
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
        return 'text-yellow-500 bg-yellow-50 border-yellow-500';
      case 'IN_PROGRESS':
        return 'text-blue-500 bg-blue-50 border-blue-500';
      case 'COMPLETED':
        return 'text-green-500 bg-green-50 border-green-500';
      default:
        return 'text-gray-500 bg-gray-50 border-gray-500';
    }
  };

  const viewSubmissionDetails = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    // Initialize with current submissions
    setExpandedSubmissions(assignment.submissions);
  };

  const closeSubmissionDetails = () => {
    setSelectedAssignment(null);
    setExpandedSubmissions([]);
  };

  const getStudentName = (submission: AssignmentSubmission) => {
    // First check in the expanded submissions if available
    const getname=async()=>{
   const student =await fetch(`/api/users/${submission.uploadedById}`,{
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const studentData = await student.json();
      return studentData.name? studentData.name :"unknown";
  }
  return getname()
  };

  return (
    <div className="bg-white rounded-md shadow-sm">
      <h2 className="text-xl font-semibold p-6 border-b">Assignments List</h2>
      
      <div className="overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submissions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {assignments.length > 0 ? (
              assignments.map((assignment) => (
                <tr key={assignment.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {assignment.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(assignment.dueDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusClass(assignment.status)}`}>
                      {assignment.status === 'SCHEDULED' ? 'Scheduled' : 
                       assignment.status === 'IN_PROGRESS' ? 'Ongoing' : 
                       assignment.status === 'COMPLETED' ? 'Completed' : 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {assignment.submissions.length}/{28} {/* Hardcoded total students for demo */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button 
                      className="text-purple-600 hover:text-purple-900"
                      onClick={() => viewSubmissionDetails(assignment)}
                    >
                      View
                    </button>
                    <span>/</span>
                    <Link href={`/t/classes/${classSectionId}/assignments/${assignment.id}/delete`} className="text-red-600 hover:text-red-900">
                      Delete
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  No assignments found. Create your first assignment above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Submission Details Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Submissions Details</h3>
              <button 
                onClick={closeSubmissionDetails} 
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <h4 className="font-medium mb-2">Assignment: {selectedAssignment.title}</h4>
              <p className="text-sm text-gray-600">
                Due Date: {formatDate(selectedAssignment.dueDate)} | 
                Total Points: {selectedAssignment.maxPoints}
              </p>
            </div>

            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted On</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feedback</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {expandedSubmissions.length > 0 ? (
                    expandedSubmissions.map((submission) => (
                      <tr key={submission.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {submission.uploadedById}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(submission.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {submission.feedback || (submission.status === 'GRADED' ? 'Well Done' : submission.status === 'PENDING' ? 'Need Improvement' : '---')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {submission.obtainedPoints}/{selectedAssignment.maxPoints}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link href={`/t/classes/${classSectionId}/assignments/grade/${submission.id}`} className="text-purple-600 hover:text-purple-900">
                            Edit
                          </Link>
                          {' / '}
                          <Link href={`/t/classes/${classSectionId}/assignments/download/${submission.id}`} className="text-purple-600 hover:text-purple-900">
                            Download
                          </Link>
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
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentsList; 