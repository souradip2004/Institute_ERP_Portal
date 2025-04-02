import { useState } from "react";

interface StudentData {
  studentRoll: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  departmentId: string;
  batchId: string;
}

interface BulkUploadData {
  file: File;
  departmentId: string;
  batchId: string;
}

export function useAddStudent() {
  const [isLoading, setIsLoading] = useState(false);
  
  const addStudent = async (data: StudentData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/addStudent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error("Failed to add student");
      }
      
      const result = await response.json();
      console.log('new student: ', result);
      return result;
    } catch (error) {
      console.error("Error adding student:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  return { addStudent, isLoading };
}




export function useBulkAddStudents() {
  const [isLoading, setIsLoading] = useState(false);
  
  const bulkAddStudents = async (data: BulkUploadData) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", data.file);
      formData.append("departmentId", data.departmentId);
      formData.append("batchId", data.batchId);
      
      const response = await fetch("/api/addStudent/bulk", {
        method: "POST",
        body: formData
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload students");
      }
      
      const result = await response.json();
      console.log('student create by csv file: ', result);
      return result;
    } catch (error) {
      console.error("Error uploading students:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  return { bulkAddStudents, isLoading };
}