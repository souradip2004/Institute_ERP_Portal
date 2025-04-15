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
  student: StudentData | null;
  teacher: TeacherData | null;
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
  createdAt: string;
  isImportant: boolean;
}

interface ClassInfo {
  id: string;
  subject: string;
  teacherName: string;
  todaySchedule: {
    startTime: string;
    endTime: string;
    roomNumber: string;
    isPresent: boolean;
  } | null;
  attendance: number;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);

  useEffect(() => {
    function loadDashboardData() {
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
        
        // Check if user has student data
        if (!user.student) {
          setNeedsProfileSetup(true);
          throw new Error('Student profile data is missing. Please contact an administrator to complete your profile setup.');
        }
        
        // Set student info from actual data
        setStudentData({
          id: user.student.id,
          name: user.name || '',
          rollNumber: user.student.studentRoll,
          section: user.student.batch?.batchName || 'Not Assigned',
          year: `Year ${user.student.currentYear || 1}`,
          department: user.student.department?.name || 'Not Assigned'
        });
        
        // We'll still use mock announcements for now
        // In a real app, you would fetch these from an API
        setAnnouncements([
          {
            id: '1',
            title: 'Physics Assignment Uploaded',
            content: 'Ravi Kumar has uploaded a new assignment for physics.',
            createdAt: '2 min ago',
            isImportant: false
          },
          {
            id: '2',
            title: 'Doubt Resolved',
            content: 'Your recent doubt was resolved by admin.',
            createdAt: '8 min ago',
            isImportant: false
          },
          {
            id: '3',
            title: 'Attendance Low',
            content: 'Physics Assignment is low: Be consistent to maintain your attendance',
            createdAt: 'Just now',
            isImportant: true
          }
        ]);
        
        // We'll still use mock classes for now
        // In a real app, you would fetch these from an API using the student's enrollments
        setClasses([
          {
            id: 'class1',
            subject: 'Physics',
            teacherName: 'Devon Lane',
            todaySchedule: {
              startTime: '9:00 AM',
              endTime: '10:30 AM',
              roomNumber: '213-A',
              isPresent: true
            },
            attendance: 78
          },
          {
            id: 'class2',
            subject: 'Chemistry',
            teacherName: 'Kristin Watson',
            todaySchedule: {
              startTime: '9:00 AM',
              endTime: '10:30 AM',
              roomNumber: '213-A',
              isPresent: true
            },
            attendance: 78
          },
          {
            id: 'class3',
            subject: 'English',
            teacherName: 'Jenny Wilson',
            todaySchedule: null,
            attendance: 78
          },
          {
            id: 'class4',
            subject: 'Mathematics',
            teacherName: 'Kathryn Murphy',
            todaySchedule: null,
            attendance: 78
          }
        ]);
        
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    
    // Use setTimeout to ensure client-side execution (localStorage is only available in browser)
    const timer = setTimeout(() => {
      loadDashboardData();
    }, 0);
    
    return () => clearTimeout(timer);
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
          
          {studentData && (
            <div className="bg-white p-4 rounded shadow">
              <h2 className="text-xl font-semibold mb-2">Student Profile</h2>
              <div className="overflow-auto max-h-40 bg-gray-100 p-4 rounded">
                <pre>{JSON.stringify(studentData, null, 2)}</pre>
              </div>
            </div>
          )}
          
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Dashboard Data (JSON)</h2>
            <div className="overflow-auto max-h-96 bg-gray-100 p-4 rounded">
              <pre>{JSON.stringify({
                announcements,
                classes
              }, null, 2)}</pre>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded shadow">
            <p className="text-sm text-gray-500">
              <strong>Note:</strong> Student data is now pulled from your actual user profile.
              Announcements and classes are still using mock data until those APIs are connected.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}