'use client';
import { useState, useEffect } from 'react';
import AttendanceSessionWindow from '@/components/teacher/AttendanceSessionWindow';
import Loader from '@/components/ui/Loader';
import React from 'react';

interface SessionPageProps {
  params: {
    sessionId: string;
  };
}

export default function SessionPage({ params }: SessionPageProps) {
  const resolvedParams = React.use(params as any) as { sessionId: string };
  const { sessionId } = resolvedParams;

  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // First check for teacherId directly
        const storedTeacherId = localStorage.getItem('teacherId');
        if (storedTeacherId) {
          setTeacherId(storedTeacherId);
          setLoading(false);
          return;
        }

        // If not found, try to get it from user object
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            if (user.teacherId || user.id) {
              setTeacherId(user.teacherId || user.id);
            } else {
              setError('Teacher ID not found in user data');
            }
          } catch (e) {
            setError('Failed to parse user data');
          }
        } else {
          setError('User data not found. Please log in again.');
        }
      } catch (err) {
        setError('An error occurred while fetching user data');
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (!sessionId) {
    return (
      <div className="p-6 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md">
        <p className="font-bold">Error</p>
        <p>Invalid session ID. Please go back and try again.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader size="large" message="Loading attendance session..." />
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

  if (!teacherId) {
    return (
      <div className="p-6 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 rounded-md">
        <p className="font-bold">Authentication Required</p>
        <p>Please log in to access attendance records.</p>
      </div>
    );
  }

  return <AttendanceSessionWindow sessionId={sessionId} />;
}