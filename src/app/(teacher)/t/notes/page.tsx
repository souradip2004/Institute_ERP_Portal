'use client';

import React, {useState, useEffect} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';

interface ClassData {
  id: string;
  name: string;
  section: string;
  subjects: string[];
  studentCount: number;
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
        if (!teacherId) {
          // Keep loading until teacherId is available
          return;
        }

        const response = await fetch(`/api/teachers/${teacherId}/classes`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch classes');
        }

        const fetchedClasses = await response.json();

        if (Array.isArray(fetchedClasses)) {
          const transformedClasses = fetchedClasses.map((classInfo: any) => {
            return {
              id: classInfo.sectionId || `class-${Math.random().toString(36).substr(2, 9)}`,
              name: classInfo.sectionName || 'Unknown Section',
              section: classInfo.section || 'N/A',
              subjects: [
                classInfo.subject || classInfo.subjectName || 'General',
                classInfo.secondarySubject,
              ].filter(Boolean),
              studentCount: classInfo.studentCount || 0,
            };
          });
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

    if (teacherId) {
      fetchClasses();
    }
  }, [teacherId]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 text-red-500 p-4 rounded-md">
          <p>{error}</p>
        </div>
      );
    }

    if (classes.length === 0) {
      return (
        <div className="text-center py-10">
          <div className="mb-4 text-gray-500">
            {/* You can use an SVG icon here for better visuals */}
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">No classes found</h3>
          <p className="mt-1 text-sm text-gray-500">
            You are not currently assigned to any classes.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...new Map(classes.map(item => [item.id, item])).values()].map(classItem => (
          <div
            key={classItem.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => router.push(`/t/classes/${classItem.id}/notes`)}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold truncate pr-4">{classItem.name}</h2>
                <span className="flex-shrink-0 text-gray-500 text-sm">{classItem.studentCount} Students</span>
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

              <div className="mt-6">
                <div className="text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center">
                  View Notes
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Classes</h1>
      {renderContent()}
    </div>
  );
}