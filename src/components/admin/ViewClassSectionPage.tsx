"use client";

import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import ClassSectionsList from '@/components/admin/ClassSectionsListComponent';
import ClassSectionDetail from '@/components/admin/ClassSectionDetailComponent';

export default function ClassSectionsPage({id}) {
  // State for storing all class sections
  const [classSections, setClassSections] = useState([]);
  // State for tracking which view to show
  const [activeSection, setActiveSection] = useState("viewClassSections");
  // State for storing the currently selected class section
  const [selectedClassSection, setSelectedClassSection] = useState(null);
  // State for tracking loading status
  const [isLoading, setIsLoading] = useState(true);
  // State for storing any error messages
  const [error, setError] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);

  // Fetch class sections data when component mounts
  useEffect(() => {
    
    const fetchClassSections = async () => {
      try {
      const teachersResponse = await fetch("http://localhost:3000/api/teachers", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const teachers = await teachersResponse.json();
      console.log("Teachers Data:", teachers);
      console.log("Institution ID:", id);
      const filteredTeachers = teachers.filter((teacher: any) => teacher.user.institutionId === id);

        setIsLoading(true);
        // Replace with your actual API endpoint
        const response = await fetch('/api/class-sections');
        
        if (!response.ok) {
          throw new Error('Failed to fetch class sections');
        }
        
        const data = await response.json();
        console.log("Class Sections Data:", data);
        // Filter class sections based on the institution ID
        console.log("Filtered Teachers:", filteredTeachers);
        setTeachers(filteredTeachers);
        const filteredClassSections = data.filter((section: any) => {
          return filteredTeachers.some((teacher: any) => {
            return section.teacherId === teacher.id;
          });
        }
        );
        setClassSections(filteredClassSections);
        setError(null);
      } catch (err) {
        console.error('Error fetching class sections:', err);
        setError('Failed to load class sections. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassSections();
  }, []);
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
        console.log(data)
        console.log(id)
        const filteredStudents = data.filter((student: any) => student?.user?.institutionId === id);
        console.log('filteredStudents: ' + filteredStudents);
        setStudents(filteredStudents);
        setError(null);
      } catch (err) {
        console.error('Error fetching students:', err);
        setError('Failed to load students. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }
  , [id]);

  // Function to handle viewing a specific class section's details
  const handleViewClassSection = (sectionId:any) => {
    // Find the selected class section from the classSections array
    const section = classSections.find(s => s.id === sectionId);
    if (section) {
      setSelectedClassSection(section);
      setActiveSection("viewClassSectionDetail");
    }
  };

  // Function to go back to the class sections list
  const handleBackToList = () => {
    setActiveSection("viewClassSections");
    setSelectedClassSection(null);
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Loading class sections...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-500 rounded-md">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 px-4 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Class Sections Management</h1>
      <div className="flex flex-wrap justify-between gap-4 mb-6">
        <Card className="shadow-md p-4 text-center flex-1">
          <h2 className="text-lg font-semibold">Total Classes</h2>
          <p className="text-2xl font-bold">{classSections.length}</p>
        </Card>
        <Card className="shadow-md p-4 text-center flex-1">
          <h2 className="text-lg font-semibold">Total Teachers</h2>
          <p className="text-2xl font-bold">{teachers.length}</p>
        </Card>
        <Card className="shadow-md p-4 text-center flex-1">
          <h2 className="text-lg font-semibold">Total Students</h2>
          <p className="text-2xl font-bold">{students.length}</p>
        </Card>
      </div>
      {activeSection === "viewClassSections" && (
        <Card className="shadow-md">
          <ClassSectionsList 
            classSections={classSections} 
            onViewClassSection={handleViewClassSection} 
          />
        </Card>
      )}

      {activeSection === "viewClassSectionDetail" && selectedClassSection && (
        <Card className="shadow-md">
          <ClassSectionDetail 
            classSection={selectedClassSection} 
            onBack={handleBackToList} 
          />
        </Card>
      )}
    </div>
  );
}