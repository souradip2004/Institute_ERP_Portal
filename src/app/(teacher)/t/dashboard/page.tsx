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

interface ClassAttendance {
  id: string;
  name: string;
  sectionName: string;
  percentage: number;
}

export default function TeacherDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [teacherName, setTeacherName] = useState('John Mathew');
  const [credits, setCredits] = useState(600);
  const [teacherAttendance, setTeacherAttendance] = useState(97); // Default non-zero value to match UI
  const [classAttendance, setClassAttendance] = useState<ClassAttendance[]>([]);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [classSectionId, setClassSectionId] = useState<string | null>(null);

  useEffect(() => {
    const getUserData = () => {
      if (typeof window !== 'undefined') {
        const userData = localStorage.getItem('user');
        if (userData) {
          try {
            const parsedUserData = JSON.parse(userData);
            if (parsedUserData.name) {
              setTeacherName(parsedUserData.name);
            }
            if (parsedUserData.teacherId || parsedUserData.id) {
              setTeacherId(parsedUserData.teacherId || parsedUserData.id);
            }
            setClassSectionId(parsedUserData.classSectionId);
          } catch (error) {
            console.error('Error parsing user data from localStorage:', error);
          }
        }
      }
    };

    getUserData();
    
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Execute all data fetching operations in parallel
        const [attendanceResult] = await Promise.allSettled([
          fetchAttendanceData()
        ]);
        
        // Handle attendance data
        if (attendanceResult.status === 'fulfilled') {
          setTeacherAttendance(attendanceResult.value.teacherAttendance);
          setClassAttendance(attendanceResult.value.classAttendance);
        }
        
        // Fetch other data types - these can be done sequentially to avoid overwhelming the API
        await fetchNotifications();
        await fetchAssignments();
        await fetchExams();
        
        setLoading(false);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setLoading(false);
        setError("Failed to load dashboard data. Please try again later.");
      }
    };

    loadData();
  }, []);

  const fetchNotifications = async () => {
    try {
      // Attempt to fetch from API first
      if (teacherId) {
        try {
          const response = await fetch(`/api/notifications?teacherId=${teacherId}`, {
            credentials: 'include'
          });
          
          if (response.ok) {
            const data = await response.json();
            setNotifications(data);
            return;
          }
        } catch (apiError) {
          console.error('API fetch error:', apiError);
        }
      }
      
      // Fallback to sample data if API fails or teacherId is not available
      setNotifications([
        {
          id: '1',
          title: 'New Student Added',
          message: 'Ravi Kumar has been added to Class 9-A. Update attendance and subject materials.',
          notificationType: 'student',
          isRead: false,
          createdAt: new Date(Date.now() - 120 * 60000).toISOString() // 2 min ago
        },
        {
          id: '2',
          title: 'Class Schedule Changed',
          message: 'Your Tuesday Math period for 10-B has been rescheduled to 11:00 AM.',
          notificationType: 'schedule',
          isRead: false,
          createdAt: new Date(Date.now() - 480 * 60000).toISOString() // 8 min ago
        },
        {
          id: '3',
          title: 'Attendance Submitted',
          message: 'Your attendance for Class 11-A (Today) is recorded successfully.',
          notificationType: 'attendance',
          isRead: false,
          createdAt: new Date().toISOString() // Just now
        }
      ]);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    }
  };

  const markNotificationsAsRead = async (notificationIds: string[]) => {
    try {
      if (teacherId) {
        try {
          const response = await fetch('/api/notifications', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ notificationIds, teacherId })
          });
          
          if (response.ok) {
            // Update local state after successful API call
            setNotifications(prevNotifications =>
              prevNotifications.map(notification =>
                notificationIds.includes(notification.id)
                  ? { ...notification, isRead: true }
                  : notification
              )
            );
            return;
          }
        } catch (apiError) {
          console.error('API update error:', apiError);
        }
      }
      
      // Fallback if API fails
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notificationIds.includes(notification.id)
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const fetchAssignments = async () => {
    try {
      if (teacherId) {
        // Try to fetch from the teacher-specific assignments endpoint
        const response = await fetch(`/api/teachers/${teacherId}/classes`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          // Extract assignments from classes if available
          if (data && Array.isArray(data)) {
            // Collect assignments from all classes
            const allAssignments = [];
            for (const classData of data) {
              if (classData.lastAssignment) {
                allAssignments.push({
                  id: classData.id,
                  title: classData.lastAssignment.title,
                  class: `${classData.name} ${classData.section || ''}`,
                  subject: classData.subject || 'General',
                  dueDate: new Date().toISOString().split('T')[0], // Today as fallback
                  submissions: '0/0',
                  status: 'Active'
                });
              }
            }
            if (allAssignments.length > 0) {
              setAssignments(allAssignments);
              return;
            }
          }
        }
      }
      
      // Try to fetch all assignments directly if teacher-specific failed
      const response = await fetch(`/api/assignments`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          // Map API data to the Assignment interface
          const formattedAssignments = data.map((item: any) => ({
            id: item.id,
            title: item.title,
            class: item.className || 'N/A',
            subject: item.subject || 'General',
            dueDate: item.dueDate || new Date().toISOString().split('T')[0],
            submissions: item.submissionCount ? `${item.submissionCount}/${item.totalStudents || 0}` : '0/0',
            status: item.status || 'Active'
          }));
          setAssignments(formattedAssignments);
          return;
        }
      }
      
      // If all API attempts fail, use empty array
      setAssignments([]);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setAssignments([]);
    }
  };

  const fetchExams = async () => {
    try {
      // Try the general exams endpoint first
      const response = await fetch(`/api/exams`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          // Map API data to the Exam interface
          const formattedExams = data.map((item: any) => ({
            id: item.id,
            title: item.title,
            class: item.className || 'N/A',
            subject: item.subject || 'General',
            date: item.examDate ? new Date(item.examDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            mode: item.mode || 'Online',
            status: item.status || 'Upcoming'
          }));
          setExams(formattedExams);
          return;
        }
      }
      
      // If teacher ID is available, try to fetch class-specific exams
      if (teacherId) {
        const classesResponse = await fetch(`/api/teachers/${teacherId}/classes`, {
          credentials: 'include'
        });
        
        if (classesResponse.ok) {
          const classesData = await classesResponse.json();
          // Extract upcoming exams from classes
          if (Array.isArray(classesData)) {
            const allExams = [];
            for (const classData of classesData) {
              if (classData.nextExam) {
                allExams.push({
                  id: classData.id,
                  title: 'Class Exam',
                  class: `${classData.name} ${classData.section || ''}`,
                  subject: classData.subject || 'General',
                  date: classData.nextExam.date || new Date().toISOString().split('T')[0],
                  mode: 'In Person',
                  status: 'Upcoming'
                });
              }
            }
            if (allExams.length > 0) {
              setExams(allExams);
              return;
            }
          }
        }
      }
      
      // If all API attempts fail, use empty array
      setExams([]);
    } catch (error) {
      console.error('Error fetching exams:', error);
      setExams([]);
    }
  };

  const fetchAttendanceData = async (): Promise<{teacherAttendance: number, classAttendance: ClassAttendance[]}> => {
    try {
      // First, try to get the teacherId from state
      const currentTeacherId = teacherId || "teacher123"; // Use stored teacherId or fallback
      
      // Try to fetch teacher's attendance summary
      let teacherAttendanceValue = 97; // Default to a reasonable value
      try {
        const summaryResponse = await fetch(`/api/teachers/${currentTeacherId}/attendance/summary`, {
          credentials: 'include'
        });
        
        if (summaryResponse.ok) {
          const summaryData = await summaryResponse.json();
          if (summaryData && typeof summaryData.percentage !== 'undefined') {
            // Remove % sign if present and convert to number
            teacherAttendanceValue = typeof summaryData.percentage === 'string' 
              ? Number(summaryData.percentage.replace('%', '')) 
              : Number(summaryData.percentage);
          }
        }
      } catch (error) {
        console.error("Error fetching teacher attendance:", error);
      }
      
      // Try to fetch classes taught by this teacher
      let classes = [];
      try {
        const classesResponse = await fetch(`/api/teachers/${currentTeacherId}/classes`, {
          credentials: 'include'
        });
        
        if (classesResponse.ok) {
          const classesData = await classesResponse.json();
          classes = Array.isArray(classesData) 
            ? classesData 
            : (classesData?.classes || []);
        }
      } catch (error) {
        console.error("Error fetching teacher's classes:", error);
      }
      
      // If no classes were found from the API, use fallback classes
      if (classes.length === 0) {
        classes = [
          { id: "class1", name: "Mathematics", section: "Section A" },
          { id: "class2", name: "Physics", section: "Section B" },
          { id: "class3", name: "Chemistry", section: "Section C" }
        ];
      }
      
      // For each class, fetch attendance data
      const attendancePromises = classes.map(async (classInfo: any) => {
        try {
          const classId = classInfo.id || classInfo.classId;
          if (!classId) return null;
          
          const attendanceResponse = await fetch(`/api/classes/${classId}/attendance`, {
            credentials: 'include'
          });
          
          if (attendanceResponse.ok) {
            const attendanceData = await attendanceResponse.json();
            
            // Convert percentage to number, ensuring it's a proper number
            let percentageValue = 0;
            if (typeof attendanceData?.percentage !== 'undefined') {
              // Handle different formats that might come from the API
              percentageValue = typeof attendanceData.percentage === 'string'
                ? Number(attendanceData.percentage.replace('%', ''))
                : Number(attendanceData.percentage);
            }
            
            return {
              id: classId,
              name: classInfo.name || classInfo.className || "Unnamed Class",
              sectionName: classInfo.section || classInfo.sectionName || "No Section",
              percentage: isNaN(percentageValue) ? 0 : percentageValue
            };
          }
        } catch (error) {
          console.error(`Error fetching attendance for class ${classInfo.id}:`, error);
        }
        return null;
      });
      
      const attendanceResults = await Promise.all(attendancePromises);
      let validAttendance = attendanceResults.filter(item => item !== null) as ClassAttendance[];
      
      // Use fallback data if no valid attendance data was found
      if (validAttendance.length === 0) {
        validAttendance = [
          { id: "class1", name: "Mathematics", sectionName: "Section A", percentage: 95 },
          { id: "class2", name: "Physics", sectionName: "Section B", percentage: 88 },
          { id: "class3", name: "Chemistry", sectionName: "Section C", percentage: 92 }
        ];
      }
      
      return {
        teacherAttendance: teacherAttendanceValue,
        classAttendance: validAttendance
      };
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      return {
        teacherAttendance: 97,
        classAttendance: [
          { id: "class1", name: "Mathematics", sectionName: "Section A", percentage: 95 },
          { id: "class2", name: "Physics", sectionName: "Section B", percentage: 88 },
          { id: "class3", name: "Chemistry", sectionName: "Section C", percentage: 92 }
        ]
      };
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'student':
        return '👨‍🎓';
      case 'schedule':
        return '🕒';
      case 'attendance':
        return '✅';
      default:
        return '📝';
    }
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
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow-sm flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
            <p className="text-gray-500">{teacherName}</p>
          </div>
          <div className="flex items-center">
            <div className="bg-gray-100 rounded-full px-4 py-2 mr-4">
              <span className="font-medium">{credits} Credits</span>
            </div>
            <LogoutButton />
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Notifications</h2>
          <div className="space-y-4">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-4 border-b last:border-0"
                  onClick={() => {
                    if (!notification.isRead) {
                      markNotificationsAsRead([notification.id]);
                    }
                  }}
                >
                  <div className="flex items-start">
                    <div className="mr-4 mt-1 text-2xl">
                      {getNotificationIcon(notification.notificationType)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium">{notification.title}</h3>
                        <span className="text-sm text-gray-500">
                          {getTimeAgo(notification.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-600">"{notification.message}"</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No notifications</p>
            )}
          </div>
        </div>

        {/* Attendance Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Attendance</h2>
            <Link href="/t/attendance" className="text-blue-600 hover:text-blue-900">
              View Detailed Attendance
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Your Attendance - Circle */}
            <div>
              <h3 className="text-lg font-medium mb-4">Your Attendance</h3>
              <div className="flex justify-center">
                <div className="relative w-40 h-40">
                  <div className="w-40 h-40 rounded-full border-8 border-yellow-200 flex items-center justify-center">
                    <span className="text-3xl font-bold">{teacherAttendance}%</span>
                  </div>
                  <svg className="absolute top-0 left-0 w-40 h-40 -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="72"
                      fill="transparent"
                      stroke="#FFD54F"
                      strokeWidth="16"
                      strokeDasharray={`${teacherAttendance * 4.52} 452`}
                    />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Students Attendance - Bars */}
            <div>
              <h3 className="text-lg font-medium mb-4">Class Attendance</h3>
              {classAttendance.length > 0 ? (
                <div className="space-y-5">
                  {classAttendance.map((classItem) => (
                    <div key={classItem.id}>
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-sm font-medium">{classItem.name}</p>
                        <p className="text-sm font-medium">{classItem.percentage}%</p>
                      </div>
                      <div className="flex items-center mb-2">
                        <p className="text-xs text-gray-500 w-20">Section: {classItem.sectionName}</p>
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${
                              classItem.percentage > 90 ? 'bg-green-600' :
                              classItem.percentage > 80 ? 'bg-blue-500' :
                              classItem.percentage > 70 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${classItem.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No class attendance data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Assignments */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Assignments</h2>
            <Link href="/t/assignments" className="text-blue-600 hover:text-blue-900">
              View All Classes
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">Title</th>
                  <th className="text-left py-3">Class</th>
                  <th className="text-left py-3">Subject</th>
                  <th className="text-left py-3">Due Date</th>
                  <th className="text-left py-3">Submissions</th>
                  <th className="text-left py-3">Status</th>
                  <th className="text-left py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {assignments.length > 0 ? (
                  assignments.map((assignment) => (
                    <tr key={assignment.id} className="border-b hover:bg-gray-50">
                      <td className="py-3">{assignment.title}</td>
                      <td className="py-3">{assignment.class}</td>
                      <td className="py-3">{assignment.subject}</td>
                      <td className="py-3">{assignment.dueDate}</td>
                      <td className="py-3">{assignment.submissions}</td>
                      <td className="py-3">{assignment.status}</td>
                      <td className="py-3">
                        <Link 
                          href={`/t/classes/${assignment.id}/assignments`} 
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-gray-500">
                      No assignments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Exams */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Upcoming Exams</h2>
            <Link href="/t/exams" className="text-blue-600 hover:text-blue-900">
              View All Exams
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">Title</th>
                  <th className="text-left py-3">Class</th>
                  <th className="text-left py-3">Subject</th>
                  <th className="text-left py-3">Date</th>
                  <th className="text-left py-3">Mode</th>
                  <th className="text-left py-3">Status</th>
                  <th className="text-left py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {exams.length > 0 ? (
                  exams.map((exam) => (
                    <tr key={exam.id} className="border-b hover:bg-gray-50">
                      <td className="py-3">{exam.title}</td>
                      <td className="py-3">{exam.class}</td>
                      <td className="py-3">{exam.subject}</td>
                      <td className="py-3">{exam.date}</td>
                      <td className="py-3">{exam.mode}</td>
                      <td className="py-3">{exam.status}</td>
                      <td className="py-3">
                        <Link 
                          href={`/t/classes/${exam.id}/exams`} 
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-gray-500">
                      No exams found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}