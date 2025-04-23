'use client';
import { useEffect, useState } from 'react';
import StudentLayout from '@/components/student/StudentLayout';
import AnnouncementCard from '@/components/student/AnnouncementCard';
import ClassCard from '@/components/student/ClassCard';
import Loader from '@/components/ui/Loader';

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  createdByTeacher?: {
    user?: {
      name: string;
    };
  };
}

interface ClassSession {
  id: string;
  courseId: string;
  courseName: string;
  teacherName: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  sessionType: string;
  status: string;
  attendanceStatus?: string;
  attendancePercentage: string;
}

interface User {
  id: string;
  name?: string;
  email?: string;
  username?: string;
  role: string;
  studentId?: string; 
  teacherId?: string;
  institutionId?: string;
  student?: {
    id: string;
    departmentId?: string;
    currentYear?: number;
    batch?: {
      batchName: string;
    };
  };
}

interface StudentDetails {
  id: string;
  studentRoll: string;
  currentYear?: number;
  currentSemester?: number;
  batch?: {
    batchName: string;
    year: number;
  };
  department?: {
    name: string;
    code: string;
  };
  classEnrollments?: Array<{
    id: string;
    classSectionId: string;
    classSection: {
      id: string;
      sectionName: string;
    }
  }>
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<User | null>(null);
  const [studentDetails, setStudentDetails] = useState<StudentDetails | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [todayClasses, setTodayClasses] = useState<ClassSession[]>([]);
  const [error, setError] = useState<string | null>(null);

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

