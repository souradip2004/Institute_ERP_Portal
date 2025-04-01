// /src/hooks/useFetchClass.ts
import { useState } from "react";

interface Class {
  id?: string;
  name: string;
  token: string;
  teachers: string[]; // Array of teacher IDs
  students: string[]; // Array of student IDs
  [key: string]: any;
}

export function useFetchClass() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all classes, optionally filter by departmentId
  const getAllClasses = async (departmentId?: string): Promise<Class[]> => {
    setLoading(true);
    setError(null);

    try {
      const url = departmentId ? `/api/class-sections/department/${departmentId}` : "/api/class-sections";
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch classes");
      }

      return data;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch class by ID
  const getClassById = async (id: string): Promise<Class | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/classes/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch class");
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
    getAllClasses,
    getClassById,
    loading,
    error
  };
}
