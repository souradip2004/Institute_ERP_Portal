"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Loader from '@/components/ui/Loader';
import StudentLayout from '@/components/student/StudentLayout';
import { ArrowLeft, Download, Calendar, FileCheck, ClipboardCheck } from 'lucide-react';

interface Assignment {
  id: string;
  title: string;
  dueDate: string | Date;
  status: string;
  submissions?: AssignmentSubmission[];
  maxPoints?: number;
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
    studentId: string;
    status: string;
    obtainedPoints?: number;
  }[];
  maxPoints?: number;
  [key: string]: unknown;
}

export default function AssignmentsPage() {
  const [ongoingAssignments, setOngoingAssignments] = useState<Assignment[]>([]);
  const [completedAssignments, setCompletedAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [rawAssignmentData, setRawAssignmentData] = useState<RawAssignment[]>([]);
  const [debugMode, setDebugMode] = useState(false);

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
      
      // Fetch from the backend API - first we need to get the class sections
      const response = await fetch(`/api/assignments`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch assignments');
      }
      
      const data = await response.json();
      console.log('Raw assignment data received:', data);
      
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
      const processedAssignments = data.map((assignment: RawAssignment) => {
        // Format due date
        let formattedDueDate = 'No due date';
        if (assignment.dueDate) {
          const date = new Date(assignment.dueDate);
          formattedDueDate = `${date.getDate()}th ${date.toLocaleString('default', { month: 'long' })}, ${date.getFullYear()}`;
        }
        
        // Find submission for this student
        const studentSubmission = assignment.submissions?.find((sub) => 
          sub.studentId === studentId
        );
        
        return {
          id: assignment.id,
          title: assignment.title,
          dueDate: formattedDueDate,
          status: studentSubmission ? studentSubmission.status : 'PENDING',
          submissions: assignment.submissions,
          maxPoints: assignment.maxPoints
        };
      });
      
      // Filter assignments into ongoing and completed
      const ongoing = processedAssignments.filter((assignment: Assignment) => 
        !assignment.submissions?.some((sub: AssignmentSubmission) => 
          sub.studentId === studentId && sub.status === 'GRADED'
        )
      );
      
      const completed = processedAssignments.filter((assignment: Assignment) => 
        assignment.submissions?.some((sub: AssignmentSubmission) => 
          sub.studentId === studentId && sub.status === 'GRADED'
        )
      );
      
      console.log('Ongoing assignments:', ongoing);
      console.log('Completed assignments:', completed);
      
      setOngoingAssignments(ongoing);
      setCompletedAssignments(completed);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setOngoingAssignments([]);
      setCompletedAssignments([]);
      setLoading(false);
    }
  };

  const getStatusDisplay = (assignment: Assignment) => {
    const studentSubmission = assignment.submissions?.find(sub => 
      sub.assignmentId === assignment.id && 
      (studentData?.studentId === sub.id || studentData?.id === sub.id)
    );
    
    if (studentSubmission) {
      return studentSubmission.status === 'GRADED' ? 'Submitted' : 'Pending';
    }
    
    return 'Pending';
  };

  const getActionButton = (assignment: Assignment) => {
    const studentSubmission = assignment.submissions?.find(sub => 
      sub.assignmentId === assignment.id && 
      (studentData?.studentId === sub.id || studentData?.id === sub.id)
    );
    
    if (!studentSubmission || studentSubmission.status !== 'GRADED') {
      return (
        <Link href={`/s/assignments/submit/${assignment.id}`} className="text-purple-800 font-medium hover:text-purple-900">
          Submit Now
        </Link>
      );
    }
    
    return (
      <Link href={`/s/assignments/edit/${assignment.id}`} className="text-purple-800 font-medium hover:text-purple-900">
        Edit
      </Link>
    );
  };

  const getGrade = (assignment: Assignment) => {
    const studentSubmission = assignment.submissions?.find(sub => 
      sub.assignmentId === assignment.id && 
      (studentData?.studentId === sub.id || studentData?.id === sub.id)
    );
    
    if (studentSubmission?.obtainedPoints !== undefined) {
      return studentSubmission.obtainedPoints;
    }
    
    if (typeof studentSubmission?.obtainedPoints === 'number' && assignment.maxPoints) {
      return `${studentSubmission.obtainedPoints}/${assignment.maxPoints}`;
    }
    
    return '15'; // Default grade for display
  };

  const toggleDebugMode = () => {
    setDebugMode(!debugMode);
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <Loader size="large" />
        </div>
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout>
        <div className="p-8">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="p-8">
        <div className="mb-8">
          {/* <h1 className="text-gray-400 text-sm mb-1">
            <Link href="/s/dashboard" className="inline-flex items-center hover:text-gray-600">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Student Dashboard
            </Link>
            <span className="mx-1">/</span>
            Assignments
          </h1> */}
          <div className="flex items-center">
            <h2 className="text-2xl font-semibold text-gray-800">Assignments</h2>
            <button 
              onClick={toggleDebugMode}
              className="ml-auto text-sm text-gray-500 hover:text-gray-700"
            >
              {/* {debugMode ? 'Hide Debug Info' : 'Show Debug Info'} */}
            </button>
          </div>
        </div>

        {debugMode && (
          <div className="bg-white p-4 rounded-lg shadow-sm mb-4 overflow-auto max-h-60">
            <h3 className="font-semibold mb-2">Raw Assignment Data:</h3>
            <pre className="text-xs">{JSON.stringify(rawAssignmentData, null, 2)}</pre>
          </div>
        )}
        
        {/* Ongoing Assignments Section */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <FileCheck className="h-5 w-5 text-purple-600 mr-2" />
            <h3 className="text-xl font-semibold text-gray-800">Ongoing</h3>
          </div>
          
          {/* Ongoing Assignments Table */}
          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-600 bg-gray-50">Topic</th>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-600 bg-gray-50">Due Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-600 bg-gray-50">View</th>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-600 bg-gray-50">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-600 bg-gray-50">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ongoingAssignments.length > 0 ? (
                  ongoingAssignments.map((assignment) => (
                    <tr key={assignment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{assignment.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          {typeof assignment.dueDate === 'string' 
                            ? assignment.dueDate 
                            : assignment.dueDate instanceof Date 
                              ? assignment.dueDate.toLocaleDateString() 
                              : 'No due date'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link href={`/s/assignments/view/${assignment.id}`} className="text-blue-600 hover:text-blue-800 flex items-center">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                          {getStatusDisplay(assignment)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {getActionButton(assignment)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No ongoing assignments found</td>
                  </tr>
                )}
              </tbody>
  </table>
            </div>
          </div>

          {/* Completed Assignments Section */}
          <div>
            <div className="flex items-center mb-4">
              <ClipboardCheck className="h-5 w-5 text-green-600 mr-2" />
              <h3 className="text-xl font-semibold text-gray-800">Completed</h3>
            </div>
            
            {/* Completed Assignments Table */}
            <div className="bg-white overflow-hidden shadow-sm rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-600 bg-gray-50">Topic</th>
                    <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-600 bg-gray-50">Due Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-600 bg-gray-50">Actions</th>
                    <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-600 bg-gray-50">Grade</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {completedAssignments.length > 0 ? (
                    completedAssignments.map((assignment) => (
                      <tr key={assignment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{assignment.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            {typeof assignment.dueDate === 'string' 
                              ? assignment.dueDate 
                              : assignment.dueDate instanceof Date 
                                ? assignment.dueDate.toLocaleDateString() 
                                : 'No due date'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link href={`/s/assignments/view/${assignment.id}`} className="text-blue-600 hover:text-blue-800 flex items-center">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            {getGrade(assignment)}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">No completed assignments found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
    </StudentLayout>
  );
}