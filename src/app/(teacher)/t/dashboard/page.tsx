"use client";
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";

interface Notification {
  id: string;
  title: string;
  message: string;
  notificationType: string;
  isRead: boolean;
  createdAt: string;
}

interface Assignment {
  id: string;
  title: string;
  class: string;
  subject: string;
  dueDate: string;
  submissions: string;
  status: string;
}

interface Exam {
  id: string;
  title: string;
  class: string;
  subject: string;
  date: string;
  mode: string;
  status: string;
}

export default function TeacherDashboardPage() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [teacherAttendance, setTeacherAttendance] = useState(97);
  const [sectionAttendances, setSectionAttendances] = useState([
    { section: 'Q', percentage: 75 },
    { section: 'P', percentage: 60 },
    { section: 'T', percentage: 40 }
  ]);

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
        console.log('User data from localStorage:', userData);

        // Set the userData state
        setUserData(userData);

        // Fetch assignments and exams first
        await Promise.all([
          fetchAssignments(userData),
          fetchExams(userData)
        ]);

        // Then fetch notifications and attendance data which might need user processing
        // These use fallback data if API calls fail
        await Promise.all([
          fetchNotifications(),
          fetchAttendanceData(userData) // Pass userData directly to avoid state timing issues
        ]);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load user data. Please refresh the page.");
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const fetchNotifications = async () => {
    try {
      // Try to fetch notifications from API
      try {
        const response = await fetch('/api/notifications');

        if (response.ok) {
          const data = await response.json();
          console.log('Notifications data:', data);

          // Transform API data to match our Notification interface if needed
          const formattedNotifications = Array.isArray(data) ? data.map(notification => ({
            id: notification.id,
            title: notification.title || 'Notification',
            message: notification.message,
            notificationType: notification.notificationType,
            isRead: notification.isRead,
            createdAt: notification.createdAt
          })) : [];

          setNotifications(formattedNotifications);
          return;
        }
      } catch (apiError) {
        console.warn('API call for notifications failed, using mock data', apiError);
      }

      // Fallback to mock data if API call fails
      const mockNotifications = [
        {
          id: '1',
          title: 'New Student Added',
          message: 'Ravi Kumar has been added to Class 9-A. Update attendance and subject materials.',
          notificationType: 'ENROLLMENT',
          isRead: false,
          createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString() // 2 min ago
        },
        {
          id: '2',
          title: 'Class Schedule Changed',
          message: 'Your Tuesday Math period for 10-B has been rescheduled to 11:00 AM.',
          notificationType: 'SCHEDULE',
          isRead: false,
          createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString() // 8 min ago
        },
        {
          id: '3',
          title: 'Attendance Submitted',
          message: 'Your attendance for Class 11-A (Today) is recorded successfully.',
          notificationType: 'ATTENDANCE',
          isRead: false,
          createdAt: new Date().toISOString() // just now
        }
      ];

      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error in notifications handling:', error);
      // Last resort fallback
      setNotifications([]);
    }
  };

  const fetchAssignments = async (userData: any) => {
    try {
      // Get teacherId from user data
      const teacherId = userData?.teacherId ||
        (userData?.teacher && userData.teacher.id) ||
        (userData?.id && userData.role === 'TEACHER' ? userData.id : null);

      console.log('Using teacherId for assignments:', teacherId);

      // Fetch assignments from API - filter by teacherId if available
      const url = teacherId
        ? `/api/assignments?createdById=${teacherId}`
        : '/api/assignments';

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch assignments');
      }

      const data = await response.json();
      console.log('Assignments data:', data);

      // Transform API data to match our Assignment interface
      const formattedAssignments = Array.isArray(data) ? data.map(assignment => ({
        id: assignment.id,
        title: assignment.title,
        class: assignment.classSection?.sectionName || 'N/A',
        subject: assignment.classSection?.course?.name || 'N/A',
        dueDate: assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No due date',
        submissions: assignment.submissions ? `${assignment.submissions.length}/${assignment.classSection?.enrollments?.length || 0}` : '0/0',
        status: getAssignmentStatus(assignment)
      })) : [];

      setAssignments(formattedAssignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      // Fallback to empty array if API call fails
      setAssignments([]);
    }
  };

  const fetchExams = async (userData: any) => {
    try {
      // Get teacherId from user data
      const teacherId = userData?.teacherId ||
        (userData?.teacher && userData.teacher.id) ||
        (userData?.id && userData.role === 'TEACHER' ? userData.id : null);

      console.log('Using teacherId for exams:', teacherId);

      // Fetch exams from API - filter by teacherId if available
      const url = teacherId
        ? `/api/exams?createdById=${teacherId}`
        : '/api/exams';

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch exams');
      }

      const data = await response.json();
      console.log('Exams data:', data);

      // Transform API data to match our Exam interface
      const formattedExams = Array.isArray(data) ? data.map(exam => ({
        id: exam.id,
        title: exam.title,
        class: exam.classSection?.sectionName || 'N/A',
        subject: exam.classSection?.course?.name || 'N/A',
        date: exam.examDate ? new Date(exam.examDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No date',
        mode: exam.isAiGenerated ? 'AI Mode' : 'Manual',
        status: exam.status
      })) : [];

      setExams(formattedExams);
    } catch (error) {
      console.error('Error fetching exams:', error);
      // Fallback to empty array if API call fails
      setExams([]);
    }
  };

  const fetchAttendanceData = async (directUserData: any) => {
    try {
      // Use directly passed userData instead of state to avoid timing issues
      if (!directUserData) {
        console.warn('User data not available for attendance, using mock data');
        return;
      }

      // Log the full structure of user data to help diagnose issues
      console.log('Full user data structure for attendance:', JSON.stringify(directUserData, null, 2));

      // Get teacherId from user data with multiple fallbacks
      const teacherId = directUserData.teacherId ||
        (directUserData.teacher && directUserData.teacher.id) ||
        (directUserData.id && directUserData.role === 'TEACHER' ? directUserData.id : null);

      console.log('Extracted teacherId for attendance:', teacherId);

      if (!teacherId) {
        // If teacherId is still not found, try to fetch it directly using userId
        if (directUserData.id) {
          try {
            console.log('Attempting to fetch teacher data using userId:', directUserData.id);
            const teacherResponse = await fetch(`/api/teachersbyid/${directUserData.id}`);
            if (teacherResponse.ok) {
              const teacherData = await teacherResponse.json();
              console.log('Teacher data fetched:', teacherData);
              if (teacherData && teacherData.id) {
                // Use this teacherId for attendance
                const fetchedTeacherId = teacherData.id;
                await fetchAttendanceWithTeacherId(fetchedTeacherId);
                return;
              }
            }
          } catch (error) {
            console.warn('Failed to fetch teacher data using userId:', error);
          }
        }

        console.warn('Teacher ID not available for attendance data fetch, using mock data');
        return;
      }

      await fetchAttendanceWithTeacherId(teacherId);
    } catch (error) {
      console.error('Error in attendance data handling:', error);
    }
  };

  // Helper function to fetch attendance with a valid teacherId
  const fetchAttendanceWithTeacherId = async (teacherId: string) => {
    try {
      // Try to fetch teacher's attendance data
      try {
        const teacherAttendanceResponse = await fetch(`/api/attendance?teacherId=${teacherId}`);

        if (teacherAttendanceResponse.ok) {
          const teacherAttendanceData = await teacherAttendanceResponse.json();
          console.log('Teacher attendance data:', teacherAttendanceData);

          // Calculate attendance percentage based on present days / total sessions
          if (teacherAttendanceData.totalSessions) {
            const attendancePercentage = Math.round((teacherAttendanceData.presentDays / teacherAttendanceData.totalSessions) * 100);
            setTeacherAttendance(attendancePercentage);
          }
        }
      } catch (error) {
        console.warn('Error fetching teacher attendance, using default value:', error);
      }

      // Try to fetch sections
      try {
        const sectionsResponse = await fetch(`/api/class-sections?teacherId=${teacherId}`);

        if (sectionsResponse.ok) {
          const sectionsData = await sectionsResponse.json();
          console.log('Sections data:', sectionsData);

          if (Array.isArray(sectionsData) && sectionsData.length > 0) {
            // Fetch attendance for each section
            const sectionAttendanceData = await Promise.all(
              sectionsData.map(async (section) => {
                try {
                  const response = await fetch(`/api/attendance?classSectionId=${section.id}`);
                  if (response.ok) {
                    const data = await response.json();
                    return {
                      section: section.sectionName || section.id,
                      percentage: data.attendancePercentage || Math.round(Math.random() * 30 + 60) // Fallback to random percentage if not available
                    };
                  }
                  return {
                    section: section.sectionName || section.id,
                    percentage: Math.round(Math.random() * 30 + 60)
                  };
                } catch (error) {
                  return {
                    section: section.sectionName || section.id,
                    percentage: Math.round(Math.random() * 30 + 60)
                  };
                }
              })
            );

            setSectionAttendances(sectionAttendanceData.slice(0, 3)); // Take top 3 sections
          }
        }
      } catch (error) {
        console.warn('Error fetching sections, using default values:', error);
      }
    } catch (error) {
      console.error('Error in fetchAttendanceWithTeacherId:', error);
    }
  };

  // Helper function to determine assignment status
  const getAssignmentStatus = (assignment: any) => {
    if (!assignment.submissions || assignment.submissions.length === 0) {
      return 'Pending';
    }

    const totalStudents = assignment.classSection?.enrollments?.length || 0;
    const submittedCount = assignment.submissions.length;

    if (submittedCount === 0) {
      return 'Pending';
    } else if (submittedCount < totalStudents) {
      return 'In Progress';
    } else {
      return 'Completed';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ENROLLMENT':
        return '🎓';
      case 'SCHEDULE':
        return '🕒';
      case 'ATTENDANCE':
        return '✅';
      default:
        return '📋';
    }
  };

  const getStatusColor = (status: string) => {
    status = status.toLowerCase();
    if (status === 'completed') return 'text-green-600';
    if (status === 'in progress') return 'text-blue-500';
    return 'text-amber-500'; // pending
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white p-4 border-b">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Teacher Pannel,</h1>
            <p>{userData?.name || 'John Mathew'}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-gray-100 rounded-full px-4 py-2 flex items-center">
              <span className="text-yellow-500 mr-2">🪙</span>
              <span>600 Credits</span>
            </div>
            <div className="w-10 h-10 bg-indigo-600 rounded-full"></div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {/* Notifications Panel */}
        <section className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Notifications Pannel</h2>

          {notifications.map((notification) => (
            <div key={notification.id} className="border-b py-4 last:border-b-0">
              <div className="flex justify-between items-start">
                <div className="flex">
                  <div className="mr-4 text-2xl">
                    {getNotificationIcon(notification.notificationType)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{notification.title}</h3>
                    <p className="text-gray-700">"{notification.message}"</p>
                  </div>
                </div>
                <div className="text-gray-400">
                  {formatTimeAgo(notification.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Attendance Section */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Attendance</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Your Attendance */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Your Attendance</h3>
              <div className="flex justify-center">
                <div className="relative w-40 h-40">
                  <div className="w-full h-full rounded-full border-[16px] border-yellow-200"></div>
                  <div
                    className="absolute top-0 left-0 w-full h-full rounded-full border-[16px] border-yellow-400"
                    style={{
                      clipPath: `polygon(50% 0%, 50% 50%, ${50 + 50 * Math.cos(2 * Math.PI * (teacherAttendance / 100) - Math.PI / 2)}% ${50 + 50 * Math.sin(2 * Math.PI * (teacherAttendance / 100) - Math.PI / 2)}%, ${teacherAttendance >= 50 ? '100% 0, 100% 0' : '0 0, 0 0'})`
                    }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold">{teacherAttendance}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Students Attendance */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Students Attendance</h3>
              <div className="space-y-4">
                {sectionAttendances.map((section) => (
                  <div key={section.section} className="space-y-2">
                    <div className="flex justify-between">
                      <span>Section: {section.section}</span>
                    </div>
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${section.section === 'Q' ? 'bg-indigo-600' :
                          section.section === 'P' ? 'bg-green-600' : 'bg-blue-500'
                          }`}
                        style={{ width: `${section.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Recent Assignments */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Recent Assignments</h2>

          <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-4 px-6 text-left">Title</th>
                  <th className="py-4 px-6 text-left">Class</th>
                  {/* <th className="py-4 px-6 text-left">Subject</th> */}
                  {/* <th className="py-4 px-6 text-left">Due</th> */}
                  <th className="py-4 px-6 text-left">Submissions</th>
                  <th className="py-4 px-6 text-left">Status</th>
                  <th className="py-4 px-6 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment) => (
                  <tr key={assignment.id} className="border-b last:border-b-0 hover:bg-gray-50">
                    <td className="py-4 px-6">{assignment.title}</td>
                    <td className="py-4 px-6">{assignment.class}</td>
                    {/* <td className="py-4 px-6">{assignment.subject}</td> */}
                    {/* <td className="py-4 px-6">{assignment.dueDate}</td> */}
                    <td className="py-4 px-6">{assignment.submissions}</td>
                    <td className="py-4 px-6">
                      <span className={getStatusColor(assignment.status)}>
                        {assignment.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <Link href={`/t/assignments/${assignment.id}`} className="text-indigo-600 hover:text-indigo-800">
                        {assignment.status === 'Completed' ? 'Review' : 'View Submissions'}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Upcoming/Ongoing Exams */}
        <section>
          <h2 className="text-xl font-bold mb-4">Upcoming /Ongoing Exams</h2>

          <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-4 px-6 text-left">Title</th>
                  {/* <th className="py-4 px-6 text-left">Class</th> */}
                  {/* <th className="py-4 px-6 text-left">Subject</th> */}
                  <th className="py-4 px-6 text-left">Date</th>
                  <th className="py-4 px-6 text-left">Mode</th>
                  <th className="py-4 px-6 text-left">Status</th>
                  <th className="py-4 px-6 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => (
                  <tr key={exam.id} className="border-b last:border-b-0 hover:bg-gray-50">
                    <td className="py-4 px-6">{exam.title}</td>
                    {/* <td className="py-4 px-6">{exam.class}</td> */}
                    {/* <td className="py-4 px-6">{exam.subject}</td> */}
                    <td className="py-4 px-6">{exam.date}</td>
                    <td className="py-4 px-6">{exam.mode}</td>
                    <td className="py-4 px-6">
                      <span className={getStatusColor(exam.status)}>
                        {exam.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <Link href={`/t/exams/${exam.id}`} className="text-indigo-600 hover:text-indigo-800">
                        {exam.status === 'Completed' ? 'Review' : 'View Submissions'}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <LogoutButton />
    </div>
  );
}