'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

interface ClassData {
  id: string;
  name: string;
  section: string;
  subjects: string[];
  studentCount: number;
  assignmentCount: number;
  latestAssignment: {
    title: string;
    dueDate: string;
    status: 'active' | 'completed' | 'past_due';
  } | null;
}

interface AssignmentSubmission {
  id: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  status: 'submitted' | 'graded' | 'pending';
  grade?: number;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  classId: string;
  totalPoints: number;
  submissions: AssignmentSubmission[];
  status?: 'pending' | 'completed';
}

export default function TeacherAssignmentsPage() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const getUserData = () => {
      if (typeof window !== 'undefined') {
        const userData = localStorage.getItem('user');
        if (userData) {
          try {
            const parsedUserData = JSON.parse(userData);
            if (parsedUserData.teacherId || parsedUserData.id) {
              console.log('Parsed User Data:', parsedUserData);
              setTeacherId(parsedUserData.teacherId || parsedUserData.id);
            }
          } catch (error) {
            console.error('Error parsing user data from localStorage:', error);
          }
        }
      }
    };

    getUserData();
  }, []);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Default to 'teacher123' if no teacher ID found (for testing only)
        const currentTeacherId = teacherId || 'teacher123';
        console.log('Current Teacher ID:', currentTeacherId);
        // Try to fetch from API endpoints
        const endpoints = [
          `/api/teachers/${currentTeacherId}/classes`,
        ];
        
        let fetchedClasses: any[] = [];
        
        for (const endpoint of endpoints) {
          try {
            const response = await fetch(endpoint, {
              credentials: 'include',
              cache: 'no-store'
            });
            
            if (response.ok) {
              const data = await response.json();
              
              if (Array.isArray(data) && data.length > 0) {
                fetchedClasses = data;
                break;
              }
            }
          } catch (error) {
            console.error(`Error fetching from ${endpoint}:`, error);
          }
        }

        if (fetchedClasses.length > 0) {
          // Transform API data to our ClassData format
          const transformedClasses = await Promise.all(fetchedClasses.map(async (classInfo: any) => {
            console.log('Class Info:', classInfo);
            const classId = classInfo.sectionId	 || `class-${Math.random().toString(36).substr(2, 9)}`;
            let assignmentsData = [];
            
            // Try to fetch assignments for each class
            try {
              const assignmentsResponse = await fetch(`/api/classes/${classId}/assignments`, {
                credentials: 'include',
                cache: 'no-store'
              });
              
              if (assignmentsResponse.ok) {
                assignmentsData = await assignmentsResponse.json();
              }
            } catch (error) {
              console.error(`Error fetching assignments for class ${classId}:`, error);
            }
            
            // If we couldn't get real assignments, use sample data for now
            const assignments = Array.isArray(assignmentsData) && assignmentsData.length > 0 
              ? assignmentsData 
              : [];
              
            // Get the latest assignment if any exist
            const sortedAssignments = assignments.sort((a, b) => {
              const dateA = new Date(a.dueDate || a.due_date || 0);
              const dateB = new Date(b.dueDate || b.due_date || 0);
              return dateB.getTime() - dateA.getTime();
            });
            
            const latestAssignment = sortedAssignments.length > 0 ? {
              title: sortedAssignments[0].title || 'Untitled Assignment',
              dueDate: sortedAssignments[0].dueDate || sortedAssignments[0].due_date || 'No due date',
              status: getAssignmentStatus(sortedAssignments[0].dueDate || sortedAssignments[0].due_date)
            } : null;
            
            return {
              id: classId,
              name: classInfo.name || classInfo.className || (classInfo.batch ? `Class ${classInfo.batch.batchName}` : 'Unknown Class'),
              section: classInfo.section || classInfo.sectionName || '',
              subjects: [
                classInfo.subject || classInfo.subjectName || 'General',
                classInfo.secondarySubject
              ].filter(Boolean),
              studentCount: classInfo.studentCount || 0,
              assignmentCount: assignments.length,
              latestAssignment: latestAssignment
            };
          }));
          
          setClasses(transformedClasses);
        } else {
          setClasses([]);
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
        setError('Failed to load classes. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [teacherId]);

  const getAssignmentStatus = (dueDateStr: string): 'active' | 'completed' | 'past_due' => {
    if (!dueDateStr) return 'active';
    
    const dueDate = new Date(dueDateStr);
    const now = new Date();
    
    if (isNaN(dueDate.getTime())) return 'active';
    
    if (dueDate.getTime() < now.getTime()) {
      return 'past_due';
    }
    return 'active';
  };
  
  const getStatusBadge = (status: 'active' | 'completed' | 'past_due') => {
    switch(status) {
      case 'active':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Active</span>;
      case 'completed':
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">Completed</span>;
      case 'past_due':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">Past Due</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Classes & Assignments</h1>
      
      {error ? (
        <div className="bg-red-50 text-red-500 p-4 rounded-md mb-6">
          <p>{error}</p>
        </div>
      ) : null}
      
      {classes.length === 0 && !error ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">No Classes Found</h2>
          <p className="text-gray-600 mb-6">You currently do not have any classes assigned to you.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem) => (
            <div 
              key={classItem.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow relative cursor-pointer"
              onClick={() => router.push(`/t/classes/${classItem.id}/assignments`)}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">{classItem.name}</h2>
                  <span className="text-gray-500 text-sm">{classItem.studentCount} Students</span>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {classItem.subjects.length > 0 ? (
                    classItem.subjects.map((subject, index) => (
                      <span key={index} className="bg-purple-200 text-purple-800 px-3 py-1 rounded-full text-sm">
                        {subject}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">No subjects assigned</span>
                  )}
                </div>
                
                <div className="mb-4">
                  
                  
                  <Link 
                    href={`/t/classes/${classItem.id}/notes`}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View all Notes
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
                
                
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}