"use client";

import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import StudentsList from '@/components/admin/StudentsListComponent';
import StudentDetail from '@/components/admin/StudentdetailComponent';

export default function StudentsPage() {
  // State for storing all students
  const [students, setStudents] = useState([]);
  // State for tracking which view to show
  const [activeSection, setActiveSection] = useState("viewStudents");
  // State for storing the currently selected student
  const [selectedStudent, setSelectedStudent] = useState(null);
  // State for tracking loading status
  const [isLoading, setIsLoading] = useState(true);
  // State for storing any error messages
  const [error, setError] = useState(null);

  // Fetch students data when component mounts
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        // Replace with your actual API endpoint
        const response = await fetch('/api/students');
        
        if (!response.ok) {
          throw new Error('Failed to fetch students');
        }
        
        const data = await response.json();
        setStudents(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching students:', err);
        setError('Failed to load students. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Function to handle viewing a specific student's details
  const handleViewStudent = (studentId) => {
    // Find the selected student from the students array
    const student = students.find(s => s.id === studentId);
    if (student) {
      setSelectedStudent(student);
      setActiveSection("viewStudentDetail");
    }
  };

  // Function to go back to the students list
  const handleBackToList = () => {
    setActiveSection("viewStudents");
    setSelectedStudent(null);
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Loading students...</p>
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
      <h1 className="text-2xl font-bold mb-6">Student Management</h1>
      
      {activeSection === "viewStudents" && (
        <Card className="shadow-md">
          <StudentsList 
            students={students} 
            onViewStudent={handleViewStudent} 
          />
        </Card>
      )}

      {activeSection === "viewStudentDetail" && selectedStudent && (
        <Card className="shadow-md">
          <StudentDetail 
            student={selectedStudent} 
            onBack={handleBackToList} 
          />
        </Card>
      )}
    </div>
  );
}