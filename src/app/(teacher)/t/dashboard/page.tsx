"use client";
import React, {useEffect, useState} from 'react';
import Link from "next/link";
import {LogoutButton} from "@/components/auth/logout-button";
import Loader from '@/components/ui/Loader';
import axios from "axios";

interface Notification {
  id: string;
  title: string;
  message: string;
  notificationType: string;
  isRead: boolean;
  replyText?: string;
  createdAt: string;
  replyExists: boolean;
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
  const [teacherAttendance, setTeacherAttendance] = useState(97); // Default non-zero value to match UI
  const [classAttendance, setClassAttendance] = useState<ClassAttendance[]>([]);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [classSectionId, setClassSectionId] = useState<string | null>(null);
  const [replyInputs, setReplyInputs] = useState<{ [key: string]: string }>({});

  let user: { classSectionId?: string } | null = null;
  let classId: string | undefined = undefined;

  if (typeof window !== "undefined") {
    const userString = localStorage.getItem("user");
    user = userString ? JSON.parse(userString) : null;
    classId = user?.classSectionId;
  }

  useEffect(() => {
    const getUserData = () => {
      if (typeof window !== 'undefined') {
        const userData = localStorage.getItem('user');
        if (userData) {
          try {
            const parsedUserData = JSON.parse(userData);
            console.log('Parsed user data:', parsedUserData);

            if (parsedUserData.name) {
              setTeacherName(parsedUserData.name);
            }

            // Set teacher ID immediately
            if (parsedUserData.teacherId) {
              console.log('Setting teacher ID from teacherId:', parsedUserData.teacherId);
              setTeacherId(parsedUserData.teacherId);
            } else {
              setTeacherId(null);
              console.log('No teacher ID found in user data');
            }

            setClassSectionId(parsedUserData.classSectionId);
          } catch (error) {
            console.error('Error parsing user data from localStorage:', error);
          }
        } else {
          console.log('No user data found in localStorage');
        }
      }
    };

    getUserData();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Wait for teacherId to be set
        if (!teacherId) {
          console.log('Waiting for teacher ID to be set...');
          return;
        }

        console.log('Loading data for teacher ID:', teacherId);
        // Execute all data fetching operations in parallel
        const [attendanceResult] = await Promise.allSettled([
          fetchAttendanceData()
        ]);

        // Handle attendance data
        if (attendanceResult.status === 'fulfilled') {
          setTeacherAttendance(attendanceResult.value.teacherAttendance);
          setClassAttendance(attendanceResult.value.classAttendance);
        }

        // Fetch other data types
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
  }, [teacherId]); // Add teacherId as dependency

  const fetchNotifications = async () => {
    try {
      if (!teacherId) {
        console.log('No teacherId available for fetching notifications');
        return;
      }

    /*  // First get the teacher's user ID
      const teacherResponse = await fetch(`/api/teachers/${teacherId}`, {
        credentials: 'include'
      });

      if (!teacherResponse.ok) {
        console.error('Failed to fetch teacher data:', await teacherResponse.json());
        return;
      }

      const teacherData = await teacherResponse.json();
      console.log('Fetched teacher data:', teacherData);

      if (!teacherData.userId) {
        console.error('No userId found in teacher data');
        return;
        console.log('Fetching notifications for userId:', teacherData.userId);
      }*/


      const response = await fetch(`/api/notifications?teacherId=${teacherId}`);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error fetching notifications:', errorData);
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      console.log('Received notifications:', data);
      const processedNotifications = data.map((notification: Notification) => ({
        ...notification,
        replyExists: !!notification.replyText?.trim() // Set true if replyText is a non-empty string
      }));

      setNotifications(processedNotifications);

    } catch (error) {
      console.error('Error in fetchNotifications:', error);
      setNotifications([]);
    }
  };


  const handleReplyChange = (notificationId: string, text: string) => {
    setNotifications(prevState => prevState.map(notification =>
      notification.id === notificationId
        ? {...notification, replyText: text}
        : notification
    ))
  };

