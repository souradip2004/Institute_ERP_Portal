'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Loader from '@/components/ui/Loader';

interface StudentAttendance {
  userId: string;
  studentId: string;
  name: string;
  rollNo: string;
  attendancePercentage: number;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | null;
  totalSessions?: number;
  presentSessions?: number;
  lateSessions?: number;
}

interface AttendanceSessionDetails {
  id: string;
  classSection: { id: string; name: string };
  course: { id: string; name: string; code: string };
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  presentCount: number;
  absentCount: number;
  students: StudentAttendance[];
}

interface AttendanceSessionWindowProps {
  sessionId: string;
  institutionId: string;
}

export default function AttendanceSessionWindow({ sessionId, institutionId }: AttendanceSessionWindowProps) {
  const [attendance, setAttendance] = useState<Record<string, 'PRESENT' | 'LATE' | null>>({});
  const [session, setSession] = useState<AttendanceSessionDetails | null>(null);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [creditsData, setCreditsData] = useState<any>(null);
  const router = useRouter();

  const [view, setView] = useState<'all' | 'PRESENT' | 'ABSENT' | 'LATE'>('all');

  useEffect(() => {
    if (localStorage.getItem("user")) {
      const getData = async () => {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        try {
          const result = await fetch(`/api/credits/${institutionId}?month=${month}&year=${year}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
          });
          if (result.ok) {
            const res = await result.json();
            setCreditsData(res);
          }
        } catch (err) {
          console.error("Failed to fetch credits data:", err);
        }
      };
      getData();
    }
  }, [institutionId]);

  const updateCoins = async () => {
    if (!creditsData) return;
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    try {
      const result = await fetch(`/api/credits/${institutionId}?month=${month}&year=${year}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attendanceCreditsBalance: creditsData.attendanceCreditsBalance + 2,
          total: creditsData.total + 2
        })
      });
      if (!result.ok) {
        alert(`Failed to update credits: ${result.status}`);
      }
    } catch (err) {
      console.error("Failed to update coins:", err);
      alert("Failed to update coins.");
    }
  };

  useEffect(() => {
    const storedTeacherId = localStorage.getItem('teacherId');
    if (storedTeacherId) {
      setTeacherId(storedTeacherId);
    } else {
      setError('Teacher ID not found');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!teacherId) return;

    const fetchSession = async () => {
      try {
        const response = await axios.get<AttendanceSessionDetails>(
          `/api/teachers/${teacherId}/attendance/session/${sessionId}`
        );
        const sessionData = response.data;

        const studentMap = new Map<string, StudentAttendance>();
        sessionData.students.forEach(student => {
          if (!studentMap.has(student.studentId)) {
            studentMap.set(student.studentId, student);
          }
        });
        const uniqueStudents = Array.from(studentMap.values());

        const studentsWithRealAttendance = uniqueStudents.map(student => {
          if (student.attendancePercentage < 0) {
            return { ...student, attendancePercentage: 0 };
          }
          return student;
        });

        setSession({
          ...sessionData,
          students: studentsWithRealAttendance,
        });

        const initialAttendance: Record<string, 'PRESENT' | 'LATE' | null> = {};
        studentsWithRealAttendance.forEach((student) => {
          // Absent status will be represented as null
          initialAttendance[student.studentId] = student.status === 'ABSENT' ? null : student.status;
        });
        setAttendance(initialAttendance);
        setLoading(false);
      } catch (err) {
        const errorMessage = axios.isAxiosError(err)
          ? err.response?.data?.error || 'Failed to load session'
          : 'Failed to load session';
        setError(errorMessage);
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId, teacherId]);

  const handleAttendanceChange = (studentId: string, status: 'PRESENT' | 'LATE') => {
    setAttendance(prev => {
      const currentStatus = prev[studentId];
      const newStatus = currentStatus === status ? null : status;
      return { ...prev, [studentId]: newStatus };
    });
  };

  const markAll = (status: 'PRESENT' | 'LATE' | null) => {
    const updatedAttendance: Record<string, 'PRESENT' | 'LATE' | null> = {};
    session?.students.forEach((student) => {
      updatedAttendance[student.studentId] = status;
    });
    setAttendance(updatedAttendance);
  };

  const saveAttendance = async () => {
    if (!teacherId) {
      setError('Teacher ID not found');
      return;
    }
    try {
      updateCoins();
      setSaving(true);
      const attendanceData = Object.entries(attendance).map(([studentId, status]) => ({
        studentId,
        status: status || 'ABSENT', // If status is null, it's considered 'ABSENT'
      }));

      const response = await axios.post(`/api/teachers/${teacherId}/attendance/save`, {
        sessionId,
        teacherId,
        attendanceData,
      });
      console.log('Response:', response.data);
      setSession((prev) => (prev ? { ...prev, status: 'COMPLETED' } : prev));
      alert('Attendance saved successfully');
      router.back();
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.error || 'Failed to save attendance'
        : 'Failed to save attendance';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = session?.students.filter(student => {
    if (view === 'all') return true;
    if (view === 'ABSENT') {
      return attendance[student.studentId] === null;
    }
    return attendance[student.studentId] === view;
  }) || [];

  const presentCount = Object.values(attendance).filter((status) => status === 'PRESENT').length;
  const absentCount = Object.values(attendance).filter((status) => status === null).length;
  const lateCount = Object.values(attendance).filter((status) => status === 'LATE').length;
  const totalStudents = session?.students.length || 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader size="large" message="Loading attendance data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg max-w-7xl mx-auto my-8 shadow-md">
        <p className="font-bold text-lg">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="bg-indigo-700 text-white p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {session?.classSection.name} - {session?.course.name} ({session?.course.code})
              </h2>
              <p className="text-indigo-200 mt-2 text-sm sm:text-base">
                {session?.date ? new Date(session.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'N/A'}
                {session?.startTime && session?.endTime ? ` · ${new Date(session.startTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })} - ${new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ease-in-out ${session?.status === 'COMPLETED' ? 'bg-green-500 text-white' :
                  session?.status === 'ACTIVE' ? 'bg-blue-500 text-white' :
                    'bg-gray-200 text-gray-800'
                  }`}>
                {session?.status}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 sm:p-5 text-center transition-transform hover:scale-105 shadow-sm">
              <p className="text-sm sm:text-base text-gray-500">Total Students</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1">{totalStudents}</p>
            </div>
            <div className="bg-green-50 rounded-lg border border-green-200 p-4 sm:p-5 text-center transition-transform hover:scale-105 shadow-sm">
              <p className="text-sm sm:text-base text-green-600">Present</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-700 mt-1">{presentCount}</p>
              <p className="text-xs text-green-500 mt-1">{totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0}%</p>
            </div>
            <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4 sm:p-5 text-center transition-transform hover:scale-105 shadow-sm">
              <p className="text-sm sm:text-base text-yellow-600">Late</p>
              <p className="text-2xl sm:text-3xl font-bold text-yellow-700 mt-1">{lateCount}</p>
              <p className="text-xs text-yellow-500 mt-1">{totalStudents > 0 ? Math.round((lateCount / totalStudents) * 100) : 0}%</p>
            </div>
            <div className="bg-red-50 rounded-lg border border-red-200 p-4 sm:p-5 text-center transition-transform hover:scale-105 shadow-sm">
              <p className="text-sm sm:text-base text-red-600">Absent</p>
              <p className="text-2xl sm:text-3xl font-bold text-red-700 mt-1">{absentCount}</p>
              <p className="text-xs text-red-500 mt-1">{totalStudents > 0 ? Math.round((absentCount / totalStudents) * 100) : 0}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={() => setView('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'all' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              All Students ({totalStudents})
            </button>
            <button
              onClick={() => setView('PRESENT')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'PRESENT' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Present ({presentCount})
            </button>
            <button
              onClick={() => setView('LATE')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'LATE' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Late ({lateCount})
            </button>
            <button
              onClick={() => setView('ABSENT')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'ABSENT' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Absent ({absentCount})
            </button>
          </div>
          <div className="flex gap-2 flex-wrap md:justify-end">
            <button
              onClick={() => markAll('PRESENT')}
              className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={saving || session?.status === 'COMPLETED'}
            >
              Mark All Present
            </button>
            <button
              onClick={() => markAll('LATE')}
              className="bg-yellow-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={saving || session?.status === 'COMPLETED'}
            >
              Mark All Late
            </button>
            <button
              onClick={() => markAll(null)}
              className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={saving || session?.status === 'COMPLETED'}
            >
              Mark All Absent
            </button>
            <button
              onClick={saveAttendance}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              disabled={saving || session?.status === 'COMPLETED'}
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : 'Save Attendance'}
            </button>
          </div>
        </div>

        {/* Mobile view - card layout */}
        <div className="lg:hidden p-4 sm:p-6">
          {filteredStudents.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-lg">
              No students found for the selected filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredStudents.map((student) => (
                <div key={student.studentId} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm transition-transform hover:scale-[1.01] duration-150 ease-in-out">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{student.name}</h3>
                      <p className="text-sm text-gray-500">Roll No: {student.rollNo}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-gray-800">{student.attendancePercentage.toFixed(1)}%</span>
                      <p className="text-xs text-gray-500">Overall</p>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <label className={`inline-flex items-center cursor-pointer ${saving || session?.status === 'COMPLETED' ? 'opacity-60 cursor-not-allowed' : ''}`}>
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-green-600 rounded-md"
                        checked={attendance[student.studentId] === 'PRESENT'}
                        onChange={() => handleAttendanceChange(student.studentId, 'PRESENT')}
                        disabled={saving || session?.status === 'COMPLETED'}
                      />
                      <span className="ml-3 text-base text-green-600 font-medium">Present</span>
                    </label>
                    <label className={`inline-flex items-center cursor-pointer ${saving || session?.status === 'COMPLETED' ? 'opacity-60 cursor-not-allowed' : ''}`}>
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-yellow-500 rounded-md"
                        checked={attendance[student.studentId] === 'LATE'}
                        onChange={() => handleAttendanceChange(student.studentId, 'LATE')}
                        disabled={saving || session?.status === 'COMPLETED'}
                      />
                      <span className="ml-3 text-base text-yellow-600 font-medium">Late</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop view - table layout */}
        <div className="hidden lg:block overflow-x-auto">
          {filteredStudents.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-lg">
              No students found for the selected filter.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Roll No.</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Overall %</th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.studentId} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{student.rollNo}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.attendancePercentage.toFixed(1)}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex justify-center space-x-4">
                        <label className={`inline-flex items-center cursor-pointer ${saving || session?.status === 'COMPLETED' ? 'opacity-60 cursor-not-allowed' : ''}`}>
                          <input
                            type="checkbox"
                            className="form-checkbox h-5 w-5 text-green-600 rounded-md"
                            checked={attendance[student.studentId] === 'PRESENT'}
                            onChange={() => handleAttendanceChange(student.studentId, 'PRESENT')}
                            disabled={saving || session?.status === 'COMPLETED'}
                          />
                          <span className="ml-2 text-sm text-green-600">Present</span>
                        </label>
                        <label className={`inline-flex items-center cursor-pointer ${saving || session?.status === 'COMPLETED' ? 'opacity-60 cursor-not-allowed' : ''}`}>
                          <input
                            type="checkbox"
                            className="form-checkbox h-5 w-5 text-yellow-500 rounded-md"
                            checked={attendance[student.studentId] === 'LATE'}
                            onChange={() => handleAttendanceChange(student.studentId, 'LATE')}
                            disabled={saving || session?.status === 'COMPLETED'}
                          />
                          <span className="ml-2 text-sm text-yellow-600">Late</span>
                        </label>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}