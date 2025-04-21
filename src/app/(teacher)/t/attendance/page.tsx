'use client';
import { useState, useEffect } from 'react';
import TodaySessionsList from '@/components/teacher/TodaySessionWindow';

export default function AttendancePage() {
  const [teacherId, setTeacherId] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setTeacherId(parsedUser.id); // This could be userId
    }
  }, []);

  if (!teacherId) {
    return <div className="p-4">Loading...</div>;
  }

  return <TodaySessionsList teacherId={teacherId} />;
}