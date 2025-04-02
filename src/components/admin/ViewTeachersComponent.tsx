"use client";

import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import TeachersList from '@/components/admin/TeacherListComponent.tsx';
import TeacherDetail from '@/components/admin/TeacherDetailComponent';

export default function TeachersPage() {
  // State for storing all teachers
  const [teachers, setTeachers] = useState([]);
  // State for tracking which view to show
  const [activeSection, setActiveSection] = useState("viewTeachers");
  // State for storing the currently selected teacher
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  // State for tracking loading status
  const [isLoading, setIsLoading] = useState(true);
  // State for storing any error messages
  const [error, setError] = useState(null);

  // Fetch teachers data when component mounts
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setIsLoading(true);
        // Replace with your actual API endpoint
        const response = await fetch('/api/teachers');
        
        if (!response.ok) {
          throw new Error('Failed to fetch teachers');
        }
        console.log('response: ' + response);
        const data = await response.json();
        setTeachers(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching teachers:', err);
        setError('Failed to load teachers. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  // Function to handle viewing a specific teacher's details
  const handleViewTeacher = (teacherId:any) => {
    // Find the selected teacher from the teachers array
    const teacher = teachers.find(t => t?.id === teacherId);
    if (teacher) {
      setSelectedTeacher(teacher);
      setActiveSection("viewTeacherDetail");
    }
  };

  // Function to go back to the teachers list
  const handleBackToList = () => {
    setActiveSection("viewTeachers");
    setSelectedTeacher(null);
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Loading teachers...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-500 rounded-md">
        <p>{error}</p>
       </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Teacher Management</h1>
      
      {activeSection === "viewTeachers" && (
        <Card className="shadow-md">
          <TeachersList 
            teachers={teachers} 
            onViewTeacher={handleViewTeacher} 
          />
        </Card>
      )}

      {activeSection === "viewTeacherDetail" && selectedTeacher && (
        <Card className="shadow-md">
          <TeacherDetail 
            teacher={selectedTeacher} 
            onBack={handleBackToList} 
          />
        </Card>
      )}
    </div>
  );
}