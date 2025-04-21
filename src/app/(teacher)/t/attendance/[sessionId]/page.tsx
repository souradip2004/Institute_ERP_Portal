'use client';
import { useState, useEffect } from 'react';
import AttendanceSessionWindow from '@/components/teacher/AttendanceSessionWindow';

interface SessionPageProps {
  params: {
    sessionId: string;
  };
}

export default function SessionPage({ params }: SessionPageProps) {
  const { sessionId } = params;
  const [teacherId, setTeacherId] = useState<string | null>(null);

  useEffect(() => {
    const storedTeacherId = localStorage.getItem('teacherId');
    if (storedTeacherId) {
      setTeacherId(storedTeacherId); // No JSON.parse needed if stored as string
    }
  }, []);

  if (!sessionId) {
    return <div>Invalid session ID</div>;
  }

  if (!teacherId) {
    return <div className="p-4">Loading...</div>;
  }

  return <AttendanceSessionWindow sessionId={sessionId} />;
}