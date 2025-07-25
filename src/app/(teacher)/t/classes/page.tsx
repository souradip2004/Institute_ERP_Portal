'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Loader from '@/components/ui/Loader';

interface ClassData {
  id: string;
  name: string;
  section: string;
  sectionId: string;
  subjects: string[];
  studentCount: number;
  attendancePercentage: number;
  lastAssignment: {
    title: string;
    daysAgo: number;
  };
  nextExam: {
    date: string;
    day: string;
  };
}

export default function ClassesPage() {
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
      if (!teacherId) {
        setLoading(false); // If no teacherId, stop loading
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/teachers/${teacherId}/classes`, {
          credentials: 'include',
          cache: 'no-store'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch data from the server.');
        }

        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
          const transformedClasses = data.map((classInfo: any) => ({
            id: classInfo.id || classInfo.classId || `class-${Math.random().toString(36).substr(2, 9)}`,
            name: classInfo.name || classInfo.className || (classInfo.batch ? `Class ${classInfo.batch.batchName}` : 'Unknown Class'),
            section: classInfo.section || classInfo.sectionName || '',
            sectionId: classInfo.sectionId || classInfo.id,
            subjects: [
              classInfo.subject || classInfo.subjectName || 'General',
              classInfo.secondarySubject
            ].filter(Boolean),
            studentCount: classInfo.studentCount || 0,
            attendancePercentage: classInfo.attendancePercentage || 0,
            lastAssignment: {
              title: classInfo.lastAssignment?.title || "No assignments yet",
              daysAgo: classInfo.lastAssignment?.daysAgo || 0
            },
            nextExam: {
              date: classInfo.nextExam?.date || "No scheduled exams",
              day: classInfo.nextExam?.day || ""
            }
          }));
          setClasses(transformedClasses);
        } else {
          // If data is an empty array or not an array
          setClasses([]);
        }
      } catch (err) {
        console.error('Error fetching classes:', err);
        setError('Failed to load classes. Please refresh the page.');
        setClasses([]); // Ensure classes is empty on error
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [teacherId]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader size="large"/>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 text-red-500 p-4 rounded-md mb-6">
          <p>{error}</p>
        </div>
      );
    }

    if (classes.length === 0) {
      return (
        <div className="text-center py-10">
          <div className="mb-4 text-gray-500">
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
            You are not assigned to any classes. Please contact an administrator if you think this is a mistake.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classItem) => (
          <div
            key={classItem.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow relative cursor-pointer"
            onClick={() => router.push(`/t/classes/${classItem.sectionId}`)}
          >
            <div className="p-6 border-b">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{classItem.section}</h2>
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
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-gray-500 text-sm">Total Students</p>
                  <p className="text-3xl font-bold">{classItem.studentCount || 0}</p>
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex items-center mb-2">
                  <span className="text-red-500 mr-2">📝</span>
                  <span>Last Assignment: </span>
                  <span className="font-medium ml-1">
                    "{classItem.lastAssignment.title}"
                    {classItem.lastAssignment.daysAgo > 0 && ` – ${classItem.lastAssignment.daysAgo} day${classItem.lastAssignment.daysAgo > 1 ? 's' : ''} ago`}
                  </span>
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
      <h1 className="text-2xl font-bold mb-6">Classes and Sections</h1>
      {renderContent()}
    </div>
  );
}