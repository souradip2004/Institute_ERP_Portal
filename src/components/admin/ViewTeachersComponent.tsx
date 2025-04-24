"use client";

import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import TeachersList, { Teacher } from '@/components/admin/TeacherListComponent';
import TeacherDetail, { TeacherDetail as TeacherDetailType } from '@/components/admin/TeacherDetailComponent';
import Loader from '@/components/ui/Loader';
import AddTeacherModal from '@/components/admin/AddTeachers';

interface ViewTeachersProps {
  id: string;
}

export default function ViewTeachersComponent({ id }: ViewTeachersProps) {
  // State for storing all teachers
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  // State for tracking which view to show
  const [activeSection, setActiveSection] = useState<"viewTeachers" | "viewTeacherDetail">("viewTeachers");
  // State for storing the currently selected teacher
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherDetailType | null>(null);
  // State for tracking loading status
  const [isLoading, setIsLoading] = useState(true);
  // State for storing any error messages
  const [error, setError] = useState<string | null>(null);
  // State for controlling the add teacher modal
  const [isAddTeacherModalOpen, setIsAddTeacherModalOpen] = useState(false);

  // Fetch teachers data when component mounts or after adding a new teacher
  const fetchTeachers = async () => {
    try {
      setIsLoading(true);
      // Replace with your actual API endpoint
      const response = await fetch('/api/teachers');
      
      if (!response.ok) {
        throw new Error('Failed to fetch teachers');
      }
      
      const data = await response.json();
      const filteredTeachers = data.filter((teacher: Teacher) => teacher?.user?.institutionId === id);
      setTeachers(filteredTeachers);
      setError(null);
    } catch (err) {
      console.error('Error fetching teachers:', err);
      setError('Failed to load teachers. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [id]);

  // Function to handle viewing a specific teacher's details
  const handleViewTeacher = (teacherId: string) => {
    // Find the selected teacher from the teachers array
    const teacher = teachers.find(t => t.id === teacherId);
    if (teacher) {
      setSelectedTeacher(teacher as unknown as TeacherDetailType);
      setActiveSection("viewTeacherDetail");
    }
  };

  // Function to go back to the teachers list
  const handleBackToList = () => {
    setActiveSection("viewTeachers");
    setSelectedTeacher(null);
  };

  // Function to handle successful teacher addition
  const handleTeacherAdded = () => {
    fetchTeachers();
  };

  // Render loading state
  if (isLoading && teachers.length === 0) {
    return <Loader size="large" message="Loading teachers..." fullScreen={false} />;
  }

  // Render error state
  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-500 rounded-md border border-red-200">
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Teacher Management</h1>
        <button
          onClick={() => setIsAddTeacherModalOpen(true)}
          className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
        >
          Add New Teacher
        </button>
      </div>
      
      {activeSection === "viewTeachers" && (
        <Card className="shadow-lg">
          {isLoading ? (
            <div className="p-8">
              <Loader size="medium" message="Refreshing..." fullScreen={false} />
            </div>
          ) : (
            <TeachersList 
              teachers={teachers} 
              onViewTeacher={handleViewTeacher} 
            />
          )}
        </Card>
      )}

      {activeSection === "viewTeacherDetail" && selectedTeacher && (
        <Card className="shadow-lg">
          <TeacherDetail 
            teacher={selectedTeacher} 
            onBack={handleBackToList} 
          />
        </Card>
      )}

      <AddTeacherModal
        id={id}
        isOpen={isAddTeacherModalOpen}
        onClose={() => setIsAddTeacherModalOpen(false)}
        onSuccess={handleTeacherAdded}
      />
    </div>
  );
}