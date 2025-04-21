'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface StudentAttendance {
  userId: string;
  studentId: string;
  name: string;
  rollNo: string;
  attendancePercentage: number;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | null;
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
}

export default function AttendanceSessionWindow({ sessionId }: AttendanceSessionWindowProps) {
  const [session, setSession] = useState<AttendanceSessionDetails | null>(null);
  const [attendance, setAttendance] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'LATE'>>({});
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
        console.log('Fetching session data for sessionId:', sessionId);
        const response = await axios.get<AttendanceSessionDetails>(
          `/api/teachers/${teacherId}/attendance/session/${sessionId}`
        );
        const sessionData = response.data;
        console.log('Fetched session:', sessionData);
        setSession(sessionData);

        const initialAttendance: Record<string, 'PRESENT' | 'ABSENT' | 'LATE'> = {};
        sessionData.students.forEach((student) => {
          initialAttendance[student.studentId] = student.status || 'PRESENT';
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

  const handleAttendanceChange = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE') => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status: 'PRESENT' | 'ABSENT' | 'LATE') => {
    const updatedAttendance: Record<string, 'PRESENT' | 'ABSENT' | 'LATE'> = {};
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
      setSaving(true);
      const attendanceData = Object.entries(attendance).map(([studentId, status]) => ({
        studentId,
        status,
      }));
      console.log('Sending data:', { sessionId, teacherId, attendanceData });
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

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  const presentCount = Object.values(attendance).filter((status) => status === 'PRESENT' || status === 'LATE').length;
  const absentCount = Object.values(attendance).filter((status) => status === 'ABSENT').length;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold">
            {session?.classSection.name} - {session?.course.name}
          </h2>
          <p>Date: {session?.date ? new Date(session.date).toLocaleDateString() : 'N/A'}</p>
          <p>
            Time:{' '}
            {session?.startTime && session?.endTime
              ? `${new Date(session.startTime).toLocaleTimeString()} - ${new Date(
                  session.endTime
                ).toLocaleTimeString()}`
              : 'N/A'}
          </p>
          <p>Status: {session?.status}</p>
          <p>Total: {presentCount} Present/Late, {absentCount} Absent</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => markAll('PRESENT')}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
            disabled={saving || session?.status === 'COMPLETED'}
          >
            Mark All Present
          </button>
          <button
            onClick={() => markAll('ABSENT')}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:bg-gray-400"
            disabled={saving || session?.status === 'COMPLETED'}
          >
            Mark All Absent
          </button>
          <button
            onClick={() => markAll('LATE')}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 disabled:bg-gray-400"
            disabled={saving || session?.status === 'COMPLETED'}
          >
            Mark All Late
          </button>
          <button
            onClick={saveAttendance}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            disabled={saving || session?.status === 'COMPLETED'}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Name</th>
            <th className="border p-2">Roll No.</th>
            <th className="border p-2">Attendance %</th>
            <th className="border p-2">Present</th>
            <th className="border p-2">Absent</th>
            <th className="border p-2">Late</th>
          </tr>
        </thead>
        <tbody>
          {session?.students.map((student) => (
            <tr key={student.studentId}>
              <td className="border p-2">{student.name}</td>
              <td className="border p-2">{student.rollNo}</td>
              <td className="border p-2">{student.attendancePercentage.toFixed(2)}%</td>
              <td className="border p-2">
                <input
                  type="radio"
                  name={`attendance-${student.studentId}`}
                  value="PRESENT"
                  checked={attendance[student.studentId] === 'PRESENT'}
                  onChange={() => handleAttendanceChange(student.studentId, 'PRESENT')}
                  disabled={saving || session?.status === 'COMPLETED'}
                />
              </td>
              <td className="border p-2">
                <input
                  type="radio"
                  name={`attendance-${student.studentId}`}
                  value="ABSENT"
                  checked={attendance[student.studentId] === 'ABSENT'}
                  onChange={() => handleAttendanceChange(student.studentId, 'ABSENT')}
                  disabled={saving || session?.status === 'COMPLETED'}
                />
              </td>
              <td className="border p-2">
                <input
                  type="radio"
                  name={`attendance-${student.studentId}`}
                  value="LATE"
                  checked={attendance[student.studentId] === 'LATE'}
                  onChange={() => handleAttendanceChange(student.studentId, 'LATE')}
                  disabled={saving || session?.status === 'COMPLETED'}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}