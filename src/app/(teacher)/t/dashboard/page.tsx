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
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchNotifications(),
          fetchAssignments(),
          fetchExams(),
          fetchAttendanceData()
        ]);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data. Please refresh the page.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Use fallback data for notifications
      setNotifications([]);
    }
  };

  const markNotificationsAsRead = async (notificationIds: string[]) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ notificationIds })
      });

      if (!response.ok) {
        throw new Error('Failed to mark notifications as read');
      }

      // Update local state
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
    // Fallback data for now
    setAssignments([
      {
        id: '1',
        title: 'Math Assignment 1',
        class: 'Class 10',
        subject: 'Mathematics',
        dueDate: '2024-04-25',
        submissions: '15/30',
        status: 'In Progress'
      }
    ]);
  };

  const fetchExams = async () => {
    // Fallback data for now
    setExams([
      {
        id: '1',
        title: 'Mid-term Exam',
        class: 'Class 10',
        subject: 'Mathematics',
        date: '2024-05-01',
        mode: 'Online',
        status: 'Upcoming'
      }
    ]);
  };

  const fetchAttendanceData = async () => {
    // Using fallback data for now
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
          <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
          <LogoutButton />
        </div>

        {/* Notifications Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Notifications</h2>
          <div className="space-y-4">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border ${
                    notification.isRead ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                  }`}
                  onClick={() => {
                    if (!notification.isRead) {
                      markNotificationsAsRead([notification.id]);
                    }
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{notification.title}</h3>
                      <p className="text-gray-600">{notification.message}</p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">No new notifications</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/t/classes" className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-semibold">Classes</h3>
            <p className="text-gray-600">View and manage your classes</p>
          </Link>
          <Link href="/t/assignments" className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-semibold">Assignments</h3>
            <p className="text-gray-600">Create and grade assignments</p>
          </Link>
          <Link href="/t/exams" className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-semibold">Exams</h3>
            <p className="text-gray-600">Manage and monitor exams</p>
          </Link>
          <Link href="/t/attendance" className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-semibold">Attendance</h3>
            <p className="text-gray-600">Track student attendance</p>
          </Link>
        </div>

        {/* Recent Assignments */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Recent Assignments</h2>
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
                {assignments.map((assignment) => (
                  <tr key={assignment.id} className="border-b hover:bg-gray-50">
                    <td className="py-3">{assignment.title}</td>
                    <td className="py-3">{assignment.class}</td>
                    <td className="py-3">{assignment.subject}</td>
                    <td className="py-3">{assignment.dueDate}</td>
                    <td className="py-3">{assignment.submissions}</td>
                    <td className="py-3">{assignment.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Exams */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Upcoming Exams</h2>
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
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => (
                  <tr key={exam.id} className="border-b hover:bg-gray-50">
                    <td className="py-3">{exam.title}</td>
                    <td className="py-3">{exam.class}</td>
                    <td className="py-3">{exam.subject}</td>
                    <td className="py-3">{exam.date}</td>
                    <td className="py-3">{exam.mode}</td>
                    <td className="py-3">{exam.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}