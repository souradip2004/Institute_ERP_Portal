"use client"
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

interface ClassSection {
  id: string;
  sectionName: string;
  course: {
    id: string;
    name: string;
    courseCode: string;
  };
  teacher: {
    id: string;
    user: {
      name: string;
    };
    name?: string;
  };
  batch: {
    id: string;
    batchName: string;
  };
}

interface AttendanceSession {
  id: string;
  classSectionId: string;
  teacherId: string;
  sessionDate: string;
  startTime?: string;
  endTime?: string;
  sessionType?: string;
  status: string;
  teacher?: {
    user?: {
      name?: string;
    }
  };
  classSection?: {
    sectionName?: string;
    course?: {
      name?: string;
      courseCode?: string;
    }
  };
}

interface AttendanceRecord {
  id: string;
  status: string;
  date?: string;
  session?: {
    id: string;
    classSectionId?: string;
    sessionDate?: string;
    status?: string;
    sessionType?: string;
  };
}

interface Enrollment {
  id: string;
  studentId: string;
  classSectionId: string;
  classSection: ClassSection;
}

interface TodayCourse {
  id: string;
  subject: string;
  subjectCode: string;
  teacherName: string;
  section: string;
  schedule: {
    id: string;
    sessionType: string;
    startTime: string;
    endTime: string;
    status: string;
    date: string;
  } | null;
  attendance: {
    todayStatus: string;
    percentage: number;
  };
}

