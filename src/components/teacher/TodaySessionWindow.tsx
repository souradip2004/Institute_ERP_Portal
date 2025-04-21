'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface Session {
  id: string;
  classSection: { id: string; name: string };
  course: { id: string; name: string; code: string };
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  presentCount: number;
  absentCount: number;
}

interface TodaySessionsListProps {
  teacherId: string;
}

export default function TodaySessionsList({ teacherId }: TodaySessionsListProps) {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        console.log('Fetching today sessions for teacherId:', teacherId);
        const response = await axios.get<{ sessions: Session[]; userId: string; teacherId: string }>(
          `/api/teachers/${teacherId}/attendance/today`
        );
        setSessions(response.data.sessions);
        localStorage.setItem('userId', response.data.userId);
        localStorage.setItem('teacherId', response.data.teacherId);
        console.log('Response:', response.data);
        setLoading(false);
      } catch (err) {
        const errorMessage = axios.isAxiosError(err)
          ? err.response?.data?.error || 'Failed to load sessions'
          : 'Failed to load sessions';
        setError(errorMessage);
        setLoading(false);
      }
    };
    fetchSessions();
  }, [teacherId]);

  const openSessionWindow = (sessionId: string) => {
    router.push(`/t/attendance/${sessionId}`);
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Today's Attendance Sessions</h2>
      {sessions.length === 0 ? (
        <p className="text-gray-500">No sessions scheduled for today.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Class Section</th>
              <th className="border p-2">Course</th>
              <th className="border p-2">Time</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Present/Late</th>
              <th className="border p-2">Absent</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.id}>
                <td className="border p-2">{session.classSection.name}</td>
                <td className="border p-2">
                  {session.course.name} ({session.course.code})
                </td>
                <td className="border p-2">
                  {new Date(session.startTime).toLocaleTimeString()} -{' '}
                  {new Date(session.endTime).toLocaleTimeString()}
                </td>
                <td className="border p-2">{session.status}</td>
                <td className="border p-2">{session.presentCount}</td>
                <td className="border p-2">{session.absentCount}</td>
                <td className="border p-2">
                  <button
                    onClick={() => openSessionWindow(session.id)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                    disabled={session.status === 'CANCELLED'}
                  >
                    Open
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}