  const handleReplySubmit = async (notificationId: string) => {
    // 1. Find the specific notification from the state
    const notification = notifications.find(n => n.id === notificationId);

    // 2. Check if the replyText exists and is not just empty spaces
    if (notification?.replyText?.trim()) {
      try {
        const response = await axios.put(
          '/api/notifications/saveReply',
          {
            notificationId,
            teacherId,
            replyText: notification.replyText // 3. Use the correct replyText from the notification object
          }
        );

        // 4. Correctly update state with the API response
        if (response.data && response.data.notifications) {
          const updatedNotifications = response.data.notifications.map((n: Notification) => ({
            ...n,
            replyExists: !!n.replyText?.trim()
          }));
          setNotifications(updatedNotifications);
        }
      } catch (err) {
        console.error("Failed to submit reply:", err);
        // Optionally, show an error message to the user
      }
    }
  };
  const markNotificationsAsRead = async (notificationIds: string[]) => {
    try {
      if (teacherId) {
        try {
          setNotifications(prevNotifications =>
            prevNotifications.map(notification => {
              if (notificationIds.includes(notification.id)) {
                return {
                  ...notification,
                  isRead: true
                }
              }

              return notification;
            })
          )

          const response = await axios.put(
            '/api/notifications',
            {
              notificationIds,
              teacherId
            }
          );

          // Update local state after successful API call
          console.log("Notification update response:", response.data);
          if (response.data && response.data.notifications) {
            const updatedNotificationsFromServer = response.data.notifications;

            const processedNotifications = updatedNotificationsFromServer.map((n: Notification) => ({
              ...n,
              replyExists: !!n.replyText?.trim()
            }));

            setNotifications(processedNotifications);
          }

        } catch (apiError) {
          console.error('API update error:', apiError);
        }
      }

    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const fetchAssignments = async () => {
    try {
      if (!teacherId) {
        console.log('No teacherId available for fetching assignments');
        return;
      }

      const response = await fetch(`/api/teachers/${teacherId}/dashboardDetail`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      if (data && data.assignments) {
        setAssignments(data.assignments);
      } else {
        setAssignments([]);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setAssignments([]);
    }
  };

  const fetchExams = async () => {
    try {
      if (!teacherId) {
        console.log('No teacherId available for fetching exams');
        return;
      }

      const response = await fetch(`/api/teachers/${teacherId}/dashboardDetail`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      if (data && data.exams) {
        setExams(data.exams);
      } else {
        setExams([]);
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
      setExams([]);
    }
  };

  const fetchAttendanceData = async (): Promise<{ teacherAttendance: number, classAttendance: ClassAttendance[] }> => {
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
          {id: "class1", name: "Mathematics", section: "Section A"},
          {id: "class2", name: "Physics", section: "Section B"},
          {id: "class3", name: "Chemistry", section: "Section C"}
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
          {id: "class1", name: "Mathematics", sectionName: "Section A", percentage: 95},
          {id: "class2", name: "Physics", sectionName: "Section B", percentage: 88},
          {id: "class3", name: "Chemistry", sectionName: "Section C", percentage: 92}
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
          {id: "class1", name: "Mathematics", sectionName: "Section A", percentage: 95},
          {id: "class2", name: "Physics", sectionName: "Section B", percentage: 88},
          {id: "class3", name: "Chemistry", sectionName: "Section C", percentage: 92}
        ]
      };
    }
  };

  const handleMarkSelectedAsRead = () => {

    if (notifications.length > 0) {

      markNotificationsAsRead(notifications.map(notification => notification.id));

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
        <Loader size='large'/>
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
            </div>
            <LogoutButton/>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          {/*<h2 className="text-xl font-semibold mb-4">Notifications</h2>*/}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Notifications</h2>
            {notifications.length > 0 && notifications.some(notification => !notification.isRead) && <button
							onClick={handleMarkSelectedAsRead}
							className="px-4 py-2 text-sm font-medium text-black bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
						>
							Mark all as Read ({notifications.length})
						</button>}


          </div>
          <div className="space-y-4">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div key={notification.id} className="p-4 border-b last:border-0">
                  <div className="flex items-start space-x-4">
                    {/* Checkbox */}

                    {/* Icon and Content */}
                    <div className="flex-1">
                      <div className="flex items-start">
                        <div className="mr-4 mt-1 text-2xl">
                          {getNotificationIcon(notification.notificationType)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <div className={"flex space-x-4"}>
                              <h3 id={`notification-title-${notification.id}`}
                                  className="font-medium">{notification.title}</h3>

                              <div className={"flex items-center space-x-2"}>
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 border-2"
                                  checked={notification.isRead}
                                  disabled={notification.isRead}
                                  onChange={() => markNotificationsAsRead([notification.id])}
                                  aria-labelledby={`notification-title-${notification.id}`}
                                />
                                <span className={""}>Mark as read</span>
                              </div>
                            </div>
                            <span className="text-sm text-gray-500">
                            {getTimeAgo(notification.createdAt)}
                        </span>
                          </div>
                          <p className="text-gray-600 mb-3">"{notification.message}"</p>

                          {notification.replyExists ? (
                            // If a reply IS saved, display it as text
                            <div className="mt-2 p-2 bg-gray-100 rounded-md">
                              <p className="text-sm font-medium text-gray-800">Your reply:</p>
                              <p className="text-sm text-gray-600">"{notification.replyText}"</p>
                            </div>
                          ) : (
                            // If NO reply is saved, show the input field and button
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                placeholder="Type your reply..."
                                value={notification.replyText || ''}
                                onChange={(e) => handleReplyChange(notification.id, e.target.value)}
                                className="flex-grow p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                              <button
                                onClick={() => handleReplySubmit(notification.id)}
                                disabled={!notification.replyText?.trim()} // Disable button if input is empty
                                className="px-4 py-2 text-sm font-medium text-white bg-gray-700 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                              >
                                Reply
                              </button>
                            </div>
                          )}

                        </div>
                      </div>
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
        {/*

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Attendance</h2>
            <Link href={"/t/attendance" as any} className="text-blue-600 hover:text-blue-900">
              View Detailed Attendance
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

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
                            className={`h-3 rounded-full ${classItem.percentage > 90 ? 'bg-green-600' :
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
            <Link href={"/t/classes/" as any} className="text-blue-600 hover:text-blue-900">
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
            <Link
              href={`/t/classes/${classId}/exams` as any}
              className="text-blue-600 hover:text-blue-900"
            >
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
                <th className="text-left py-3">Status</th>
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
                    <td className="py-3">{exam.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-gray-500">
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