// Helper function for authenticated fetch requests
const authenticatedFetch = async (url: string) => {
  try {
    // Get authentication token from localStorage
    let token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    const userJson = localStorage.getItem('user');
    let user = null;
    
    // Try to get token from user object if not directly available
    if (userJson && !token) {
      try {
        user = JSON.parse(userJson);
        // Some implementations store the token inside the user object
        if (user && user.token) {
          token = user.token;
          // Only try to use substring if token is a string
          if (typeof token === 'string') {
            console.log('Found token in user object:', token.substring(0, 10) + '...');
          }
        }
      } catch (e) {
        console.error('Error parsing user JSON:', e);
      }
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    // Add token if available (JWT auth)
    if (token) {
      // Make sure the token has the Bearer prefix if not already present
      if (typeof token === 'string' && !token.startsWith('Bearer ')) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        headers['Authorization'] = token;
      }
      console.log('Using auth token:', headers['Authorization'].substring(0, 20) + '...');
    }
    
    // For debugging
    console.log(`Fetching ${url} with auth headers:`, 
      Object.keys(headers).map(k => `${k}: ${k === 'Authorization' ? 'Bearer [hidden]' : headers[k]}`));
    
    const response = await fetch(url, {
      headers,
      credentials: 'include' // Include cookies for session-based auth
    });
    
    if (response.status === 401) {
      console.error(`Authentication failed for ${url}. Status: ${response.status}`);
      console.log('Please check your authentication credentials or token.');
    }
    
    return response;
  } catch (error) {
    console.error('Error in authenticatedFetch:', error);
    throw error;
  }
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [studentDetails, setStudentDetails] = useState<StudentData | null>(null);
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [todayCourses, setTodayCourses] = useState<TodayCourse[]>([]);
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);

  // Function to fetch student details
  const fetchStudentDetails = async (studentId: string) => {
    try {
      const response = await authenticatedFetch(`/api/students/${studentId}`);
      console.log("Student Details Response:", response);
      
      if (!response.ok) {
        throw new Error('Failed to fetch student details');
      }
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error fetching student details:', err);
      throw err;
    }
  };

  // Function to fetch student enrollments (which classes the student is enrolled in)
  const fetchStudentEnrollments = async (studentId: string) => {
    try {
      const response = await authenticatedFetch(`/api/studentClassEnrollment?studentId=${studentId}`);
      console.log("Student Enrollments Response:", response);
      if (!response.ok) {
        throw new Error('Failed to fetch student enrollments');
      }
      return await response.json();
    } catch (err) {
      console.error('Error fetching student enrollments:', err);
      throw err;
    }
  };

  // Function to fetch attendance sessions for today (classes scheduled for today)
  const fetchTodayAttendanceSessions = async (classSectionIds: string[]) => {
    try {
      // Format today's date as ISO string (YYYY-MM-DD)
      const today = new Date().toISOString().split('T')[0];
      console.log("Today's Date:", today);
      
      // Fetch attendance sessions for each class section individually for better results
      const allSessions = [];
      
      for (const classSectionId of classSectionIds) {
        // Add detailed logging for debugging
        console.log(`Fetching attendance sessions for class section: ${classSectionId}`);
        
        const response = await authenticatedFetch(
          `/api/attendance-sessions?classSectionId=${classSectionId}&fromDate=${today}&toDate=${today}`
        );
        
        console.log(`Attendance Sessions Response for ${classSectionId}:`, response);
        
        if (response.ok) {
          const sessions = await response.json();
          console.log(`Sessions found for ${classSectionId}:`, sessions);
          
          // Make sure we're getting the expected data structure
          if (Array.isArray(sessions) && sessions.length > 0) {
            allSessions.push(...sessions);
          } else {
            console.log(`No sessions found for class section: ${classSectionId}`);
          }
        } else {
          console.error(`Failed to fetch attendance sessions for ${classSectionId}: ${response.status}`);
        }
      }
      
      console.log("All attendance sessions:", allSessions);
      return allSessions;
    } catch (err) {
      console.error('Error fetching today\'s sessions:', err);
      throw err;
    }
  };

  // Function to fetch student attendance records for specific sessions
  const fetchAttendanceRecords = async (studentId: string, sessionIds: string[]) => {
    try {
      if (sessionIds.length === 0) {
        console.log("No sessions to fetch attendance records for");
        return [];
      }
      
      console.log(`Fetching attendance records for student ${studentId} and ${sessionIds.length} sessions`);
      
      // Build query string with multiple sessionId parameters
      const queryString = sessionIds.map(id => `sessionId=${id}`).join('&');
      console.log("Query String:", queryString);
      
      const response = await authenticatedFetch(`/api/attendance?studentId=${studentId}&${queryString}`);
      console.log("Attendance Records Response:", response);
      
      if (!response.ok) {
        console.error(`Failed to fetch attendance records: ${response.status}`);
        return [];
      }
      
      const records = await response.json();
      console.log(`Retrieved ${records.length} attendance records:`, records);
      return records;
    } catch (err) {
      console.error('Error fetching attendance records:', err);
      return [];
    }
  };

  // Function to fetch attendance statistics (percentage) for a student in a class
  const fetchAttendanceStats = async (studentId: string, classSectionId: string) => {
    try {
      const response = await authenticatedFetch(`/api/attendance?studentId=${studentId}&classSectionId=${classSectionId}`);
      console.log("Attendance Stats Response:", response);
      if (!response.ok) {
        throw new Error('Failed to fetch attendance statistics');
      }
      
      const records = await response.json();
      
      // Calculate attendance percentage
      if (records.length === 0) return 0;
      
      const presentCount = records.filter((record: AttendanceRecord) => 
        record.status === 'PRESENT'
      ).length;
      
      return Math.round((presentCount / records.length) * 100);
    } catch (err) {
      console.error('Error fetching attendance stats:', err);
      return 0;
    }
  };

  // Function to fetch class section details
  const fetchClassSectionDetails = async (classSectionId: string) => {
    try {
      // Add include query parameter to fetch related course and teacher data
      const response = await authenticatedFetch(`/api/class-sections/${classSectionId}?include=course,teacher`);
      
      if (!response.ok) {
        console.error(`Failed to fetch class section details: ${response.status}`);
        return null;
      }
      
      const data = await response.json();
      console.log(`Complete class section data for ${classSectionId}:`, data);
      return data;
    } catch (error) {
      console.error("Error fetching class section details:", error);
      return null;
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

        // Student details
        let studentDetails;
        
        // If we have a studentId but no student data, fetch the details
        if (user.studentId && !user.student) {
          console.log("Fetching student details using studentId:", user.studentId);
          
          try {
            studentDetails = await fetchStudentDetails(user.studentId);
            setStudentDetails(studentDetails);
            
            // Build student display object
            setStudentData({
              id: studentDetails.id,
              name: user.name || '',
              rollNumber: studentDetails.studentRoll || 'Not Assigned',
              section: studentDetails.batch?.batchName || 'Not Assigned',
              year: `Year ${studentDetails.currentYear || 1}`,
              department: studentDetails.department?.name || 'Not Assigned'
            });
          } catch (error) {
            console.error('Error fetching student details:', error);
            setNeedsProfileSetup(true);
            throw new Error('Could not retrieve your student profile. Please contact an administrator.');
          }
        } else if (user.student) {
          // If we already have student data in the user object
          studentDetails = user.student;
          setStudentDetails(studentDetails);
          setStudentData({
            id: user.student.id,
            name: user.name || '',
            rollNumber: user.student.studentRoll,
            section: user.student.batch?.batchName || 'Not Assigned',
            year: `Year ${user.student.currentYear || 1}`,
            department: user.student.department?.name || 'Not Assigned'
          });
        }

        // Fetch student class enrollments
        const enrollments = await fetchStudentEnrollments(user.studentId);
        
        // Debug logging to see exactly what data structure we're getting
        console.log("ENROLLMENT DATA STRUCTURE:", JSON.stringify(enrollments[0], null, 2));
        
        // Get class section IDs from enrollments
        const classSectionIds = enrollments.map((enrollment: Enrollment) => enrollment.classSectionId);
        
        // Fetch today's attendance sessions for these class sections
        const todaySessions = await fetchTodayAttendanceSessions(classSectionIds);
        
        // Get session IDs from today's sessions
        const sessionIds = todaySessions.map((session: AttendanceSession) => session.id);
        
        // Fetch attendance records for these sessions
        const attendanceRecords = sessionIds.length > 0 
          ? await fetchAttendanceRecords(user.studentId, sessionIds)
          : [];
        
        // Process course data for all enrollments
        const coursesWithData = await Promise.all(
          enrollments.map(async (enrollment: Enrollment) => {
            const sectionId = enrollment.classSectionId;
            console.log("Processing enrollment:", enrollment);
            console.log("Section ID:", sectionId);
            
            // Fetch class section details including course and teacher info
            const sectionDetails = await fetchClassSectionDetails(sectionId);
            console.log("Section details:", sectionDetails);
            // Print details about course and teacher specifically
            console.log("Course details:", {
              courseId: sectionDetails?.courseId,
              courseName: sectionDetails?.course?.name,
              courseCode: sectionDetails?.course?.code,
              courseObject: sectionDetails?.course
            });
            console.log("Teacher details:", {
              teacherId: sectionDetails?.teacherId,
              teacherName: sectionDetails?.teacher?.name,
              teacherUserName: sectionDetails?.teacher?.user?.name,
              teacherObject: sectionDetails?.teacher
            });
            
            // Find all today's sessions for this class section
            const todaySectionSessions = todaySessions.filter(
              (session: AttendanceSession) => session.classSectionId === sectionId
            );
            
            console.log(`Found ${todaySectionSessions.length} sessions for section ${sectionId}:`, todaySectionSessions);
            
            // Basic course information (this is shared regardless of how many sessions there are)
            const baseInfo = {
              id: sectionId,
              subject: "Unknown Subject",
              subjectCode: "N/A",
              teacherName: "Unknown Teacher",
              section: "Unknown Section",
            };
            
            // If we have no sessions for this section
            if (todaySectionSessions.length === 0) {
              // Try to extract course and teacher information from section details
              if (sectionDetails?.course) {
                baseInfo.subject = sectionDetails.course.name || baseInfo.subject;
                baseInfo.subjectCode = sectionDetails.course.code || sectionDetails.course.courseCode || baseInfo.subjectCode;
              }
              
              if (sectionDetails?.sectionName) {
                baseInfo.section = sectionDetails.sectionName;
              }
              
              if (sectionDetails?.teacher) {
                if (sectionDetails.teacher.name) {
                  baseInfo.teacherName = sectionDetails.teacher.name;
                } else if (sectionDetails.teacher.user && sectionDetails.teacher.user.name) {
                  baseInfo.teacherName = sectionDetails.teacher.user.name;
                }
              }
              
              // Calculate overall attendance percentage for this class
              const attendancePercentage = await fetchAttendanceStats(
                user.studentId as string, 
                sectionId
              );
              
              return {
                ...baseInfo,
                schedule: null,
                attendance: {
                  todayStatus: 'NO_CLASS',
                  percentage: attendancePercentage
                }
              };
            }
            
            // If we have sessions, create a course entry for each session
            return Promise.all(todaySectionSessions.map(async (session) => {
              // Try to get course and teacher info from session first
              let subject = session.classSection?.course?.name || "Unknown Subject";
              let subjectCode = session.classSection?.course?.courseCode || "N/A";
              let sectionName = session.classSection?.sectionName || "Unknown Section";
              let teacherName = session.teacher?.user?.name || "Unknown Teacher";
              
              // If session doesn't have the info, use the section details as fallback
              if (subject === "Unknown Subject" && sectionDetails?.course) {
                subject = sectionDetails.course.name || subject;
                subjectCode = sectionDetails.course.code || sectionDetails.course.courseCode || subjectCode;
              }
              
              if (sectionName === "Unknown Section" && sectionDetails?.sectionName) {
                sectionName = sectionDetails.sectionName;
              }
              
              if (teacherName === "Unknown Teacher" && sectionDetails?.teacher) {
                if (sectionDetails.teacher.name) {
                  teacherName = sectionDetails.teacher.name;
                } else if (sectionDetails.teacher.user && sectionDetails.teacher.user.name) {
                  teacherName = sectionDetails.teacher.user.name;
                }
              }
              
              // Find attendance record for this session if it exists
              const sessionAttendance = attendanceRecords.find(
                (record: AttendanceRecord) => record.session?.id === session.id
              );
              
              // Calculate overall attendance percentage for this class
              const attendancePercentage = await fetchAttendanceStats(
                user.studentId as string, 
                sectionId
              );
              
              return {
                id: `${sectionId}-${session.id}`, // Create a unique ID for each session
                subject,
                subjectCode,
                teacherName,
                section: sectionName,
                schedule: {
                  id: session.id,
                  sessionType: session.sessionType || 'LECTURE',
                  startTime: session.startTime ? new Date(session.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A',
                  endTime: session.endTime ? new Date(session.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A',
                  status: session.status || 'UNKNOWN',
                  date: session.sessionDate ? new Date(session.sessionDate).toLocaleDateString() : new Date().toLocaleDateString()
                },
                attendance: {
                  todayStatus: sessionAttendance ? sessionAttendance.status : 'NOT_RECORDED',
                  percentage: attendancePercentage
                }
              };
            }));
          })
        );
        
        // Flatten the array since we might have multiple sessions per course now
        const flattenedCourses = coursesWithData.flat();
        console.log("Final courses data (including all sessions):", flattenedCourses);
        
        setTodayCourses(flattenedCourses);
        
        // We'll still use mock announcements for now
        // In a real app, you would fetch these from an API
        const mockAnnouncements: Announcement[] = [
          {
            id: '1',
            title: 'Welcome to the new semester!',
            content: 'We are excited to welcome you to the new semester. Please check your schedule and let us know if you have any questions.',
            date: new Date().toISOString(),
            author: 'Admin'
          },
          {
            id: '2',
            title: 'Maintenance Notice',
            content: 'The system will be down for maintenance on Sunday from 2am to 4am.',
            date: new Date().toISOString(),
            author: 'Admin'
          },
          {
            id: '3',
            title: 'Holiday Notice',
            content: 'The school will be closed on Monday due to the national holiday.',
            date: new Date().toISOString(),
            author: 'Admin'
          }
        ];
        
        setAnnouncements(mockAnnouncements);
        
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    
    // Load the dashboard data
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
          <p className="text-sm mt-2">
            Make sure you have user data in localStorage with the key &apos;user&apos;.
          </p>
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
            <h2 className="text-xl font-semibold mb-2">Today&apos;s Courses</h2>
            <div className="overflow-auto max-h-96 bg-gray-100 p-4 rounded">
              <pre>{JSON.stringify(todayCourses, null, 2)}</pre>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Announcements</h2>
            <div className="overflow-auto max-h-96 bg-gray-100 p-4 rounded">
              <pre>{JSON.stringify(announcements, null, 2)}</pre>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded shadow">
            <p className="text-sm text-gray-500">
              <strong>Note:</strong> Student data and today&apos;s courses are fetched from the API.
              Announcements are still using mock data until those APIs are connected.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}