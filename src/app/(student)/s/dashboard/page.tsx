'use client';
import { useEffect, useState } from 'react';
import AnnouncementCard from '@/components/student/AnnouncementCard';
import ClassCard from '@/components/student/ClassCard';
import Loader from '@/components/ui/Loader';
// Assuming lucide-react is installed or available in your environment
// If not, you might need to run: npm install lucide-react
import { ChevronDown } from 'lucide-react';

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
    id: string;
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

interface GroupedSection {
  id: string; // Unique ID for the section group, e.g., "A", "B"
  section: string;
  subjects: string[];
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<User | null>(null);
  const [studentDetails, setStudentDetails] = useState<StudentDetails | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [todayClasses, setTodayClasses] = useState<ClassSession[]>([]);
  const [error, setError] = useState<string | null>(null);
  // State to manage which section is expanded
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);

  // Function to toggle the expanded state of a section
  const handleSectionClick = (sectionId: string) => {
    setExpandedSectionId(prevId => (prevId === sectionId ? null : sectionId));
  };

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

  // Function to group class enrollments by section name
  const groupSections = (enrollments: StudentDetails['classEnrollments']): GroupedSection[] => {
    if (!enrollments) return [];

    const sectionMap = enrollments.reduce((acc, curr) => {
      const [section, subject] = curr.classSection.sectionName.split("-");
      if (!acc[section]) {
        acc[section] = { id: section, section: section, subjects: [] };
      }
      if (subject) {
        acc[section].subjects.push(subject);
      }
      return acc;
    }, {} as Record<string, GroupedSection>);

    return Object.values(sectionMap);
  };

  const groupedSections = groupSections(studentDetails?.classEnrollments);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <Loader size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Extract student information
  const studentName = userData?.name || 'Student';

  // Use detailed student information for better year-section display
  let yearSection = 'Student';
  if (studentDetails) {
    const year = studentDetails.currentYear || 1;
    // const yearSuffix = year === 1 ? 'st' : year === 2 ? 'nd' : year === 3 ? 'rd' : 'th'; // Not used in current display

    // Try to get section name from class enrollments first
    let sectionName = 'A';
    if (studentDetails.classEnrollments && studentDetails.classEnrollments.length > 0) {
      // Find the first active enrollment with a section name
      const activeEnrollment = studentDetails.classEnrollments.find(
        enrollment => enrollment.classSection && enrollment.classSection.sectionName
      );
      if (activeEnrollment) {
        // Extract only the section part (e.g., "A" from "A-Physics")
        const [section] = activeEnrollment.classSection.sectionName.split("-");
        sectionName = section;
      }
    } else if (studentDetails.batch?.batchName) {
      // Fallback to batch name if no class section is available
      sectionName = studentDetails.batch.batchName;
    }

    yearSection = `Section ${sectionName}`;

    // Add department if available
    if (studentDetails.department?.name) {
      yearSection += ` (${studentDetails.department.name})`;
    }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-4 mt-8 sm:mb-8 sm:mt-0" >
        <div>
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
                isPresentToday={classSession.attendanceStatus === 'PRESENT' || classSession.attendanceStatus === 'LATE'}
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
      
      {groupedSections.length > 0 && (
        <div className="col-span-full mt-8">
          <h4 className="text-xl font-semibold mb-3">Your Classes</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {groupedSections.map((group) => (
              <div
                key={group.id}
                className="bg-white border border-indigo-200 rounded-xl shadow overflow-hidden
                           transition-all duration-300 hover:shadow-lg"
              >
                {/* Section Header (Clickable) */}
                <div
                  className="flex justify-between items-center px-6 py-4 cursor-pointer
                             bg-indigo-50 hover:bg-indigo-100 transition-colors duration-200"
                  onClick={() => handleSectionClick(group.id)}
                >
                  <div className="flex items-center">
                    <span className="inline-block bg-indigo-600 text-white rounded-full px-3 py-1 text-sm font-semibold mr-2">
                       {group.section}
                    </span>
                    {group.subjects.length > 0 && (
                      <p className="text-gray-600 text-sm">{group.subjects.length} subjects</p>
                    )}
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-indigo-600 transition-transform duration-300
                                ${expandedSectionId === group.id ? 'rotate-180' : ''}`}
                  />
                </div>

                {/* Subjects Content (Collapsible) */}
                <div
                  className={`px-6 pt-0 transition-all duration-300 ease-in-out
                              ${expandedSectionId === group.id ? 'max-h-screen pb-4' : 'max-h-0 overflow-hidden'}`}
                >
                  {group.subjects.length > 0 ? (
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      {group.subjects.map((subject, index) => (
                        <li key={index} className="font-medium">
                          {subject}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 py-2">No subjects found for this section.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
