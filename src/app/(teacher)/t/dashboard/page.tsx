"use client";
import React, { useEffect, useState, useRef } from 'react';
import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import Loader from '@/components/ui/Loader';
import axios from "axios";

// Interface definitions remain the same
interface Notification {
  id: string;
  title: string;
  message: string;
  notificationType: string;
  isRead: boolean;
  replyText?: string;
  createdAt: string;
  replyExists: boolean;
  studentId: string;
}

interface GroupedNotification {
  studentId: string;
  studentName: string;
  notifications: Notification[];
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

const ChatBubble: React.FC<{
  message: string;
  timestamp: string;
  isSender: boolean;
  primaryColor: string;
}> = ({ message, timestamp, isSender, primaryColor }) => {
  const bubbleStyles = isSender
    ? {
      backgroundColor: primaryColor,
      color: 'white',
      borderRadius: '1.25rem 1.25rem 0.25rem 1.25rem',
      alignSelf: 'flex-end',
    }
    : {
      backgroundColor: '#E5E7EB',
      color: '#1F2937',
      borderRadius: '1.25rem 1.25rem 1.25rem 0.25rem',
      alignSelf: 'flex-start',
    };

  return (
    <div
      className={`relative py-2 px-4 shadow-sm text-sm max-w-[80%]`}
      style={bubbleStyles}
    >
      <p className="pr-12" style={{ overflowWrap: 'break-word', wordWrap: 'break-word' }}>
        {message}
      </p>
      <span
        className={`absolute bottom-1 text-xs ${isSender ? 'right-2 text-white/75' : 'right-2 text-gray-500'
          }`}
      >
        {timestamp}
      </span>
    </div>
  );
};
export default function TeacherDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupedNotifications, setGroupedNotifications] = useState<GroupedNotification[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [teacherName, setTeacherName] = useState('John Mathew');
  const [teacherAttendance, setTeacherAttendance] = useState(97);
  const [classAttendance, setClassAttendance] = useState<ClassAttendance[]>([]);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [classSectionId, setClassSectionId] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState<string>('#3B82F6');

  const chatRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const hexToRgba = (hex: string, alpha: number = 1) => {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substr(0, 2), 16);
    const g = parseInt(cleanHex.substr(2, 2), 16);
    const b = parseInt(cleanHex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (teacherId) {
      // Set up the interval to refresh notifications every 10 seconds
      intervalId = setInterval(() => {
        fetchNotifications();
      }, 10000); // 10 seconds
    }

    // Clean up the interval when the component unmounts or teacherId changes
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [teacherId]);
  useEffect(() => {
    const temp = localStorage.getItem('primaryColor');
    if (temp) {
      setPrimaryColor(temp);
    } else {
      setPrimaryColor('#3B82F6');
    }
  }, []);

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
            if (parsedUserData.name) {
              setTeacherName(parsedUserData.name);
            }
            if (parsedUserData.teacherId) {
              setTeacherId(parsedUserData.teacherId);
            } else {
              setTeacherId(null);
            }
            setClassSectionId(parsedUserData.classSectionId);
          } catch (error) {
            console.error('Error parsing user data from localStorage:', error);
          }
        }
      }
    };

    getUserData();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        if (!teacherId) {
          return;
        }

        const [attendanceResult] = await Promise.allSettled([
          fetchAttendanceData()
        ]);

        if (attendanceResult.status === 'fulfilled') {
          setTeacherAttendance(attendanceResult.value.teacherAttendance);
          setClassAttendance(attendanceResult.value.classAttendance);
        }

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
  }, [teacherId]);

  useEffect(() => {
    expandedGroups.forEach(studentId => {
      const chatContainer = chatRefs.current[studentId];
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    });
  }, [groupedNotifications, expandedGroups]);

  const fetchNotifications = async () => {
    try {
      if (!teacherId) {
        return;
      }

      const response = await fetch(`/api/notifications?teacherId=${teacherId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();

      const grouped = data.reduce((acc: { [key: string]: GroupedNotification }, notification: Notification) => {
        const studentId = notification.studentId || "unknown";
        const studentName = notification.title.split(":")[0]?.trim() || "Unknown Student";

        if (!acc[studentId]) {
          acc[studentId] = {
            studentId,
            studentName,
            notifications: [],
          };
        }
        acc[studentId].notifications.push({
          ...notification,
          replyExists: !!notification.replyText?.trim(),
        });
        return acc;
      }, {});

      setGroupedNotifications(Object.values(grouped));
    } catch (error) {
      console.error('Error in fetchNotifications:', error);
      setGroupedNotifications([]);
    }
  };

  const handleReplyChange = (notificationId: string, text: string) => {
    setGroupedNotifications(prevState =>
      prevState.map(group => ({
        ...group,
        notifications: group.notifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, replyText: text }
            : notification
        )
      }))
    );
  };

  const handleReplySubmit = async (notificationId: string) => {
    let notificationToUpdate: Notification | undefined;
    groupedNotifications.forEach(group => {
      const found = group.notifications.find(n => n.id === notificationId);
      if (found) {
        notificationToUpdate = found;
      }
    });

    if (notificationToUpdate?.replyText?.trim()) {
      try {
        const response = await axios.put(
          '/api/notifications/saveReply',
          {
            notificationId,
            teacherId,
            replyText: notificationToUpdate.replyText
          }
        );

        if (response.data && response.data.notifications) {
          const updatedNotifications = response.data.notifications.map((n: Notification) => ({
            ...n,
            replyExists: !!n.replyText?.trim(),
          }));

          const grouped = updatedNotifications.reduce((acc: { [key: string]: GroupedNotification }, notification: Notification) => {
            const studentId = notification.studentId || "unknown";
            const studentName = notification.title.split(":")[0]?.trim() || "Unknown Student";
            if (!acc[studentId]) {
              acc[studentId] = { studentId, studentName, notifications: [] };
            }
            acc[studentId].notifications.push(notification);
            return acc;
          }, {});
          setGroupedNotifications(Object.values(grouped));
        }
      } catch (err) {
        console.error("Failed to submit reply:", err);
      }
    }
  };

  const markNotificationsAsRead = async (notificationIds: string[]) => {
    try {
      if (teacherId) {
        setGroupedNotifications(prevNotifications =>
          prevNotifications.map(group => ({
            ...group,
            notifications: group.notifications.map(notification =>
              notificationIds.includes(notification.id)
                ? { ...notification, isRead: true }
                : notification
            )
          }))
        );

        const response = await axios.put(
          '/api/notifications',
          {
            notificationIds,
            teacherId
          }
        );

        if (response.data && response.data.notifications) {
          const updatedNotificationsFromServer = response.data.notifications;

          const processedNotifications = updatedNotificationsFromServer.map((n: Notification) => ({
            ...n,
            replyExists: !!n.replyText?.trim(),
          }));

          const grouped = processedNotifications.reduce((acc: { [key: string]: GroupedNotification }, notification: Notification) => {
            const studentId = notification.studentId || "unknown";
            const studentName = notification.title.split(":")[0]?.trim() || "Unknown Student";
            if (!acc[studentId]) {
              acc[studentId] = { studentId, studentName, notifications: [] };
            }
            acc[studentId].notifications.push(notification);
            return acc;
          }, {});

          setGroupedNotifications(Object.values(grouped));
        }

      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const handleMarkAllAsRead = () => {
    const allUnreadIds: string[] = groupedNotifications
      .flatMap(group => group.notifications)
      .filter(notification => !notification.isRead)
      .map(notification => notification.id);

    if (allUnreadIds.length > 0) {
      markNotificationsAsRead(allUnreadIds);
    }
  };

  const fetchAssignments = async () => {
    try {
      if (!teacherId) {
        return;
      }
      const response = await fetch(`/api/teachers/${teacherId}/dashboardDetail`, { credentials: 'include' });
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
        return;
      }
      const response = await fetch(`/api/teachers/${teacherId}/dashboardDetail`, { credentials: 'include' });
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
      const currentTeacherId = teacherId || "teacher123";
      let teacherAttendanceValue = 97;
      try {
        const summaryResponse = await fetch(`/api/teachers/${currentTeacherId}/attendance/summary`, { credentials: 'include' });
        if (summaryResponse.ok) {
          const summaryData = await summaryResponse.json();
          if (summaryData && typeof summaryData.percentage !== 'undefined') {
            teacherAttendanceValue = typeof summaryData.percentage === 'string'
              ? Number(summaryData.percentage.replace('%', ''))
              : Number(summaryData.percentage);
          }
        }
      } catch (error) {
        console.error("Error fetching teacher attendance:", error);
      }

      let classes = [];
      try {
        const classesResponse = await fetch(`/api/teachers/${currentTeacherId}/classes`, { credentials: 'include' });
        if (classesResponse.ok) {
          const classesData = await classesResponse.json();
          classes = Array.isArray(classesData) ? classesData : (classesData?.classes || []);
        }
      } catch (error) {
        console.error("Error fetching teacher's classes:", error);
      }

      if (classes.length === 0) {
        classes = [
          { id: "class1", name: "Mathematics", section: "Section A" },
          { id: "class2", name: "Physics", section: "Section B" },
          { id: "class3", name: "Chemistry", section: "Section C" }
        ];
      }

      const attendancePromises = classes.map(async (classInfo: any) => {
        try {
          const classId = classInfo.id || classInfo.classId;
          if (!classId) return null;
          const attendanceResponse = await fetch(`/api/classes/${classId}/attendance`, { credentials: 'include' });
          if (attendanceResponse.ok) {
            const attendanceData = await attendanceResponse.json();
            let percentageValue = 0;
            if (typeof attendanceData?.percentage !== 'undefined') {
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

  const toggleGroup = (studentId: string) => {
    setExpandedGroups(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
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
        <Loader size='large' />
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
        <div className="bg-white p-6 rounded-lg shadow-sm flex justify-between items-center border-t-4" style={{ borderTopColor: primaryColor }}>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: primaryColor }}>Teacher Dashboard</h1>
            <p className="text-gray-500">{teacherName}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4" style={{ borderLeftColor: primaryColor }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold" style={{ color: primaryColor }}>Notifications</h2>
            {groupedNotifications.length > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{
                  backgroundColor: primaryColor,
                  '--tw-ring-color': primaryColor
                } as React.CSSProperties}
              >
                Mark all as Read
              </button>
            )}
          </div>
          <div className="space-y-4">
            {groupedNotifications.length > 0 ? (
              groupedNotifications.map((group) => (
                <div key={group.studentId} className="border-b last:border-0 pb-4">
                  <button
                    onClick={() => toggleGroup(group.studentId)}
                    className="w-full text-left p-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors duration-200 rounded-md"
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-2xl">👨‍🎓</span>
                      <h3 className="font-medium text-gray-800">{group.studentName}</h3>
                      <span className="text-sm text-gray-500">
                        ({group.notifications.filter(n => !n.isRead).length} unread)
                      </span>
                    </div>
                    <span>
                      {expandedGroups.includes(group.studentId) ? '▲' : '▼'}
                    </span>
                  </button>
                  {expandedGroups.includes(group.studentId) && (
                    <div
                      ref={(el) => (chatRefs.current[group.studentId] = el)}
                      className="p-4 space-y-4 flex flex-col items-start w-full max-h-96 overflow-y-auto"
                    >
                      {group.notifications.slice().reverse().map((notification) => (
                        <React.Fragment key={notification.id}>
                          <ChatBubble
                            message={notification.message}
                            timestamp={getTimeAgo(notification.createdAt)}
                            isSender={false}
                            primaryColor={primaryColor}
                          />
                          {notification.replyExists ? (
                            <div className="w-full flex justify-end">
                              <ChatBubble
                                message={notification.replyText || ''}
                                timestamp={getTimeAgo(notification.createdAt)}
                                isSender={true}
                                primaryColor={primaryColor}
                              />
                            </div>
                          ) : (
                            <div className="w-full flex justify-end mt-2">
                              <div className="flex items-center space-x-2 w-full sm:max-w-[50%] lg:max-w-[80%]">
                                <input
                                  type="text"
                                  placeholder="Type your reply..."
                                  value={notification.replyText || ''}
                                  onChange={(e) => handleReplyChange(notification.id, e.target.value)}
                                  className="flex-grow p-2 border border-gray-300 rounded-md shadow-sm sm:text-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
                                  style={{
                                    '--tw-ring-color': primaryColor
                                  } as React.CSSProperties}
                                  onFocus={(e) => {
                                    e.target.style.borderColor = primaryColor;
                                    e.target.style.boxShadow = `0 0 0 2px ${hexToRgba(primaryColor, 0.25)}`;
                                  }}
                                  onBlur={(e) => {
                                    e.target.style.borderColor = '#D1D5DB';
                                    e.target.style.boxShadow = 'none';
                                  }}
                                />
                                <button
                                  onClick={() => handleReplySubmit(notification.id)}
                                  disabled={!notification.replyText?.trim()}
                                  className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200"
                                  style={{
                                    backgroundColor: !notification.replyText?.trim() ? '#9CA3AF' : primaryColor,
                                    boxShadow: !notification.replyText?.trim() ? 'none' : `0 2px 4px ${hexToRgba(primaryColor, 0.3)}`
                                  }}
                                >
                                  Reply
                                </button>
                              </div>
                            </div>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No notifications</p>
            )}
          </div>
        </div>

        {/* Recent Assignments */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4" style={{ borderLeftColor: primaryColor }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold" style={{ color: primaryColor }}>Recent Assignments</h2>
            <Link href={"/t/classes/" as any} className="hover:opacity-80" style={{ color: primaryColor }}>
              View All Classes
            </Link>
          </div>
          {/* Desktop Table View */}
          <div className="overflow-x-auto hidden md:block">
            <table className="min-w-full">
              <thead>
                <tr className="border-b" style={{ borderBottomColor: primaryColor }}>
                  <th className="text-left py-3 font-semibold" style={{ color: primaryColor }}>Title</th>
                  <th className="text-left py-3 font-semibold" style={{ color: primaryColor }}>Class</th>
                  <th className="text-left py-3 font-semibold" style={{ color: primaryColor }}>Subject</th>
                  <th className="text-left py-3 font-semibold" style={{ color: primaryColor }}>Due Date</th>
                  <th className="text-left py-3 font-semibold" style={{ color: primaryColor }}>Submissions</th>
                  <th className="text-left py-3 font-semibold" style={{ color: primaryColor }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {assignments.length > 0 ? (
                  assignments.map((assignment) => (
                    <tr key={assignment.id} className="border-b hover:bg-gray-50 transition-colors duration-200"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = hexToRgba(primaryColor, 0.1);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '';
                      }}>
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
          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {assignments.length > 0 ? (
              assignments.map((assignment) => (
                <div key={assignment.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-lg" style={{ color: primaryColor }}>{assignment.title}</h4>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${assignment.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {assignment.status}
                    </span>
                  </div>
                  <div className="text-gray-600 space-y-1 text-sm">
                    <p><span className="font-medium">Class:</span> {assignment.class}</p>
                    <p><span className="font-medium">Subject:</span> {assignment.subject}</p>
                    <p><span className="font-medium">Due Date:</span> {assignment.dueDate}</p>
                    <p><span className="font-medium">Submissions:</span> {assignment.submissions}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-gray-500">
                No assignments found
              </p>
            )}
          </div>
        </div>

        {/* Upcoming Exams */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4" style={{ borderLeftColor: primaryColor }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold" style={{ color: primaryColor }}>Upcoming Exams</h2>
            <Link
              href={`/t/classes/${classId}/exams` as any}
              className="hover:opacity-80"
              style={{ color: primaryColor }}
            >
              View All Exams
            </Link>
          </div>
          {/* Desktop Table View */}
          <div className="overflow-x-auto hidden md:block">
            <table className="min-w-full">
              <thead>
                <tr className="border-b" style={{ borderBottomColor: primaryColor }}>
                  <th className="text-left py-3 font-semibold" style={{ color: primaryColor }}>Title</th>
                  <th className="text-left py-3 font-semibold" style={{ color: primaryColor }}>Class</th>
                  <th className="text-left py-3 font-semibold" style={{ color: primaryColor }}>Subject</th>
                  <th className="text-left py-3 font-semibold" style={{ color: primaryColor }}>Date</th>
                  <th className="text-left py-3 font-semibold" style={{ color: primaryColor }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {exams.length > 0 ? (
                  exams.map((exam) => (
                    <tr key={exam.id} className="border-b hover:bg-gray-50 transition-colors duration-200"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = hexToRgba(primaryColor, 0.1);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '';
                      }}>
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
          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {exams.length > 0 ? (
              exams.map((exam) => (
                <div key={exam.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-lg" style={{ color: primaryColor }}>{exam.title}</h4>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${exam.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                      {exam.status}
                    </span>
                  </div>
                  <div className="text-gray-600 space-y-1 text-sm">
                    <p><span className="font-medium">Class:</span> {exam.class}</p>
                    <p><span className="font-medium">Subject:</span> {exam.subject}</p>
                    <p><span className="font-medium">Date:</span> {exam.date}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-gray-500">
                No exams found
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}