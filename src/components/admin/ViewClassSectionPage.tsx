"use client";

import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import ClassSectionsList, { ClassSection } from '@/components/admin/ClassSectionsListComponent';
import ClassSectionDetail from '@/components/admin/ClassSectionDetailComponent';
import { ClassSectionDetail as ClassSectionDetailType } from '@/components/admin/ClassSectionDetailComponent';
import Loader from '@/components/ui/Loader';
import AddClassModal from '@/components/admin/AddClass';
import { PlusCircle } from 'lucide-react';

interface Teacher {
  id: string;
  user: {
    institutionId: string;
    name?: string;
  };
  teacherCode?: string;
}

interface Student {
  user: {
    institutionId: string;
  };
}

interface ApiClassSection {
  id: string;
  teacherId: string;
  sectionName?: string;
  maxStudents?: number;
  batchId?: string;
  courseId?: string;
  semesterId?: string;
  createdAt?: string;
  updatedAt?: string;
  batch?: {
    id?: string;
    batchName?: string;
    year?: number;
  };
  course?: {
    id?: string;
    courseCode?: string;
    name?: string;
  };
  semester?: {
    id?: string;
    name?: string;
    startDate?: string;
    endDate?: string;
  };
  teacher?: {
    id?: string;
    teacherCode?: string;
    user?: {
      name?: string;
    };
  };
  [key: string]: string | number | boolean | object | null | undefined;
}

interface ViewClassSectionPageProps {
  id: string;
}

export default function ClassSectionsPage({ id }: ViewClassSectionPageProps) {
  const [classSections, setClassSections] = useState<ClassSection[]>([]);
  const [activeSection, setActiveSection] = useState<"viewClassSections" | "viewClassSectionDetail">("viewClassSections");
  const [selectedClassSection, setSelectedClassSection] = useState<ClassSectionDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const fetchClassSections = async () => {
      setIsLoading(true);
      try {
        // Fetch teachers first
        const teachersResponse = await fetch("http://localhost:3000/api/teachers", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        if (!teachersResponse.ok) {
          throw new Error('Failed to fetch teachers');
        }
        
        const teachers = await teachersResponse.json();
        
        if (!Array.isArray(teachers)) {
          console.error('Teachers response is not an array:', teachers);
          throw new Error('Invalid teachers data format');
        }
        
        const filteredTeachers = teachers.filter((teacher: Teacher) => 
          teacher && teacher.user && teacher.user.institutionId === id
        );
        
        setTeachers(filteredTeachers || []);
        
        // Now fetch class sections
        const response = await fetch('/api/class-sections');
        
        if (!response.ok) {
          throw new Error('Failed to fetch class sections');
        }
        
        const data = await response.json();
        
        if (!Array.isArray(data)) {
          console.error('Class sections response is not an array:', data);
          throw new Error('Invalid class sections data format');
        }
        
        // Filter sections by teacher ID
        const teacherIds = filteredTeachers.map(t => t.id);
        const filteredClassSections = data
          .filter((section: ApiClassSection) => 
            section && section.teacherId && teacherIds.includes(section.teacherId)
          )
          .map((section: ApiClassSection) => {
            // Make sure every section has at least the required fields
            return {
              id: section.id || '',
              sectionName: section.sectionName || 'Unnamed Section',
              teacherId: section.teacherId || '',
              batchId: section.batchId || '',
              courseId: section.courseId || '',
              semesterId: section.semesterId || '',
              maxStudents: section.maxStudents || 0,
              createdAt: section.createdAt || new Date().toISOString(),
              updatedAt: section.updatedAt || new Date().toISOString(),
              batch: section.batch || {},
              course: section.course || {},
              semester: section.semester || {},
              teacher: section.teacher || { user: {} }
            };
          });
        
        setClassSections(filteredClassSections as ClassSection[]);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data. Please try again later.');
        setClassSections([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassSections();
  }, [id]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/students');
        
        if (!response.ok) {
          throw new Error('Failed to fetch students');
        }
        
        const data = await response.json();
        
        if (!Array.isArray(data)) {
          console.error('Students response is not an array:', data);
          throw new Error('Invalid students data format');
        }
        
        const filteredStudents = data.filter((student: Student) => 
          student && student.user && student.user.institutionId === id
        );
        
        setStudents(filteredStudents || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching students:', err);
        // Don't set error here to avoid overriding class sections error
        // Just log it since student count is less critical
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [id]);

  const handleViewClassSection = (sectionId: string) => {
    const section = classSections.find(s => s.id === sectionId);
    if (section) {
      // Convert to the detail type
      setSelectedClassSection(section as unknown as ClassSectionDetailType);
      setActiveSection("viewClassSectionDetail");
    }
  };

  const handleBackToList = () => {
    setActiveSection("viewClassSections");
    setSelectedClassSection(null);
  };

  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  if (isLoading) {
    return <Loader fullScreen message="Loading class sections..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
          <div className="flex items-center gap-3 mb-4">
            <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-medium text-red-800">Error</h3>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Class Sections Management</h1>
            <p className="mt-2 text-sm text-gray-600">Manage and view all class sections in your institution</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Class Section</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Classes</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{classSections.length}</p>
            </div>
            <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center">
              <span className="text-xl">🏫</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Teachers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{teachers.length}</p>
            </div>
            <div className="h-12 w-12 bg-purple-50 rounded-full flex items-center justify-center">
              <span className="text-xl">👨‍🏫</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{students.length}</p>
            </div>
            <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center">
              <span className="text-xl">👨‍🎓</span>
            </div>
          </div>
        </Card>
      </div>

      {activeSection === "viewClassSections" && (
        <Card className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <ClassSectionsList 
            classSections={classSections} 
            onViewClassSection={handleViewClassSection} 
          />
        </Card>
      )}

      {activeSection === "viewClassSectionDetail" && selectedClassSection && (
        <Card className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <ClassSectionDetail 
            classSection={selectedClassSection} 
            onBack={handleBackToList} 
          />
        </Card>
      )}
      
      {/* Add Class Modal */}
      {isAddModalOpen && (
        <AddClassModal 
          id={id} 
          userid={id}
          isOpen={isAddModalOpen} 
          onClose={closeAddModal} 
        />
      )}
    </div>
  );
}