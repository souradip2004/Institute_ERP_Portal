"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import StudentsList from "@/components/admin/StudentsListComponent";
import StudentDetail from "@/components/admin/StudentdetailComponent";
import { useFetchAllStudentByBatchId } from "@/hooks/useFetchAllStudentByBatchId";
import { useFetchAllStudentByDeptId } from "@/hooks/useFetchAllStudentByDeptId";
import { Suspense } from "react";   
interface Student {
  id: string;
  name: string;
  email: string;
  department: string;
  batch: string;
}

export default function Page(){
    return(
        <Suspense>
            <Page1 />
        </Suspense>
    )
}
function Page1() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const departmentId = searchParams?.get("departmentId");
  const batchId = searchParams?.get("batchId");

  const [viewMode, setViewMode] = useState<'batch' | 'department' | null>("batch");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [studentError, setStudentError] = useState<string | null>(null);

  const { students: batchStudents, loading: batchLoading, error: batchError } = useFetchAllStudentByBatchId(viewMode === 'batch' ? batchId : null);
  const { students: deptStudents, loading: deptLoading, error: deptError } = useFetchAllStudentByDeptId(viewMode === 'department' ? departmentId : null);

  const students = viewMode === 'batch' ? batchStudents : deptStudents;
  const currentLoading = viewMode === 'batch' ? batchLoading : deptLoading;
  const currentError = viewMode === 'batch' ? batchError : deptError;

  const handleViewByBatch = () => {
    if (!batchId) return;
    setViewMode('batch');
    setSelectedStudent(null);
    setStudentError(null);
  };

  const handleViewByDepartment = () => {
    if (!departmentId) return;
    setViewMode('department');
    setSelectedStudent(null);
    setStudentError(null);
  };

  const handleViewStudent = async (studentId: string) => {
    setIsLoading(true);
    setStudentError(null);

    try {
      const response = await fetch(`/api/students/${studentId}`);
      if (!response.ok) throw new Error("Failed to fetch student details");
      const data = await response.json();
      setSelectedStudent(data);
    } catch (error) {
      setStudentError("Failed to fetch student details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToList = () => {
    setSelectedStudent(null);
    setStudentError(null);
  };

  const navigateToAddStudent = () => {
    router.push(`/admin/students/add?departmentId=${departmentId}&batchId=${batchId}`);
  };

  return (
    <Suspense>
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Manage Students</h1>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={handleViewByBatch}
          disabled={!batchId}
          className={`px-4 py-2 rounded ${!batchId ? 'bg-gray-300 cursor-not-allowed' : viewMode === 'batch' ? 'bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
        >
          View Students by Batch
        </button>

        <button
          onClick={handleViewByDepartment}
          disabled={!departmentId}
          className={`px-4 py-2 rounded ${!departmentId ? 'bg-gray-300 cursor-not-allowed' : viewMode === 'department' ? 'bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
        >
          View Students by Department
        </button>

        <button
          onClick={navigateToAddStudent}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded ml-auto"
        >
          Add Student
        </button>
      </div>

      {(isLoading || currentLoading) && (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {(currentError || studentError) && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{currentError || studentError}</p>
        </div>
      )}

      {!isLoading && !currentLoading && viewMode && !selectedStudent && students.length > 0 && (
        <StudentsList students={students} onViewStudent={handleViewStudent} />
      )}

      {!isLoading && !currentLoading && viewMode && !selectedStudent && students.length === 0 && !currentError && (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            No students found for the selected {viewMode === 'batch' ? 'batch' : 'department'}
          </p>
        </div>
      )}

      {!isLoading && selectedStudent && (
        <StudentDetail student={selectedStudent} onBack={handleBackToList} />
      )}

      {!isLoading && !currentLoading && !viewMode && !selectedStudent && (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            Select "View Students by Batch" or "View Students by Department" to get started
          </p>
        </div>
      )}
    </div>
    </Suspense>
  );
}
