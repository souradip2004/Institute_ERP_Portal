'use client';

import { useState, useEffect } from 'react';
import axios from "axios";
import ClassSectionForm from "@/components/ClassSectionForm";
import AttendanceSessionList from "@/components/AttendanceSessionList";
import { useRouter } from 'next/navigation';

export default function TeacherDashboard() {
  const router = useRouter();
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [classSections, setClassSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Check if user is logged in and is a teacher
    const userDataStr = localStorage.getItem('user');
    if (!userDataStr) {
      router.push('/custom-login');
      return;
    }

    try {
      const userData = JSON.parse(userDataStr);
      setUserName(userData.name || '');

      if (userData.teacherId) {
        setTeacherId(userData.teacherId);
        fetchClassSections(userData.teacherId);
      } else if (userData.id) {
        // If we don't have teacherId but have userId, fetch teacherId
        fetchTeacherByUserId(userData.id);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
      setIsLoading(false);
    }
  }, [router]);

  const fetchTeacherByUserId = async (userId: string) => {
    try {
      const response = await axios.get(`/api/teachersbyid/${userId}`);
      if (response.data?.id) {
        setTeacherId(response.data.id);
        // Store teacherId in localStorage for future use
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        userData.teacherId = response.data.id;
        localStorage.setItem('user', JSON.stringify(userData));
        fetchClassSections(response.data.id);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching teacher data:", error);
      setIsLoading(false);
    }
  };

  const fetchClassSections = async (id: string) => {
    try {
      const response = await axios.get(`/api/class-sections?teacherId=${id}`);
      setClassSections(response.data || []);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching class sections:", error);
      setClassSections([]);
      setIsLoading(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Teacher Dashboard</h1>

      {/* First-time setup: Prompt to add class sections */}
      {classSections.length === 0 ? (
        <div className="bg-yellow-100 p-4 rounded-md mb-4">
          <p className="mb-2">Welcome! {userName} Please create your first class section.</p>
          {teacherId && <ClassSectionForm teacherId={teacherId} />}
        </div>
      ) : (
        <>
          {teacherId && <ClassSectionForm teacherId={teacherId} />}
          {teacherId && <AttendanceSessionList teacherId={teacherId} />}
        </>
      )}
    </div>
  );
}