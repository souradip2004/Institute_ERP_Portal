"use client";

import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import StudentsList, { Student } from '@/components/admin/StudentsListComponent';
import StudentDetail, { StudentDetail as StudentDetailType } from '@/components/admin/StudentdetailComponent';
import Loader from '@/components/ui/Loader';
import AddStudentModal from '@/components/admin/AddStudent';

interface ViewStudentsProps {
  id: string;
}

export default function ViewStudentsComponent({ id }: ViewStudentsProps) {
  // State for storing all students
  const [students, setStudents] = useState<Student[]>([]);
  // State for tracking which view to show
  const [activeSection, setActiveSection] = useState<"viewStudents" | "viewStudentDetail">("viewStudents");
  // State for storing the currently selected student
  const [selectedStudent, setSelectedStudent] = useState<StudentDetailType | null>(null);
  // State for tracking loading status
  const [isLoading, setIsLoading] = useState(true);
  // State for storing any error messages
  const [error, setError] = useState<string | null>(null);
  // State for controlling the add student modal
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);

  // Fetch students data when component mounts or after adding a new student
  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      // Replace with your actual API endpoint
      const response = await fetch('/api/students');
      
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }
      
      const data = await response.json();
      const filteredStudents = data.filter((student: Student) => student?.user?.institutionId === id);
      setStudents(filteredStudents);
      setError(null);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [id]);

  // Function to handle viewing a specific student's details
  const handleViewStudent = (studentId: string) => {
    // Find the selected student from the students array
    const student = students.find(s => s.id === studentId);
    if (student) {
      setSelectedStudent(student as unknown as StudentDetailType);
      setActiveSection("viewStudentDetail");
    }
  };

  // Function to go back to the students list
  const handleBackToList = () => {
    setActiveSection("viewStudents");
    setSelectedStudent(null);
  };

  // Function to handle successful student addition
  const handleStudentAdded = () => {
    fetchStudents();
  };

  // Render loading state
  if (isLoading && students.length === 0) {
    return <Loader size="large" message="Loading students..." fullScreen={false} />;
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
        <h1 className="text-2xl font-bold text-gray-800">Student Management</h1>
        <button
          onClick={() => setIsAddStudentModalOpen(true)}
          className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
        >
        Add Student      
        </button>
      </div>
      
      {activeSection === "viewStudents" && (
        <Card className="shadow-lg">
          {isLoading ? (
            <div className="p-8">
              <Loader size="medium" message="Refreshing..." fullScreen={false} />
            </div>
          ) : (
            <StudentsList 
              students={students} 
              onViewStudent={handleViewStudent} 
            />
          )}
        </Card>
      )}

      {activeSection === "viewStudentDetail" && selectedStudent && (
        <Card className="shadow-lg">
          <StudentDetail 
            student={selectedStudent} 
            onBack={handleBackToList} 
          />
        </Card>
      )}

      <AddStudentModal
        id={id}
        isOpen={isAddStudentModalOpen}
        onClose={() => setIsAddStudentModalOpen(false)}
        onSuccess={handleStudentAdded}
      />
    </div>
  );
}