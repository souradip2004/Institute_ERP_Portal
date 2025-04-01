// /src/hooks/useFetchStudent.ts
import { useState } from "react";

interface Student {
  id?: string;
  name?: string;
  email?: string;
  rollNumber?: string;
  [key: string]: any;
}

export function useFetchStudent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all students, optionally filter by departmentId
  const getAllStudents = async (departmentId?: string): Promise<Student[]> => {
    setLoading(true);
    setError(null);

    try {
      const url = departmentId ? `/api/students/department/${departmentId}` : "/api/students";
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch students");
      }

      return data;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch student by ID
  const getStudentById = async (id: string): Promise<Student | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/students/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch student");
      }

      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    getAllStudents,
    getStudentById,
    loading,
    error
  };
}
