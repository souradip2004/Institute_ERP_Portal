// /src/hooks/useFetchTeacher.ts
import { useState } from "react";

interface Teacher {
  id?: string;
  name: string;
  email: string;
  [key: string]: any;
}

export function useFetchTeacher() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAllTeachers = async (departmentId?: string): Promise<Teacher[]> => {
    setLoading(true);
    setError(null);

    try {
      const url = departmentId ? `/api/teachers/department/${departmentId}` : "/api/teachers";
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch teachers");
      }

      return data;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getTeacherById = async (id: string): Promise<Teacher | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/teachers/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch teacher");
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
    getAllTeachers, 
    getTeacherById, 
    loading, 
    error 
  };
}
