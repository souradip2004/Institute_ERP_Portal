'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Loader from '@/components/ui/Loader';

interface ClassData {
  id: string;
  name: string;
  section: string;
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
              setTeacherId(parsedUserData.teacherId);
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
        const currentTeacherId = teacherId ;

        // Try to fetch from API endpoints
        const endpoints = [
          `/api/teachers/${currentTeacherId}/classes`
        ];

        let fetchedClasses = null;
console.log('try to get data from backend');
        for (const endpoint of endpoints) {
          try {

            const response = await fetch(endpoint, {
              credentials: 'include',
              cache: 'no-store'
            });

            if (response.ok) {
              console.log('data recieve from backend');
              const data = await response.json();
              console.log('data: ');
              console.log(data);
              if (Array.isArray(data) && data.length > 0) {
                fetchedClasses = data;
                break;
              }
            }
          } catch (error) {
            console.error(`Error fetching from ${endpoint}:`, error);
          }
        }

        if (fetchedClasses) {
          // Transform API data to our ClassData format
          const transformedClasses = fetchedClasses.map((classInfo: any) => {
            return {
              id: classInfo.id || classInfo.classId || `class-${Math.random().toString(36).substr(2, 9)}`,
              name: classInfo.name || classInfo.className || (classInfo.batch ? `Class ${classInfo.batch.batchName}` : 'Unknown Class'),
              section: classInfo.section || classInfo.sectionName || '',
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

    fetchClasses();
  }, [teacherId]);

  const getAttendanceColorClass = (percentage: number) => {
    if (percentage >= 80) return 'bg-blue-500';
    if (percentage >= 65) return 'bg-green-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        {/* <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div> */}
        <Loader size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Classes and Sections</h1>

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
            // onClick={() => router.push(`/t/classes/${classItem.id}` as any)}
            >
              <div className="p-6 border-b">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">{classItem.name}</h2>
                  <span className="text-xl font-bold">{classItem.section}</span>
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
                  <div>
                    <p className="text-gray-500 text-sm">Attendance</p>
                    {classItem.attendancePercentage > 0 ? (
                      <div className="flex items-center">
                        <p className="text-3xl font-bold">{classItem.attendancePercentage}%</p>
                        <div className="ml-2 w-16 h-3 bg-gray-200 rounded-full">
                          <div
                            className={`h-3 rounded-full ${getAttendanceColorClass(classItem.attendancePercentage)}`}
                            style={{ width: `${classItem.attendancePercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xl text-gray-500">No data</p>
                    )}
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

                  <div className="flex items-center">
                    <span className="text-blue-500 mr-2">📅</span>
                    <span>Next Exam: </span>
                    <span className="font-medium ml-1">
                      {classItem.nextExam.date} {classItem.nextExam.day}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 