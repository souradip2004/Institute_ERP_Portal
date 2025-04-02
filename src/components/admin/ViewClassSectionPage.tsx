"use client";

import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import ClassSectionsList from '@/components/admin/ClassSectionsListComponent';
import ClassSectionDetail from '@/components/admin/ClassSectionDetailComponent';

export default function ClassSectionsPage() {
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

  // Fetch class sections data when component mounts
  useEffect(() => {
    const fetchClassSections = async () => {
      try {
        setIsLoading(true);
        // Replace with your actual API endpoint
        const response = await fetch('/api/class-sections');
        
        if (!response.ok) {
          throw new Error('Failed to fetch class sections');
        }
        
        const data = await response.json();
        setClassSections(data);
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