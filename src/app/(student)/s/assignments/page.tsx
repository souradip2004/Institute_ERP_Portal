"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

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
  status: string;
  obtainedPoints?: number;
  maxPoints?: number;
}

export default function AssignmentsPage() {
  const [ongoingAssignments, setOngoingAssignments] = useState<Assignment[]>([]);
  const [completedAssignments, setCompletedAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<any>(null);
  const [rawAssignmentData, setRawAssignmentData] = useState<any[]>([]);
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
      const processedAssignments = data.map((assignment: any) => {
        // Format due date
        let formattedDueDate = 'No due date';
        if (assignment.dueDate) {
          const date = new Date(assignment.dueDate);
          formattedDueDate = `${date.getDate()}th ${date.toLocaleString('default', { month: 'long' })}, ${date.getFullYear()}`;
        }
        
        // Find submission for this student
        const studentSubmission = assignment.submissions?.find((sub: any) => 
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
      const ongoing = processedAssignments.filter((assignment: any) => 
        !assignment.submissions?.some((sub: any) => 
          sub.studentId === studentId && sub.status === 'GRADED'
        )
      );
      
      const completed = processedAssignments.filter((assignment: any) => 
        assignment.submissions?.some((sub: any) => 
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-500 rounded-md">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Assignments (Ongoing)</h1>
          <button 
            onClick={toggleDebugMode}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            {debugMode ? 'Hide Debug Info' : 'Show Debug Info'}
          </button>
        </div>

        {debugMode && (
          <div className="bg-white p-4 rounded-lg shadow-sm mb-4 overflow-auto max-h-60">
            <h3 className="font-semibold mb-2">Raw Assignment Data:</h3>
            <pre className="text-xs">{JSON.stringify(rawAssignmentData, null, 2)}</pre>
          </div>
        )}
        
        {/* Ongoing Assignments Table */}
        <div className="bg-white overflow-hidden shadow-sm rounded-lg mb-8">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-lg font-semibold text-gray-800 bg-gray-50">Topic</th>
                <th scope="col" className="px-6 py-3 text-left text-lg font-semibold text-gray-800 bg-gray-50">Due Date</th>
                <th scope="col" className="px-6 py-3 text-left text-lg font-semibold text-gray-800 bg-gray-50">View</th>
                <th scope="col" className="px-6 py-3 text-left text-lg font-semibold text-gray-800 bg-gray-50">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-lg font-semibold text-gray-800 bg-gray-50">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ongoingAssignments.length > 0 ? (
                ongoingAssignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{assignment.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{
                      typeof assignment.dueDate === 'string' 
                        ? assignment.dueDate 
                        : assignment.dueDate instanceof Date 
                          ? assignment.dueDate.toLocaleDateString() 
                          : 'No due date'
                    }</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={`/s/assignments/view/${assignment.id}`} className="text-blue-600 hover:text-blue-800 flex items-center">
                        Download <span className="ml-1 text-lg">⬇️</span>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusDisplay(assignment)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getActionButton(assignment)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No ongoing assignments found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-4">Assignments (Completed)</h1>
        
        {/* Completed Assignments Table */}
        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-lg font-semibold text-gray-800 bg-gray-50">Topic</th>
                <th scope="col" className="px-6 py-3 text-left text-lg font-semibold text-gray-800 bg-gray-50">Due Date</th>
                <th scope="col" className="px-6 py-3 text-left text-lg font-semibold text-gray-800 bg-gray-50">Actions</th>
                <th scope="col" className="px-6 py-3 text-left text-lg font-semibold text-gray-800 bg-gray-50">Grade</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {completedAssignments.length > 0 ? (
                completedAssignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{assignment.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{
                      typeof assignment.dueDate === 'string' 
                        ? assignment.dueDate 
                        : assignment.dueDate instanceof Date 
                          ? assignment.dueDate.toLocaleDateString() 
                          : 'No due date'
                    }</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={`/s/assignments/view/${assignment.id}`} className="text-blue-600 hover:text-blue-800 flex items-center">
                        Download <span className="ml-1 text-lg">⬇️</span>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getGrade(assignment)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No completed assignments found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 