  const fetchAnnouncements = async (institutionId?: string, departmentId?: string) => {
    try {
      // Only add parameters that are defined
      const params = new URLSearchParams();
      if (institutionId) params.append('institutionId', institutionId);
      if (departmentId) params.append('departmentId', departmentId);
      
      // Construct URL with params
      const url = `/api/announcements?${params.toString()}`;
      console.log('Fetching announcements from:', url);
      
      const response = await authenticatedFetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch announcements');
      }
      const data = await response.json();
      console.log('Received announcements:', data);
      return data;
    } catch (error) {
      console.error('Error fetching announcements:', error);
      return [];
    }
  };

  const fetchTodayClasses = async (studentId: string): Promise<ClassSession[]> => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await authenticatedFetch(`/api/attendance-sessions/today?studentId=${studentId}&date=${today}`);
      if (!response.ok) throw new Error('Failed to fetch today\'s classes');
      
      const data = await response.json();
      
      // For each class session, fetch the attendance percentage
      const sessionsWithAttendance = await Promise.all(
        data.map(async (session: Record<string, string | null>) => {
          const courseId = session.courseId;
          let attendancePercentage = 'N/A';
          
          if (courseId && studentId) {
            try {
              // Fetch historical attendance for this course
              const attendanceResponse = await authenticatedFetch(
                `/api/attendance?studentId=${studentId}&courseId=${courseId}`
              );
              
              if (attendanceResponse.ok) {
                const attendanceData = await attendanceResponse.json();
                if (attendanceData.totalSessions > 0) {
                  const percentage = Math.round((attendanceData.presentSessions / attendanceData.totalSessions) * 100);
                  attendancePercentage = `${percentage}%`;
                }
              }
            } catch (attendanceError) {
              console.error('Error fetching attendance percentage:', attendanceError);
            }
          }
          
          return {
            ...session,
            attendancePercentage
          };
        })
      );
      
      return sessionsWithAttendance;
    } catch (err) {
      console.error('Error fetching today\'s classes:', err);
      throw err;
    }
  };

  const fetchStudentDetails = async (studentId: string): Promise<StudentDetails | null> => {
    try {
      const response = await authenticatedFetch(`/api/students/${studentId}?includeClassSection=true`);
      if (!response.ok) {
        throw new Error('Failed to fetch student details');
      }
      const data = await response.json();
      console.log('Student details:', data);
      return data;
    } catch (error) {
      console.error('Error fetching student details:', error);
      return null;
    }
  };

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        setError(null);

        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          throw new Error('User data not found in localStorage');
        }
        const user = JSON.parse(storedUser);
        console.log('User data from localStorage:', user);
        setUserData(user);

        // Fetch student details for proper year and section information
        if (user.studentId) {
          const details = await fetchStudentDetails(user.studentId);
          if (details) {
            setStudentDetails(details);
          }
        }

        // Fetch announcements - institutionId may be missing in the localStorage data
        const announcementsData = await fetchAnnouncements(
          user.institutionId, 
          user.student?.departmentId || studentDetails?.department?.id
        );
        setAnnouncements(announcementsData);

        // Fetch today's classes
        if (user.studentId) {
          try {
            const classesData = await fetchTodayClasses(user.studentId);
            setTodayClasses(classesData);
          } catch (classError) {
            console.error('Failed to load classes, continuing with dashboard:', classError);
            // Don't throw error here, just continue without classes
          }
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

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
        <div className="p-6">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  // Extract student information
  const studentName = userData?.name || 'Student';
  
  // Use detailed student information for better year-section display
  let yearSection = 'Student';
  if (studentDetails) {
    const year = studentDetails.currentYear || 1;
    const yearSuffix = year === 1 ? 'st' : year === 2 ? 'nd' : year === 3 ? 'rd' : 'th';
    
    // Try to get section name from class enrollments first
    let sectionName = 'A';
    if (studentDetails.classEnrollments && studentDetails.classEnrollments.length > 0) {
      // Find the first active enrollment with a section name
      const activeEnrollment = studentDetails.classEnrollments.find(
        enrollment => enrollment.classSection && enrollment.classSection.sectionName
      );
      if (activeEnrollment) {
        sectionName = activeEnrollment.classSection.sectionName;
      }
    } else if (studentDetails.batch?.batchName) {
      // Fallback to batch name if no class section is available
      sectionName = studentDetails.batch.batchName;
    }
    
    yearSection = `${year}${yearSuffix} Year - Section ${sectionName}`;
    
    // Add department if available
    if (studentDetails.department?.name) {
      yearSection += ` (${studentDetails.department.name})`;
    }
  }

  return (
    <StudentLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            {/* <h1 className="text-gray-400 text-sm mb-1">Student Dashboard / My Classes</h1> */}
            <div className="flex flex-col">
              <h2 className="text-2xl font-semibold">Hello, {studentName}</h2>
              <p className="text-gray-500">{yearSection}</p>
            </div>
          </div>
          <div className="w-10 h-10 bg-indigo-700 rounded-full flex items-center justify-center">
            <span className="text-white text-xl">{studentName.charAt(0)}</span>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Announcements</h3>
          <div className="bg-white p-6 rounded-lg shadow">
            {announcements.length > 0 ? (
              announcements.map((announcement) => (
                <AnnouncementCard
                  key={announcement.id}
                  title={announcement.title}
                  content={announcement.content}
                  createdAt={announcement.createdAt}
                  author={announcement.createdByTeacher?.user?.name || 'Admin'}
                  icon={
                    announcement.title.toLowerCase().includes('physics')
                      ? '📚'
                      : announcement.title.toLowerCase().includes('doubt')
                      ? '⭕'
                      : announcement.title.toLowerCase().includes('attendance')
                      ? '✅'
                      : '📢'
                  }
                />
              ))
            ) : (
              <div className="text-gray-500">No announcements to display.</div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Today&apos;s Classes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {todayClasses.length > 0 ? (
              todayClasses.map((classSession) => (
                <ClassCard
                  key={classSession.id}
                  subjectName={classSession.courseName}
                  teacherName={classSession.teacherName}
                  schedule={`${classSession.startTime} - ${classSession.endTime}`}
                  attendance={classSession.attendancePercentage}
                  isAbsentToday={classSession.attendanceStatus === 'ABSENT'}
                  noClassToday={classSession.status === 'CANCELLED'}
                />
              ))
            ) : (
              <div className="bg-white p-6 rounded-lg shadow text-gray-500">
                No classes scheduled for today.
              </div>
            )}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}