// File: app/dashboard/page.tsx
'use client';
import { useEffect, useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  studentId: string | null;
  teacherId: string | null;
  student?: StudentData | null;
  teacher?: TeacherData | null;
  profileError?: string | null;
}

interface TeacherData {
  id: string;
  userId: string;
  teacherCode: string;
  departmentId: string;
  department?: {
    id: string;
    name: string;
    code: string;
  };
}

interface StudentData {
  id: string;
  userId: string;
  studentRoll: string;
  departmentId: string;
  batchId: string;
  enrollmentStatus: string;
  currentSemester?: number;
  currentYear?: number;
  department?: {
    id: string;
    name: string;
    code: string;
  };
  batch?: {
    id: string;
    batchName: string;
    year: number;
  };
}

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  section: string;
  year: string;
  department: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: Date | string;
  author?: string;
}

interface TodayClass {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  teacherName: string;
  classSectionName: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  sessionType: string;
  sessionStatus: string;
  attendanceStatus: string;
}

const authenticatedFetch = async (url: string): Promise<Response> => {
  try {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { headers, credentials: 'include' });

    if (response.status === 401) {
      console.error(`Authentication failed for ${url}. Status: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error('Error in authenticatedFetch:', error);
    throw error;
  }
};

export default function Dashboard() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [studentDetails, setStudentDetails] = useState<StudentData | null>(null);
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [todayClasses, setTodayClasses] = useState<TodayClass[]>([]);
  const [needsProfileSetup, setNeedsProfileSetup] = useState<boolean>(false);

  const fetchStudentDetails = async (studentId: string): Promise<StudentData> => {
    try {
      const response = await authenticatedFetch(`/api/students/${studentId}`);
      if (!response.ok) throw new Error('Failed to fetch student details');
      return await response.json();
    } catch (err) {
      console.error('Error fetching student details:', err);
      throw err;
    }
  };

  const fetchTodayClasses = async (studentId: string): Promise<TodayClass[]> => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await authenticatedFetch(`/api/attendance-sessions/today?studentId=${studentId}&date=${today}`);
      if (!response.ok) throw new Error('Failed to fetch today\'s classes');
      return await response.json();
    } catch (err) {
      console.error('Error fetching today\'s classes:', err);
      throw err;
    }
  };

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);

        // Get user data from localStorage
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          throw new Error('User data not found in localStorage');
        }

        const user: User = JSON.parse(storedUser);
        setUserData(user);

        // Check if user has a profile error
        if (user.profileError) {
          setError(user.profileError);
          setNeedsProfileSetup(true);
          return;
        }

        // Check if user has studentId
        if (!user.studentId) {
          setNeedsProfileSetup(true);
          throw new Error('Student ID is missing. Please contact an administrator to complete your profile setup.');
        }

        // Fetch student details
        let studentDetails: StudentData;
        if (user.studentId && !user.student) {
          studentDetails = await fetchStudentDetails(user.studentId);
          setStudentDetails(studentDetails);
        } else if (user.student) {
          studentDetails = user.student;
          setStudentDetails(studentDetails);
        } else {
          throw new Error('No student data available');
        }

        // Set student display data
        setStudentData({
          id: studentDetails.id,
          name: user.name || '',
          rollNumber: studentDetails.studentRoll || 'Not Assigned',
          section: studentDetails.batch?.batchName || 'Not Assigned',
          year: `Year ${studentDetails.currentYear || 1}`,
          department: studentDetails.department?.name || 'Not Assigned',
        });

        // Fetch today's classes
        const classes = await fetchTodayClasses(user.studentId);
        setTodayClasses(classes);

        // Mock announcements (replace with real API call when available)
        const mockAnnouncements: Announcement[] = [
          {
            id: '1',
            title: 'Welcome to the new semester!',
            content: 'We are excited to welcome you to the new semester. Please check your schedule and let us know if you have any questions.',
            date: new Date().toISOString(),
            author: 'Admin',
          },
          {
            id: '2',
            title: 'Maintenance Notice',
            content: 'The system will be down for maintenance on Sunday from 2am to 4am.',
            date: new Date().toISOString(),
            author: 'Admin',
          },
          {
            id: '3',
            title: 'Holiday Notice',
            content: 'The school will be closed on Monday due to the national holiday.',
            date: new Date().toISOString(),
            author: 'Admin',
          },
        ];
        setAnnouncements(mockAnnouncements);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Student Dashboard</h1>

      {loading && <p>Loading dashboard data...</p>}

      {needsProfileSetup && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
          <p className="font-bold">Profile Setup Needed</p>
          <p>Your student profile is not complete. Please contact an administrator.</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <p className="text-sm mt-2">Make sure you have user data in localStorage with the key user.</p>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">User Information</h2>
            <div className="overflow-auto max-h-40 bg-gray-100 p-4 rounded">
              <pre>{JSON.stringify(userData, null, 2)}</pre>
            </div>
          </div>

          {studentDetails && (
            <div className="bg-white p-4 rounded shadow">
              <h2 className="text-xl font-semibold mb-2">Student Details</h2>
              <div className="overflow-auto max-h-40 bg-gray-100 p-4 rounded">
                <pre>{JSON.stringify(studentDetails, null, 2)}</pre>
              </div>
            </div>
          )}

          {studentData && (
            <div className="bg-white p-4 rounded shadow">
              <h2 className="text-xl font-semibold mb-2">Student Profile</h2>
              <div className="overflow-auto max-h-40 bg-gray-100 p-4 rounded">
                <pre>{JSON.stringify(studentData, null, 2)}</pre>
              </div>
            </div>
          )}

          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Todays Classes</h2>
            {todayClasses.length >0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {todayClasses.map((classItem) => (
                      <tr key={classItem.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{classItem.courseName}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{classItem.courseCode}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{classItem.teacherName}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{classItem.classSectionName}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{`${classItem.startTime} - ${classItem.endTime}`}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{classItem.sessionType}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{classItem.sessionStatus}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              classItem.attendanceStatus === 'PRESENT'
                                ? 'bg-green-100 text-green-800'
                                : classItem.attendanceStatus === 'ABSENT'
                                ? 'bg-red-100 text-red-800'
                                : classItem.attendanceStatus === 'LATE'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {classItem.attendanceStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No classes scheduled for today.</p>
            )}
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Announcements</h2>
            <div className="overflow-auto max-h-96 bg-gray-100 p-4 rounded">
              <pre>{JSON.stringify(announcements, null, 2)}</pre>
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <p className="text-sm text-gray-500">
              <strong>Note:</strong> Student data and todays classes are fetched from the API. Announcements are still using mock data until those APIs are connected.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}