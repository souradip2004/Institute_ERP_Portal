'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Loader from '@/components/ui/Loader';

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
    router.push(`/t/attendance/${sessionId}` as any);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">Active</span>;
      case 'PENDING':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">Pending</span>;
      case 'COMPLETED':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">Completed</span>;
      case 'CANCELLED':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">Cancelled</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full font-medium">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md">
        <p className="font-bold">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Today's Attendance Sessions</h2>

      {sessions.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <div className="text-gray-400 text-5xl mb-4">📋</div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">No Sessions Today</h3>
          <p className="text-gray-500">There are no attendance sessions scheduled for today.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {/* Mobile view - Card format for better experience on small screens */}
          <div className="lg:hidden space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
                  <div className="font-medium text-gray-900">{session.classSection.name}</div>
                  <div className="text-sm text-gray-500">{session.course.name} ({session.course.code})</div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Time</span>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {' '}
                        {new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-xs text-gray-500">{new Date(session.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Status</span>
                    <div>{getStatusBadge(session.status)}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Attendance</span>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm">
                        <span className="text-green-600 font-medium">{session.presentCount}</span> present
                      </div>
                      <div className="text-sm">
                        <span className="text-red-600 font-medium">{session.absentCount}</span> absent
                      </div>
                    </div>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => openSessionWindow(session.id)}
                      className="w-full inline-flex justify-center items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                      disabled={session.status === 'CANCELLED'}
                    >
                      Open Session
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop view - Table format for larger screens */}
          <div className="hidden lg:block bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Section</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Present/Absent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sessions.map((session) => (
                    <tr key={session.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{session.classSection.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{session.course.name}</div>
                        <div className="text-xs text-gray-500">{session.course.code}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {' '}
                          {new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-xs text-gray-500">{new Date(session.date).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(session.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-4">
                          <div className="text-sm">
                            <span className="text-green-600 font-medium">{session.presentCount}</span>
                            <span className="text-gray-500"> present</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-red-600 font-medium">{session.absentCount}</span>
                            <span className="text-gray-500"> absent</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => openSessionWindow(session.id)}
                          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                          disabled={session.status === 'CANCELLED'}
                        >
                          Open
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}