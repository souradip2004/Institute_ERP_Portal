"use client";

import React, {useState, useEffect} from 'react';
import {Card} from "@/components/ui/card";
import TeachersList, {Teacher} from '@/components/admin/TeacherListComponent';
import TeacherDetail, {TeacherDetail as TeacherDetailType} from '@/components/admin/TeacherDetailComponent';
import Loader from '@/components/ui/Loader';
import AddTeacherModal from '@/components/admin/AddTeachers';
import axios from "axios"; // Assuming this is your modal component

interface ViewTeachersProps {
  id: string;
}

export default function ViewTeachersComponent({id}: ViewTeachersProps) {
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
  const [deletingTeacher, setDeletingTeacher] = useState<boolean>(false);

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

  const handleDeleteTeacher = async (userId: string) => {
    try {
      setDeletingTeacher(true);
      const deleteTeacher = await axios.delete(`/api/teacher/profile?id=${userId}`);

      await fetchTeachers();

      setDeletingTeacher(false);
    } catch (err) {
      console.error('Error deleting teachers:', err);
      setError('Failed to delete teacher. Please try again later.');
    }
  }

  // Function to go back to the teachers list
  const handleBackToList = () => {
    setActiveSection("viewTeachers");
    setSelectedTeacher(null);
  };

  // Function to handle successful teacher addition
  const handleTeacherAdded = () => {
    fetchTeachers();
  };

  // Render loading state for initial load
  if (isLoading && teachers.length === 0) {
    return (
      <div className="flex justify-center items-center h-full min-h-[300px]">
        <Loader size="large" message="Loading teachers..." fullScreen={false}/>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-500 rounded-md border border-red-200 mx-auto max-w-4xl mt-4">
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6"> {/* Adjusted padding for mobile vs desktop */}
      <div
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0"> {/* Stack on mobile, row on desktop */}
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Teacher Management</h1> {/* Adjust text size */}
        <button
          onClick={() => setIsAddTeacherModalOpen(true)}
          className="w-full md:w-auto px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
        >
          Add New Teacher
        </button>
      </div>

      {activeSection === "viewTeachers" && (
        <Card className="shadow-lg p-4 md:p-6"> {/* Adjusted padding within card */}
          {isLoading ? (
            <div className="flex justify-center items-center h-48"> {/* Centered loader for refresh */}
              <Loader size="medium" message="Refreshing..." fullScreen={false}/>
            </div>
          ) : (
            <TeachersList
              teachers={teachers}
              handleDeleteTeacher={handleDeleteTeacher}
              deletingTeacher={deletingTeacher}
              onViewTeacher={handleViewTeacher}
            />
          )}
        </Card>
      )}

      {activeSection === "viewTeacherDetail" && selectedTeacher && (
        <Card className="shadow-lg p-4 md:p-6"> {/* Adjusted padding within card */}
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